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
  CUID,
  AUTO_INCREMENT,
  NOW,
  UUID,
  ScalarFieldDefault,
  Enum,
  ReferentialActions,
  isCallExpression,
} from "prisma-schema-dsl-types";

const NAME_REGEXP = /[A-Za-z][A-Za-z0-9_]*/;
export const OPTIONAL_LIST_ERROR_MESSAGE =
  "Invalid modifiers: You cannot combine isRequired: false and isList: true - optional lists are not supported.";

export const INVALID_MODEL_ATTRIBUTES_ERROR_MESSAGE = (name: string) =>
  `Invalid model ${name} attribute: all model attributes must start with @@.`;

export const INVALID_FIELD_ATTRIBUTES_ERROR_MESSAGE = (name: string) =>
  `Invalid field ${name} attribute: all field attributes must start with @.`;

/** Creates a schema AST object */
export function createSchema(
  models: Model[],
  enums: Enum[],
  dataSource?: DataSource,
  generators: Generator[] = []
): Schema {
  return {
    dataSource,
    generators,
    enums,
    models,
  };
}

/** Creates an enum AST object */
export function createEnum(
  name: string,
  values: string[],
  documentation?: string
): Enum {
  validateName(name);
  return {
    name,
    values,
    documentation,
  };
}

/** Creates a model AST object */
export function createModel(
  name: string,
  fields: Array<ScalarField | ObjectField>,
  documentation?: string,
  map?: string,
  attributes?: string | string[]
): Model {
  validateName(name);
  const preparedAttributes = validateAndPrepareModelAttributes(
    name,
    attributes
  );
  return {
    name,
    fields,
    documentation,
    map,
    attributes: preparedAttributes,
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
  isId: boolean = false,
  isUpdatedAt: boolean = false,
  defaultValue: ScalarFieldDefault = null,
  documentation?: string,
  isForeignKey: boolean = false,
  attributes?: string | string[]
): ScalarField {
  validateName(name);
  validateScalarDefault(type, defaultValue);
  validateModifiers(isRequired, isList);
  const preparedAttributes = validateAndPrepareFieldAttributes(
    name,
    attributes
  );
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
    attributes: preparedAttributes,
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
    case ScalarType.Int:
    case ScalarType.BigInt: {
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
    case ScalarType.Float:
    case ScalarType.Decimal: {
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
export function createObjectField(
  name: string,
  type: string,
  isList: boolean = false,
  isRequired: boolean = false,
  relationName: string | null = null,
  relationFields: string[] = [],
  relationReferences: string[] = [],
  relationOnDelete: ReferentialActions = ReferentialActions.NONE,
  relationOnUpdate: ReferentialActions = ReferentialActions.NONE,
  documentation?: string,
  attributes?: string | string[]
): ObjectField {
  validateName(name);
  validateModifiers(isRequired, isList);
  const preparedAttributes = validateAndPrepareFieldAttributes(
    name,
    attributes
  );

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
    attributes: preparedAttributes,
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

function validateAndPrepareAttributesPrefix(
  attributePrefix: string,
  invalidErrorMessage: (name: string) => string,
  name: string,
  attributes?: string | string[]
): string[] | null {
  if (!attributes) {
    return null;
  }

  if (typeof attributes === "string") {
    // clean up new lines
    attributes = attributes.replace(/\n/g, " ");
    // split by attributePrefix
    attributes = attributes.split(attributePrefix);
    // remove empty strings
    attributes = attributes.filter(Boolean);
    // remove trailing and leading spaces
    attributes = attributes.map((attribute) =>
      attribute.replace(/\n/g, " ").trim()
    );
    // add back attributePrefix
    attributes = attributes.map(
      (attribute) => attributePrefix + attribute.trim()
    );
  }

  if (Array.isArray(attributes)) {
    attributes.forEach((attribute) => attribute.trim());
  }

  // Check if it's an array and if all attributes start with the prefix and that it's not only the prefix
  if (
    !Array.isArray(attributes) ||
    !attributes.every(
      (attribute) =>
        attribute.trim().startsWith(attributePrefix) &&
        attribute.length > attributePrefix.length
    )
  ) {
    throw new Error(invalidErrorMessage(name));
  }

  return attributes;
}

function validateAndPrepareModelAttributes(
  name: string,
  attributes?: string | string[]
): string[] | null {
  return validateAndPrepareAttributesPrefix(
    "@@",
    INVALID_MODEL_ATTRIBUTES_ERROR_MESSAGE,
    name,
    attributes
  );
}

function validateAndPrepareFieldAttributes(
  name: string,
  attributes?: string | string[]
): string[] | null {
  return validateAndPrepareAttributesPrefix(
    "@",
    INVALID_FIELD_ATTRIBUTES_ERROR_MESSAGE,
    name,
    attributes
  );
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

/** Creates a generator AST object */
export function createGenerator(
  name: string,
  provider: string,
  output: string | null = null,
  binaryTargets: string[] = []
): Generator {
  return {
    name,
    provider,
    output,
    binaryTargets,
  };
}
