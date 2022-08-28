import { v4 } from 'uuid'

const handler = async (event: any, context: any) => {
    return {
        statusCode: 200,
        body: `Hello from lambda! ${v4()}`
    }
}

export { handler }