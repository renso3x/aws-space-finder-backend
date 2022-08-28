import { Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';
import { GenericTable } from './GenericTable';

export class SpaceStack extends Stack {
    // reference this in the class
    private api = new RestApi(this, 'SpaceApi')
    // create a table
    private spacesTable = new GenericTable('SpacesTable', 'spaceId', this)

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        // Lambda
        const helloLambda = new lambda.Function(this, 'helloLambda', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
            handler: 'hello.main'
        })
        // API Gateway Integrate Lambda
        const helloLambdaIntegration = new LambdaIntegration(helloLambda)
        // Add Resource
        const helloLambdaResource = this.api.root.addResource('hello')
        // Add The method
        helloLambdaResource.addMethod('GET', helloLambdaIntegration)
    }
}