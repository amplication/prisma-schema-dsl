import { getConfig } from "@prisma/internals";
import { createGenerator } from "../builders";
import { printGenerator } from "../print";
import {
  EXAMPLE_BINARY_TARGET,
  EXAMPLE_GENERATOR_NAME,
  EXAMPLE_GENERATOR_OUTPUT,
  EXAMPLE_GENERATOR_PREVIEW_FEATURE,
  EXAMPLE_GENERATOR_PROVIDER,
} from "./data";

describe("printGenerator", () => {
  test("name and provider only", async () => {
    const generator = createGenerator({
      name: EXAMPLE_GENERATOR_NAME,
      provider: EXAMPLE_GENERATOR_PROVIDER,
    });
    const printed = printGenerator(generator);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      generators: [
        {
          name: EXAMPLE_GENERATOR_NAME,
          provider: {
            fromEnvVar: null,
            value: EXAMPLE_GENERATOR_PROVIDER,
          },
        },
      ],
    });
  });

  test("output", async () => {
    const generator = createGenerator({
      name: EXAMPLE_GENERATOR_NAME,
      provider: EXAMPLE_GENERATOR_PROVIDER,
      output: EXAMPLE_GENERATOR_OUTPUT,
    });
    const printed = printGenerator(generator);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      generators: [
        {
          name: EXAMPLE_GENERATOR_NAME,
          provider: {
            fromEnvVar: null,
            value: EXAMPLE_GENERATOR_PROVIDER,
          },
          output: {
            fromEnvVar: null,
            value: EXAMPLE_GENERATOR_OUTPUT,
          },
        },
      ],
    });
  });

  test("binary targets", async () => {
    const generator = createGenerator({
      name: EXAMPLE_GENERATOR_NAME,
      provider: EXAMPLE_GENERATOR_PROVIDER,
      output: null,
      binaryTargets: [EXAMPLE_BINARY_TARGET],
    });
    const printed = printGenerator(generator);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      generators: [
        {
          name: EXAMPLE_GENERATOR_NAME,
          provider: {
            fromEnvVar: null,
            value: EXAMPLE_GENERATOR_PROVIDER,
          },
          binaryTargets: [
            {
              fromEnvVar: null,
              value: "example-binary-target",
            },
          ],
        },
      ],
    });
  });

  test("preview features", async () => {
    const generator = createGenerator({
      name: EXAMPLE_GENERATOR_NAME,
      provider: EXAMPLE_GENERATOR_PROVIDER,
      previewFeatures: [EXAMPLE_GENERATOR_PREVIEW_FEATURE],
    });
    const printed = printGenerator(generator);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      generators: [
        {
          name: EXAMPLE_GENERATOR_NAME,
          provider: {
            fromEnvVar: null,
            value: EXAMPLE_GENERATOR_PROVIDER,
          },
          previewFeatures: ["fullTextSearch"],
        },
      ],
    });
  });
});
