import { createEnum } from "../builders";
import {
  EXAMPLE_DOCUMENTATION,
  EXAMPLE_ENUM_NAME,
  EXAMPLE_ENUM_VALUE,
  EXAMPLE_OTHER_ENUM_VALUE,
} from "./data";
import { printDocumentation, printEnum } from "../print";
import { getDMMF } from "@prisma/internals";

describe("printEnum", () => {
  test("single value", async () => {
    const theEnum = createEnum({
      name: EXAMPLE_ENUM_NAME,
      values: [EXAMPLE_ENUM_VALUE],
    });
    const printed = printEnum(theEnum);
    const meta = await getDMMF({ datamodel: printed });

    expect(printed).toBe(
      `enum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n}`
    );
    expect(meta).toMatchObject({
      datamodel: {
        enums: [
          {
            name: EXAMPLE_ENUM_NAME,
            values: [
              {
                name: EXAMPLE_ENUM_VALUE,
              },
            ],
          },
        ],
      },
    });
  });

  test("single value with documentation", async () => {
    const theEnum = createEnum({
      name: EXAMPLE_ENUM_NAME,
      values: [EXAMPLE_ENUM_VALUE],
      documentation: EXAMPLE_DOCUMENTATION,
    });
    const printed = printEnum(theEnum);
    const meta = await getDMMF({ datamodel: printed });

    expect(printed).toBe(
      `${printDocumentation(
        EXAMPLE_DOCUMENTATION
      )}\nenum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n}`
    );
    expect(meta).toMatchObject({
      datamodel: {
        enums: [
          {
            name: EXAMPLE_ENUM_NAME,
            values: [
              {
                name: EXAMPLE_ENUM_VALUE,
              },
            ],

            documentation: EXAMPLE_DOCUMENTATION,
          },
        ],
      },
    });
  });

  test("two values", async () => {
    const theEnum = createEnum({
      name: EXAMPLE_ENUM_NAME,
      values: [EXAMPLE_ENUM_VALUE, EXAMPLE_OTHER_ENUM_VALUE],
    });
    const printed = printEnum(theEnum);
    const meta = await getDMMF({ datamodel: printed });

    expect(printed).toBe(
      `enum ${EXAMPLE_ENUM_NAME} {\n${EXAMPLE_ENUM_VALUE}\n${EXAMPLE_OTHER_ENUM_VALUE}\n}`
    );
    expect(meta).toMatchObject({
      datamodel: {
        enums: [
          {
            name: EXAMPLE_ENUM_NAME,
            values: [
              {
                name: EXAMPLE_ENUM_VALUE,
              },
              {
                name: EXAMPLE_OTHER_ENUM_VALUE,
              },
            ],
          },
        ],
      },
    });
  });
});
