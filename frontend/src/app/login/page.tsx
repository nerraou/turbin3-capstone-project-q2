import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function Login() {
  return (
    <Suspense fallback="...">
      <LoginForm />
    </Suspense>
  );
}
