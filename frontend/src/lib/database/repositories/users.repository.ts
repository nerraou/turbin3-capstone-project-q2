import { eq } from "drizzle-orm";
import { db } from "../connection";
import { users, type User } from "../schema/users";

export async function getUserByUsername(
  username: string,
): Promise<User | undefined> {
  const usersResult = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (usersResult.length === 0) {
    return undefined;
  }

  return usersResult[0] as User;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const usersResult = await db.select().from(users).where(eq(users.id, id));

  if (usersResult.length === 0) {
    return undefined;
  }

  return usersResult[0] as User;
}
