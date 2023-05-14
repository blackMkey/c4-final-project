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

export async function deleteTodo(userId:string, todoId:string){
  todosAccess.deleteTodoItem(userId, todoId)
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