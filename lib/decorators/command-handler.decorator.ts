import { Controller, SetMetadata, applyDecorators } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import type { BaseCommand } from "../types/base.command";
import { findDescritpr, findHandlerMethod } from "./discovery";
export function AsyncCommandHandler(command: BaseCommand): ClassDecorator {
	return (target) => {
		const handlerMethod = findHandlerMethod(target);
		const descriptor = findDescritpr(target, handlerMethod);

		applyDecorators(MessagePattern(command.constructor.name))(
			target.prototype,
			handlerMethod,
			descriptor,
		);

		return applyDecorators(
			Controller(),
			SetMetadata("command", command.constructor.name),
		)(target);
	};
}
