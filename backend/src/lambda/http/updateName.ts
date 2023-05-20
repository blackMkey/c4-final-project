import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { updateName } from '../../businessLogic/todos'
import {  } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
interface UpdateTodo {
    name: string
}
export const handler =   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const data: UpdateTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    await updateName(userId, todoId, data.name)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: '',
    }
  };

