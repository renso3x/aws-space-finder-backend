require('dotenv').config()

import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { MissingFieldError, validateSpaceEntry } from '../Shared/InputValidator'
import { generateRandomID, getEventBody } from '../Shared/Utils'

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY, 
}
const TABLE_NAME = process.env.TABLE_NAME
const dbClient = new DynamoDB.DocumentClient(config)

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    try {
        const item = getEventBody(event)
        item.spaceId = generateRandomID()

        validateSpaceEntry(item)

        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item,
        }).promise()

        result.body = JSON.stringify(`CREATED spaceId: ${item.spaceId}`)
    } catch (error: any) {
        if (error instanceof MissingFieldError) {
            result.statusCode = 403
        } else {
            result.statusCode = 500
        }
        result.body = error.message
    }

    return result
}

export { handler }