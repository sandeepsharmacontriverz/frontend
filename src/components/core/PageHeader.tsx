"use client";
import React from "react";
import User from "@lib/sidebardata";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "@components/core/nav-link";
import dynamic from 'next/dynamic'
// import { useLocale } from 'next-intl';
import useTranslations from '@hooks/useTranslation';

interface PageHeaderProps {
  currentPageName?: string;
  currentPageRoute?: string[];
  isPremiumValidation?: boolean
}

interface SidebarItem {
  item: string;
  path?: string;
  childrens?: SidebarItem[];
}

export default function PageHeader({
  currentPageName,
  currentPageRoute = [],
  isPremiumValidation

}: PageHeaderProps) {
  const path = usePathname();
  const [router, setRouter] = useState(path);

  const { fetchTranslations, translations, loading, setLoading } = useTranslations();

  useEffect(() => {
    setRouter(path);
  }, [path]);

  const getPageNames = (items: any): string[] => {
    return items.flatMap((item: any) => {
      if (item.path === router) {
        return [item.item];
      } else if (item.childrens && item.childrens.length > 0) {
        return getPageNames(item.childrens);
      } else {
        return [];
      }
    });
  };
  const pageNames = getPageNames(User.list);

  const getCurrentPageData = (items: SidebarItem[], path: string): string[] => {
    for (const item of items) {
      if (item.path === path) {
        return [item.item];
      }
      if (item.childrens && item.childrens.length > 0) {
        const result = getCurrentPageData(item.childrens, path);
        if (result.length > 0) {
          return [item.item, ...result];
        }
      }
    }
    return [];
  };

  useEffect(() => {
    const locale = localStorage.getItem("locale")
    if (locale) {
      setLocale(locale)
    }
    else {
      setLocale('en')
    }
  }, [])
  const currentPageData = getCurrentPageData(User.list, router);
  const [locale, setLocale] = useState('')

  const handleChange = (e: any) => {
    const newLocale = e.target.value;
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale);
    fetchTranslations(newLocale);
    // window.location.reload();
  }


  return (
    <div className="flex justify-between border-b mb-4">

      <div>
        {pageNames.length > 0 ? (
          pageNames.map((name, index) => (
            <h1 key={index} className="mt-10 mb-5">
              {name === "Premium Validation" ? <p>Premium Validation-Farmer/
                <Link href="/services/premium-validation/premium-validation-project" className="text-blue-600">Premium Validation-Project/Ginner</Link></p>
                : name}
            </h1>
          ))
        ) : (
          <h1 className="mt-10 ml-4 mb-5">{isPremiumValidation ? (<p><Link href="/services/premium-validation" className="text-blue-600">Premium Validation-Farmer</Link> /
            Premium Validation-Project/Ginner</p>) : currentPageName}</h1>
        )}
      </div>

      <div className="my-6 px-5">
        {/* <div className="flex w-100% justify-end">
          <select className="border mb-3" onChange={handleChange} value={locale}>
            <option value="en">English</option>
            <option value="cn">Chinese</option>

          </select>
     
        </div> */}

        <div className="flex ">

          {/* <Link href={"/dashboard"} className="text-sm">
            Home
          </Link> */}

          {/* {currentPageData.length > 0
            ? currentPageData.map((name, index) => (
              <Link href={router} key={index} className="text-sm">
                &gt;{name}
              </Link>
            ))
            : currentPageRoute.map((name, index) => (
              <Link href={router} key={index} className="text-sm">
                &gt;{name}
              </Link>
            ))} */}

        </div>

      </div>

    </div>
  );
}
