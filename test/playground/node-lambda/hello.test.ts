import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../../services/SpacesTable/Create'

const event: APIGatewayProxyEvent = {
    body: {
        name: 'Test'
    }
} as any

const result = handler(event, {} as any).then(res => {
    const items = JSON.parse(res.body)
    console.log(items)
})