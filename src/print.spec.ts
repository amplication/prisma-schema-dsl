import {
  createSchema,
  createModel,
  createScalarField,
  createObjectField,
  createDataSource,
  createGenerator,
  createEnum,
} from "./builders";
import {
  print,
  printField,
  printModel,
  printGenerator,
  printEnum,
  printDocumentation,
} from "./print";
import {
  ScalarType,
  Schema,
  ObjectField,
  ScalarField,
  DataSourceProvider,
  Model,
  Generator,
  CallExpression,
  AUTO_INCREMENT,
  UUID,
  CUID,
  NOW,
  Enum,
} from "./types";

const EXAMPLE_DOCUMENTATION = "Example Documentation";
const EXAMPLE_ENUM_NAME = "ExampleEnumName";
const EXAMPLE_ENUM_VALUE = "ExampleEnumValue";
const EXAMPLE_OTHER_ENUM_VALUE = "ExampleOtherEnumValue";
const EXAMPLE_FIELD_NAME = "exampleFieldName";
const EXAMPLE_RELATION_FIELD_NAME = "exampleRelationFieldName";
const EXAMPLE_RELATION_REFERENCE_FIELD_NAME =
  "exampleRelationReferenceFieldName";
const EXAMPLE_STRING_FIELD = createScalarField(
  EXAMPLE_FIELD_NAME,
  ScalarType.String,
  false,
  true
);
const EXAMPLE_OTHER_STRING_FIELD = createScalarField(
  "exampleOtherFieldName",
  ScalarType.String,
  false,
  true
);
const EXAMPLE_OBJECT_NAME = "ExampleObjectName";
const EXAMPLE_MODEL_NAME = "ExampleModelName";
const EXAMPLE_MODEL = createModel(EXAMPLE_MODEL_NAME, [EXAMPLE_STRING_FIELD]);
const EXAMPLE_GENERATOR_NAME = "exampleGeneratorName";
const EXAMPLE_GENERATOR_PROVIDER = "exampleGeneratorProvider";
const EXAMPLE_GENERATOR_OUTPUT = "example-generator-output";
const EXAMPLE_BINARY_TARGET = "example-binary-target";
const EXAMPLE_DATA_SOURCE_NAME = "exampleDataSource";
const EXAMPLE_DATA_SOURCE_PROVIDER = DataSourceProvider.MySQL;
const EXAMPLE_DATA_SOURCE_URL = "mysql://example.com";
const EXAMPLE_RELATION_NAME = "exampleRelationName";

describe("printEnum", () => {
  const cases: Array<[string, Enum, string]> = [
    [
      "Single value",
      createEnum(EXAMPLE_ENUM_NAME, [EXAMPLE_ENUM_VALUE]),
      `enum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n}`,
    ],
    [
      "Single value with documentation",
      createEnum(
        EXAMPLE_ENUM_NAME,
        [EXAMPLE_ENUM_VALUE],
        EXAMPLE_DOCUMENTATION
      ),
      `${printDocumentation(
        EXAMPLE_DOCUMENTATION
      )}\nenum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n}`,
    ],
    [
      "Two values",
      createEnum(EXAMPLE_ENUM_NAME, [
        EXAMPLE_ENUM_VALUE,
        EXAMPLE_OTHER_ENUM_VALUE,
      ]),
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
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        false,
        false,
        undefined,
        EXAMPLE_DOCUMENTATION
      ),
      `${printDocumentation(EXAMPLE_DOCUMENTATION)}\n${EXAMPLE_FIELD_NAME} ${
        ScalarType.String
      }`,
    ],
    [
      "Simple float field",
      createScalarField(EXAMPLE_FIELD_NAME, ScalarType.Float, false, true),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Float}`,
    ],
    [
      "Simple optional string field",
      createScalarField(EXAMPLE_FIELD_NAME, ScalarType.String, false, false),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}?`,
    ],
    [
      "Simple string array field",
      createScalarField(EXAMPLE_FIELD_NAME, ScalarType.String, true, true),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}[]`,
    ],
    [
      "Simple date-time field",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.DateTime,
        false,
        true,
        false,
        false,
        false
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.DateTime}`,
    ],
    [
      "Int field with default",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.Int,
        false,
        true,
        false,
        false,
        false,
        42
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(42)`,
    ],
    [
      "Int field with autoincrement()",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.Int,
        false,
        true,
        false,
        false,
        false,
        new CallExpression(AUTO_INCREMENT)
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(autoincrement())`,
    ],
    [
      "String field with uuid()",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        false,
        false,
        new CallExpression(UUID)
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(uuid())`,
    ],
    [
      "String field with cuid()",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        false,
        false,
        new CallExpression(CUID)
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(cuid())`,
    ],
    [
      "Date-time field with now()",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.DateTime,
        false,
        true,
        false,
        false,
        false,
        new CallExpression(NOW)
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.DateTime} @default(now())`,
    ],
    [
      "Boolean field with default value",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.Boolean,
        false,
        true,
        false,
        false,
        false,
        true
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Boolean} @default(true)`,
    ],
    [
      "Simple object field",
      createObjectField(EXAMPLE_FIELD_NAME, EXAMPLE_OBJECT_NAME, false, true),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME}`,
    ],
    [
      "Object field with relation",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        EXAMPLE_RELATION_NAME
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(name: "${EXAMPLE_RELATION_NAME}")`,
    ],
    [
      "Object field with fields",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        null,
        [EXAMPLE_RELATION_FIELD_NAME]
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(fields: [${EXAMPLE_RELATION_FIELD_NAME}])`,
    ],
    [
      "Object field with references",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        null,
        [],
        [EXAMPLE_RELATION_REFERENCE_FIELD_NAME]
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(references: [${EXAMPLE_RELATION_REFERENCE_FIELD_NAME}])`,
    ],
    [
      "Object field with full relation",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        EXAMPLE_RELATION_NAME,
        [EXAMPLE_RELATION_FIELD_NAME],
        [EXAMPLE_RELATION_REFERENCE_FIELD_NAME]
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(name: "${EXAMPLE_RELATION_NAME}", fields: [${EXAMPLE_RELATION_FIELD_NAME}], references: [${EXAMPLE_RELATION_REFERENCE_FIELD_NAME}])`,
    ],
  ];
  test.each(cases)("%s", (name, field, expected) => {
    expect(printField(field)).toBe(expected);
  });
});

describe("printModel", () => {
  const cases: Array<[string, Model, string]> = [
    [
      "Single field",
      createModel(EXAMPLE_MODEL_NAME, [EXAMPLE_STRING_FIELD]),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD)}
}`,
    ],
    [
      "Single field and documentation",
      createModel(
        EXAMPLE_MODEL_NAME,
        [EXAMPLE_STRING_FIELD],
        EXAMPLE_DOCUMENTATION
      ),
      `${printDocumentation(EXAMPLE_DOCUMENTATION)}
model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD)}
}`,
    ],
    [
      "Two fields",
      createModel(EXAMPLE_MODEL_NAME, [
        EXAMPLE_STRING_FIELD,
        EXAMPLE_OTHER_STRING_FIELD,
      ]),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD)}
