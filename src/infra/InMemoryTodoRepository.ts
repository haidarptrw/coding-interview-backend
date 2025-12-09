import { Todo } from "../domain/Todo";
import { ITodoRepository } from "../core/ITodoRepository";
import z from "zod";

const validTodoSchema = z.object({
  title: z.string().min(1).trim().nonempty("Title cannot be empty")
});

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async create(
    todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
    // Change from random to use ISO String to make it unique (with assumption that user cannot bulk creation)
    const now = new Date();
    const id = `todo-${todoData.userId}-${now.toISOString()}`; // to flag what todo belongs to which user

    // validate title
    if (todoData.title.length === 0) {
      throw new Error("Title should not be empty");
    }

    const result = validTodoSchema.partial().safeParse(todoData);
    if (!result.success) throw new Error(`Invalid Todo data format: ${result.error.message}`);

    const todo: Todo = {
      ...todoData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.todos.push(todo);
    return todo;
  }

  async update(
    id: string,
    updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">>
  ): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      // Remove initiating new todo when the todo is not found. it should be the create method responsibility
      return null;
    }

    const result = validTodoSchema.partial().safeParse(updates);
    if (!result.success) throw new Error(`Invalid Todo data format: ${result.error.message}`);    

    const now = new Date();

    // omit updateAt for safety
    const validUpdates: Omit<typeof updates, 'updateAt'> = {...updates};

    this.todos[index] = {
      ...this.todos[index],
      ...validUpdates,
      updatedAt: now,
    };

    return this.todos[index];
  }

  // fix: add one more = sign. JavaScript equals statement is weird because it works properly using triple = (===)
  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id && !t.deleted);
    return todo || null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.todos.filter((t) => t.userId === userId && !t.deleted);
  }

  // FIX: should return only the todos with 'PENDING' status
  async findDueReminders(currentTime: Date): Promise<Todo[]> {
    return this.todos.filter((t) => t.remindAt && t.status === 'PENDING' && t.remindAt <= currentTime && !t.deleted);
  }
}
