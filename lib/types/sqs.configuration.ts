import type { Deserializer, Serializer } from "@nestjs/microservices";

export type SqsCredentials = {
	accessKeyId: string;
	secretAccessKey: string;
};

export interface SqsConfiguration {
	region: string;
	credentials: SqsCredentials | undefined;
	endpoint: string;
	baseQueueUrl: string;
	useQueueUrlAsEndpoint: boolean;
	maxReceiveCount: number;
	poolingDelayInMilliseconds: number;
	waitTimeSeconds: number;
	batchReceiveSize: number;
	failureVisibilityBackoffInMilliseconds: number[];
	serializer: Serializer;
	deserializer: Deserializer;
}

export interface SqsOptions {
	environment: string;
	options: SqsConfiguration;
}
