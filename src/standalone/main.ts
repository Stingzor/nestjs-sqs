import { NestFactory } from "@nestjs/core";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { SQSServer } from "@lib/server/sqs.server";
import { SqsRecordSerializer } from "@lib/serializers/sqs.serializer";
import { SqsRecordDeserializer } from "@lib/deserializers/sqs.deserializer";
import { StandaloneModule } from "@standalone/standalone.module";

async function main(): Promise<void> {
    const app = await NestFactory.create(StandaloneModule);

    app.enableCors();
    app.enableShutdownHooks().connectMicroservice<MicroserviceOptions>({
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
            poolingDelayInMilliseconds: 1000,
            waitTimeSeconds: 20,
            batchReceiveSize: 1,
            failureVisibilityBackoffInMilliseconds: [1000, 2000, 3000],
            serializer: new SqsRecordSerializer(),
            deserializer: new SqsRecordDeserializer(),
        }),
    });

    await app.startAllMicroservices();
    await app.listen(3000);
}

main().catch(console.error);
