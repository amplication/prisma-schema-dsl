/**
 * @see https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-sources#fields
 */
export enum DataSourceProvider {
  PostgreSQL = "postgresql",
  MySQL = "mysql",
  SQLite = "sqlite",
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

export enum FieldKind {
  Scalar = "scalar",
  Object = "object",
}

export type BaseField = {
  name: string;
  isList: boolean;
  isRequired: boolean;
  isGenerated: boolean;
};

export type ScalarField = BaseField & {
  kind: FieldKind.Scalar;
  type: ScalarType;
  isId: boolean;
  isUnique: boolean;
  isUpdatedAt: boolean;
};

export type ObjectField = BaseField & {
  kind: FieldKind.Object;
  type: string;
  relationName: string;
  relationToFields: string[];
  relationToReferences: string[];
  relationOnDelete: "NONE";
};

export type Model = {
  name: string;
  fields: Array<ScalarField | ObjectField>;
};

export type Schema = {
  models: Model[];
  dataSource?: DataSource;
};
