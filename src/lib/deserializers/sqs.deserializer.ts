import type { Message } from "@aws-sdk/client-sqs";
import type { Deserializer, IncomingResponse } from "@nestjs/microservices";

export class SqsRecordDeserializer implements Deserializer<Message, IncomingResponse> {
    deserialize(value: Message): IncomingResponse {
        return {
            id: value.MessageId ?? "",
            response: value.Body,
            isDisposed: true,
        };
    }
}
