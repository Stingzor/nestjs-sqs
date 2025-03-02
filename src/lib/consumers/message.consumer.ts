import { EventEmitter } from "node:events";
import type { Message } from "@aws-sdk/client-sqs";
import { type Observable, type Subscription, catchError, from, map, mergeMap, takeWhile, tap, timer } from "rxjs";
import { type SQSEvents, SQSEventsMap } from "@lib/server/sqs.events";

export type ReceiveMessagesFn = (queueName: string) => Observable<Message[]>;
export type DeleteMessageFn = (message: Message) => Observable<Message>;
export type ProcessMessageFn = (message: Message) => Observable<Message>;
export type HandleFailureFn = (error: unknown, message: Message) => Observable<Message>;

export class MessageConsumer extends EventEmitter {
    private stream$: Observable<Message[]>;
    private subscription$: Subscription | null = null;

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
                this.emit(SQSEventsMap.PROCESS_MESSAGE, { queueName: this.queueName, messageId: message.MessageId }),
            ),
            mergeMap((message) => this.deleteMessage(message)),
            tap(() =>
                this.emit(SQSEventsMap.DELETE_MESSAGE, { queueName: this.queueName, messageId: message.MessageId }),
            ),
            catchError((error) =>
                this.handleFailure(error, message).pipe(
                    tap(() =>
                        this.emit(SQSEventsMap.FAILED, {
                            error,
                            queueName: this.queueName,
                            messageId: message.MessageId,
                        }),
                    ),
                ),
            ),
        );
    }

    public start(): Subscription {
        //this.logger.log(`Starting consumer for queue ${this.queueName}`);

        this.subscription$ = this.stream$.subscribe({
            error: (err) => {
                this.emit(SQSEventsMap.FAILED, { error: err, queueName: this.queueName });
            },
        });

        this.emit(SQSEventsMap.STARTED, this.queueName);
        return this.subscription$;
    }

    public stop() {
        //this.logger.log(`Stopping consumer for queue ${this.queueName}`);

        if (this.subscription$) {
            this.subscription$.unsubscribe();
            this.subscription$ = null;
        }

        this.emit(SQSEventsMap.STOPPED);
    }
}
