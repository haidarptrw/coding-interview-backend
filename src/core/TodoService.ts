import { Todo } from "../domain/Todo";
import { ResponseErrorFactory, ShareBody } from "../types";
import { ITodoRepository } from './ITodoRepository';
import { IUserRepository } from "./IUserRepository";

export class TodoService {
  constructor(
    private todoRepo: ITodoRepository,
    private userRepo: IUserRepository
  ) {}

  async createTodo(data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'remindAt'> & {remindAt?: string}): Promise<Todo> {

    // Validate whether the user is exists in the repository
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw ResponseErrorFactory.new("User that owns this todo was not found in the repository", 404);
    }

    // This throws error when the validation failed. should be handled by the HTTP handler
    const todo = await this.todoRepo.create({
      userId: data.userId,
      title: data.title,
      description: data.description || "No Description",
      status: "PENDING",
      remindAt: data.remindAt ? new Date(data.remindAt) : undefined,
    });

    return todo;
  }

  async completeTodo(todoId: string): Promise<Todo> {
    const todo = await this.todoRepo.findById(todoId);

    if (!todo) {
      throw ResponseErrorFactory.new(`todo with id = ${todoId} is not found`, 404);
    }

    if (todo.status === "DONE") {
      return todo;
    }

    const updated = await this.todoRepo.update(todoId, {
      status: "DONE",
      updatedAt: new Date(),
    });

    if (!updated) {
      throw ResponseErrorFactory.new("Failed to update the requested todo because it was not found", 404);
    }

    return updated;
  }

  async getTodosByUser(userId: string): Promise<Todo[]> {
    return this.todoRepo.findByUserId(userId);
  }

  async processReminders(): Promise<void> {
    const now = new Date();
    const dueTodos = await this.todoRepo.findDueReminders(now);

    for (const todo of dueTodos) {
      // This should only process PENDING todos, but doesn't check
      await this.todoRepo.update(todo.id, {
        status: "REMINDER_DUE",
        updatedAt: new Date(),
      });
    }
  }

  // NEW APIs: There are some endpoint where the API is not available by default. to enforce single responsibility by TodoService,
  // We will create new API
  async createUser(...args: Parameters<IUserRepository['create']>): ReturnType<IUserRepository['create']> {
    return await this.userRepo.create(...args);
  }

  async findUserById(...args: Parameters<IUserRepository['findById']>): ReturnType<IUserRepository['findById']> {
    return await this.userRepo.findById(...args);
  }

  async findUserAll(...args: Parameters<IUserRepository['findAll']>): ReturnType<IUserRepository['findAll']> {
    return await this.userRepo.findAll(...args);
  }

  async findToDoById(...args: Parameters<ITodoRepository['findById']>): ReturnType<ITodoRepository['findById']> {
    return await this.todoRepo.findById(...args);
  }

  async updateTodo(...args: Parameters<ITodoRepository['update']>): ReturnType<ITodoRepository['update']> {
    return await this.todoRepo.update(...args);
  }

  async deleteTodo(id: Todo['id']) {
    return await this.todoRepo.update(id, {deleted: true})
  }

  // New Method: share
  // we will assume that sharing means creating
  // a copy of that todo to another user. since relation between todo and user is one-on-one
  async share(payload: ShareBody) {
    // find the todo
    const todo = await this.todoRepo.findById(payload.id);
    if (!todo) {
      throw ResponseErrorFactory.new(`Todo with id ${payload.id} was not found`, 404);
    }

    // find the user target
    const user = await this.userRepo.findById(payload.userIdTarget);
    if (!user) {
      throw ResponseErrorFactory.new(`Target user with id ${payload.userIdTarget} was not found`, 404);
    }

    const newTodo = await this.todoRepo.create({...todo, userId: user.id});
    return newTodo;
  }
}
