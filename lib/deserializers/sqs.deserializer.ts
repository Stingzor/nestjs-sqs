import type { Deserializer, IncomingResponse } from "@nestjs/microservices";
import type { Message } from "@aws-sdk/client-sqs";

export class SqsRecordDeserializer
	implements Deserializer<Message, IncomingResponse>
{
	deserialize(value: Message): IncomingResponse {
		return {
			id: value.MessageId,
			response: value.Body,
			isDisposed: true,
		};
	}
}
