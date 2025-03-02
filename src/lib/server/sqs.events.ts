type VoidCallback = () => void;
type OnErrorCallback = (error: Error) => void;

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
    FAILED = "failed",
    RECEIVE_MESSAGES = "receiveMessages",
    PROCESS_MESSAGE = "processMessage",
    DELETE_MESSAGE = "deleteMessage",
}

export type SQSEvents = {
    [SQSEventsMap.STARTED]: VoidCallback;
    [SQSEventsMap.STOPPED]: VoidCallback;
    [SQSEventsMap.FAILED]: OnErrorCallback;
    [SQSEventsMap.RECEIVE_MESSAGES]: VoidCallback;
    [SQSEventsMap.PROCESS_MESSAGE]: VoidCallback;
    [SQSEventsMap.DELETE_MESSAGE]: VoidCallback;
};
