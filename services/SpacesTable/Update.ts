require('dotenv').config()

import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY, 
}
const TABLE_NAME = process.env.TABLE_NAME as string 
const PRIMARY_KEY = process.env.PRIMARY_KEY as string
const dbClient = new DynamoDB.DocumentClient(config)

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    const requestBody = typeof event.body === 'object' ? event.body : JSON.parse(event.body)
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY]

    if (requestBody && spaceId) {
        const payloadKey = Object.keys(requestBody)[0]
        const payload = requestBody[payloadKey]

        const updatedResponse = await dbClient.update({
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: spaceId
            },
            UpdateExpression: 'set #zzNew = :new',
            ExpressionAttributeNames: {
                '#zzNew': payloadKey
            },
            ExpressionAttributeValues: {
                ':new': payload
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise()
        result.body = JSON.stringify(updatedResponse)
    }
    return result
}

export { handler }