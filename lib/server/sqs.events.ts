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
	CONNECT = "connect",
	DISCONNECT = "disconnect",
	RECONNECT = "reconnect",
	ERROR = "error",
}

export type SQSEvents = {
	[SQSEventsMap.CONNECT]: VoidCallback;
	[SQSEventsMap.DISCONNECT]: VoidCallback;
	[SQSEventsMap.RECONNECT]: VoidCallback;
	[SQSEventsMap.ERROR]: OnErrorCallback;
};
