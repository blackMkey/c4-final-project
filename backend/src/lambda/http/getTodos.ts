import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'

// TODO: Get all TODO items for a current user
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Write your code here
  const userId = getUserId(event)
  const items = await getTodosForUser(userId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ items })
  }
}
