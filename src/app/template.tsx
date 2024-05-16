'use client';

import Loader from '@components/core/Loader';
import { useLoading } from 'context/LoadingContext';
import { usePathname } from "next/navigation";


export default function Template({ children }: { children: React.ReactNode }) {
  const { loading }: any = useLoading();
  // const path = usePathname();

  // const isQrDetailsPage = () => {
  //   return path === "/brand/qr-details/garment-sales" ? true : false
  // }


  // if (isQrDetailsPage()) {
  //   <div>
  //     {children}
  //   </div>
  // } else 
  if (loading) {
    return <Loader />
  } else {
    return <div>{children}</div>
  }
}