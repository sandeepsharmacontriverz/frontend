'use client'
import React from 'react'
import Link from "next/link";
 
export default function page() {
    return (
        <div className="login-box">
          <div className="login-wrapper">
            <div className="login-left">
              <div className="logo-wrap">
                <img src="/images/logo-with-text.svg" className="d-none d-lg-block" alt="..." />
                <img src="/images/logo-with-text-white.svg" className="d-lg-none" alt="..." />
                <h3 className="heading18 d-lg-none">The TraceRice Platform /n From Farm to Spoon</h3>
              </div>
              <div className="mx-login-left">
                <div className="login-form-box">
                  <div className="login-form-wrapper">
                    <div className="top-headings">
                      <h3 className="heading24 main-heading"><span className="heading36">Error 404...</span></h3>
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
                  <h2 className="heading32">The TraceRice Platform /n From Farm to Spoon</h2>
                  <div className="radial-bg">
                    <img src="/images/maintenance.svg" className="img-bg" alt="..." />
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
        </div>
      );
}
