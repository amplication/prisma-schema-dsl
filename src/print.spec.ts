import {
  createSchema,
  createModel,
  createScalarField,
  createObjectField,
  createDataSource,
  createGenerator,
} from "./builders";
import { print, printField, printModel, printGenerator } from "./print";
import {
  ScalarType,
  Schema,
  ObjectField,
  ScalarField,
  DataSourceProvider,
  Model,
  Generator,
} from "./types";

const EXAMPLE_FIELD_NAME = "exampleFieldName";
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

describe("printField", () => {
  const cases: Array<[string, ObjectField | ScalarField, string]> = [
    [
      "Simple string field",
      EXAMPLE_STRING_FIELD,
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}`,
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
      "Simple object field",
      createObjectField(EXAMPLE_FIELD_NAME, EXAMPLE_OBJECT_NAME, false, true),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME}`,
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
      createSchema([EXAMPLE_MODEL]),
      `model ${EXAMPLE_MODEL.name} {
  ${printField(EXAMPLE_STRING_FIELD)}
}`,
    ],
    [
      "Two models",
      createSchema([
        EXAMPLE_MODEL,
        createModel("Order", [EXAMPLE_STRING_FIELD]),
      ]),
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
      createSchema([], undefined, [
        createGenerator(EXAMPLE_GENERATOR_NAME, EXAMPLE_GENERATOR_PROVIDER),
      ]),
      `${printGenerator(
        createGenerator(EXAMPLE_GENERATOR_NAME, EXAMPLE_GENERATOR_PROVIDER)
      )}`,
    ],
  ];
  test.each(cases)("print(%s)", async (name, schema, expected) => {
    expect(await print(schema)).toBe(expected);
  });
});
