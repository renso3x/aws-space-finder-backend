import { CfnIdentityPool, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";

import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

export class IdentityPoolWrapper {
    private scope: Construct;
    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    private identityPool: CfnIdentityPool;

    constructor(scope: Construct, userPool: UserPool, userPoolClient: UserPoolClient) {
        this.scope = scope
        this.userPool = userPool
        this.userPoolClient = userPoolClient
        this.initialize()
    }

    private initialize() {
        this.initializeIdentityPool()
    }

    private initializeIdentityPool() {
        this.identityPool = new CfnIdentityPool(this.scope, 'SpaceIdentityPool', {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName
            }]
        })
        new CfnOutput(this.scope, 'IdentityPoolId', {
            value: this.identityPool.ref
        })
    }

}