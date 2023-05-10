import { Injectable } from "@nestjs/common";
import { env } from "./app.settings";

@Injectable()
export class AppService {
  getHello() {
    return {
      message: "Hello World!",
      git_hash: env("GIT_COMMIT"),
    };
  }
}
