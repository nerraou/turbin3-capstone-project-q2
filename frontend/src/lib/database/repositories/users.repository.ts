import { eq } from "drizzle-orm";
import { db } from "../connection";
import { NewUser, users, type User } from "../schema/users";
import { PgTransaction } from "../types";

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

export async function getUserById(id: bigint): Promise<User | undefined> {
  const usersResult = await db.select().from(users).where(eq(users.id, id));

  if (usersResult.length === 0) {
    return undefined;
  }

  return usersResult[0] as User;
}

export async function createUser(
  user: Omit<NewUser, "id" | "createdAt" | "updatedAt">,
  tx?: PgTransaction,
) {
  let createResult: User[];

  if (tx) {
    createResult = await tx.insert(users).values(user).returning();
  } else {
    createResult = await db.insert(users).values(user).returning();
  }

  return createResult[0];
}
