import type { ReadPacket } from "@nestjs/microservices";
import type { Serializer } from "@nestjs/microservices";

export class SqsRecordSerializer implements Serializer<ReadPacket, string> {
	serialize(packet: ReadPacket): string {
		return JSON.stringify(packet);
	}
}
