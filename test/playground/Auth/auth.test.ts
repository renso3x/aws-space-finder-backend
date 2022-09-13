import * as AWS from 'aws-sdk'

import { AuthService } from './AuthService'
import { config } from './config'

async function call() {

    const authService = new AuthService()

    const user = await authService.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD)

    await authService.getAWSTemporaryCreds(user)

    const someCreds = AWS.config.credentials
    const a = 5
}

call()