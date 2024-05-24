import { Metadata } from "next";
import Page from "./page";  

export const metadata: Metadata = {
  title: 'Rice Traceability | Dashboard',
  description: "Your Description",
  // Open Graph tags
  openGraph: {
    title: 'Rice Traceability | Dashboard',
    description: "Your Description",
    url: 'https://frontend-eta-ebon-62.vercel.app/dashboard',
    images: [
      {
        url: 'https://frontend-eta-ebon-62.vercel.app/images/cottonconnect.png',
        alt: 'Rice Traceability'
      }
    ]
  },
  // Twitter Card tags
  twitter: {
    title: 'Rice Traceability | Dashboard',
    description: "Your Description",
    images: [
      {
        url: 'https://frontend-eta-ebon-62.vercel.app/images/cottonconnect.png',
        alt: 'Rice Traceability'
      }
    ]
  }
};

export default Page;
