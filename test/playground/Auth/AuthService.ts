import * as AWS from 'aws-sdk'

import Amplify from 'aws-amplify'
import { Auth } from 'aws-amplify'
import { CognitoUser } from '@aws-amplify/auth'
import { Credentials } from 'aws-sdk/lib/credentials'
import { config } from './config'

Amplify.configure({
    Auth: {
        mandatorySignIn: false,
        region: config.REGION,
        userPoolId: config.USER_POOL_ID,
        userWebClientId: config.APP_CLIENT_ID,
        identityPool: config.IDENTITY_POOL_ID,
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
})

export class AuthService {
    async login(username: string, password: string): Promise<CognitoUser> {
        const user = await Auth.signIn(username, password) as CognitoUser
        return user
    }
    
    async getAWSTemporaryCreds(user: CognitoUser) {
        const cognitoIdendityPool = `cognito-idp.${config.REGION}.amazonaws.com/${config.USER_POOL_ID}`
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: config.IDENTITY_POOL_ID,
            Logins: {
                [cognitoIdendityPool]: user.getSignInUserSession()!.getIdToken().getJwtToken()
            }
        }, {
            region: config.REGION
        })
        await this.refreshCredentials()
    }

    private async refreshCredentials(): Promise<void> {
        return new Promise((resolve, reject) => {
            (AWS.config.credentials as Credentials).refresh(error => {
                if (error) {
                    reject(error)
                }
                resolve()
            })
        })
    }
}