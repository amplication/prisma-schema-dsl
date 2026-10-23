import { ScalarType } from "prisma-schema-dsl-types";
import {
  createEnum,
  createModel,
  createScalarField,
  createObjectField,
  OPTIONAL_LIST_ERROR_MESSAGE,
} from "./builders";

const EXAMPLE_NAME = "EXAMPLE_NAME";
const EXAMPLE_SCALAR_TYPE = ScalarType.String;
const EXAMPLE_TYPE = "EXAMPLE_TYPE";

describe("name validation", () => {
  test("rejects invalid characters anywhere in model and enum names", () => {
    expect(() => createModel("User-name", [])).toThrow(
      'Invalid name: "User-name"'
    );
    expect(() => createEnum("1Status", [])).toThrow('Invalid name: "1Status"');
  });
});

describe("createScalarField", () => {
  test("fails for invalid combination of optional list", () => {
    const isList = true;
    const isRequired = false;
    expect(() =>
      createScalarField(EXAMPLE_NAME, EXAMPLE_SCALAR_TYPE, isList, isRequired)
    ).toThrow(OPTIONAL_LIST_ERROR_MESSAGE);
  });
});

describe("createObjectField", () => {
  test("fails for invalid combination of optional list", () => {
    const isList = true;
    const isRequired = false;
    expect(() =>
      createObjectField(EXAMPLE_NAME, EXAMPLE_TYPE, isList, isRequired)
    ).toThrow(OPTIONAL_LIST_ERROR_MESSAGE);
  });
});
