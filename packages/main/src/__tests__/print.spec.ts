import {
  createDataSource,
  createEnum,
  createGenerator,
  createModel,
  createSchema,
} from "../builders";
import { print } from "../print";
import {
  EXAMPLE_DATA_SOURCE_NAME,
  EXAMPLE_DATA_SOURCE_PROVIDER,
  EXAMPLE_DATA_SOURCE_URL,
  EXAMPLE_ENUM_NAME,
  EXAMPLE_ENUM_VALUE,
  EXAMPLE_FIELD_NAME,
  EXAMPLE_GENERATOR_NAME,
  EXAMPLE_GENERATOR_PROVIDER,
  EXAMPLE_MODEL,
  EXAMPLE_MODEL_NAME,
  EXAMPLE_STRING_ID_FIELD,
} from "./data";
import { getConfig, getDMMF } from "@prisma/internals";

describe("print", () => {
  test("simple model", async () => {
    const schema = createSchema({ models: [EXAMPLE_MODEL], enums: [] });
    const printed = await print(schema);
    const meta = await getDMMF({ datamodel: printed });

    expect(meta).toMatchObject({
      datamodel: {
        models: [
          {
            name: EXAMPLE_MODEL_NAME,
            fields: [
              {
                name: EXAMPLE_FIELD_NAME,
                kind: "scalar",
                isList: false,
                isRequired: true,
                isUnique: false,
                isId: true,
                isReadOnly: false,
                hasDefaultValue: false,
                type: "String",
                isGenerated: false,
                isUpdatedAt: false,
              },
            ],
          },
        ],
      },
    });
  });

  test("two models", async () => {
    const schema = createSchema({
      models: [
        EXAMPLE_MODEL,
        createModel({
          name: "Order",
          fields: [EXAMPLE_STRING_ID_FIELD],
        }),
      ],
      enums: [],
    });
    const printed = await print(schema);
    const meta = await getDMMF({ datamodel: printed });

    expect(meta).toMatchObject({
      datamodel: {
        models: [
          {
            name: EXAMPLE_MODEL_NAME,
            fields: [
              {
                name: EXAMPLE_FIELD_NAME,
                kind: "scalar",
                isList: false,
                isRequired: true,
                isUnique: false,
                isId: true,
                isReadOnly: false,
                hasDefaultValue: false,
                type: "String",
                isGenerated: false,
                isUpdatedAt: false,
              },
            ],
          },
          {
            name: "Order",
            fields: [
              {
                name: EXAMPLE_FIELD_NAME,
                kind: "scalar",
                isList: false,
                isRequired: true,
                isUnique: false,
                isId: true,
                isReadOnly: false,
                hasDefaultValue: false,
                type: "String",
                isGenerated: false,
                isUpdatedAt: false,
              },
            ],
          },
        ],
      },
    });
  });

  test("single datasource", async () => {
    const schema = createSchema({
      models: [],
      enums: [],
      dataSource: createDataSource({
        name: EXAMPLE_DATA_SOURCE_NAME,
        provider: EXAMPLE_DATA_SOURCE_PROVIDER,
        url: EXAMPLE_DATA_SOURCE_URL,
      }),
    });
    const printed = await print(schema);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      datasources: [
        {
          name: EXAMPLE_DATA_SOURCE_NAME,
          provider: "mysql",
          activeProvider: "mysql",
          url: {
            fromEnvVar: null,
            value: "mysql://example.com",
          },
          schemas: [],
        },
      ],
    });
  });

  test("single datasource with relationMode", async () => {
    const schema = createSchema({
      models: [],
      enums: [],
      dataSource: createDataSource({
        name: EXAMPLE_DATA_SOURCE_NAME,
        provider: EXAMPLE_DATA_SOURCE_PROVIDER,
        url: EXAMPLE_DATA_SOURCE_URL,
        relationMode: "prisma",
      }),
    });
    const printed = await print(schema);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      datasources: [
        {
          name: EXAMPLE_DATA_SOURCE_NAME,
          provider: "mysql",
          activeProvider: "mysql",
          url: {
            fromEnvVar: null,
            value: "mysql://example.com",
          },
          schemas: [],
        },
      ],
    });
  });

  test("single generator", async () => {
    const schema = createSchema({
      models: [],
      enums: [],
      dataSource: undefined,
      generators: [
        createGenerator({
          name: EXAMPLE_GENERATOR_NAME,
          provider: EXAMPLE_GENERATOR_PROVIDER,
        }),
      ],
    });
    const printed = await print(schema);
    const config = await getConfig({ datamodel: printed });

    expect(config).toMatchObject({
      generators: [
        {
          name: EXAMPLE_GENERATOR_NAME,
          provider: {
            fromEnvVar: null,
            value: EXAMPLE_GENERATOR_PROVIDER,
          },
          output: null,
          config: {},
          binaryTargets: [],
          previewFeatures: [],
        },
      ],
    });
  });

  test("single enum", async () => {
    const schema = createSchema({
      models: [],
      enums: [
        createEnum({
          name: EXAMPLE_ENUM_NAME,
          values: [EXAMPLE_ENUM_VALUE],
        }),
      ],
    });
    const printed = await print(schema);
    const meta = await getDMMF({ datamodel: printed });

    expect(meta).toMatchObject({
      datamodel: {
        enums: [
          {
            name: EXAMPLE_ENUM_NAME,
            values: [
              {
                name: EXAMPLE_ENUM_VALUE,
              },
            ],
          },
        ],
        models: [],
      },
    });
  });
});
