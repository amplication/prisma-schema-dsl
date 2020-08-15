import isEmpty from "lodash.isempty";
import {
  Schema,
  DataSource,
  DataSourceURLEnv,
  Model,
  PrismaEnum,
  ObjectField,
  ScalarField,
  FieldKind,
  BaseField,
  Generator,
  CallExpression,
  ScalarFieldDefault,
} from "./types";
import { format } from "./format";

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
  statements.push(...schema.models.map(printModel));
  const schemaText = statements.join("\n");
  return format(schemaText);
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
 * Prints model code from AST representation.
 * Note: the code is not formatted.
 * @param schema the model AST
 * @returns code of the model
 */
export function printModel(model: Model): string {
  const fieldTexts = model.fields.map(printField).join("\n");
  return `model ${model.name} {\n${fieldTexts}\n}`;
}

/**
 * Prints model code from AST representation.
 * Note: the code is not formatted.
 * @param schema the model AST
 * @returns code of the model
 */
export function printEnum(prismaEnum: PrismaEnum): string {
  const fieldTexts = prismaEnum.values.map(value => value).join("\n");
  return `enum ${prismaEnum.name} {
${fieldTexts}
}`;
}

/**
 * Prints model field code from AST representation.
 * Note: the code is not formatted.
 * @param schema the field AST
 * @returns code of the field
 */
export function printField(field: ObjectField | ScalarField) {
  return field.kind === FieldKind.Scalar
    ? printScalarField(field)
    : printObjectField(field);
}

function printScalarField(field: ScalarField): string {
  const modifiersText = printFieldModifiers(field);
  const attributes: string[] = [];
  if (field.isId) {
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

function printObjectField(field: ObjectField): string {
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
    attributes.push(printRelation(relation));
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

function printRelation(relation: Relation): string {
  const nameText = relation.name ? `name: ${relation.name}` : "";
  const fieldsText = relation.fields ? `fields: [${relation.fields}]` : "";
  const referencesText = relation.references
    ? `references: [${relation.references}]`
    : "";
  return `@relation(${nameText} ${fieldsText} ${referencesText})`;
}
