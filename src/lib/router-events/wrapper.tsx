import { usePathname, useSearchParams, } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useLoading } from 'context/LoadingContext';

function HandleOnCompleteChild() {
  const pathname = usePathname();
  const searchParams: any = useSearchParams();
  const { setLoading }: any = useLoading();

  useEffect(() => setLoading(false), [searchParams && pathname]);
  return null;
}

export function HandleOnComplete() {
  return (
    <Suspense>
      <HandleOnCompleteChild />
    </Suspense>
  );
}


