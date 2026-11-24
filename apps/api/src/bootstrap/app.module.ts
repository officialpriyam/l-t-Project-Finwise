import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { AppExceptionFilter } from "../kernel/exception.filter.js";
import { SessionGuard } from "../kernel/guards.js";
import { AccountModule } from "../domains/accounts/account.module.js";
import { AdminModule } from "../domains/admin/admin.module.js";
import { AiModule } from "../domains/intelligence/ai.module.js";
import { AnalyticsModule } from "../domains/reporting/analytics.module.js";
import { BillingModule } from "../domains/billing/billing.module.js";
import { BusinessModule } from "../domains/business/business.module.js";
import { CopilotModule } from "../domains/copilot/copilot.module.js";
import { IntegrationsModule } from "../domains/integrations/integrations.module.js";
import { JobsModule } from "../platform/jobs/jobs.module.js";
import { LedgerModule } from "../domains/accounting/ledger.module.js";
import { PlanningModule } from "../domains/planning/planning.module.js";
import { StorageModule } from "../platform/storage/storage.module.js";
import { SupportModule } from "../domains/support/support.module.js";
import { HealthController } from "../domains/ops/health.controller.js";
import { RateLimitGuard } from "../domains/ops/rate-limit.js";
import { SystemModule } from "../domains/ops/system.module.js";
import { WealthModule } from "../domains/wealth/wealth.module.js";
import { WorkspacesModule } from "../domains/tenancy/workspaces.module.js";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SystemModule,
    BillingModule,
    JobsModule,
    StorageModule,
    WorkspacesModule,
    LedgerModule,
    PlanningModule,
    WealthModule,
    BusinessModule,
    AnalyticsModule,
    AiModule,
    CopilotModule,
    IntegrationsModule,
    AdminModule,
    AccountModule,
    SupportModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: authenticate first, then rate-limit per user.
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useExisting: RateLimitGuard },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {}
