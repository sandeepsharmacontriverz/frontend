"use client";
import type { NextPage } from "next";
import Form from "@components/auth-form/Form";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import { useState } from "react";
import Link from "next/link";

const ForgotPassword: NextPage = () => {
  const formFields = [
    { name: "email", type: "email", placeholder: "Enter Registered Email-ID", title: "Enter Registered Email-ID" },
  ];
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<{ [key: string]: string | null }>({});
  const [isSent, isSetSent] = useState(false)
  const [submitLoader, setSubmitLoader] = useState(false);
  const handleFormSubmit = async (formData: { [key: string]: any }) => {
    // Perform form submission logic or API request here
    setSubmitLoader(true);
    try {
      const result = await API.post(
        ["auth", "forgot-password"],
        formData
      );

      if (result.success) {
        isSetSent(true)
        setSubmitLoader(false);
      }
      else {
        let field = "email";
        const res = result.error.code === "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD" ? "Wrong Email" : "An error occurred";
        setErrorMessage({
          ...errorMessage,
          [field]: res,
        });
        setSubmitLoader(false);
      }
    } catch (error) {
      setSubmitLoader(false);
      // errorHandler(error);
    }
  };

  return (
    <div >
      {isSent === false ?
        <Form
          titleBold="Forgot"
          titleNormal="password?"
          description="Please enter the email address you used to create your account, and we’ll send you a link to reset your password."
          fields={formFields}
          buttonText="SEND LINK"
          linkText="Back"
          linkUrl="/auth/login"
          onSubmit={handleFormSubmit}
          submitLoader={submitLoader}
          error={errorMessage}
        />
        :
        <section className="login-box">
          <div className="login-wrapper">
            <div className="login-left">
              <div className="logo-wrap">
                <img src="/images/logo-with-text.svg" className="d-none d-lg-block" alt="..." />
                <img src="/images/logo-with-text-white.svg" className="d-lg-none" alt="..." />
                <h3 className="heading18 d-lg-none">The Traceability Platform Revolutionizing Paddy Supply Chains</h3>
              </div>
              <div className="mx-login-left">
                <div className="login-form-box">
                  <div className="login-form-wrapper">
                    <div className="top-headings pb-0">
                      <h3 className="heading24 main-heading"><span className="heading36">Forgot</span> password?</h3>
                      <h4 className="heading32">Reset Password</h4>
                      <p className="heading14 mt-12">Thank you, an email has been sent to you.</p>
                    </div>

                    <div className="back-link">
                      <Link className="left-arrow-link" href="login"><span className="icon-double-arrow-left icon"></span>Back</Link>
                    </div>
                  </div>
                </div>
                <ul className="social-links">
                  <li><Link href=""><span className="icon-facebook"></span></Link></li>
                  <li><Link href=""><span className="icon-twitter"></span></Link></li>
                  <li><Link href=""><span className="icon-instagram"></span></Link></li>
                  <li><Link href=""><span className="icon-linkedin"></span></Link></li>
                  <li><Link href=""><span className="icon-youtube"></span></Link></li>
                </ul>
              </div>
            </div>
            <div className="login-right">
              <div className="login-right-wrap">
                <div className="login-right-top">
                  <h2 className="heading32">The Traceability Platform Revolutionizing Paddy Supply Chains</h2>
                  <div className="radial-bg">
                    <img src="/images/login-bg.svg" className="img-bg" alt="..." />
                  </div>
                </div>
                <ul className="social-icons">
                  <li><img src="/images/Google.svg" alt="..." /></li>
                  <li><img src="/images/facebook.svg" alt="..." /></li>
                  <li><img src="/images/YouTube.svg" alt="..." /></li>
                  <li><img src="/images/Pinterest.svg" alt="..." /></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      }
    </div>
  );
};

export default ForgotPassword;
