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
export interface DataSourceURLEnv {
  name: string;
}

export function isDataSourceURLEnv(
  url: string | DataSourceURLEnv
): url is DataSourceURLEnv {
  return (url as DataSourceURLEnv).name !== undefined;
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

export type PreviewFeature =
  | "fullTextSearch"
  | "fullTextIndex"
  | "metrics"
  | "orderByNulls"
  | "tracing"
  | "filteredRelationCount"
  | "fieldReference"
  | "multiSchema"
  | "postgresqlExtensions"
  | "deno"
  | "extendedWhereUnique"
  | "clientExtensions"
  | "views";
/**
 * Prisma's Schema generator
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/generators
 */
export type Generator = {
  name: string;
  provider: string;
  output?: string | null;
  /** @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/generators#binary-targets */
  binaryTargets?: string[];
  previewFeatures?: Array<PreviewFeature>;
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

/**
 * Prisma's referential actions
 * @see https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions#types-of-referential-actions
 */
export enum ReferentialActions {
  NONE = "NONE",
  Cascade = "Cascade",
  Restrict = "Restrict",
  NoAction = "NoAction",
  SetNull = "SetNull",
  SetDefault = "SetDefault",
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

export interface CallExpression {
  callee: string;
}

export function isCallExpression(object: unknown): object is CallExpression {
  return (object as CallExpression).callee !== undefined;
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
  isForeignKey: boolean;
};

export type ObjectField = BaseField & {
  kind: FieldKind.Object;
  type: string;
  relationName: string | null;
  relationToFields: string[];
  relationToReferences: string[];
  relationOnDelete?: ReferentialActions;
  relationOnUpdate?: ReferentialActions;
};

export type Index = {
  fields: Array<{ name: string; sort?: "desc" | "asc" }>;
};

export type FullTextIndex = {
  fields: Array<{ name: string }>;
};

export type Model = {
  name: string;
  fields: Array<ScalarField | ObjectField>;
  /** @see https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map-1 */
  map?: string;
  /** @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema#comments */
  documentation?: string;
  indexes?: Array<Index>;
  fullTextIndexes?: Array<FullTextIndex>;
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
