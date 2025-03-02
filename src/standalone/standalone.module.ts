import { Module } from "@nestjs/common";
import { ServerModule } from "@lib/module/server.module";
import { StandaloneController } from "./controller";
import { TestCommandHandler } from "./handler";
@Module({
    imports: [ServerModule],
    controllers: [StandaloneController, TestCommandHandler],
    providers: [],
    exports: [ServerModule],
})
export class StandaloneModule {}
