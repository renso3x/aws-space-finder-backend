import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../../services/SpacesTable/Delete'

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: '252c9ed1-b2d5-45be-a433-5d82338ec4dc'
    }
} as any

const result = handler(event, {} as any).then(res => {
    const items = JSON.parse(res.body)
    console.log(items)
})