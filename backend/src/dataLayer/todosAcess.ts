import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all groups')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosCreatedAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    logger.info('Got items', { items })

    return items as TodoItem[]
  }

  async createTodo(item): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: item
      })
      .promise()

    return item
  }

  async deleteTodoItem(userId:string, todoId: string) {
    logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`)

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId,
      }
    }, function(err, data) {
      if (err) {
        throw new Error('cannot delete item')  
      } else {
        logger.info("Success", data);
      }
    }).promise()   
    logger.info(`Deleted todo item ${todoId} from ${this.todosTable}`) 
  }

  async getTodoItem(userId:string,todoId: string): Promise<TodoItem> {
    logger.info(`Getting todo ${todoId} from ${this.todosTable}`)

    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }).promise()

    const item = result.Item

    return item as TodoItem
  }

  async updateTodoItem(
    userId: string,
    todoId: string,
    updatedTodo: TodoUpdate
  ) {
    logger.info(`Updating To-do Item with id ${todoId}.`, { updatedTodo })
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #N = :n, dueDate = :dd, done=:d',
        ExpressionAttributeNames: {
          '#N': 'name'
        },
        ExpressionAttributeValues: {
          ':n': updatedTodo.name,
          ':d': updatedTodo.done,
          ':dd': updatedTodo.dueDate
        }
      })
      .promise()
    logger.info('To-do Item updated!')
  }

  async updateTodoImgUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ) {
    logger.info(`Updating attachmentUrl!`, { attachmentUrl })
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues: {
          ':url': attachmentUrl
        }
      })
      .promise()
    logger.info('To-do attachmentUrl updated!')
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
