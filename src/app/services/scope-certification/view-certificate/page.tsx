"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { MdDownload } from "react-icons/md";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import Accordian from "@components/core/Accordian";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("View Scope Certification");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>([]);
  const [documentURL, setDocumentURL] = useState<string>("");

  function isPDF(url: any) {
    return typeof url === "string" && url.endsWith(".pdf");
  }
  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `${fileName}`;
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
      const response = await API.get(`scope-certificate/${id}`);
      if (response.success) {
        setData(response.data);
        const documentURL = response.data.document;
        setDocumentURL(documentURL);
      }
    } catch (error) {
      console.error(error);
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
                <li>
                  <Link href="/services/scope-certification">
                    Scope Certification
                  </Link>
                </li>
                <li>View Scope Certification</li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-2" />
        <div className=" flex justify-end mt-4 px-2 space-x-3 customButtonGroup">
          <button className="btn-purple mr-2">
            <Link
              // legacyBehavior
              href={`/services/scope-certification/edit-certificate?id=${id}`}
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

        <div className="row">
          <div className="col-12 col-md-6 col-sm-6 mt-2">
            <Accordian
              title={" Scope Certification Details"}
              content={
                data && (
                  <div className="ml-8 mt-6 space-y-2 font-bold text-sm flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <span className="font-semibold w-20">
                        {translations?.common?.brand}:
                      </span>
                      <p className="font-bold">{data?.brand?.brand_name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-semibold w-20">
                        {translations?.common?.country}:
                      </span>
                      <p className="font-bold">{data?.country?.county_name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-semibold w-20">
                        {translations?.common?.state}:
                      </span>
                      <p className="font-bold">{data?.state?.state_name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-semibold ">
                        {translations?.farmGroup}:
                      </span>
                      <p className="font-bold">{data?.farmGroup?.name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-semibold w-20">
                        {translations?.icsName}:
                      </span>
                      <p className="font-bold">{data?.ics?.ics_name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-semibold ">
                        Scope Validity End:
                      </span>
                      <p className="font-bold">
                        {data?.validity_end?.substring(0, 10)}
                      </p>
                    </div>
                  </div>
                )
              }
            />
          </div>
          <div className="col-12 col-md-6 col-sm-6 mt-2">
            <Accordian
              title={"Scope Certificate Documents"}
              content={
                <>
                  <div className="block ml-12 mt-6">
                    {isPDF(documentURL) ? (
                      <img
                        src="/images/pdf-icon.png"
                        width={200}
                        height={150}
                        alt="PDF Icon"
                      />
                    ) : (
                      <img
                        src={
                          documentURL
                            ? documentURL
                            : "/images/image-placeholder.png"
                        }
                        width={200}
                        height={150}
                        alt="Identity Validation Image"
                      />
                    )}
                  </div>

                  {documentURL && (
                    <>
                      <button
                        className="block bg-green-700 rounded text-white px-10 py-2 mb-2 ml-12 mt-5 mr-5 text-sm"
                        onClick={() => handleView(documentURL)}
                      >
                        <div className="flex items-center">
                          <AiOutlineEye className="mr-2" size={20} />
                          <span>View Document#1</span>
                        </div>
                      </button>
                      <button
                        className="block bg-green-700 rounded text-white px-10 py-2 text-sm ml-12 mr-5"
                        onClick={() => handleDownload(documentURL, "document1")}
                      >
                        <div className="flex items-center">
                          <MdDownload className="mr-2 text-1xl" size={20} />
                          <span>Download Document#1</span>
                        </div>
                      </button>
                    </>
                  )}
                </>
              }
            />
          </div>
        </div>
      </>
    );
  }
}
