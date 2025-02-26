import { EventEmitter } from "node:events";
import type { Message } from "@aws-sdk/client-sqs";
import { Logger } from "@nestjs/common";
import type { MessageHandler } from "@nestjs/microservices";
import type { SQSEvents } from "../server/sqs.events";

export type ReceiveMessageFn = (queueName: string) => Promise<Message[]>;
export type DeleteMessageFn = (message: Message) => Promise<void>;

export class MessageConsumer extends EventEmitter {
    private logger: Logger;
    private mappedEventKeys = new Set<keyof SQSEvents>();

    constructor(
        public readonly queueName: string,
        private readonly messageHandler: MessageHandler,
        private readonly receiveMessage: ReceiveMessageFn,
    ) {
        super();

        this.logger = new Logger(`Consumer#${queueName}`);
    }

    public async start() {
        this.logger.log(`Starting consumer for queue ${this.queueName}`);
    }

    public async stop() {
        this.logger.log(`Stopping consumer for queue ${this.queueName}`);
    }

    public addProcessEventListener<
        EventKey extends keyof SQSEvents = keyof SQSEvents,
        EventCallback extends SQSEvents[EventKey] = SQSEvents[EventKey],
    >(event: EventKey, callback: EventCallback) {
        if (this.mappedEventKeys.has(event)) {
            this.logger.warn(`Event ${event} is already mapped`);
            return;
        }

        this.on(event, callback);
    }
}
