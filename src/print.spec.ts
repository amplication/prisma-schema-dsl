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
  printModelMap,
} from "./print";
import {
  ScalarType,
  Schema,
  ObjectField,
  ScalarField,
  DataSourceProvider,
  Model,
  Generator,
  AUTO_INCREMENT,
  UUID,
  CUID,
  NOW,
  Enum,
} from "prisma-schema-dsl-types";

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

const EXAMPLE_FIELD_ATTRIBUTES =
  '@relation(fields: [authorId], references: [id]) @map(name: "author_id") @unique';

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
const EXAMPLE_MODEL_MAP = "ExampleMappedName";
const POSTGRES_SQL_PROVIDER = DataSourceProvider.PostgreSQL;

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
        EXAMPLE_DOCUMENTATION,
        undefined,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${printDocumentation(EXAMPLE_DOCUMENTATION)}\n${EXAMPLE_FIELD_NAME} ${
        ScalarType.String
      } ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Simple float field",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.Float,
        false,
        true,
        false,
        false,
        false,
        null,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Float} ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Simple decimal field",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.Decimal,
        false,
        true,
        false,
        false,
        false,
        null,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Decimal} ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Simple optional string field",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        false,
        false,
        false,
        false,
        null,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}? ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Simple string array field",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        true,
        true,
        false,
        false,
        false,
        null,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String}[] ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        false,
        null,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.DateTime} ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        42,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(42) ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "BigInt field with default",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.BigInt,
        false,
        true,
        false,
        false,
        false,
        Number.MAX_SAFE_INTEGER,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.BigInt} @default(${Number.MAX_SAFE_INTEGER}) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        { callee: AUTO_INCREMENT },
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(autoincrement()) ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "BigInt field with autoincrement()",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.BigInt,
        false,
        true,
        false,
        false,
        false,
        { callee: AUTO_INCREMENT },
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.BigInt} @default(autoincrement()) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        { callee: UUID },
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(uuid()) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        { callee: CUID },
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(cuid()) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        { callee: NOW },
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.DateTime} @default(now()) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        true,
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Boolean} @default(true) ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Simple object field",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        null,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Object field with relation",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        EXAMPLE_RELATION_NAME,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(name: "${EXAMPLE_RELATION_NAME}") ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "Object field with fields",
      createObjectField(
        EXAMPLE_FIELD_NAME,
        EXAMPLE_OBJECT_NAME,
        false,
        true,
        null,
        [EXAMPLE_RELATION_FIELD_NAME],
        undefined,
        undefined,
        undefined,
        undefined,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(fields: [${EXAMPLE_RELATION_FIELD_NAME}]) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        [EXAMPLE_RELATION_REFERENCE_FIELD_NAME],
        undefined,
        undefined,
        undefined,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(references: [${EXAMPLE_RELATION_REFERENCE_FIELD_NAME}]) ${EXAMPLE_FIELD_ATTRIBUTES}`,
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
        [EXAMPLE_RELATION_REFERENCE_FIELD_NAME],
        undefined,
        undefined,
        undefined,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${EXAMPLE_OBJECT_NAME} @relation(name: "${EXAMPLE_RELATION_NAME}", fields: [${EXAMPLE_RELATION_FIELD_NAME}], references: [${EXAMPLE_RELATION_REFERENCE_FIELD_NAME}]) ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "ID field",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        true,
        false,
        { callee: UUID },
        undefined,
        false,
        EXAMPLE_FIELD_ATTRIBUTES
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @id @default(uuid()) ${EXAMPLE_FIELD_ATTRIBUTES}`,
    ],
    [
      "ID field with @id override",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        true,
        false,
        { callee: UUID },
        undefined,
        false,
        `@id(map: "PK_dd4f738d44")`
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(uuid()) @id(map: "PK_dd4f738d44")`,
    ],
    [
      "Int field with autoincrement() and @default attribute override",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.Int,
        false,
        true,
        false,
        false,
        false,
        { callee: AUTO_INCREMENT },
        undefined,
        false,
        `@default(dbgenerated("uuid_generate_v4()"))`
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.Int} @default(dbgenerated("uuid_generate_v4()"))`,
    ],
    [
      "String field with default cuid() and override @default() attribute",
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        false,
        false,
        { callee: CUID },
        undefined,
        false,
        `@default(dbgenerated("uuid_generate_v4()"))`
      ),
      `${EXAMPLE_FIELD_NAME} ${ScalarType.String} @default(dbgenerated("uuid_generate_v4()"))`,
    ],
  ];
  test.each(cases)("%s", (name, field, expected) => {
    expect(printField(field, POSTGRES_SQL_PROVIDER)).toBe(expected);
  });

  test("Throws error when a field attribute doesn't start with '@'", () => {
    expect(() =>
      createScalarField(
        EXAMPLE_FIELD_NAME,
        ScalarType.String,
        false,
        true,
        false,
        false,
        false,
        undefined,
        undefined,
        false,
        " @attr1 @attr2\n\nattr3\n\nattr4"
      )
    ).toThrow(
      `Invalid field ${EXAMPLE_FIELD_NAME} attribute: all field attributes must start with @.`
    );
  });
});

describe("printModel", () => {
  const cases: Array<[string, Model, string]> = [
    [
      "Single field",
      createModel(EXAMPLE_MODEL_NAME, [EXAMPLE_STRING_FIELD]),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
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
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Two fields",
      createModel(EXAMPLE_MODEL_NAME, [
        EXAMPLE_STRING_FIELD,
        EXAMPLE_OTHER_STRING_FIELD,
      ]),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
${printField(EXAMPLE_OTHER_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Single field and map",
      createModel(
        EXAMPLE_MODEL_NAME,
        [EXAMPLE_STRING_FIELD],
        "",
        EXAMPLE_MODEL_MAP
      ),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}

${printModelMap(EXAMPLE_MODEL_MAP)}
}`,
    ],
    [
      "with model attributes",
      createModel(
        EXAMPLE_MODEL_NAME,
        [EXAMPLE_STRING_FIELD, EXAMPLE_OTHER_STRING_FIELD],
        "",
        undefined,
        "@@id(fields: [title, author]) @@createdAt @@updatedAt"
      ),
      `model ${EXAMPLE_MODEL_NAME} {
${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
${printField(EXAMPLE_OTHER_STRING_FIELD, POSTGRES_SQL_PROVIDER)}

@@id(fields: [title, author])
@@createdAt
@@updatedAt
}`,
    ],
  ];
  test.each(cases)("%s", (name, model, expected) => {
    expect(printModel(model, POSTGRES_SQL_PROVIDER)).toBe(expected);
  });
  test("Throws error when a model attribute doesn't start with '@@'", () => {
    expect(() =>
      createModel(
        EXAMPLE_MODEL_NAME,
        [EXAMPLE_STRING_FIELD],
        "",
        undefined,
        " @@id(fields: [title, author]) @@createdAt @updatedAt invalid\n\ninvalid2"
      )
    ).toThrow(
      `Invalid model ${EXAMPLE_MODEL_NAME} attribute: all model attributes must start with @@.`
    );
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
  ${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}`,
    ],
    [
      "Two models",
      createSchema(
        [EXAMPLE_MODEL, createModel("Order", [EXAMPLE_STRING_FIELD])],
        []
      ),
      `model ${EXAMPLE_MODEL.name} {
  ${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
}

model Order {
  ${printField(EXAMPLE_STRING_FIELD, POSTGRES_SQL_PROVIDER)}
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
    expect(await await print(schema)).toBe(expected + "\n");
  });
});
