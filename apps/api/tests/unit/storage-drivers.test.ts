import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { S3Client } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalDriver, S3Driver } from "../../src/platform/storage/drivers.js";

afterEach(() => {
  vi.restoreAllMocks();
});

async function bytes(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

describe("storage driver streams", () => {
  it("opens local files as readable streams and rejects missing files", async () => {
    const root = await mkdtemp(join(tmpdir(), "finwise-storage-"));
    try {
      const driver = new LocalDriver(root);
      const body = Buffer.from("%PDF-1.4 streamed receipt");
      await driver.put("workspace/receipt.pdf", body);
      expect(await bytes(await driver.getStream("workspace/receipt.pdf"))).toEqual(body);
      await expect(driver.getStream("workspace/missing.pdf")).rejects.toMatchObject({ code: "ENOENT" });
      await expect(driver.getStream("../outside.pdf")).rejects.toThrow("Invalid storage key");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("returns the S3 response body without buffering it", async () => {
    const body = Readable.from([Buffer.from("one"), Buffer.from("two")]);
    vi.spyOn(S3Client.prototype, "send").mockImplementation(async () => ({ Body: body }) as never);
    const driver = new S3Driver({
      endpoint: null,
      region: "us-east-1",
      bucket: "test-bucket",
      accessKeyId: "test-key",
      secretAccessKey: "test-secret",
      forcePathStyle: false,
      serverSideEncryption: false,
    });
    try {
      const stream = await driver.getStream("receipt.pdf");
      expect(stream).toBe(body);
      expect((await bytes(stream)).toString()).toBe("onetwo");
    } finally {
      driver.destroy();
    }
  });
});
