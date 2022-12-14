import { CfnUserPoolGroup, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";

import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IdentityPoolWrapper } from './IdentityPoolWrapper';

export class AuthorizeWrapper {
    private scope: Construct;
    private api: RestApi;
    private identityPoolWrapper: IdentityPoolWrapper;

    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    public authorizer: CognitoUserPoolsAuthorizer;
    
    constructor(scope: Construct, api: RestApi) {
        this.scope = scope;
        this.api = api;

        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.createAdminsGroup()
        this.initializeIdentityPoolWrapper();
    }

    private initializeIdentityPoolWrapper(){
        this.identityPoolWrapper = new IdentityPoolWrapper(
            this.scope,
            this.userPool,
            this.userPoolClient
        )
    }

    private createUserPool() {
        this.userPool = new UserPool(this.scope, 'SpaceUserPool', {
            userPoolName: 'SpaceUserPool',
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true
            }
        })

        new CfnOutput(this.scope, 'UserPoolId', {
            value: this.userPool.userPoolId
        })
    }

    private addUserPoolClient() {
        this.userPoolClient = this.userPool.addClient('SpaceUserPool-client', {
            userPoolClientName: 'SpaceUserPool-client',
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            },
            generateSecret: false
        })

        new CfnOutput(this.scope, 'SpaceUserPool-client', {
            value: this.userPoolClient.userPoolClientId
        })
    }

    private createAuthorizer() {
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'SpaceAuthorizer', {
            cognitoUserPools: [this.userPool],
            authorizerName: 'SpaceAuthorizer',
            identitySource: 'method.request.header.Authorization'
        })
        this.authorizer._attachToApi(this.api)
    }

    private createAdminsGroup(){
        new CfnUserPoolGroup(this.scope, 'admins', {
            groupName: 'admins',
            userPoolId: this.userPool.userPoolId,
            roleArn: this.identityPoolWrapper.adminRole.roleArn
        })
    }
}