require('dotenv').config()

import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult, Context } from 'aws-lambda'

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY, 
}
const TABLE_NAME = process.env.TABLE_NAME
const PRIMARY_KEY = process.env.PRIMARY_KEY
const dbClient = new DynamoDB.DocumentClient(config)

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    try {
        if (event.queryStringParameters) {
            // ! you are sure that it is in the object
            if (PRIMARY_KEY! in event.queryStringParameters) {
                result.body = await queryWithPrimaryPartition(event.queryStringParameters)
            } else {
                result.body = await queryWithSecondaryPartition(event.queryStringParameters)   
            }
        }
        else {
            result.body = await scanTable()
        }
    } catch (error: any) {
        result.statusCode = 500
        result.body = error.message
    }

    return result
}

async function queryWithSecondaryPartition(queryStringParameters: APIGatewayProxyEventQueryStringParameters) {
    const queryKey = Object.keys(queryStringParameters)[0]
    const queryValue = queryStringParameters[queryKey]
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        IndexName: queryKey,
        KeyConditionExpression: '#zz = :zzzz',
        ExpressionAttributeNames: {
            '#zz': queryKey,
        },
        ExpressionAttributeValues: {
            ':zzzz': queryValue
        }
    }).promise()

    return JSON.stringify(queryResponse.Items)
}

async function queryWithPrimaryPartition(queryStringParameters: APIGatewayProxyEventQueryStringParameters) {
    const keyValue = queryStringParameters[PRIMARY_KEY!]
    // Build query 
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        KeyConditionExpression: '#zz = :zzzz',
        ExpressionAttributeNames: {
            '#zz': PRIMARY_KEY!,
        },
        ExpressionAttributeValues: {
            ':zzzz': keyValue
        }
    }).promise()

    return JSON.stringify(queryResponse.Items);
}

async function scanTable() {
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME!,
    }).promise()
    return JSON.stringify(queryResponse.Items)    
}

export { handler }