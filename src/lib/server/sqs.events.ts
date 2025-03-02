import type { Message } from "@aws-sdk/client-sqs";

type VoidCallback = () => boolean;
type OnFailedCallback = (error: Error, messageId: string) => boolean;
type OnReceiveMessagesCallback = (messages: Message[]) => boolean;
type OnProcessMessageCallback = (messageId: string) => boolean;
type OnDeleteMessageCallback = (messageId: string) => boolean;

export enum SQSStatus {
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTING = "disconnecting",
    DISCONNECTED = "disconnected",
    ERRORED = "errored",
}

export enum SQSEventsMap {
    STARTED = "started",
    STOPPED = "stopped",
    RECEIVED_MESSAGES = "receivedMessages",
    MESSAGE_PROCESSING_FAILED = "messageProcessingFailed",
    MESSAGE_PROCESSED = "messageProcessed",
    MESSAGE_DELETED = "messageDeleted",
}

export type SQSEvents = {
    [SQSEventsMap.STARTED]: VoidCallback;
    [SQSEventsMap.STOPPED]: VoidCallback;
    [SQSEventsMap.MESSAGE_PROCESSING_FAILED]: OnFailedCallback;
    [SQSEventsMap.RECEIVED_MESSAGES]: OnReceiveMessagesCallback;
    [SQSEventsMap.MESSAGE_PROCESSED]: OnProcessMessageCallback;
    [SQSEventsMap.MESSAGE_DELETED]: OnDeleteMessageCallback;
};