${printField(EXAMPLE_OTHER_STRING_FIELD)}
}`,
    ],
  ];
  test.each(cases)("%s", (name, model, expected) => {
    expect(printModel(model)).toBe(expected);
  });
});

describe("printGenerator", () => {
  const cases: Array<[string, Generator, string]> = [
    [
      "Name and provider only",
      createGenerator(EXAMPLE_GENERATOR_NAME, EXAMPLE_GENERATOR_PROVIDER),
      `generator ${EXAMPLE_GENERATOR_NAME} {
  provider = "${EXAMPLE_GENERATOR_PROVIDER}"
}`,
    ],
    [
      "With output",
      createGenerator(
        EXAMPLE_GENERATOR_NAME,
        EXAMPLE_GENERATOR_PROVIDER,
        EXAMPLE_GENERATOR_OUTPUT
      ),
      `generator ${EXAMPLE_GENERATOR_NAME} {
  provider = "${EXAMPLE_GENERATOR_PROVIDER}"
  output = "${EXAMPLE_GENERATOR_OUTPUT}"
}`,
    ],
    [
      "With binary targets",
      createGenerator(
        EXAMPLE_GENERATOR_NAME,
        EXAMPLE_GENERATOR_PROVIDER,
        null,
        [EXAMPLE_BINARY_TARGET]
      ),
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
      createSchema([EXAMPLE_MODEL], []),
      `model ${EXAMPLE_MODEL.name} {
  ${printField(EXAMPLE_STRING_FIELD)}
}`,
    ],
    [
      "Two models",
      createSchema(
        [EXAMPLE_MODEL, createModel("Order", [EXAMPLE_STRING_FIELD])],
        []
      ),
      `model ${EXAMPLE_MODEL.name} {
  ${printField(EXAMPLE_STRING_FIELD)}
}

model Order {
  ${printField(EXAMPLE_STRING_FIELD)}
}`,
    ],
    [
      "Single datasource",
      createSchema(
        [],
        [],
        createDataSource(
          EXAMPLE_DATA_SOURCE_NAME,
          EXAMPLE_DATA_SOURCE_PROVIDER,
          EXAMPLE_DATA_SOURCE_URL
        )
      ),
      `datasource ${EXAMPLE_DATA_SOURCE_NAME} {
  provider = "${EXAMPLE_DATA_SOURCE_PROVIDER}"
  url      = "${EXAMPLE_DATA_SOURCE_URL}"
}`,
    ],
    [
      "Single generator",
      createSchema([], [], undefined, [
        createGenerator(EXAMPLE_GENERATOR_NAME, EXAMPLE_GENERATOR_PROVIDER),
      ]),
      `${printGenerator(
        createGenerator(EXAMPLE_GENERATOR_NAME, EXAMPLE_GENERATOR_PROVIDER)
      )}`,
    ],
    [
      "Single enum",
      createSchema([], [createEnum(EXAMPLE_ENUM_NAME, [EXAMPLE_ENUM_VALUE])]),
      `enum ${EXAMPLE_ENUM_NAME} {
  ${EXAMPLE_ENUM_VALUE}
}`,
    ],
  ];
  test.each(cases)("print(%s)", async (name, schema, expected) => {
    console.log(await print(schema), "schema");
    console.log(expected, "expected");

    expect(await (await print(schema)).trim()).toBe(expected.trim());
  });
});
