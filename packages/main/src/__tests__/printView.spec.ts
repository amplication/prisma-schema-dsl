import { createGenerator, createView } from "../builders";
import { print, printView } from "../print";
import {
  EXAMPLE_DOCUMENTATION,
  EXAMPLE_FIELD_NAME,
  EXAMPLE_MODEL_MAP,
  EXAMPLE_MODEL_NAME,
  EXAMPLE_OTHER_FIELD_NAME,
  EXAMPLE_OTHER_STRING_FIELD,
  EXAMPLE_STRING_ID_FIELD,
} from "./data";
import { getDMMF } from "@prisma/internals";
import { View } from "@pmaltese/prisma-schema-dsl-types";

const generateDMMF = async (view: View) => {
  const generator = createGenerator({
    name: "gen",
    provider: "prisma-client-js",
    previewFeatures: ["views"],
  });
  const printed = await print({
    models: [],
    views: [view],
    generators: [generator],
    enums: [],
  });

  return getDMMF({ datamodel: printed });
};

describe("printView", () => {
  it("single field", async () => {
    const view = createView({
      name: EXAMPLE_MODEL_NAME,
      fields: [EXAMPLE_STRING_ID_FIELD],
    });
    const meta = await generateDMMF(view);

    expect(meta).toMatchObject({
      datamodel: {
        models: [
          {
            name: EXAMPLE_MODEL_NAME,
            dbName: null,
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

  it("single field and documentation", async () => {
    const view = createView({
      name: EXAMPLE_MODEL_NAME,
      fields: [EXAMPLE_STRING_ID_FIELD],
      documentation: EXAMPLE_DOCUMENTATION,
    });
    const meta = await generateDMMF(view);

    expect(meta).toMatchObject({
      datamodel: {
        models: [
          {
            name: EXAMPLE_MODEL_NAME,
            dbName: null,
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
            documentation: "Example Documentation",
          },
        ],
      },
    });
  });

  it("two fields", async () => {
    const view = createView({
      name: EXAMPLE_MODEL_NAME,
      fields: [EXAMPLE_STRING_ID_FIELD, EXAMPLE_OTHER_STRING_FIELD],
    });
    const meta = await generateDMMF(view);

    expect(meta).toMatchObject({
      datamodel: {
        models: [
          {
            name: EXAMPLE_MODEL_NAME,
            dbName: null,
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
              {
                name: EXAMPLE_OTHER_FIELD_NAME,
                kind: "scalar",
                isList: false,
                isRequired: true,
                isUnique: false,
                isId: false,
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

  it("single field and map", async () => {
    const view = createView({
      name: EXAMPLE_MODEL_NAME,
      fields: [EXAMPLE_STRING_ID_FIELD],
      documentation: "",
      map: EXAMPLE_MODEL_MAP,
    });
    const meta = await generateDMMF(view);

    expect(meta).toMatchObject({
      datamodel: {
        models: [
          {
            name: EXAMPLE_MODEL_NAME,
            dbName: EXAMPLE_MODEL_MAP,
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
});
