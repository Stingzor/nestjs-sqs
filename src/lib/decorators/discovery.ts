import { BaseAsyncHandler } from "@lib/types/base.async.handler";

// biome-ignore lint/complexity/noBannedTypes: Base type from Nestjs is of type Function, we cannot use the function definition and sadly, use the deprecated type
export function findHandlerMethod<T extends Function>(target: T): string {
    const isTargetAsyncBaseHandler = target.prototype instanceof BaseAsyncHandler;

    if (!isTargetAsyncBaseHandler) {
        throw new Error(
            "Target is not an instance of AsyncBaseHandler, make sure to follow the convetion, otherwise the handle method cannot be discovered.",
        );
    }

    const conventionHandlerMethod = Object.getOwnPropertyNames(target.prototype).find(
        (prototype) => prototype === BaseAsyncHandler.prototype.handle.name,
    );

    if (!conventionHandlerMethod) {
        throw new Error("Command handler method not found, something went incredily wrong because the Target matches.");
    }

    return conventionHandlerMethod;
}

// biome-ignore lint/complexity/noBannedTypes: Base type from Nestjs is of type Function, we cannot use the function definition and sadly, use the deprecated type
export function findDescritpr<T extends Function>(target: T, handlerMethod: string): PropertyDescriptor {
    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, handlerMethod);

    if (!descriptor) {
        throw new Error("Handler method not found, something went incredily wrong because the Target matches.");
    }

    if (descriptor.value === undefined) {
        throw new Error("Handler method is not defined, something went incredily wrong because the Target matches.");
    }

    return descriptor;
}
