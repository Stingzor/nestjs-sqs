import { EventEmitter } from "node:events";
import type { Message } from "@aws-sdk/client-sqs";
import { Logger } from "@nestjs/common";
import type { MessageHandler } from "@nestjs/microservices";
import { SQSEventsMap, type SQSEvents } from "../server/sqs.events";
import {
    catchError,
    from,
    map,
    mergeMap,
    type Observable,
    takeWhile,
    tap,
    timer,
} from "rxjs";

export type ReceiveMessagesFn = (queueName: string) => Observable<Message[]>;
export type DeleteMessageFn = (message: Message) => Observable<Message>;
export type ProcessMessageFn = (message: Message) => Observable<Message>;
export type HandleFailureFn = (
    error: unknown,
    message: Message,
) => Observable<Message>;

export class MessageConsumer extends EventEmitter {
    private stream$: Observable<Message[]>;

    constructor(
        public readonly queueName: string,
        private readonly pollingDelayInMilliseconds: number,
        private readonly receiveMessages: ReceiveMessagesFn,
        private readonly processMessage: ProcessMessageFn,
        private readonly deleteMessage: DeleteMessageFn,
        private readonly handleFailure: HandleFailureFn,
    ) {
        super();
        this.stream$ = timer(0, this.pollingDelayInMilliseconds).pipe(
            takeWhile(() => true),
            mergeMap(() => this.receiveMessages(queueName)),
            tap(() => this.emit(SQSEventsMap.RECEIVE_MESSAGES)),
            mergeMap((messages) => this.handleMessages(messages)),
        );
    }

    private handleMessages(messages: Message[]): Observable<Message[]> {
        return from(messages).pipe(
            mergeMap((message) => this.handleMessage(message)),
            map(() => messages),
        );
    }

    private handleMessage(message: Message): Observable<Message> {
        return this.processMessage(message).pipe(
            tap(() =>
                this.emit(SQSEventsMap.PROCESS_MESASGE, message.MessageId),
            ),
            mergeMap((message) => this.deleteMessage(message)),
            tap(() =>
                this.emit(SQSEventsMap.DELETE_MESSAGE, message.MessageId),
            ),
            catchError((error) =>
                this.handleFailure(error, message).pipe(
                    tap(() =>
                        this.emit(SQSEventsMap.FAILED, message.MessageId),
                    ),
                ),
            ),
        );
    }

    public async start() {
        //this.logger.log(`Starting consumer for queue ${this.queueName}`);

        this.emit(SQSEventsMap.STARTED);
    }

    public async stop() {
        //this.logger.log(`Stopping consumer for queue ${this.queueName}`);

        this.emit(SQSEventsMap.STOPPED);
    }
}
