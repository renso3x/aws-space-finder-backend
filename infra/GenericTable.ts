import { Stack } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";

export class GenericTable {
    private table: Table
    public constructor(private name: string, private primaryKey: string, private stack: Stack) {
        this.init()
    }

    private init() {
        this.createTable()
    }

    private createTable() {
        this.table = new Table(this.stack, this.name, {
            partitionKey: {
                name: this.primaryKey,
                type: AttributeType.STRING
            },
            tableName: this.name
        })
    }
}