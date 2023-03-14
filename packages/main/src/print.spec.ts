import {
  createDataSource,
  createEnum,
  createGenerator,
  createModel,
  createObjectField,
  createScalarField,
  createSchema,
} from "./builders";
import {
  print,
  printDocumentation,
  printEnum,
  printField,
  printGenerator,
  printModel,
  printModelMap,
} from "./print";
import {
  AUTO_INCREMENT,
  CUID,
  DataSourceProvider,
  Enum,
  Generator,
  Model,
  NOW,
  ObjectField,
  ScalarField,
  ScalarType,
  Schema,
  UUID,
} from "@pmaltese/prisma-schema-dsl-types";

const EXAMPLE_DOCUMENTATION = "Example Documentation";
const EXAMPLE_ENUM_NAME = "ExampleEnumName";
const EXAMPLE_ENUM_VALUE = "ExampleEnumValue";
const EXAMPLE_OTHER_ENUM_VALUE = "ExampleOtherEnumValue";
const EXAMPLE_FIELD_NAME = "exampleFieldName";
const EXAMPLE_RELATION_FIELD_NAME = "exampleRelationFieldName";
const EXAMPLE_RELATION_REFERENCE_FIELD_NAME =
  "exampleRelationReferenceFieldName";
const EXAMPLE_STRING_FIELD = createScalarField({
  name: EXAMPLE_FIELD_NAME,
  type: ScalarType.String,
  isList: false,
  isRequired: true,
});
const EXAMPLE_OTHER_STRING_FIELD = createScalarField({
  name: "exampleOtherFieldName",
  type: ScalarType.String,
  isList: false,
  isRequired: true,
});
const EXAMPLE_OBJECT_NAME = "ExampleObjectName";
const EXAMPLE_MODEL_NAME = "ExampleModelName";
const EXAMPLE_MODEL = createModel({
  name: EXAMPLE_MODEL_NAME,
  fields: [EXAMPLE_STRING_FIELD],
});
const EXAMPLE_GENERATOR_NAME = "exampleGeneratorName";
const EXAMPLE_GENERATOR_PROVIDER = "exampleGeneratorProvider";
const EXAMPLE_GENERATOR_OUTPUT = "example-generator-output";
const EXAMPLE_BINARY_TARGET = "example-binary-target";
const EXAMPLE_DATA_SOURCE_NAME = "exampleDataSource";
const EXAMPLE_DATA_SOURCE_PROVIDER = DataSourceProvider.MySQL;
const EXAMPLE_DATA_SOURCE_URL = "mysql://example.com";
const EXAMPLE_RELATION_NAME = "exampleRelationName";
const EXAMPLE_MODEL_MAP = "ExampleMappedName";
const POSTGRES_SQL_PROVIDER = DataSourceProvider.PostgreSQL;

describe("printEnum", () => {
  const cases: Array<[string, Enum, string]> = [
    [
      "Single value",
      createEnum({
        name: EXAMPLE_ENUM_NAME,
        values: [EXAMPLE_ENUM_VALUE],
      }),
      `enum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n}`,
    ],
    [
      "Single value with documentation",
      createEnum({
        name: EXAMPLE_ENUM_NAME,
        values: [EXAMPLE_ENUM_VALUE],
        documentation: EXAMPLE_DOCUMENTATION,
      }),
      `${printDocumentation(
        EXAMPLE_DOCUMENTATION
      )}\nenum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n}`,
    ],
    [
      "Two values",
      createEnum({
        name: EXAMPLE_ENUM_NAME,
        values: [EXAMPLE_ENUM_VALUE, EXAMPLE_OTHER_ENUM_VALUE],
      }),
      `enum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n${EXAMPLE_OTHER_ENUM_VALUE}\n}`,
    ],
  ];
  test.each(cases)("%s", (name, enum_, expected) => {
    expect(printEnum(enum_)).toBe(expected);
  });
});

