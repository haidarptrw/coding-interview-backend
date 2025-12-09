import { User } from "../domain/User";
import { IUserRepository } from "../core/IUserRepository";
import z from "zod";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private idCounter = 0;

  // FIX NOTE:
  // Because user has email properties, we need to ensure that the format is valid.
  // we can do this by creating an helper method to validate the email. if the email is invalid,
  // then we throw an exception. throwing an exception might not be good idea in javascript because
  // we are not forced by the typescript compiler/linter to handle error case
  //
  // NOTE: This maybe out of topic. but we can do this without throwing an exception by wrapping the user
  // with Result monad-like type (Like Result type in Rust), but I think because it is out of scope of this test,
  // I won't implement it
  async create(userData: Omit<User, "id" | "createdAt">): Promise<User> {

    // user validator schema
    const validUserSchema = z.object({
      name: z.string().min(1).trim().nonempty("Name cannot be empty or only whitespaces") ,
      email: z.email("Invalid email format")
    })
    // Check validity
    const result = validUserSchema.partial().safeParse(userData);

    if (!result.success) {
      throw new Error(`Invalid user data input: ${result.error}`);
    }
    
    this.idCounter++;
    const user: User = {
      ...userData,
      id: `user-${this.idCounter}`,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id == id);
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }
}
