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
const EXAMPLE_MODEL = createModel("User", [EXAMPLE_STRING_FIELD]);
const EXAMPLE_GENERATOR_NAME = "exampleGeneratorName";
const EXAMPLE_GENERATOR_PROVIDER = "exampleGeneratorProvider";
const EXAMPLE_GENERATOR_OUTPUT = "example-generator-output";
const EXAMPLE_BINARY_TARGET = "example-binary-target";

describe("printField", () => {
  const exampleObjectName = "ExampleObjectName";
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
      createObjectField(EXAMPLE_FIELD_NAME, exampleObjectName, false, true),
      `${EXAMPLE_FIELD_NAME} ${exampleObjectName}`,
    ],
  ];
  test.each(cases)("%s", (name, field, expected) => {
    expect(printField(field)).toBe(expected);
  });
});

describe("printModel", () => {
  const exampleModelName = "exampleModelName";
  const exampleOtherField = createScalarField(
    "exampleOtherFieldName",
    ScalarType.String,
    false,
    true
  );
  const cases: Array<[string, Model, string]> = [
    [
      "Single field",
      createModel(exampleModelName, [EXAMPLE_STRING_FIELD]),
      `model ${exampleModelName} {
${printField(EXAMPLE_STRING_FIELD)}
}`,
    ],
    [
      "Two fields",
      createModel(exampleModelName, [EXAMPLE_STRING_FIELD, exampleOtherField]),
      `model ${exampleModelName} {
${printField(EXAMPLE_STRING_FIELD)}
${printField(exampleOtherField)}
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
  const exampleDataSourceName = "exampleDataSource";
  const exampleDataSourceProvider = DataSourceProvider.MySQL;
  const exampleDataSourceURL = "mysql://example.com";
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
          exampleDataSourceName,
          exampleDataSourceProvider,
          exampleDataSourceURL
        )
      ),
      `datasource ${exampleDataSourceName} {
  provider = "${exampleDataSourceProvider}"
  url      = "${exampleDataSourceURL}"
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
