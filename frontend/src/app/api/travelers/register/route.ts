import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import travelerRegisterApiDataSchema from "./register-api-data-schema";
import registerTravelerHandler from "./register-traveler-handler";

export async function POST(req: NextRequest) {
  const { success, data, error } = travelerRegisterApiDataSchema.safeParse(
    await req.json(),
  );

  if (success) {
    return registerTravelerHandler(data);
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
