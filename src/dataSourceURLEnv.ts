import {DataSourceURLEnv as IDataSourceURLEnv} from 'prisma-schema-dsl-types'

export class DataSourceURLEnv implements IDataSourceURLEnv {
    constructor (readonly name: string ){}
}