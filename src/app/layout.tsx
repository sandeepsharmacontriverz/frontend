"use client";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';

import { HandleOnComplete } from "@lib/router-events";
import Loader from "@components/core/Loader";
import Header from "@components/core/Header";
import Footer from "@components/core/Footer";
import SideNavigation from "@components/core/SideNavigation";
import ToastProvider from "@lib/ToastProvider";
import useRouter from "@hooks/useRouter";
import { useRouter as useNextRouter } from "next/navigation";

import { LanguageProvider } from "context/languageContext";
import { LoadingProvider } from "context/LoadingContext";
import "../../public/css/external.css"
import "./globals.css";
import { ContextProvider } from "context/ContextProvider";
import Script from "next/script";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loading = useRouter();
  const router = useNextRouter();
  const path = usePathname();
  const searchParams: any = useSearchParams();
  const route = path.split("/");
  const locale = "en";

  const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
  const loadScript = (src: any) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }



  // async function loadScriptsSequentially() {
  //   try {
  //     // Ensure GSAP is fully loaded before proceeding
  //     await loadScript('/js/jquery.js');
  //     await loadScript('/js/popper.min.js');
  //     await loadScript('/js/bootstrap.min.js');
  //     await loadScript('/js/mCustomScrollbar.min.js');
  //     await loadScript('/js/slick.min.js');
  //     await loadScript('/js/select2.min.js');
  //     await loadScript('/js/custom.js');
  //     const gsapScript = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js');
  //     await loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js');
  //     if (gsapScript) {
  //       await loadScript('/js/MotionPathPlugin.min.js');
  //       await loadScript('/js/Animate.js');
  //     } else {
  //       throw new Error('Failed to load GSAP.');
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }


  const isDashboard = () => {
    return !route.includes("auth") ? !route.includes("maintenance") ? true : false : false;
  }

  const isQrDetailsPage = () => {
    return path === "/brand/qr-details/garment-sales" ? true : false
  }

  useEffect(() => {
    if (!isQrDetailsPage() && !isDashboard() && !localStorage.getItem("accessToken") && !route.includes("auth")) {
      router.push("/auth/login");
    }
    if (path.includes("reports") || path.includes("escalation-matrix") || path.includes("oldsales")) {
      redirect("/maintenance");
    }
  }, []);

  useEffect(() => {
    // loadScriptsSequentially();
  }, [router, searchParams, path]);

  if (loading) {
    return (
      <>
        <html lang="en">
          <body>
            <div className="w-screen h-screen flex justify-center items-center">
              <Loader />
            </div>
          </body>
        </html>
      </>
    );
  } else {
    return (
      <html lang={locale}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet" />
          <title key="title">tracebale</title>
            <meta key="keywords" name="keywords" content={`tracebale, tracebale.com,`} />
            <meta key="description" name="description" content="sffdfsf" />
            <meta key="og-title" property="og:title" content="tracebale" />
            <meta key="og-description" property="og:description" content="I'm superman" />
            <meta key="og-url" property="og:url" content={`https://newtraceable.com/`} />
            <meta key="twitter-title" name="twitter:title" content="tracebale" />
            <meta key="twitter-description" name="twitter:description" content="I'm superman" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@lighter_app" />
            <meta name="twitter:image" content={`/images/logo.png`} />
            <meta name="twitter:creator" content="@lighter_app" />
          {/* <link rel="stylesheet" href="/css/external.css" /> */}
          <Script src="/js/jquery.js" strategy="afterInteractive" />
        <Script
          src="/js/popper.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/bootstrap.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/mCustomScrollbar.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/slick.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/select2.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/custom.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/MotionPathPlugin.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/js/Animate.js"
          strategy="beforeInteractive"
        />
        </head>
        <body>
          <LoadingProvider>
            <LanguageProvider>
              <ContextProvider>
                <main>
                  {
                    isQrDetailsPage() ? (
                      <div>
                        {children}
                      </div>
                    ) :
                      isDashboard() ? (
                        <div className="wrapper">
                          <section className={`layout-wrapper ${isMenuCollapsed ? "layout-wrapper-collapsed" : ""}`}>
                            <SideNavigation isMenuCollapsed={isMenuCollapsed} setIsMenuCollapsed={setIsMenuCollapsed} />
                            <section className="layout-wrapper-content">
                              <Header />
                              <section className="right-content">
                                <div className="right-content-inner">
                                  {children}
                                </div>
                              </section>
                              <Footer />
                            </section>
                          </section>
                        </div>
                      ) : (
                        <div>
                          {children}
                        </div>
                      )
                  }
                  <HandleOnComplete />
                  <ToastProvider />
                </main>
              </ContextProvider>
            </LanguageProvider >
          </LoadingProvider>
        </body>
      </html>
    );
  }
}
