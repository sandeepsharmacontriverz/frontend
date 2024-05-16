import NextLink from "next/link";
import { forwardRef } from "react";
import { useRouter } from "@lib/router-events"; // Import useRouter hook
import { useLoading } from 'context/LoadingContext';
import { shouldTriggerStartEvent } from "./should-trigger-start-event";

export const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(function Link(
  { href, onClick, className, ...rest },
  ref,
) {
  const { setLoading }: any = useLoading();
  const router = useRouter(); // Use useRouter hook

  const useLink = href && href.startsWith("/");
  if (!useLink) return <a href={href} onClick={onClick} {...rest} />;

  return (
    <NextLink
      href={href}
      className={className}
      onClick={(event) => {
        if (shouldTriggerStartEvent(href, event)) setLoading(true);
        if (onClick) onClick(event);
      }}
      {...rest}
      ref={ref}
      onMouseEnter={() => {
        router.prefetch(href);
      }}
      onFocus={() => {
        router.prefetch(href);
      }}
    >
      {rest.children}
    </NextLink>
  );
});

