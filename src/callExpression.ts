import {CallExpression as ICallExpression} from 'prisma-schema-dsl-types'

export class CallExpression implements ICallExpression {
    constructor(readonly callee: string){
    }
}