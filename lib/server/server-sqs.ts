import { SQSClient } from "@aws-sdk/client-sqs";
import { Server } from "@nestjs/microservices";
import { SqsRecordDeserializer } from "lib/deserializers/sqs.deserializer";
import { SqsRecordSerializer } from "lib/serializers/sqs.serializer";
import type { SqsOptions } from "../types/sqs.configuration";
import type { SQSEvents, SQSStatus } from "./sqs.events";

export class ServerSQS extends Server<SQSEvents, SQSStatus> {
	private readonly SQSClient: SQSClient;

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

	public start(
		callback: (err?: unknown, ...optionalParams: unknown[]) => void,
	): Promise<void> {
		return Promise.resolve();
	}

	protected initializeSerializer(options: SqsOptions["options"]): void {
		this.serializer = options.serializer ?? new SqsRecordSerializer();
	}

	protected initializeDeserializer(options: SqsOptions["options"]): void {
		this.deserializer = options.deserializer ?? new SqsRecordDeserializer();
	}

	public on<
		EventKey extends keyof SQSEvents = keyof SQSEvents,
		EventCallback extends SQSEvents[EventKey] = SQSEvents[EventKey],
	>(_: EventKey, __: EventCallback) {}

	public unwrap<T = never>(): T {
		return this.SQSClient as T;
	}
}
