type VoidCallback = () => void;
type OnErrorCallback = (error: Error) => void;

export enum SQSStatus {
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTING = "disconnecting",
    DISCONNECTED = "disconnected",
    RECONNECTING = "reconnecting",
    ERRORED = "errored",
}

export enum SQSEventsMap {
    STARTED = "started",
    FAILED = "failed",
    RECEIVE_MESSAGE = "receiveMessage",
    PROCESS_MESASGE = "processMessage",
    DELETE_MESSAGE = "deleteMessage",
    CHANGE_MESSAGE_VISIBILITY = "changeMessageVisibility",
}

export type SQSEvents = {
    [SQSEventsMap.STARTED]: VoidCallback;
    [SQSEventsMap.FAILED]: OnErrorCallback;
    [SQSEventsMap.RECEIVE_MESSAGE]: VoidCallback;
    [SQSEventsMap.PROCESS_MESASGE]: VoidCallback;
    [SQSEventsMap.DELETE_MESSAGE]: VoidCallback;
    [SQSEventsMap.CHANGE_MESSAGE_VISIBILITY]: VoidCallback;
};
