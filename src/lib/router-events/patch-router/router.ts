// import { useRouter as useRouterOriginal } from "next/navigation";

// import { useLoading } from 'context/LoadingContext';
// import { shouldTriggerStartEvent } from "./should-trigger-start-event";

// export function useRouter(): ReturnType<typeof useRouterOriginal> {
//   const router = useRouterOriginal();
//   const { setLoading }: any = useLoading();

//   return {
//     ...router,
//     push: (href, options) => {
//       if (shouldTriggerStartEvent(href)) setLoading(true);
//       router.push(href, options);
//     },
//     replace: (href, options) => {
//       if (shouldTriggerStartEvent(href)) setLoading(true);
//       router.replace(href, options);
//     },
//   };
// }

import { useMemo } from 'react';
import { useRouter as useRouterOriginal } from "next/navigation";
import { useLoading } from 'context/LoadingContext';
import { shouldTriggerStartEvent } from "./should-trigger-start-event";

export function useRouter(): ReturnType<typeof useRouterOriginal> {
  const router = useRouterOriginal();
  const { setLoading }: any = useLoading();

  const memoizedShouldTriggerStartEvent = useMemo(() => shouldTriggerStartEvent, []);

  const enhancedRouter = {
    ...router,
    push: async (href: string, options: any) => {
      if (memoizedShouldTriggerStartEvent(href)) setLoading(true);
      await router.push(href, options);
    },
    replace: async (href: string, options: any) => {
      if (memoizedShouldTriggerStartEvent(href)) setLoading(true);
      await router.replace(href, options);
    },
  };

  return enhancedRouter;
}
