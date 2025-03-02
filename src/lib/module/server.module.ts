import { SqsRecordDeserializer } from "@lib/deserializers/sqs.deserializer";
import { SqsRecordSerializer } from "@lib/serializers/sqs.serializer";
import { SQSServer } from "@lib/server/sqs.server";
import { Module } from "@nestjs/common";

@Module({
    imports: [],
    providers: [SQSServer, SqsRecordSerializer, SqsRecordDeserializer],
    exports: [SQSServer, SqsRecordSerializer, SqsRecordDeserializer],
})
export class ServerModule {}
