import { Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';
import { GenericTable } from './GenericTable';

import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
export class SpaceStack extends Stack {
    // reference this in the class
    private api = new RestApi(this, 'SpaceApi')
    // Use generic table
    private spacesTable = new GenericTable(this, {
      tableName: 'SpacesTable',
      primaryKey: 'spaceId',
      createLambdaPath: 'Create',
      readLambdaPath: 'Read',
      updateLambdaPath: 'Update',
      deleteLambdaPath: 'Delete',
      secondaryIndexes: ['location']
    })

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
              externalModules: [
                'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
              ],
            },
            depsLockFilePath: join(__dirname, '..', 'package-lock.json'),
            runtime: Runtime.NODEJS_14_X,
          }

        // Lambda
        const helloLambda = new lambda.Function(this, 'helloLambda', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
            handler: 'hello.main'
        })

        
        // NodeJS Lambda
        const helloLambdaNodeJS = new NodejsFunction(this, 'helloLambdaNodeJS', {
            runtime: Runtime.NODEJS_14_X,
            entry: (join(__dirname, '..', 'services', 'node-lambda', 'hello.ts')),
            ...nodeJsFunctionProps,
        })
        // Add s3 Policy
        const s3ListPolicy = new PolicyStatement()
        s3ListPolicy.addActions('s3:ListAllMyBuckets')
        s3ListPolicy.addResources('*')

        helloLambdaNodeJS.addToRolePolicy(s3ListPolicy)

        // API Gateway Integrate Lambda
        const helloLambdaIntegration = new LambdaIntegration(helloLambda)
        // Add Resource
        const helloLambdaResource = this.api.root.addResource('hello')
        // Add The method
        helloLambdaResource.addMethod('GET', helloLambdaIntegration)


        // Sspace API Integration
        const spaceResource = this.api.root.addResource('spaces')
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration)
        spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration)
        spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration)
        spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration)
    }
}