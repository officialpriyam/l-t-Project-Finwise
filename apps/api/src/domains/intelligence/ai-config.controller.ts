import { type AiConfigInput, type AiConfigTestInput, aiConfigInput, aiConfigTestInput } from "@finwise/core";
import { Body, Controller, Delete, Get, HttpCode, Inject, Post, Put, UseGuards } from "@nestjs/common";
import type { SessionUser } from "../../kernel/context.js";
import { AdminGuard, CurrentUser } from "../../kernel/guards.js";
import { zod } from "../../kernel/zod.js";
import { RateLimit } from "../ops/rate-limit.js";
import { AiConfigService } from "./ai-config.service.js";

/** /api/admin/ai-config — the installation's AI provider. Platform administrators only. */
@Controller("admin/ai-config")
@UseGuards(AdminGuard)
export class AiConfigController {
  constructor(@Inject(AiConfigService) private readonly config: AiConfigService) {}

  @Get()
  view() {
    return this.config.view();
  }

  @Put()
  update(@Body(zod(aiConfigInput)) body: AiConfigInput, @CurrentUser() user: SessionUser) {
    return this.config.update(body, user.id);
  }

  /** Small real calls against the provider; rate limited because each one costs a little. */
  @Post("test")
  @HttpCode(200)
  @RateLimit("ai-config-test", 10, 60)
  test(@Body(zod(aiConfigTestInput)) body: AiConfigTestInput) {
    return this.config.test(body);
  }

  @Delete()
  reset(@CurrentUser() user: SessionUser) {
    return this.config.reset(user.id);
  }
}
