import {
  createSchema,
  createModel,
  createScalarField,
  createObjectField,
} from "./builders";
import { print } from "./print";
import { ScalarType, Schema } from "./types";

describe("print", () => {
  const cases: Array<[string, Schema, string]> = [
    [
      "Simple model",
      createSchema([
        createModel("User", [
          createScalarField("id", ScalarType.String, false, true),
        ]),
      ]),
      `model User {
  id String
}`,
    ],
    [
      "Two models",
      createSchema([
        createModel("User", [
          createScalarField("id", ScalarType.String, false, true),
        ]),
        createModel("Order", [
          createScalarField("id", ScalarType.String, false, true),
        ]),
      ]),
      `model User {
  id String
}

model Order {
  id String
}`,
    ],
  ];
  test.each(cases)("print(%s)", async (name, schema, expected) => {
    expect(await print(schema)).toBe(expected);
  });
});
