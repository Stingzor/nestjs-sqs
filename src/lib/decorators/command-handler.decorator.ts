import { findDescritpr, findHandlerMethod } from "@lib/decorators/discovery";
import type { BaseCommand } from "@lib/types/base.command";
import { Controller, Logger, SetMetadata, applyDecorators } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

export function AsyncCommandHandler(command: BaseCommand): ClassDecorator {
    return (target) => {
        const commandName = typeof command === "function" ? command.name : command.constructor.name;
        const handlerMethod = findHandlerMethod(target);
        const descriptor = findDescritpr(target, handlerMethod);

        applyDecorators(MessagePattern(commandName))(target.prototype, handlerMethod, descriptor);

        return applyDecorators(Controller(), SetMetadata("command", commandName))(target);
    };
}
