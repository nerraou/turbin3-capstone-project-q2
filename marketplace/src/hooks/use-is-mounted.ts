import { useEffect, useState } from "react";

/**
 * needed temporarly until custom cart handling is used.
 * @deprecated Do not use enywhere, except in checkout page
 *
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}
