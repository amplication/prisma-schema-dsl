export function parseArgs<O extends object>(
  args: [O] | Array<O[keyof O]>,
  propNames: Array<keyof O>
): O {
  const isOptionsObj = args.length === 1 && typeof args[0] === "object";

  if (isOptionsObj) return args[0] as O;

  return propNames.reduce((acc: O, p, index) => {
    acc[p] = isOptionsObj
      ? (args[0] as O)[p]
      : (args as Array<O[keyof O]>)[index];

    return acc;
  }, {} as O);
}
