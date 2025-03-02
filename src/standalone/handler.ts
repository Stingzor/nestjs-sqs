import { AsyncCommandHandler } from "@lib/decorators/command-handler.decorator";
import { BaseAsyncHandler } from "@lib/types/base.async.handler";
import { BaseCommand } from "@lib/types/base.command";

export class TestCommand extends BaseCommand {
    constructor(public readonly message: string) {
        super();
    }
}

@AsyncCommandHandler(TestCommand)
export class TestCommandHandler extends BaseAsyncHandler<TestCommand> {
    async handle(command: TestCommand): Promise<void> {
        console.log(command.message);
    }
}
