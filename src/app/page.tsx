"use client";

import React, { useEffect, useState } from "react";
import Loader from "@components/core/Loader";
import { redirect, useRouter } from "next/navigation";
import User from "@lib/User";
import Role from "@lib/Role";
import { useLoading } from "context/LoadingContext";

export default function page() {
  const router = useRouter();
  const { setLoading }: any = useLoading();

  useEffect(() => {
    setLoading(true);
    if (localStorage.getItem("accessToken")) {
      checkRole();
    } else {
      router.push("/auth/login");
    }
  }, []);

  const checkRole = async () => {
    let res = await User.role();
    let role: string = res?.role?.userCategory?.category_name;
    let path = Role.dashboardPath(role);
    if (!path) {
      console.error("Error - Role doesn't Exist");
      return router.push("/auth/login");
    }
    return router.push(path);
  };

  return (
    <div>
      <Loader />
    </div>
  );
}
