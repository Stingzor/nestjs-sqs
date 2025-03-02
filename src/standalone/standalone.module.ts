import { ServerModule } from "@lib/module/server.module";
import { Module } from "@nestjs/common";
import { StandaloneController } from "./controller";
import { TestCommandHandler } from "./handler";
@Module({
    imports: [ServerModule],
    controllers: [StandaloneController, TestCommandHandler],
    providers: [],
    exports: [ServerModule],
})
export class StandaloneModule {}
