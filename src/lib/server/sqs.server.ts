import { type Message, ReceiveMessageCommand, type ReceiveMessageCommandOutput, SQSClient } from "@aws-sdk/client-sqs";
import { MessageConsumer } from "@lib/consumers/message.consumer";
import { SqsRecordDeserializer } from "@lib/deserializers/sqs.deserializer";
import { SqsRecordSerializer } from "@lib/serializers/sqs.serializer";
import { type SQSEvents, SQSEventsMap, SQSStatus } from "@lib/server/sqs.events";
import type { SqsOptions } from "@lib/types/sqs.configuration";
import { Server } from "@nestjs/microservices";
import { type Observable, from, map, of, tap } from "rxjs";

export class SQSServer extends Server<SQSEvents, SQSStatus> {
    private readonly SQSClient: SQSClient;
    private readonly messageConsumers = new Array<MessageConsumer>();
    protected pendingEventListeners: Array<{
        eventKey: keyof SQSEvents;
        callback: SQSEvents[keyof SQSEvents];
    }> = [];

    constructor(private readonly options: Required<SqsOptions>["options"]) {
        super();
        this.SQSClient = new SQSClient(options);
    }

    public async listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): Promise<void> {
        this._status$.next(SQSStatus.CONNECTING);

        this.initializeSerializer(this.options);
        this.initializeDeserializer(this.options);

        return this.start(callback).catch((error) => {
            this.logger.error("We were unable to start the SQS Server, please check your configuration.", error);
            this._status$.next(SQSStatus.ERRORED);
            callback(error);
        });
    }

    public async close(): Promise<void> {
        this._status$.next(SQSStatus.DISCONNECTING);

        for (const consumer of this.messageConsumers) {
            consumer.stop();
        }

        this._status$.next(SQSStatus.DISCONNECTED);
        this.logger.log("SQS server stopped");
        return Promise.resolve();
    }

    public async start(callback: (err?: unknown, ...optionalParams: unknown[]) => void): Promise<void> {
        this._status$.next(SQSStatus.CONNECTING);

        const discoveredQueueNames = this.discoverQueueNames();
        if (discoveredQueueNames.length === 0) {
            this.logger.warn("No queue names discovered. Please make sure to register your handlers.");
            return callback();
        }

        for (const queueName of discoveredQueueNames) {
            const messageConsumer = new MessageConsumer(
                queueName,
                this.options.poolingDelayInMilliseconds,
                (queueName) => this.receiveMessages(queueName),
                (message) => this.processMessage(message),
                (message) => this.deleteMessage(message),
                (error, message) => this.handleProcessingFailure(error, message),
            );

            messageConsumer.on(SQSEventsMap.STARTED, () => this.logger.log(`Consumer for ${queueName} started`));

            messageConsumer.on(SQSEventsMap.STOPPED, () => this.logger.log(`Consumer for ${queueName} stopped`));

            messageConsumer.on(SQSEventsMap.RECEIVED_MESSAGES, (messages) =>
                this.logger.log(`Received messages ${messages.length} from ${queueName}`),
            );

            messageConsumer.on(SQSEventsMap.MESSAGE_PROCESSED, (messageId) =>
                this.logger.log(`Processing message from ${queueName}:#{messageId}`),
            );

            messageConsumer.on(SQSEventsMap.MESSAGE_DELETED, (messageId) =>
                this.logger.log(`Deleting message from ${queueName}:#${messageId}`),
            );
            messageConsumer.on(SQSEventsMap.MESSAGE_PROCESSING_FAILED, (messageId) =>
                this.logger.error(`Failed processing message from ${queueName}:#${messageId}`),
            );

            for (const { eventKey, callback } of this.pendingEventListeners) {
                messageConsumer.on(eventKey, callback);
            }

            this.messageConsumers.push(messageConsumer);
            messageConsumer.start();
        }

        this._status$.next(SQSStatus.CONNECTED);

        callback();
    }

    public on<
        EventKey extends keyof SQSEvents = keyof SQSEvents,
        EventCallback extends SQSEvents[EventKey] = SQSEvents[EventKey],
    >(eventKey: EventKey, eventCallback: EventCallback) {
        if (!this.SQSClient || this.messageConsumers.length === 0) {
            this.pendingEventListeners.push({
                eventKey: eventKey,
                callback: eventCallback,
            });
        } else {
            for (const consumer of this.messageConsumers) {
                consumer.on(eventKey, eventCallback);
            }
        }
    }

    public unwrap<T = never>(): T {
        if (!this.SQSClient) {
            throw new Error(
                "SQSClient is not initialized. Please call listen/startAllMicroservices before accessing the server.",
            );
        }

        return this.SQSClient as T;
    }

    private receiveMessages(queueName: string): Observable<Message[]> {
        const queueUrl = `${this.options.baseQueueUrl}/${queueName}`;

        // const receiveMessageCommand = new ReceiveMessageCommand({
        //     QueueUrl: queueUrl,
        //     MaxNumberOfMessages: this.options.batchReceiveSize,
        //     WaitTimeSeconds: this.options.waitTimeSeconds,
        //     MessageAttributeNames: ["All"],
        //     MessageSystemAttributeNames: ["All"],
        // });

        // return from(this.SQSClient.send(receiveMessageCommand)).pipe(
        //     tap((commandOutput: ReceiveMessageCommandOutput) =>
        //         this.logger.log(`Received ${commandOutput.Messages?.length} message from ${queueName}`),
        //     ),
        //     map((commandOutput) => commandOutput.Messages ?? []),
        // );

        return of([]);
    }

    private processMessage(message: Message): Observable<Message> {
        throw new Error("Method not implemented.");
    }

    private handleProcessingFailure(error: Error, message: Message): Observable<Message> {
        throw new Error("Method not implemented.");
    }

    private deleteMessage(message: Message): Observable<Message> {
        throw new Error("Method not implemented.");
    }

    protected initializeSerializer(options: SqsOptions["options"]): void {
        this.serializer = options.serializer ?? new SqsRecordSerializer();
    }

    protected initializeDeserializer(options: SqsOptions["options"]): void {
        this.deserializer = options.deserializer ?? new SqsRecordDeserializer();
    }

    private discoverQueueNames(): string[] {
        const patterns = Array.from(this.getHandlers()).map(([packet, handler]) => {
            this.logger.log(`${packet} - ${handler.isEventHandler ? "event" : "command"}`);

            return handler.isEventHandler ? `${packet}-event-tmp` : `${packet}-command-tmp`;
        });

        return patterns;
    }
}
