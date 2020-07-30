![Node.js CI](https://github.com/amplication/prisma-schema-dsl/workflows/Node.js%20CI/badge.svg)

# Prisma Schema DSL

JavaScript interface for [Prisma Schema DSL](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema)

## Installation

```
npm install prisma-schema-dsl
```

## API

### Print

#### `print(schema: Schema): Promise<string>`

Prints Prisma schema file from AST.
The schema is formatted using prisma-format.

### Builders

#### `createSchema(models: Model[], dataSource?: DataSource): Schema`

Creates a schema AST object

#### `createModel(name: string, fields: Array<ScalarField | ObjectField>): Model`

- Creates a model AST object
- Validates given name argument

#### `createScalarField(name: string, type: ScalarType, isList: boolean = false, isRequired: boolean = false, isUnique: boolean = false, isGenerated: boolean = false, isId: boolean = false, isUpdatedAt: boolean = false): ScalarField`

- Creates a scalar field AST object
- Validates given name argument

#### `createObjectField(name: string, type: string, isList: boolean = false, isRequired: boolean = false, isGenerated: boolean = false, relationName: string | null = null, relationToFields: string[] = [], relationToReferences: string[] = [], relationOnDelete: "NONE" = "NONE"): ObjectField`

- Creates an object field AST object
- Validates given name argument

#### `createDataSource(name: string, provider: DataSourceProvider, url: string | DataSourceURLEnv): DataSource`

Creates a data source AST object

## Development

- Clone the repository `git clone git@github.com:amplication/prisma-schema-dsl.git`
- Install the dependencies `npm install`
- Run tests `npm test`

---

Created with <3 by amplication
