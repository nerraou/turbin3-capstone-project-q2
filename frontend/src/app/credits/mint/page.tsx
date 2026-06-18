import { mintCreditsHandler } from "@app/api/credits/mint/mint-credits-handler";
import mintCreditsSchema from "@app/api/credits/mint/mint-credits-schema";
import { checkUserPermission, redirectToLogin } from "@lib/login-utils";
import { redirect } from "next/navigation";

interface MintTravelerCreditsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MintCreditsPage(
  props: MintTravelerCreditsPageProps,
) {
  const { status } = await checkUserPermission(["traveler"]);

  if (status !== "ok") {
    redirectToLogin();
  }

  const params = await props.searchParams;

  const { success, data } = mintCreditsSchema.safeParse(params);

  if (success) {
    await mintCreditsHandler(data);
  }

  redirect("/travelers/dashboard");
}
