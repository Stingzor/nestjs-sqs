import { Controller, Post } from "@nestjs/common";

@Controller("standalone")
export class StandaloneController {
    @Post()
    async test(): Promise<void> {
        console.log("test");
    }
}
