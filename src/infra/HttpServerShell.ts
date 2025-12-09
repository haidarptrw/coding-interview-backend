import express, { Express,Request, Response } from 'express';
import { Server } from 'node:http';

export interface RouteHandler {
  (req: any, res: any): void | Promise<void>;
}

export interface IHttpServer {
  listen(port: number): Promise<void>;
  registerRoute(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    handler: RouteHandler
  ): void;
  close(): Promise<void>;
}

export class HttpServer implements IHttpServer {
  private server: Server | null = null;
  constructor(private app: Express = express()) { 
    this.app.use(express.json());
  }
  listen(port: number): Promise<void> {
    // throw new Error("Method not implemented.");
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        resolve();
      })
    });
  }
  registerRoute(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, handler: RouteHandler): void {
        this.app[method.toLowerCase() as keyof Express](path, async (req: Request, res: Response) => {
      try {
        await handler(req, res);
      } catch (e: any) {
        console.error("Unhandled route error:", e);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  }
  async close(): Promise<void> {
    if (!this.server) return;

    return new Promise((resolve, reject) => {
      this.server?.close((err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

}