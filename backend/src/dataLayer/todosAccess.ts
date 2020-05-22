import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodoItems(userId: String): Promise<TodoItem[]> {
    console.log('Getting all Todos')
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise();
    
      const items = result.Items;
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: todo
      }).promise();

    return todo
  }

  async updateTodoItem(todoId: String, userId: String, updatedTodo: UpdateTodoRequest) {
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'SET #n = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues : {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        }
      }).promise();
  }

  async deleteTodoItem(todoId: String, userId: String) {
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }).promise();
  }
 
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      service: AWSXRay.captureAWSClient(new AWS.DynamoDB)
    })
  }

  return new AWS.DynamoDB.DocumentClient({service: AWSXRay.captureAWSClient(new AWS.DynamoDB)})
}

