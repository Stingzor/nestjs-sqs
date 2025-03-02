import { Module } from "@nestjs/common";
import { SQSServer } from "@lib/server/sqs.server";
import { SqsRecordSerializer } from "@lib/serializers/sqs.serializer";
import { SqsRecordDeserializer } from "@lib/deserializers/sqs.deserializer";

@Module({
    imports: [],
    providers: [SQSServer, SqsRecordSerializer, SqsRecordDeserializer],
    exports: [SQSServer, SqsRecordSerializer, SqsRecordDeserializer],
})
export class ServerModule {}
