import React from "react";
import { FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Link from "@components/core/nav-link";

const LoginFooter = () => {
  return (
    <>
      <footer>
        <div className="flex flex-row justify-between mx-10 my-5">
          <div className="w-60">
            <span>Contact us</span>
            <hr className="my-3" />
            <div>
              <span className="text-xs">
                If you want to know more about us or support, please write to
                noreply@cottonconnect.org
              </span>
            </div>
          </div>

          <div className="w-60">
            <span>Email Newsletter</span>
            <hr className="my-3" />
            <div>
              <img src="/images/email_signup.png" />
            </div>
          </div>

          <div className="w-60">
            <span>Follow us</span>
            <hr className="my-3" />
            <div className="flex flex-row space-x-4">
              <Link href="#">
                <i>
                  {" "}
                  <FaTwitter color="00ACEE" size={18} />{" "}
                </i>{" "}
              </Link>

              <Link href="#">
                <i>
                  {" "}
                  <FaLinkedinIn color=" #0A66C2" size={18} />{" "}
                </i>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LoginFooter;
