import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../../services/SpacesTable/Read'

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: '4eb8368e-fa53-404d-b770-17e39041ef6c'
    }
} as any

const result = handler(event, {} as any).then(res => {
    const items = JSON.parse(res.body)
    console.log(items)
})