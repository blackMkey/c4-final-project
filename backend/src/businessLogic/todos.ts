import { TodosAccess } from '../dataLayer/todosAcess'
import { getPutSignedUrl } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()

// TODO: Implement businessLogic
export async function getTodosForUser(userId): Promise<TodoItem[]> {
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const newItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: 'http://example.com/image.png',
    ...newTodo
  }
  return todosAccess.createTodo(newItem)
}

export async function updateTodoItem(userId: string, todoId: string,  updatedTodo: UpdateTodoRequest){
  todosAccess.updateTodoItem(userId, todoId,  updatedTodo)
}

export async function updateName(userId: string, todoId: string,  name: string) {
  await todosAccess.updateName(userId, todoId, name)
}
export async function getTodoItem(userId: string, todoId: string){
  return todosAccess.getTodoItem(userId, todoId)
}

export async function deleteTodo(userId:string, todoId:string){
  const item = await getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Item not found')  

  if (item.userId !== userId) {
    throw new Error('User is not authorized to delete item')  
  }

  await todosAccess.deleteTodoItem(userId, todoId)
}

export async function updateTodoImgUrl(
  userId: string,
  todoId: string,
  attachmentUrl: string
) {
  return await todosAccess.updateTodoImgUrl(userId, todoId, attachmentUrl)
}
export async function createAttachmentPresignedUrl(key:string){
  return await getPutSignedUrl(key)
}