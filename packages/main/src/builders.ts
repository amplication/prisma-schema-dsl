import {
  AUTO_INCREMENT,
  CUID,
  DataSource,
  DataSourceProvider,
  DataSourceURLEnv,
  Enum,
  FieldKind,
  FullTextIndex,
  Generator,
  Index,
  isCallExpression,
  Model,
  NOW,
  ObjectField,
  PreviewFeature,
  ReferentialActions,
  ScalarField,
  ScalarFieldDefault,
  ScalarType,
  Schema,
  UUID,
} from "@pmaltese/prisma-schema-dsl-types";

const NAME_REGEXP = /[A-Za-z][A-Za-z0-9_]*/;
export const OPTIONAL_LIST_ERROR_MESSAGE =
  "Invalid modifiers: You cannot combine isRequired: false and isList: true - optional lists are not supported.";

/** Creates a schema AST object */
export function createSchema({
  models,
  enums,
  dataSource,
  generators = [],
}: {
  models: Model[];
  enums: Enum[];
  dataSource?: DataSource;
  generators?: Generator[];
}): Schema {
  return {
    dataSource,
    generators,
    enums,
    models,
  };
}

/** Creates an enum AST object */
export function createEnum({
  name,
  values,
  documentation,
}: {
  name: string;
  values: string[];
  documentation?: string;
}): Enum {
  validateName(name);
  return {
    name,
    values,
    documentation,
  };
}

/** Creates a model AST object */
export function createModel({
  name,
  fields,
  documentation,
  map,
  indexes,
  fullTextIndexes,
}: {
  name: string;
  fields: Array<ScalarField | ObjectField>;
  documentation?: string;
  map?: string;
  indexes?: Array<Index>;
  fullTextIndexes?: Array<FullTextIndex>;
}): Model {
  validateName(name);
  return {
    name,
    fields,
    documentation,
    map,
    indexes,
    fullTextIndexes,
  };
}

/** Creates a view AST object */
export function createView({
  name,
  fields,
  documentation,
  map,
}: {
  name: string;
  fields: Array<ScalarField | ObjectField>;
  documentation?: string;
  map?: string;
  indexes?: Array<Index>;
  fullTextIndexes?: Array<FullTextIndex>;
}): Model {
  validateName(name);
  return {
    name,
    fields,
    documentation,
    map,
  };
}

/**
 * Creates a scalar field AST object
 * Validates given name argument
 */
export function createScalarField({
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
}: {
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
}): ScalarField {
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
          (isCallExpression(value) &&
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
          (isCallExpression(value) && value.callee === AUTO_INCREMENT)
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
          (isCallExpression(value) && value.callee === NOW)
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

/**
 * Creates an object field AST object
 * Validates given name argument
 */
export function createObjectField({
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
}: {
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
}): ObjectField {
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

/** Creates a data source AST object */
export function createDataSource({
  name,
  provider,
  url,
  relationMode,
}: {
  name: string;
  provider: DataSourceProvider;
  url: string | DataSourceURLEnv;
  relationMode?: DataSource["relationMode"];
}): DataSource {
  return {
    name,
    provider,
    url,
    relationMode,
  };
}

/** Creates a generator AST object */
export function createGenerator({
  name,
  provider,
  output = null,
  binaryTargets = [],
  previewFeatures = [],
}: {
  name: string;
  provider: string;
  output?: string | null;
  binaryTargets?: string[];
  previewFeatures?: Array<PreviewFeature>;
}): Generator {
  return {
    name,
    provider,
    output,
    binaryTargets,
    previewFeatures,
  };
}
