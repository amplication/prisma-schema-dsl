import { createSchema, createModel, createScalarField } from "./builders";
import { print } from "./print";
import { ScalarType } from "./types";

test("Print simple model", async () => {
  const schema = await print(
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

test("Print two models", async () => {
  const schema = await print(
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
