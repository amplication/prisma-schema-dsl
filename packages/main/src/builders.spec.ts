import { ScalarType } from "@pmaltese/prisma-schema-dsl-types";
import {
  createScalarField,
  createObjectField,
  OPTIONAL_LIST_ERROR_MESSAGE,
} from "./builders";

const EXAMPLE_NAME = "EXAMPLE_NAME";
const EXAMPLE_SCALAR_TYPE = ScalarType.String;
const EXAMPLE_TYPE = "EXAMPLE_TYPE";

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
