"use client";

import { Link } from "@lib/router-events";
import React from "react";

export default function NavLink({ href,className,onClick, children }: React.PropsWithChildren<{ href: string, className?: string,onClick?:any,prefetch?:any }>) {

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
