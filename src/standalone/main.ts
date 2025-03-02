import { SqsRecordDeserializer } from "@lib/deserializers/sqs.deserializer";
import { SqsRecordSerializer } from "@lib/serializers/sqs.serializer";
import { SQSEventsMap } from "@lib/server/sqs.events";
import { SQSServer } from "@lib/server/sqs.server";
import { ConsoleLogger, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { StandaloneModule } from "@standalone/standalone.module";

async function main(): Promise<void> {
    const logger = new ConsoleLogger({
        colors: true,
        json: true,
        timestamp: true,
        prefix: "SQS Server",
    });

    const app = await NestFactory.create(StandaloneModule, {
        logger,
    });

    app.enableCors();
    const server = app.enableShutdownHooks().connectMicroservice<MicroserviceOptions>({
        strategy: new SQSServer({
            region: "us-east-1",
            credentials: {
                accessKeyId: "AKIA6666666666666666",
                secretAccessKey: "6666666666666666666666666666666666666666",
            },
            endpoint: "http://localhost:9324",
            baseQueueUrl: "http://localhost:9324/queue",
            useQueueUrlAsEndpoint: true,
            maxReceiveCount: 3,
            poolingDelayInMilliseconds: 5000,
            waitTimeSeconds: 20,
            batchReceiveSize: 1,
            failureVisibilityBackoffInMilliseconds: [1000, 2000, 3000],
            serializer: new SqsRecordSerializer(),
            deserializer: new SqsRecordDeserializer(),
        }),
    });

    server.status.subscribe((status) => {
        logger.log(`Server status: ${status}`);
    });

    server.on(SQSEventsMap.STARTED, () => {
        logger.log("SQS Polling started");
    });

    server.on(SQSEventsMap.STOPPED, () => {
        logger.log("SQS Polling stopped");
    });

    await app.startAllMicroservices();
    await app.listen(3000);
}

main().catch(console.error);
