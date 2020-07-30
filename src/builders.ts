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
} from "./types";

const NAME_REGEXP = /[A-Za-z][A-Za-z0-9_]*/;

/** Creates a schema AST object */
export function createSchema(models: Model[], dataSource?: DataSource): Schema {
  return {
    dataSource,
    models,
  };
}

/** Creates a model AST object */
export function createModel(
  name: string,
  fields: Array<ScalarField | ObjectField>
): Model {
  validateName(name);
  return {
    name,
    fields,
  };
}

/**
 * Creates a scalar field AST object
 * Validates given name argument
 */
export function createScalarField(
  name: string,
  type: ScalarType,
  isList: boolean = false,
  isRequired: boolean = false,
  isUnique: boolean = false,
  isGenerated: boolean = false,
  isId: boolean = false,
  isUpdatedAt: boolean = false
): ScalarField {
  validateName(name);
  return {
    name,
    isList,
    isRequired,
    isUnique,
    isGenerated,
    kind: FieldKind.Scalar,
    type,
    isId,
    isUpdatedAt,
  };
}

/**
 * Creates an object field AST object
 * Validates given name argument
 */
export function createObjectField(
  name: string,
  type: string,
  isList: boolean = false,
  isRequired: boolean = false,
  isGenerated: boolean = false,
  relationName: string | null = null,
  relationToFields: string[] = [],
  relationToReferences: string[] = [],
  relationOnDelete: "NONE" = "NONE"
): ObjectField {
  validateName(name);
  return {
    name,
    isList,
    isRequired,
    isGenerated,
    kind: FieldKind.Object,
    type,
    relationName,
    relationToFields,
    relationToReferences,
    relationOnDelete,
  };
}

function validateName(name: string): void {
  if (!name.match(NAME_REGEXP)) {
    throw new Error(
      `Invalid name: "${name}". Name must start with a letter and can contain only letters, numbers and underscores`
    );
  }
}

/** Creates a data source AST object */
export function createDataSource(
  name: string,
  provider: DataSourceProvider,
  url: string | DataSourceURLEnv
): DataSource {
  return {
    name,
    provider,
    url,
  };
}
