import isEmpty from "lodash.isempty";
import {
  BaseField,
  DataSource,
  DataSourceProvider,
  DataSourceURLEnv,
  Enum,
  FieldKind,
  FullTextIndex,
  Generator,
  Index,
  isCallExpression,
  isDataSourceURLEnv,
  Model,
  ObjectField,
  ReferentialActions,
  ScalarField,
  ScalarFieldDefault,
  Schema,
} from "@pmaltese/prisma-schema-dsl-types";
import { formatSchema } from "@prisma/internals";

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
  const relationMode = dataSource.relationMode
    ? `\nrelationMode = "${dataSource.relationMode}"`
    : "";
  return `datasource ${dataSource.name} {
  provider = "${dataSource.provider}"
  url      = ${url}${relationMode}
}`;
}

function printDataSourceURL(url: string | DataSourceURLEnv): string {
  return isDataSourceURLEnv(url) ? `env("${url.name}")` : `"${url}"`;
}

export function printGenerator(generator: Generator): string {
  const fields = [`provider = "${generator.provider}"`];
  if (generator.output) {
    fields.push(`output = "${generator.output}"`);
  }
  if (generator.binaryTargets?.length) {
    fields.push(`binaryTargets = ${JSON.stringify(generator.binaryTargets)}`);
  }
  if (generator.previewFeatures?.length) {
    fields.push(
      `previewFeatures = ${JSON.stringify(generator.previewFeatures)}`
    );
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
export function printModel(
  model: Model,
  provider: DataSourceProvider = DataSourceProvider.PostgreSQL
): string {
  const fieldTexts = model.fields
    .map((field) => printField(field, provider))
    .join("\n");
  const map = model.map ? printModelMap(model.map, true) : "";
  const indexes = model.indexes ? printModelIndexes(model.indexes, true) : "";
  const fullTextIndexes = model.fullTextIndexes
    ? printModelFullTextIndexes(model.fullTextIndexes, true)
    : "";

  return withDocumentation(
    model.documentation,
    `model ${model.name} {\n${fieldTexts}${map}${indexes}${fullTextIndexes}\n}`
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
      : printObjectField(field)
  );
}

function printScalarField(
  field: ScalarField,
  provider: DataSourceProvider
): string {
  const modifiersText = printFieldModifiers(field);
  const attributes: string[] = [];
  const isMongoDBProvider = provider === DataSourceProvider.MongoDB;

  if (field.isId) {
    if (isMongoDBProvider) {
      attributes.push(`@id @map("_id") @mongo.ObjectId`);
    } else {
      attributes.push("@id");
    }
  }

  if (isMongoDBProvider && field.isForeignKey) {
    attributes.push("@mongo.ObjectId");
  }

  if (field.isUnique) {
    attributes.push("@unique");
  }
  if (field.isUpdatedAt) {
    attributes.push("@updatedAt");
  }
  if (field.default) {
    if (!isMongoDBProvider || !field.isId) {
      attributes.push(`@default(${printScalarDefault(field.default)})`);
    }
    if (isMongoDBProvider && field.isId) {
      attributes.push(`@default(auto())`);
    }
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
  if (isCallExpression(value)) {
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
    attributes.push(printRelation(relation, field));
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

function printRelation(relation: Relation, field: ObjectField): string {
  const nameText = relation.name ? `name: "${relation.name}"` : "";
  const fieldsText = relation.fields ? `fields: [${relation.fields}]` : "";
  const referencesText = relation.references
    ? `references: [${relation.references}]`
    : "";

  const onDeleteAction =
    field.relationOnDelete != ReferentialActions.NONE
      ? `onDelete: ${field.relationOnDelete}`
      : "";
  const onUpdateAction =
    field.relationOnUpdate != ReferentialActions.NONE
      ? `onUpdate: ${field.relationOnUpdate}`
      : "";

  return `@relation(${[
    nameText,
    fieldsText,
    referencesText,
    onDeleteAction,
    onUpdateAction,
  ]
    .filter(Boolean)
    .join(", ")})`;
}

export function printModelMap(name: string, prependNewLines = false) {
  const prefix = prependNewLines ? "\n\n" : "";

  return `${prefix}@@map("${name}")`;
}

export function printModelIndexes(
  indexes: Array<Index>,
  prependNewLines = false
) {
  const prefix = prependNewLines ? "\n\n" : "";

  return indexes
    .map((index) => {
      const fieldList = index.fields.map((field) => {
        let f = field.name;
        const fieldArgs = safeMergeArguments([
          field.sort
            ? `sort: ${
                field.sort.charAt(0).toUpperCase() + field.sort.slice(1)
              }`
            : "",
        ]);

        f += fieldArgs ? `(${fieldArgs})` : "";
        return f;
      });

      const fields = `fields: [${fieldList}]`;

      return `${prefix}@@index(${fields})`;
    })
    .join("\n");
}

export function printModelFullTextIndexes(
  fullTextIndexes: Array<FullTextIndex>,
  prependNewLines = false
) {
  const prefix = prependNewLines ? "\n\n" : "";

  return fullTextIndexes
    .map((index) => {
      const fields = `fields: [${index.fields.map((f) => f.name).join(", ")}]`;
      const args = safeMergeArguments([fields]);

      return `${prefix}@@fulltext(${args})`;
    })
    .join("\n");
}

function safeMergeArguments(args: Array<string | null | undefined>) {
  return args.filter((a) => !!a).join(", ");
}
