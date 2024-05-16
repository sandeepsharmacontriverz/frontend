"use client";
import Form from "@components/auth-form/Form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import API from "@lib/Api";
import Link from 'next/link'

import { useSearchParams } from 'next/navigation'
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useLoading } from "context/LoadingContext";

const ResetPassword = () => {
  const router = useRouter();
  const { setLoading }: any = useLoading();
  const searchParams = useSearchParams()

  const search = searchParams.get('token')

  const formFields = [
    { name: "password", type: "password", placeholder: "New Password", title: "Create a Password" },
    { name: "confirmPassword", type: "password", placeholder: "Confirm Password", title: "Confirm Password" },
  ];
  const [errorMessage, setErrorMessage] = useState<{ [key: string]: string | null }>({});

  const handleFormSubmit = async (formData: { [key: string]: any }) => {
    // Perform form submission logic or API request here
    const payload = {
      token: search,
      password: formData.password
    }
    try {
      if (formData.password && formData.confirmPassword) {


        if (formData.password === formData.confirmPassword) {
          const result = await API.post(
            ["auth", "reset-password"],
            payload
          );
          if (result.success) {
            setLoading(true);
            router.push("/auth/login");
            toasterSuccess("Password reset successfully", 3000, "id");
          } else {
            if (result.error.code === "ERR_AUTH_WRONG_TOKEN") {
              toasterError("Oops! Looks like this link has expired. Please request a fresh one.", 3000, "id")
            }
          }
        }
        else {
          let field = "confirmPassword";
          const res = "Password and confirm password are not same"
          setErrorMessage({
            ...errorMessage,
            [field]: res,
          });
        }
      }
      else {
        toasterError("Fields cannot be empty", 3000, "id")
      }
    } catch (error: any) {

    }
  };

  return (
    <div >
      <Form
        titleBold="Reset"
        titleNormal="password"
        description="Please enter a new password and log in again."
        fields={formFields}
        buttonText="Submit"
        onSubmit={handleFormSubmit}
        error={errorMessage}
      />

    </div>
  );
};

export default ResetPassword;