describe("printField", () => {
  const cases: Array<[string, ObjectField | ScalarField, string]> = [
    [
      "Simple string field",
      EXAMPLE_STRING_FIELD,
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}`,
    ],
    [
      "Simple string field with documentation",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.String,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: undefined,
        documentation: EXAMPLE_DOCUMENTATION,
      }),
      `${printDocumentation(EXAMPLE_DOCUMENTATION)}\n${EXAMPLE_FIELD_NAME} ${
        ScalarType.String
      }`,
    ],
    [
      "Simple float field",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.Float,
        isList: false,
        isRequired: true,
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Float}`,
    ],
    [
      "Simple optional string field",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.String,
        isRequired: false,
        isUnique: false,
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}?`,
    ],
    [
      "Simple string array field",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.String,
        isList: true,
        isRequired: true,
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}[]`,
    ],
    [
      "Simple date-time field",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.DateTime,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.DateTime}`,
    ],
    [
      "Int field with default",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.Int,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: 42,
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(42)`,
    ],
    [
      "Int field with autoincrement()",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.Int,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: { callee: AUTO_INCREMENT },
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(autoincrement())`,
    ],
    [
      "String field with uuid()",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.String,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: { callee: UUID },
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(uuid())`,
    ],
    [
      "String field with cuid()",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.String,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: { callee: CUID },
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(cuid())`,
    ],
    [
      "Date-time field with now()",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.DateTime,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: { callee: NOW },
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.DateTime} @default(now())`,
    ],
    [
      "Boolean field with default value",
      createScalarField({
        name: EXAMPLE_FIELD_NAME,
        type: ScalarType.Boolean,
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isUpdatedAt: false,
        defaultValue: true,
      }),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Boolean} @default(true)`,
    ],
    [
      "Simple object field",
      createObjectField({
        name: EXAMPLE_FIELD_NAME,
        type: EXAMPLE_OBJECT_NAME,
        isList: false,
        isRequired: true,
      }),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME}`,
    ],
    [
      "Object field with relation",
      createObjectField({
        name: EXAMPLE_FIELD_NAME,
        type: EXAMPLE_OBJECT_NAME,
        isList: false,
        isRequired: true,
        relationName: EXAMPLE_RELATION_NAME,
      }),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(name: "${EXAMPLE_RELATION_NAME}")`,
    ],
    [
      "Object field with fields",
      createObjectField({
        name: EXAMPLE_FIELD_NAME,
        type: EXAMPLE_OBJECT_NAME,
        isList: false,
        isRequired: true,
        relationName: null,
        relationFields: [EXAMPLE_RELATION_FIELD_NAME],
      }),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(fields: [${EXAMPLE_RELATION_FIELD_NAME}])`,
    ],
    [
      "Object field with references",
      createObjectField({
        name: EXAMPLE_FIELD_NAME,
        type: EXAMPLE_OBJECT_NAME,
        isList: false,
        isRequired: true,
        relationName: null,
        relationFields: [],
        relationReferences: [EXAMPLE_RELATION_REFERENCE_FIELD_NAME],
      }),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(references: [${EXAMPLE_RELATION_REFERENCE_FIELD_NAME}])`,
    ],
    [
      "Object field with full relation",
      createObjectField({
        name: EXAMPLE_FIELD_NAME,
        type: EXAMPLE_OBJECT_NAME,
        isList: false,
        isRequired: true,
        relationName: EXAMPLE_RELATION_NAME,
        relationFields: [EXAMPLE_RELATION_FIELD_NAME],
        relationReferences: [EXAMPLE_RELATION_REFERENCE_FIELD_NAME],
      }),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(name: "${EXAMPLE_RELATION_NAME}", fields: [${EXAMPLE_RELATION_FIELD_NAME}], references: [${EXAMPLE_RELATION_REFERENCE_FIELD_NAME}])`,
    ],
  ];
  test.each(cases)("%s", (name, field, expected) => {
    expect(printField(field, POSTGRES_SQL_PROVIDER)).toBe(expected);
  });
});

describe("printModel", () => {
  const cases: Array<[string, Model, string]> = [
    [
      "Single field",
      createModel({
        name: EXAMPLE_MODEL_NAME,
        fields: [EXAMPLE_STRING_FIELD],
      }),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Single field and documentation",
      createModel({
        name: EXAMPLE_MODEL_NAME,
        fields: [EXAMPLE_STRING_FIELD],
        documentation: EXAMPLE_DOCUMENTATION,
      }),
      `${printDocumentation(EXAMPLE_DOCUMENTATION)}
model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Two fields",
      createModel({
        name: EXAMPLE_MODEL_NAME,
        fields: [EXAMPLE_STRING_FIELD, EXAMPLE_OTHER_STRING_FIELD],
      }),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
${printField(EXAMPLE_OTHER_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Single field and map",
      createModel({
        name: EXAMPLE_MODEL_NAME,
        fields: [EXAMPLE_STRING_FIELD],
        documentation: "",
        map: EXAMPLE_MODEL_MAP,
      }),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}

${printModelMap(EXAMPLE_MODEL_MAP)}
}`,
    ],
  ];
  test.each(cases)("%s", (name, model, expected) => {
    expect(printModel(model, POSTGRES_SQL_PROVIDER)).toBe(expected);
  });
});

