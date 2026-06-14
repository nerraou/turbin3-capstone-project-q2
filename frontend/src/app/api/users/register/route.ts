import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import registerApiDataSchema from "./register-api-data-schema";
import registerHandler from "./register-handler";

export async function POST(req: NextRequest) {
  const { success, data, error } = registerApiDataSchema.safeParse(
    await req.json(),
  );

  if (success) {
    return registerHandler(data);
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
