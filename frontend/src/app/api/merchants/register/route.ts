import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import registerMerchantApiDataSchema from "./register-merchant-api-data-schema";
import registerMerchantHandler from "./register-merchant-handler";

export async function POST(req: NextRequest) {
  const { success, data, error } = registerMerchantApiDataSchema.safeParse(
    await req.json(),
  );

  if (success) {
    return registerMerchantHandler(data);
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
