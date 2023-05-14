import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import {
  createAttachmentPresignedUrl,
  updateTodoImgUrl
} from '../../businessLogic/todos'
import { getUserId } from '../utils'

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    if (!todoId) {
      throw new Error('miss todoID')
    }
    const userId = getUserId(event)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const imageName = userId + '_' + todoId
    const url = await createAttachmentPresignedUrl(imageName)
    await updateTodoImgUrl(
      userId,
      todoId,
      `https://${bucketName}.s3.amazonaws.com/${imageName}`
    )

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        err: e,
        message: 'error when generate URL!'
      })
    }
  }
}
