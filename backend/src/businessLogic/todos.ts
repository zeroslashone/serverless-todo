import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()

export async function getAllTodos(userId: String): Promise<TodoItem[]> {
  return todosAccess.getAllTodoItems(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string
): Promise<TodoItem> {
 
  const todoId =  uuid.v4();
  const createdAt = new Date().toISOString()
  const newTodo = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...createTodoRequest
  }

  return todosAccess.createTodoItem(newTodo)
}

export async function updateTodo(todoId: String, userId: string, updateTodoRequest: UpdateTodoRequest){
    return todosAccess.updateTodoItem(todoId, userId, updateTodoRequest)
}

export async function deleteTodo(todoId: String, userId: string){
    return todosAccess.deleteTodoItem(todoId, userId)
}
