"use client";
import InputFormController from "@components/input-form-controller";
import useRedirectUrl from "@hooks/use-redirect-url";
import { Alert, AlertDescription } from "@ui/alert";
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { StatusCodes } from "http-status-codes";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import useLoginForm, { type LoginFormFieldValues } from "./use-login-form";
import useLoginMutation from "./use-login-mutation";

export function LoginForm() {
  const loginForm = useLoginForm();
  const loginMutation = useLoginMutation();
  const redirect = useRedirectUrl();

  useEffect(() => {
    if (
      loginMutation.isSuccess &&
      loginMutation.data.status === StatusCodes.OK
    ) {
      redirect();
    }
  }, [redirect, loginMutation.isSuccess, loginMutation.data]);

  async function onFormSubmit(data: LoginFormFieldValues) {
    loginMutation.mutate(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your username and password to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loginMutation.isSuccess &&
            loginMutation.data?.status !== StatusCodes.OK && (
              <Alert className="mb-2">
                <InfoIcon />
                <AlertDescription>
                  Username and/or password are incorrect
                </AlertDescription>
              </Alert>
            )}

          <form
            className="space-y-4"
            onSubmit={loginForm.handleSubmit(onFormSubmit)}
          >
            <div className="space-y-2">
              <InputFormController
                control={loginForm.control}
                name="username"
                label="Username"
                inputProps={{
                  id: "username",
                  placeholder: "john.doe",
                }}
              />
            </div>

            <div className="space-y-2">
              <InputFormController
                control={loginForm.control}
                name="password"
                label="Password"
                inputProps={{
                  id: "password",
                  placeholder: "••••••••",
                  type: "password",
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              Login
            </Button>
          </form>

          <p className="mt-2 text-center leading-7">
            New on our platform?{" "}
            <Link prefetch={false} href="/register" className="font-bold">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
