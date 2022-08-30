import { Stack } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { join } from "path";

export interface TableProps {
    primaryKey: string,
    tableName: string,
    createLambdaPath?: string,
    readLambdaPath?: string,
    updateLambdaPath?: string,
    deleteLambdaPath?: string,
}
 
export class GenericTable {
    private table: Table
    
    private createLambda: NodejsFunction | undefined
    private readLambda: NodejsFunction | undefined
    private updateLambda: NodejsFunction | undefined
    private deleteLambda: NodejsFunction | undefined

    public createLambdaIntegration: LambdaIntegration
    public readLambdaIntegration: LambdaIntegration
    public updateLambdaIntegration: LambdaIntegration
    public deleteLambdaIntegration: LambdaIntegration

    public constructor(private stack: Stack, private props: TableProps) {
        this.init()
    }

    private init() {
        this.createTable()
        this.createLambdas()
        this.grantTableRights()
    }

    private createTable() {
        this.table = new Table(this.stack, this.props.tableName, {
            partitionKey: {
                name: this.props.primaryKey,
                type: AttributeType.STRING
            },
            tableName: this.props.tableName
        })
    }

    private createLambdas() {
        if(this.props.createLambdaPath) {
            this.createLambda = this.createSingleLambda(this.props.createLambdaPath)
            this.createLambdaIntegration = new LambdaIntegration(this.createLambda)
        }
        if(this.props.readLambdaPath) {
            this.readLambda = this.createSingleLambda(this.props.readLambdaPath)
            this.readLambdaIntegration = new LambdaIntegration(this.readLambda)
        }
        if(this.props.updateLambdaPath) {
            this.updateLambda = this.createSingleLambda(this.props.updateLambdaPath)
            this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda)
        }
        if(this.props.deleteLambdaPath) {
            this.deleteLambda = this.createSingleLambda(this.props.deleteLambdaPath)
            this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda)
        }
    }

    private grantTableRights() {
        if (this.createLambda) {
            this.table.grantWriteData(this.createLambda)
        }
        if (this.readLambda) {
            this.table.grantReadData(this.readLambda)
        }
        if (this.updateLambda) {
            this.table.grantWriteData(this.updateLambda)
        }
        if (this.deleteLambda) {
            this.table.grantWriteData(this.deleteLambda)
        }
    }

    private createSingleLambda(lambdaName: string): NodejsFunction {
        const lambdaId =  `${this.props.tableName}-${lambdaName}`
        return new NodejsFunction(this.stack, lambdaId, {
            entry: (join(__dirname, '..', 'services', this.props.tableName, `${lambdaName}.ts`)),
            handler: 'handler',
            functionName: lambdaId,
            environment: {
                TABLE_NAME: this.props.tableName,
                PRIMARY_KEY: this.props.primaryKey
            }
        })
    }
}