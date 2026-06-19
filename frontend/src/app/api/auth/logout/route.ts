import { destroySession } from "@lib/login-utils";
import { redirect } from "next/navigation";

export async function GET() {
  await destroySession();

  redirect("/login");
}
