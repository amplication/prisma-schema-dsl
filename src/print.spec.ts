import { createSchema, createModel, createScalarField } from "./builders";
import { print } from "./print";
import { ScalarType } from "./types";

test("Print simple model", () => {
  const schema = print(
    createSchema([
      createModel("User", [
        createScalarField("id", ScalarType.String, false, true),
      ]),
    ])
  );
  expect(schema).toBe(`model User {
id String
}`);
});

test("Print two models", () => {
  const schema = print(
    createSchema([
      createModel("User", [
        createScalarField("id", ScalarType.String, false, true),
      ]),
      createModel("Order", [
        createScalarField("id", ScalarType.String, false, true),
      ]),
    ])
  );
  expect(schema).toBe(`model User {
id String
}
model Order {
id String
}`);
});
