/**
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-sources#fields
 */
export enum DataSourceProvider {
  PostgreSQL = "postgresql",
  MySQL = "mysql",
  SQLite = "sqlite",
  MongoDB = "mongodb",
}

/**
 * Prisma's Schema data source url environment variable
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-sources#examples
 */
export class DataSourceURLEnv {
  constructor(public name: string) {}
}

/**
 * Prisma's Schema data source
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-sources
 */
export type DataSource = {
  name: string;
  provider: DataSourceProvider;
  url: string | DataSourceURLEnv;
};

/**
 * Prisma's Schema generator
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/generators
 */
export type Generator = {
  name: string;
  provider: string;
  output: string | null;
  /** @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/generators#binary-targets */
  binaryTargets: string[];
};

/**
 * Prisma's data model scalar types
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model#scalar-types
 */
export enum ScalarType {
  /** Variable length text */
  String = "String",
  /** True or false value */
  Boolean = "Boolean",
  /** Integer value */
  Int = "Int",
  /** Floating point number */
  Float = "Float",
  /** Timestamp */
  DateTime = "DateTime",
  /** JSON */
  Json = "Json",
}

/** Create a sequence of integers in the underlying database and assign the incremented values to the ID values of the created records based on the sequence */
export const AUTO_INCREMENT = "autoincrement";

/** Set a timestamp of the time when a record is created. */
export const NOW = "now";

/** Generate a globally unique identifier based on the cuid spec */
export const CUID = "cuid";

/** Generate a globally unique identifier based on the UUID spec. */
export const UUID = "uuid";

/** Represents default values that can't be expressed in the Prisma schema. Only available after introspection. */
export const DB_GENERATED = "dbgenerated";

export class CallExpression {
  constructor(public callee: string) {}
}

export enum FieldKind {
  Scalar = "scalar",
  Object = "object",
}

export type BaseField = {
  name: string;
  isList: boolean;
  isRequired: boolean;
  /** @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema#comments */
  documentation?: string;
};

export type ScalarFieldDefault =
  | null
  | boolean
  | CallExpression
  | number
  | string;

export type ScalarField = BaseField & {
  kind: FieldKind.Scalar;
  type: ScalarType;
  isId: boolean;
  isUnique: boolean;
  isUpdatedAt: boolean;
  default: ScalarFieldDefault;
};

export type ObjectField = BaseField & {
  kind: FieldKind.Object;
  type: string;
  relationName: string | null;
  relationToFields: string[];
  relationToReferences: string[];
  relationOnDelete: "NONE";
};

export type Model = {
  name: string;
  fields: Array<ScalarField | ObjectField>;
  /** @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema#comments */
  documentation?: string;
};

export type Enum = {
  name: string;
  values: string[];
  /** @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema#comments */
  documentation?: string;
};

export type Schema = {
  models: Model[];
  enums: Enum[];
  dataSource?: DataSource;
  generators: Generator[];
};
