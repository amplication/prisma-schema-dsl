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
} from "./types";

type Relation = {
  name?: string;
  fields?: string[];
  references?: string[];
};

export function print(schema: Schema): string {
  const statements = [];
  if (schema.dataSource) {
    statements.push(printDataSource(schema.dataSource));
  }
  statements.push(schema.models.map(printModel).join("\n"));
  return statements.join("\n");
}

function printDataSource(dataSource: DataSource): string {
  const url = printDataSourceURL(dataSource.url);
  return `datasource ${dataSource.name} {
  provider = "${dataSource.provider}"
  url      = ${url}
}`;
}

function printDataSourceURL(url: string | DataSourceURLEnv): string {
  return url instanceof DataSourceURLEnv ? `env("${url.name}")` : `"${url}"`;
}

function printModel(model: Model): string {
  const fieldTexts = model.fields.map(printField).join("\n");
  return `model ${model.name} {\n${fieldTexts}\n}`;
}

function printField(field: ObjectField | ScalarField) {
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

  const typeText = `${field.type}${modifiersText}`;
  const attributesText = attributes.join(" ");
  return [field.name, typeText, attributesText].filter(Boolean).join(" ");
}

function printObjectField(field: ObjectField): string {
  const relation: Relation = {};
  if (field.relationToFields) {
    relation.name = field.relationName;
    relation.fields = field.relationToFields;
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
