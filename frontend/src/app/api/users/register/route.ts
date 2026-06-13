import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import loginApiDataSchema from "./register-api-data-schema";
import loginHandler from "./register-handler";

export async function POST(req: NextRequest) {
  const { success, data, error } = loginApiDataSchema.safeParse(
    await req.json(),
  );

  if (success) {
    return loginHandler(data);
  } else {
    return NextResponse.json(
      {
        error: error.issues,
      },
      {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
      },
    );
  }
}
