import { findDescritpr, findHandlerMethod } from "@lib/decorators/discovery";
import type { BaseMessage } from "@lib/types/base.message";
import { Controller, SetMetadata, applyDecorators } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

export function AsyncEventHandler(event: BaseMessage): ClassDecorator {
    return (target) => {
        const handlerMethod = findHandlerMethod(target);
        const descriptor = findDescritpr(target, handlerMethod);

        applyDecorators(EventPattern(event.constructor.name))(target.prototype, handlerMethod, descriptor);

        return applyDecorators(Controller(), SetMetadata("event", event.constructor.name))(target);
    };
}
