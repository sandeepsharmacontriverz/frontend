"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { MdDownload } from "react-icons/md";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
export default function page() {
  const [roleLoading] = useRole();
  useTitle("View Organic Integrity");
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>([]);
  const [documentURL, setDocumentURL] = useState<string>("");
  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };
  const handleBack = () => {
    router.back();
  };
  const handleView = (url: string) => {
    window.open(url, "_blank");
  };
  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await API.get(
        `organic-integrity/get-organic-integrity?id=${id}`
      );
      if (response.success) {
        setData(response.data);
        const documentURL = response.data.documents;
        setDocumentURL(documentURL);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Services</li>
                <li>
                  <Link href="/services/organic-integrity">
                    Organic Integrity
                  </Link>
                </li>
                <li>View Organic Integrity</li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="mb-5 mt-5" />
        <div className=" flex justify-end mt-4 px-2 space-x-3 customButtonGroup">
          <button className="btn-purple mr-2">
            <Link
              // legacyBehavior
              href={`/services/organic-integrity/edit-organic-integrity?id=${id}`}
            // passHref
            >
              <p className="text-white-600" rel="noopener noreferrer">
                {translations?.menuEntitlement?.edit}
              </p>
            </Link>
          </button>
          <button className="btn-outline-purple" onClick={handleBack}>
            {translations?.common?.back}
          </button>
        </div>

        <div className="flex ">
          <div className="w-1/2 h-screen">
            <h4 className="font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3">
              Organic integrity details
            </h4>
            {data && (
              <div className="ml-8 mt-6 space-y-2 font-bold text-sm flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <span className="font-semibold w-20">
                    {translations?.transactions?.date}:
                  </span>
                  <p className="font-bold">{data.date?.substring(0, 10)}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold w-20">
                    {translations?.common?.brand}:
                  </span>
                  <p className="font-bold">{data.brand?.brand_name}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold w-20">
                    {translations?.farmGroup}:
                  </span>
                  <p className="font-bold">{data.farmGroup?.name}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold w-20">
                    {translations?.icsName}:
                  </span>
                  <p className="font-bold">{data.ics?.ics_name}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold w-20">Test Stage:</span>
                  <p className="font-bold">{data.test_stage}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold">Seed Lot No:</span>
                  <p className="font-bold">{data.seed_lot}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold w-20">Seal No:</span>
                  <p className="font-bold"> {data.seal_no}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold">Sample Code No:</span>
                  <p className="font-bold">{data.sample_code}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-semibold ">Integrity Score:</span>
                  <p className="font-bold">
                    {data.integrity_score ? "Positive" : "Negative"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-1/2 h-full">
            <h4 className="font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
              Organic Integrity Documents
            </h4>
            <div className="block ml-12 mt-6">
              <div className="mt-4 ml-8" style={{ overflow: "hidden" }}>
                <img
                  src={
                    documentURL ? documentURL : "/images/image-placeholder.png"
                  }
                  width={200}
                  height={150}
                  alt="Proof Document Image"
                />
              </div>
              <button
                className="block bg-green-700 rounded text-white px-10 py-2 mb-2 ml-12 mt-5 mr-5 text-sm"
                onClick={() => handleView(documentURL)}
              >
                <div className="flex items-center">
                  <AiOutlineEye className="mr-2" />
                  <span>View Document#1</span>
                </div>
              </button>
              <button
                className="block bg-green-700 rounded text-white px-10 py-2 text-sm ml-12 mr-5"
                onClick={() => handleDownload(documentURL, "document1.jpg")}
              >
                <div className="flex items-center">
                  <MdDownload className="mr-2 text-1xl" />
                  <span>Download Document#1</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
