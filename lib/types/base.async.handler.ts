import type { BaseMessage } from "./base.message";

export abstract class BaseAsyncHandler {
    abstract handle(message: BaseMessage): Promise<void>;
}
