import { parseArgs } from "./utils";

describe("parseArgs", () => {
  test("should be able to parse variadic arguments #1", () => {
    type MyObject = {
      success: boolean;
      type: string;
      code: number;
    };
    const args = [true, "bigSuccess", 200];

    const result = parseArgs<MyObject>(args, ["success", "type", "code"]);

    expect(result).toEqual({ success: true, type: "bigSuccess", code: 200 });
  });

  test("should be able to parse an options object", () => {
    type MyObject = {
      success: boolean;
      type: string;
      code: number;
    };
    const args: [MyObject] = [{ success: true, type: "bigSuccess", code: 200 }];

    const result = parseArgs<MyObject>(args, ["success", "type", "code"]);

    expect(result).toEqual({ success: true, type: "bigSuccess", code: 200 });
  });
});
