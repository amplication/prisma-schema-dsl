import {
  DataSource,
  Model,
  Schema,
  ScalarField,
  ObjectField,
  ScalarType,
  FieldKind,
  DataSourceProvider,
  DataSourceURLEnv,
  Generator,
  CallExpression,
  CUID,
  AUTO_INCREMENT,
  NOW,
  UUID,
  ScalarFieldDefault,
  Enum,
  ReferentialActions,
} from "prisma-schema-dsl-types";
import { parseArgs } from "./utils";

const NAME_REGEXP = /[A-Za-z][A-Za-z0-9_]*/;
export const OPTIONAL_LIST_ERROR_MESSAGE =
  "Invalid modifiers: You cannot combine isRequired: false and isList: true - optional lists are not supported.";

interface CreateSchemaOptions {
  models: Model[];
  enums: Enum[];
  dataSource?: DataSource;
  generators?: Generator[];
}
type CreateSchemaVariadicArgs = [
  models: Model[],
  enums: Enum[],
  dataSource?: DataSource,
  generators?: Generator[]
];

/** Creates a schema AST object */
export function createSchema(options: CreateSchemaOptions): Schema;
/**
 * @deprecated
 */
export function createSchema(...args: CreateSchemaVariadicArgs): Schema;
export function createSchema(
  ...args: [CreateSchemaOptions] | CreateSchemaVariadicArgs
): Schema {
  const {
    dataSource,
    generators = [],
    enums,
    models,
  } = parseArgs<CreateSchemaOptions>(args, [
    "models",
    "enums",
    "dataSource",
    "generators",
  ]);

  return {
    dataSource,
    generators,
    enums,
    models,
  };
}

interface CreateEnumOptions {
  name: string;
  values: string[];
  documentation?: string;
}
type CreateEnumVariadicArgs = [
  name: string,
  values: string[],
  documentation?: string
];
/** Creates an enum AST object */
export function createEnum(options: CreateEnumOptions): Enum;
/**
 * @deprecated
 */
export function createEnum(...args: CreateEnumVariadicArgs): Enum;
export function createEnum(
  ...args: [CreateEnumOptions] | CreateEnumVariadicArgs
): Enum {
  const { name, values, documentation } = parseArgs<CreateEnumOptions>(args, [
    "name",
    "values",
    "documentation",
  ]);
  validateName(name);

  return {
    name,
    values,
    documentation,
  };
}

interface CreateModelOptions {
  name: string;
  fields: Array<ScalarField | ObjectField>;
  documentation?: string;
  map?: string;
}
type CreateModelVariadicArgs = [
  name: string,
  fields: Array<ScalarField | ObjectField>,
  documentation?: string,
  map?: string
];

/** Creates a model AST object */
export function createModel(options: CreateModelOptions): Model;
/**
 * @deprecated
 */
export function createModel(...args: CreateModelVariadicArgs): Model;
export function createModel(
  ...args: [CreateModelOptions] | CreateModelVariadicArgs
): Model {
  const { name, fields, documentation, map } = parseArgs<CreateModelOptions>(
    args,
    ["name", "fields", "documentation", "map"]
  );
  validateName(name);

  return {
    name,
    fields,
    documentation,
    map,
  };
}

interface CreateScalarFieldOptions {
  name: string;
  type: ScalarType;
  isList?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  isId?: boolean;
  isUpdatedAt?: boolean;
  defaultValue?: ScalarFieldDefault;
  documentation?: string;
  isForeignKey?: boolean;
}
type CreateScalarFieldVariadicArgs = [
  name: string,
  type: ScalarType,
  isList?: boolean,
  isRequired?: boolean,
  isUnique?: boolean,
  isId?: boolean,
  isUpdatedAt?: boolean,
  defaultValue?: ScalarFieldDefault,
  documentation?: string,
  isForeignKey?: boolean
];

/**
 * Creates a scalar field AST object
 * Validates given name argument
 */
export function createScalarField(
  options: CreateScalarFieldOptions
): ScalarField;
/**
 * @deprecated
 */
export function createScalarField(
  ...args: CreateScalarFieldVariadicArgs
): ScalarField;
export function createScalarField(
  ...args: [CreateScalarFieldOptions] | CreateScalarFieldVariadicArgs
): ScalarField {
  const {
    name,
    type,
    isList = false,
    isRequired = false,
    isUnique = false,
    isId = false,
    isUpdatedAt = false,
    defaultValue = null,
    documentation,
    isForeignKey = false,
  } = parseArgs<CreateScalarFieldOptions>(args, [
    "name",
    "type",
    "isList",
    "isRequired",
    "isUnique",
    "isId",
    "isUpdatedAt",
    "defaultValue",
    "documentation",
    "isForeignKey",
  ]);
  validateName(name);
  validateScalarDefault(type, defaultValue);
  validateModifiers(isRequired, isList);

  return {
    name,
    isList,
    isRequired,
    isUnique,
    kind: FieldKind.Scalar,
    type,
    isId,
    isUpdatedAt,
    default: defaultValue,
    documentation,
    isForeignKey,
  };
}

