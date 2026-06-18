import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { mintCreditsHandler } from "./mint-credits-handler";
import mintCreditsSchema from "./mint-credits-schema";
import { checkUserPermission } from "@lib/login-utils";

export async function POST(req: NextRequest) {
  const { status } = await checkUserPermission(["admin"]);

  if (status !== "ok") {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: StatusCodes.UNAUTHORIZED,
      },
    );
  }

  const { success, error, data } = mintCreditsSchema.safeParse(
    await req.json(),
  );

  try {
    if (success) {
      return mintCreditsHandler(data);
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
  } catch (error) {
    console.error("Mint credits error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
