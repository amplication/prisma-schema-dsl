import { tmpdir } from "os";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { formatSchema } from "@prisma/sdk";

export async function format(schema: string): Promise<string> {
  const temporaryFilePath = createTemporaryFilePath();
  await fs.promises.mkdir(path.dirname(temporaryFilePath), { recursive: true });
  await fs.promises.writeFile(temporaryFilePath, schema);
  const formatted = await formatSchema({ schemaPath: temporaryFilePath });
  await fs.promises.unlink(temporaryFilePath);
  return formatted;
}

function createTemporaryFilePath(): string {
  const fileName = crypto.randomBytes(4).readUInt32LE(0);
  return path.join(tmpdir(), `${fileName}-schema.prisma`);
}