describe("printGenerator", () => {
  const cases: Array<[string, Generator, string]> = [
    [
      "Name and provider only",
      createGenerator({
        name: EXAMPLE_GENERATOR_NAME,
        provider: EXAMPLE_GENERATOR_PROVIDER,
      }),
      `generator ${EXAMPLE_GENERATOR_NAME} {
  provider = "${EXAMPLE_GENERATOR_PROVIDER}"
}`,
    ],
    [
      "With output",
      createGenerator({
        name: EXAMPLE_GENERATOR_NAME,
        provider: EXAMPLE_GENERATOR_PROVIDER,
        output: EXAMPLE_GENERATOR_OUTPUT,
      }),
      `generator ${EXAMPLE_GENERATOR_NAME} {
  provider = "${EXAMPLE_GENERATOR_PROVIDER}"
  output = "${EXAMPLE_GENERATOR_OUTPUT}"
}`,
    ],
    [
      "With binary targets",
      createGenerator({
        name: EXAMPLE_GENERATOR_NAME,
        provider: EXAMPLE_GENERATOR_PROVIDER,
        output: null,
        binaryTargets: [EXAMPLE_BINARY_TARGET],
      }),
      `generator ${EXAMPLE_GENERATOR_NAME} {
  provider = "${EXAMPLE_GENERATOR_PROVIDER}"
  binaryTargets = ["${EXAMPLE_BINARY_TARGET}"]
}`,
    ],
  ];
  test.each(cases)("%s", (name, generator, expected) => {
    expect(printGenerator(generator)).toBe(expected);
  });
});

describe("print", () => {
  const cases: Array<[string, Schema, string]> = [
    [
      "Simple model",
      createSchema({ models: [EXAMPLE_MODEL], enums: [] }),
      `model ${EXAMPLE_MODEL.name} {
  ${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Two models",
      createSchema({
        models: [
          EXAMPLE_MODEL,
          createModel({
            name: "Order",
            fields: [EXAMPLE_STRING_FIELD],
          }),
        ],
        enums: [],
      }),
      `model ${EXAMPLE_MODEL.name} {
  ${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}

model Order {
  ${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Single datasource",
      createSchema({
        models: [],
        enums: [],
        dataSource: createDataSource({
          name: EXAMPLE_DATA_SOURCE_NAME,
          provider: EXAMPLE_DATA_SOURCE_PROVIDER,
          url: EXAMPLE_DATA_SOURCE_URL,
        }),
      }),
      `datasource ${EXAMPLE_DATA_SOURCE_NAME} {
  provider = "${EXAMPLE_DATA_SOURCE_PROVIDER}"
  url      = "${EXAMPLE_DATA_SOURCE_URL}"
}`,
    ],
    [
      "Single generator",
      createSchema({
        models: [],
        enums: [],
        dataSource: undefined,
        generators: [
          createGenerator({
            name: EXAMPLE_GENERATOR_NAME,
            provider: EXAMPLE_GENERATOR_PROVIDER,
          }),
        ],
      }),
      `${printGenerator(
        createGenerator({
          name: EXAMPLE_GENERATOR_NAME,
          provider: EXAMPLE_GENERATOR_PROVIDER,
        })
      )}`,
    ],
    [
      "Single enum",
      createSchema({
        models: [],
        enums: [
          createEnum({
            name: EXAMPLE_ENUM_NAME,
            values: [EXAMPLE_ENUM_VALUE],
          }),
        ],
      }),
      `enum ${EXAMPLE_ENUM_NAME} {
  ${EXAMPLE_ENUM_VALUE}
}`,
    ],
  ];
  test.each(cases)("print(%s)", async (name, schema, expected) => {
    expect(await await print(schema)).toBe(expected + "\n");
  });
});
