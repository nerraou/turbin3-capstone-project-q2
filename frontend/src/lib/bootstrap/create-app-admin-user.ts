import { createUser, getUserByUsername } from "@lib/database/repositories";
import { hash } from "@lib/hash";

export async function createAppAdminUser() {
  const username = process.env.APP_ADMIN_USERNAME;
  const password = process.env.APP_ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn("APP_ADMIN_USERNAME or APP_ADMIN_PASSWORD not configured");

    return;
  }

  const existingUser = await getUserByUsername(username);

  if (existingUser) {
    return;
  }

  const passwordHash = await hash(password);

  await createUser({
    username,
    password: passwordHash,
    role: "admin",
  });

  console.log(`Admin user created: ${username}`);
}
