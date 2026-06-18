import { useEffect } from "react";
import useMintCreditsMutation from "./use-mint-credits-mutation";

interface MintCreditsProps {
  wallet: string;
  amount: number;
}

export default function MintCredits(props: MintCreditsProps) {
  const { amount, wallet } = props;

  const { mutate } = useMintCreditsMutation();

  useEffect(() => {
    mutate({
      amount: BigInt(amount),
      travelerWallet: wallet,
    });
  }, [amount, wallet, mutate]);
}