function validateScalarDefault(type: ScalarType, value: ScalarFieldDefault) {
  if (value === null) {
    return;
  }
  switch (type) {
    case ScalarType.String: {
      if (
        !(
          typeof value === "string" ||
          (value instanceof CallExpression &&
            (value.callee === UUID || value.callee === CUID))
        )
      ) {
        throw new Error(
          "Default must be a string or a call expression to uuid() or cuid()"
        );
      }
      return;
    }
    case ScalarType.Boolean: {
      if (typeof value !== "boolean") {
        throw new Error("Default must be a boolean");
      }
      return;
    }
    case ScalarType.Int: {
      if (
        !(
          typeof value === "number" ||
          (value instanceof CallExpression && value.callee === AUTO_INCREMENT)
        )
      ) {
        throw new Error(
          "Default must be a number or call expression to autoincrement()"
        );
      }
      return;
    }
    case ScalarType.Float: {
      if (!(typeof value == "number")) {
        throw new Error("Default must be a number");
      }
      return;
    }
    case ScalarType.DateTime: {
      if (
        !(
          typeof value === "string" ||
          (value instanceof CallExpression && value.callee === NOW)
        )
      ) {
        throw new Error(
          "Default must be a date-time string or a call expression to now()"
        );
      }
      return;
    }
    case ScalarType.Json: {
      if (typeof value !== "string") {
        throw new Error("Default must a JSON string");
      }
      return;
    }
    default: {
      throw new Error(`Unknown type ${type}`);
    }
  }
}

interface CreateObjectFieldOptions {
  name: string;
  type: string;
  isList?: boolean;
  isRequired?: boolean;
  relationName?: string | null;
  relationFields?: string[];
  relationReferences?: string[];
  relationOnDelete?: ReferentialActions;
  relationOnUpdate?: ReferentialActions;
  documentation?: string;
}
type CreateObjectFieldVariadicArgs = [
  name: string,
  type: string,
  isList?: boolean,
  isRequired?: boolean,
  relationName?: string | null,
  relationFields?: string[],
  relationReferences?: string[],
  relationOnDelete?: ReferentialActions,
  relationOnUpdate?: ReferentialActions,
  documentation?: string
];
/**
 * Creates an object field AST object
 * Validates given name argument
 */
export function createObjectField(
  options: CreateObjectFieldOptions
): ObjectField;
/**
 * @deprecated
 */
export function createObjectField(
  ...args: CreateObjectFieldVariadicArgs
): ObjectField;
export function createObjectField(
  ...args: [CreateObjectFieldOptions] | CreateObjectFieldVariadicArgs
): ObjectField {
  const {
    name,
    type,
    isList = false,
    isRequired = false,
    relationName = null,
    relationFields = [],
    relationReferences = [],
    relationOnDelete = ReferentialActions.NONE,
    relationOnUpdate = ReferentialActions.NONE,
    documentation,
  } = parseArgs<CreateObjectFieldOptions>(args, [
    "name",
    "type",
    "isList",
    "isRequired",
    "relationName",
    "relationFields",
    "relationReferences",
    "relationOnDelete",
    "relationOnUpdate",
    "documentation",
  ]);
  validateName(name);
  validateModifiers(isRequired, isList);

  return {
    name,
    isList,
    isRequired,
    kind: FieldKind.Object,
    type,
    relationName,
    relationToFields: relationFields,
    relationToReferences: relationReferences,
    relationOnDelete,
    relationOnUpdate,
    documentation,
  };
}

function validateName(name: string): void {
  if (!name.match(NAME_REGEXP)) {
    throw new Error(
      `Invalid name: "${name}". Name must start with a letter and can contain only letters, numbers and underscores`
    );
  }
}

function validateModifiers(isRequired: boolean, isList: boolean): void {
  if (!isRequired && isList) {
    throw new Error(OPTIONAL_LIST_ERROR_MESSAGE);
  }
}

interface CreateDataSourceOptions {
  name: string;
  provider: DataSourceProvider;
  url: string | DataSourceURLEnv;
}
type CreateDataSourceVariadicArgs = [
  name: string,
  provider: DataSourceProvider,
  url: string | DataSourceURLEnv
];
/** Creates a data source AST object */
export function createDataSource(options: CreateDataSourceOptions): DataSource;
/**
 * @deprecated
 */
export function createDataSource(
  ...args: CreateDataSourceVariadicArgs
): DataSource;
export function createDataSource(
  ...args: [CreateDataSourceOptions] | CreateDataSourceVariadicArgs
): DataSource {
  const { name, provider, url } = parseArgs<CreateDataSourceOptions>(args, [
    "name",
    "provider",
    "url",
  ]);

  return {
    name,
    provider,
    url,
  };
}

interface CreateGeneratorOptions {
  name: string;
  provider: string;
  output?: string | null;
  binaryTargets?: string[];
}
type CreateGeneratorVariadicArgs = [
  name: string,
  provider: string,
  output?: string | null,
  binaryTargets?: string[]
];
/** Creates a generator AST object */
export function createGenerator(options: CreateGeneratorOptions): Generator;
/**
 * @deprecated
 */
export function createGenerator(
  ...args: CreateGeneratorVariadicArgs
): Generator;
export function createGenerator(
  ...args: [CreateGeneratorOptions] | CreateGeneratorVariadicArgs
) {
  const {
    name,
    provider,
    output = null,
    binaryTargets = [],
  } = parseArgs<CreateGeneratorOptions>(args, [
    "name",
    "provider",
    "output",
    "binaryTargets",
  ]);

  return {
    name,
    provider,
    output,
    binaryTargets,
  };
}
