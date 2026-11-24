import type { AddressInfo } from "node:net";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../src/bootstrap/app.module.js";
import { env } from "../../src/kernel/env.js";
import { configureHttpServer } from "../../src/kernel/http-server.js";
import { closeDb, db } from "../../src/platform/data/index.js";
import { users, workspaceMembers, workspaces } from "../../src/platform/data/schema/index.js";
import { auth } from "../../src/platform/identity/auth.js";
import { resetDatabase } from "./harness.js";

let app: NestExpressApplication;
let base: string;

type Person = { userId: string; cookie: string; personalId: string; businessId: string };

async function signUp(name: string): Promise<Person> {
  const email = `${name.toLowerCase().replace(/\W+/g, "-")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.test`;
  const response = await auth.api.signUpEmail({
    body: { email, password: "correct horse battery staple", name },
    asResponse: true,
  });
  const cookie = response.headers
    .getSetCookie()
    .map((header) => header.split(";")[0])
    .join("; ");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error("User was not created");
  const owned = await db
    .select({ id: workspaces.id, kind: workspaces.kind })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, user.id));
  return {
    userId: user.id,
    cookie,
    personalId: owned.find((workspace) => workspace.kind === "personal")?.id as string,
    businessId: owned.find((workspace) => workspace.kind === "business")?.id as string,
  };
}

beforeAll(async () => {
  await resetDatabase();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
  configureHttpServer(app, { appUrl: env.APP_URL, trustProxy: "1" });
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api`;
});

afterAll(async () => {
  await app?.close();
  await closeDb();
});

describe("file HTTP downloads", () => {
  it("streams a file larger than 4.5 MB and keeps workspace authorization and download headers", async () => {
    const owner = await signUp("File Owner");
    const body = Buffer.alloc(5 * 1024 * 1024 + 17, 0x61);
    const form = new FormData();
    form.append("file", new Blob([body], { type: "application/pdf" }), "large-receipt.pdf");
    const uploaded = await fetch(`${base}/files?kind=receipt`, {
      method: "POST",
      headers: { cookie: owner.cookie, "x-workspace-id": owner.personalId },
      body: form,
    });
    expect(uploaded.status).toBe(201);
    const saved = (await uploaded.json()) as { id: string };
    const headers = { cookie: owner.cookie, "x-workspace-id": owner.personalId };

    try {
      expect((await fetch(`${base}/files/${saved.id}`)).status).toBe(401);
      const foreignWorkspace = await fetch(`${base}/files/${saved.id}`, {
        headers: { cookie: owner.cookie, "x-workspace-id": owner.businessId },
      });
      expect(foreignWorkspace.status).toBe(404);

      const download = await fetch(`${base}/files/${saved.id}`, { headers });
      expect(download.status).toBe(200);
      expect(download.headers.get("content-type")).toBe("application/pdf");
      expect(download.headers.get("content-length")).toBe(String(body.length));
      expect(download.headers.get("x-content-type-options")).toBe("nosniff");
      expect(download.headers.get("cache-control")).toBe("private, max-age=3600");
      expect(download.headers.get("content-security-policy")).toContain("sandbox");
      expect(download.headers.get("content-disposition")).toBe('inline; filename="large-receipt.pdf"');
      expect(Buffer.from(await download.arrayBuffer()).equals(body)).toBe(true);

      const attachment = await fetch(`${base}/files/${saved.id}?download=1`, { headers });
      expect(attachment.status).toBe(200);
      expect(attachment.headers.get("content-disposition")).toBe('attachment; filename="large-receipt.pdf"');
      await attachment.arrayBuffer();
    } finally {
      await fetch(`${base}/files/${saved.id}`, { method: "DELETE", headers });
    }
  });
});
