import { InMemoryUserRepository } from "../infra/InMemoryUserRepository";
import { InMemoryTodoRepository } from "../infra/InMemoryTodoRepository";
import { SimpleScheduler } from "../infra/SimpleScheduler";
import { TodoService } from "../core/TodoService";
import { HttpServer } from "../infra/HttpServerShell";
import type { Request, Response } from "express";
import { ResponseBodyFactory } from '../types';

async function bootstrap() {
  // Wire up dependencies
  const userRepo = new InMemoryUserRepository();
  const todoRepo = new InMemoryTodoRepository();
  const scheduler = new SimpleScheduler();
  const todoService = new TodoService(todoRepo, userRepo);

  console.log("Todo Reminder Service - Bootstrap Complete");
  console.log("Repositories and services initialized.");
  console.log("Note: HTTP server implementation left for candidate to add.");

  // Candidate should implement HTTP server here
  // Example: scheduler.scheduleRecurring('reminder-check', 60000, () => todoService.processReminders());
  scheduler.scheduleRecurring('reminder-check', 60000, ()=> todoService.processReminders());
  const server: HttpServer = new HttpServer();

  // TODO: Implement HTTP server with the following routes:
  // POST /users - Create a new user
  // GET /users/:id - Get user by ID
  // POST /todos - Create a new todo
  // GET /todos/:id - Get todo by ID
  // PUT /todos/:id - Update a todo
  // DELETE /todos/:id - Delete a todo
  // GET /users/:userId/todos - Get all todos for a user
  // POST /todos/:id/share - Share a todo with another user
  server.registerRoute('POST', '/users', async (req:Request, res:Response) => {
    try {
      const user = await todoService.createUser(req.body);

      res.status(201).json(ResponseBodyFactory.new("Successfully created new user",user));
    } catch (e) {
      res.status(400).json({error: e});
    }
  });

  server.registerRoute('GET', '/users/:id', async (req:Request, res:Response) => {
    try {
      const user = await todoService.findUserById(req.params?.id);
      res.status(200).json(ResponseBodyFactory.new("Successfully retrieved the user", user));
    } catch (e) {
      res.status(500).json({error: e});
    }
  })

  server.registerRoute('POST', '/todos', async (req:Request, res:Response) => {
    try {
      const newTodo = await todoService.createTodo(req.body);
      res.status(201).json(ResponseBodyFactory.new("Successfully created new to-do", newTodo));
    } catch (e) {
      res.status(400).json({error: e});
    }
  });

  server.registerRoute('GET', '/todos/:id', async (req:Request, res: Response) => {
    try {
      const todo = await todoService.findToDoById(req.params?.id);
      res.status(200).json(ResponseBodyFactory.new(`Successfully retrieve to-do with id ${req.params.id}`,todo));
    } catch (e) {
      res.status(500).json({error: e});
    }
  });

  server.registerRoute('PUT', '/todos/:id', async (req:Request, res:Response) => {
    try {
      const updated = todoService.updateTodo(req.params?.id, req.body);
      res.status(200).json(ResponseBodyFactory.new(`Successfully update to-do with id ${req.params.id}`,updated));
    } catch (e) {
      res.status(400).json({error: e});
    }
  });

  server.registerRoute('DELETE', '/todos/:id', async (req:Request, res:Response) => {
    try {
      await todoService.deleteTodo(req.body.id);
      res.status(200).json({message: `todos with id ${req.body.id} successfully deleted`, data: null});
    } catch (e) {
      res.status(400).json({error: e});
    }
  })

  server.registerRoute('GET', '/todos/:userId/todos', async (req:Request, res:Response) => {
    try {
      const todos = await todoService.getTodosByUser(req.body.user_id);
      res.status(200).json({message: `retrieve todos by ${req.body.user_id}`, data: todos});

    } catch (e) {
      res.status(400).json({error: e});
    }
  });

  server.registerRoute('POST', '/todos/:id/share', async (req:Request, res:Response) => {
    try {
      const shared = await todoService.share(req as any);
      res.status(201).json({message: `The todo has been successfully shared`, data: shared});
    } catch (e) {
      res.status(400).json({error: e});
    }
  });

  server.listen(3000);
  // stop scheduler
  const shutdown = async () => {
    await server.close();
    scheduler.stop('reminder-check');
    console.log("Application shutting down...");
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(console.error);
