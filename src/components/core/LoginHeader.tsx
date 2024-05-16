import React from "react";
import { FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
const LoginHeader = () => {
  return (
    <>
      <header>
        <div className="flex flex-row justify-between mx-8">
          <div>
            <Image
              src={"/images/cottonConnect_white.png"}
              alt="cottonconnectLogo"
              width={226}
              height={66}
              // className={styles.logo_img}
            />
          </div>
          <div>
            <Image
              src="/images/Tracebale.png"
              width={140}
              height={27}
              alt="Tracebale"
              className="mt-2 w-auto h-auto"
            />
          </div>
        </div>
      </header>
    </>
  );
};

export default LoginHeader;
