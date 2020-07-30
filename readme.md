# Prisma Schema DSL

JavaScript interface for [Prisma Schema DSL](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema)

## Installation

```
npm install prisma-schema-dsl
```

## API

### Print

#### `print(schema: Schema): string`

Prints Prisma schema file from AST

### Builders

#### `createSchema(models: Model[], dataSource?: DataSource): Schema`

Creates a schema AST from given model and data source objects.

## Development

- Clone the repository `git clone git@github.com:amplication/prisma-schema-dsl.git`
- Install the dependencies `npm install`
- Run tests `npm test`

---

Created with <3 by amplication
