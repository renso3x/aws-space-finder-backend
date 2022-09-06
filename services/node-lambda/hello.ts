import { APIGatewayProxyEvent } from 'aws-lambda';
import { S3 }  from 'aws-sdk'

const s3Client = new S3();

const handler = async (event: any, context: any) => {
    const buckets = await s3Client.listBuckets().promise()
    if (isAuthorized(event)) {
        return {
            statusCode: 200,
            body: `Here are your buckets: ${JSON.stringify(buckets.Buckets)}`
        }
    }
    return {
        statusCode: 401,
        body: 'You are NOT authorized'
    }
}

function isAuthorized(event: APIGatewayProxyEvent) {
    const groups = event.requestContext.authorizer?.claims['cognito:groups']
    if (groups) {
        return (groups as string).includes('admins')
    }
    return false
}

export { handler }