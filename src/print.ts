import isEmpty from "lodash.isempty";
import {
  Schema,
  DataSource,
  DataSourceURLEnv,
  Model,
  ObjectField,
  ScalarField,
  FieldKind,
  BaseField,
  Generator,
  CallExpression,
  ScalarFieldDefault,
  Enum,
  DataSourceProvider,
} from "./types";
import { formatSchema } from "@prisma/sdk";

type Relation = {
  name?: string | null;
  fields?: string[];
  references?: string[];
};

/**
 * Prints Prisma schema code from AST representation.
 * The code is formatted using prisma-format.
 * @param schema the Prisma schema AST
 * @returns code of the Prisma schema
 */
export async function print(schema: Schema): Promise<string> {
  const statements = [];
  if (schema.dataSource) {
    statements.push(printDataSource(schema.dataSource));
  }
  if (schema.generators.length) {
    statements.push(...schema.generators.map(printGenerator));
  }
  const providerType = schema.dataSource?.provider;
  providerType &&
    statements.push(
      ...schema.models.map((model) => printModel(model, providerType))
    );
  statements.push(...schema.enums.map(printEnum));
  const schemaText = statements.join("\n");
  return formatSchema({ schema: schemaText });
}

/**
 * Prints data source code from AST representation.
 * Note: the code is not formatted.
 * @param schema the data source AST
 * @returns code of the data source
 */
export function printDataSource(dataSource: DataSource): string {
  const url = printDataSourceURL(dataSource.url);
  return `datasource ${dataSource.name} {
  provider = "${dataSource.provider}"
  url      = ${url}
}`;
}

function printDataSourceURL(url: string | DataSourceURLEnv): string {
  return url instanceof DataSourceURLEnv ? `env("${url.name}")` : `"${url}"`;
}

export function printGenerator(generator: Generator): string {
  const fields = [`provider = "${generator.provider}"`];
  if (generator.output) {
    fields.push(`output = "${generator.output}"`);
  }
  if (generator.binaryTargets.length) {
    fields.push(`binaryTargets = ${JSON.stringify(generator.binaryTargets)}`);
  }
  return `generator ${generator.name} {
  ${fields.join("\n  ")}
}`;
}

/**
 * Prints documentation code from AST representation
 * @param documentation the documentation AST representation
 * @returns code of the documentation
 */
export function printDocumentation(documentation: string): string {
  return `/// ${documentation}`;
}

/**
 * If defined, adds documentation to the provided code
 * @param documentation documentation of the provided node's code
 * @param code code of an AST node
 * @returns if defined, code with documentation, otherwise the code as is
 */
function withDocumentation(
  documentation: string | undefined,
  code: string
): string {
  if (documentation) {
    return [printDocumentation(documentation), code].join("\n");
  }
  return code;
}

/**
 * Prints enum code from AST representation
 * Node: the code is not formatted.
 * @param enum_ the enum AST
 * @returns code of the enum
 */
export function printEnum(enum_: Enum): string {
  const valuesText = enum_.values.join("\n");
  return withDocumentation(
    enum_.documentation,
    `enum ${enum_.name} {\n${valuesText}\n}`
  );
}

/**
 * Prints model code from AST representation.
 * Note: the code is not formatted.
 * @param model the model AST
 * @returns code of the model
 */
export function printModel(model: Model, provider: DataSourceProvider): string {
  const fieldTexts = model.fields
    .map((field) => printField(field, provider))
    .join("\n");
  return withDocumentation(
    model.documentation,
    `model ${model.name} {\n${fieldTexts}\n}`
  );
}

/**
 * Prints model field code from AST representation.
 * Note: the code is not formatted.
 * @param field the field AST
 * @returns code of the field
 */
export function printField(
  field: ObjectField | ScalarField,
  provider: DataSourceProvider
) {
  return withDocumentation(
    field.documentation,
    field.kind === FieldKind.Scalar
      ? printScalarField(field, provider)
      : printObjectField(field, provider)
  );
}

function printScalarField(
  field: ScalarField,
  provider: DataSourceProvider
): string {
  const modifiersText = printFieldModifiers(field);
  const attributes: string[] = [];

  if (field.isId && provider === DataSourceProvider.MongoDB) {
    attributes.push(`@id @map("_id") @mongo.ObjectId`);
  } else if (field.isId) {
    attributes.push("@id");
  }
  if (field.isUnique) {
    attributes.push("@unique");
  }
  if (field.isUpdatedAt) {
    attributes.push("@updatedAt");
  }
  if (field.default) {
    attributes.push(`@default(${printScalarDefault(field.default)})`);
  }
  const typeText = `${field.type}${modifiersText}`;
  const attributesText = attributes.join(" ");
  return [field.name, typeText, attributesText].filter(Boolean).join(" ");
}

function printScalarDefault(value: ScalarFieldDefault): string {
  // String, JSON and DateTime
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (value instanceof CallExpression) {
    return `${value.callee}()`;
  }
  throw new Error(`Invalid value: ${value}`);
}

function printObjectField(
  field: ObjectField,
  provider: DataSourceProvider
): string {
  const relation: Relation = {};

  if (field.relationName) {
    relation.name = field.relationName;
  }
  if (field.relationToFields.length) {
    relation.fields = field.relationToFields;
  }
  if (field.relationToReferences.length) {
    relation.references = field.relationToReferences;
  }
  const attributes: string[] = [];
  if (!isEmpty(relation)) {
    attributes.push(printRelation(relation, provider));
  }
  const typeText = `${field.type}${printFieldModifiers(field)}`;
  const attributesText = attributes.join(" ");
  return [field.name, typeText, attributesText].filter(Boolean).join(" ");
}

function printFieldModifiers(field: BaseField): string {
  const modifiers = [];
  if (field.isList) {
    modifiers.push("[]");
  }
  if (!field.isRequired) {
    modifiers.push("?");
  }
  return modifiers.join("");
}

function printRelation(
  relation: Relation,
  provider: DataSourceProvider
): string {
  const isMongodbProvider = provider === DataSourceProvider.MongoDB;
  const nameText = relation.name ? `name: "${relation.name}"` : "";
  const fieldsText = relation.fields ? `fields: [${relation.fields}]` : "";
  const referencesText = relation.references
    ? `references: [${relation.references}]`
    : "";
  const onDeleteFiled =
    relation.references && isMongodbProvider ? "onDelete:NoAction" : "";
  const onUpdateFiled =
    relation.references && isMongodbProvider ? "onUpdate:NoAction" : "";

  return `@relation(${[
    nameText,
    fieldsText,
    referencesText,
    onDeleteFiled,
    onUpdateFiled,
  ]
    .filter(Boolean)
    .join(", ")})`;
}
