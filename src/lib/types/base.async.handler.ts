import type { BaseMessage } from "@lib/types/base.message";

export abstract class BaseAsyncHandler<T extends BaseMessage> {
    abstract handle(message: T): Promise<void>;
}
