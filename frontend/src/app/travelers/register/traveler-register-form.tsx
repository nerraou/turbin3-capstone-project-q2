"use client";
import InputFormController from "@components/input-form-controller";
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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useTravelerRegisterForm, {
  type TravelerRegisterFormFieldValues,
} from "./use-traveler-register-form";
import useTravelerRegisterMutation from "./use-traveler-register-mutation";

function getMessageByStatus(status: number) {
  if (status === StatusCodes.CREATED) {
    return "Account created";
  }

  if (status === StatusCodes.CONFLICT) {
    return "Username already exists";
  }

  return "Something went wrong! try again!";
}

export function RegisterForm() {
  const registerForm = useTravelerRegisterForm();
  const registerMutation = useTravelerRegisterMutation();
  const router = useRouter();

  useEffect(() => {
    if (
      registerMutation.isSuccess &&
      registerMutation.data.status === StatusCodes.CREATED
    ) {
      router.push("/login");
    }
  }, [router, registerMutation.isSuccess, registerMutation.data]);

  async function onFormSubmit(data: TravelerRegisterFormFieldValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create New Traveler Account</CardTitle>
          <CardDescription>
            Create your new account to start using the app!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {registerMutation.isSuccess && (
            <Alert className="mb-2">
              <InfoIcon />
              <AlertDescription>
                {getMessageByStatus(registerMutation.data.status)}
              </AlertDescription>
            </Alert>
          )}

          <form
            className="space-y-4"
            onSubmit={registerForm.handleSubmit(onFormSubmit)}
          >
            <div className="space-y-2">
              <InputFormController
                control={registerForm.control}
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
                control={registerForm.control}
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
              disabled={registerMutation.isPending}
            >
              Register
            </Button>
          </form>

          <p className="mt-2 text-center leading-7">
            Already have an account?{" "}
            <Link prefetch={false} href="/login" className="font-bold">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
