import {
    type Message,
    ReceiveMessageCommand,
    SQSClient,
} from "@aws-sdk/client-sqs";
import { Server } from "@nestjs/microservices";
import { MessageConsumer } from "lib/consumers/message.consumer";
import { SqsRecordDeserializer } from "lib/deserializers/sqs.deserializer";
import { SqsRecordSerializer } from "lib/serializers/sqs.serializer";
import type { SqsOptions } from "../types/sqs.configuration";
import { type SQSEvents, SQSEventsMap, type SQSStatus } from "./sqs.events";

export class ServerSQS extends Server<SQSEvents, SQSStatus> {
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

    public async listen(
        callback: (err?: unknown, ...optionalParams: unknown[]) => void,
    ): Promise<void> {
        this.initializeSerializer(this.options);
        this.initializeDeserializer(this.options);

        return this.start(callback).catch(callback);
    }

    public close() {}

    public async start(
        callback: (err?: unknown, ...optionalParams: unknown[]) => void,
    ): Promise<void> {
        const discoveredQueueNames = this.discoverQueueNames();

        for (const queueName of discoveredQueueNames) {
            const messageConsumer = new MessageConsumer(
                queueName,
                this.getHandlerByPattern(queueName),
                (queueName) => this.receiveMessage(queueName),
            );

            messageConsumer.on(SQSEventsMap.STARTED, () =>
                this.logger.log(`Consumer for ${queueName} started`),
            );

            messageConsumer.on(SQSEventsMap.RECEIVE_MESSAGE, () =>
                this.logger.log(`Received message from ${queueName}`),
            );

            messageConsumer.on(SQSEventsMap.PROCESS_MESASGE, () =>
                this.logger.log(`Processing message from ${queueName}`),
            );

            messageConsumer.on(SQSEventsMap.DELETE_MESSAGE, () =>
                this.logger.log(`Deleting message from ${queueName}`),
            );

            messageConsumer.on(SQSEventsMap.CHANGE_MESSAGE_VISIBILITY, () =>
                this.logger.log(
                    `Changing message visibility from ${queueName}`,
                ),
            );

            for (const { eventKey, callback } of this.pendingEventListeners) {
                messageConsumer.on(eventKey, callback);
            }

            this.messageConsumers.push(messageConsumer);
            messageConsumer.start();
        }

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
                consumer.addProcessEventListener(eventKey, eventCallback);
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

    private async receiveMessage(queueName: string): Promise<Message[]> {
        const queueUrl = `${this.options.baseQueueUrl}/${queueName}`;

        const messages = await this.SQSClient.send(
            new ReceiveMessageCommand({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: this.options.batchReceiveSize,
                WaitTimeSeconds: this.options.waitTimeSeconds,
                MessageAttributeNames: ["All"],
                MessageSystemAttributeNames: ["All"],
            }),
        );

        return messages.Messages ?? [];
    }

    protected initializeSerializer(options: SqsOptions["options"]): void {
        this.serializer = options.serializer ?? new SqsRecordSerializer();
    }

    protected initializeDeserializer(options: SqsOptions["options"]): void {
        this.deserializer = options.deserializer ?? new SqsRecordDeserializer();
    }

    private discoverQueueNames(): string[] {
        const patterns = Array.from(this.getHandlers()).map(
            ([packet, handler]) => {
                return handler.isEventHandler
                    ? `${packet}-event-tmp`
                    : `${packet}-command-tmp`;
            },
        );

        return patterns;
    }
}
