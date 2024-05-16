import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
    <p>© 2023 RiceTraceability</p>
  </footer>
    // <div className="flex bg-gray-100 p-4">
    //   <div>
    //     <h6 className="font-semibold">
    //       Copyright &#169;
    //       <Link
    //         href="https://www.cottonconnect.org/"
    //         className="hover:text-blue-500"
    //         target="_blank"
    //       >
    //         CottonConnect
    //       </Link>
    //     </h6>
    //   </div>
    //   <div className="flex items-center ml-auto">
    //     <h3 className="font-semibold">
    //       Developed by&nbsp;
    //       <Link href="http://vaiha.in/" className="hover:text-blue-500" target="_blank">
    //         Vaiha
    //       </Link>
    //     </h3>
    //   </div>
    // </div>
  );
}
