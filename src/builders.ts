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

const FIELD_NAME_REGEXP = /[A-Za-z][A-Za-z0-9_]*/;

export function createSchema(models: Model[], dataSource?: DataSource): Schema {
  return {
    dataSource,
    models,
  };
}

export function createModel(
  name: string,
  fields: Array<ScalarField | ObjectField>
): Model {
  return {
    name,
    fields,
  };
}

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
  validateFieldName(name);
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

export function createObjectField(
  name: string,
  isList: boolean,
  isRequired: boolean,
  isGenerated: boolean,
  type: string,
  relationName: string,
  relationToFields: string[],
  relationToReferences: string[],
  relationOnDelete: "NONE"
): ObjectField {
  validateFieldName(name);
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

function validateFieldName(name: string): void {
  if (!name.match(FIELD_NAME_REGEXP)) {
    throw new Error("Invalid field name");
  }
}

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
