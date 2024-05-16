"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { MdDownload } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import Link from "@components/core/nav-link";
import Accordian from "@components/core/Accordian";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("View Premium Farmer");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>([]);
  const [farmerTable, setFarmerTable] = useState<any>([]);
  const [farmerImage, setFarmerImage] = useState<string>("");
  const [IdentityValidationImage, setIdentityValidationImage] =
    useState<string>("");
  const [ProofDocument, setProofDocument] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (data?.season?.id && data?.farmer_id) {
      getFarmerTable();
    }
  }, [data]);

  const fetchData = async () => {
    try {
      const response = await API.get(`premium-validation/fetch-by-id?id=${id}`);
      if (response.success) {
        setData(response.data);
        const farmerimage = response.data.farmer_image;
        setFarmerImage(farmerimage);
        const Identityimage = response.data.identity_image;
        setIdentityValidationImage(Identityimage);
        const proofDocument = response.data.proof_document;
        setProofDocument(proofDocument);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getFarmerTable = async () => {
    try {
      if (data?.season?.id && data?.farmer_id) {
        const res = await API.get(
          `premium-validation/get-premium-farmer?seasonId=${data?.season?.id}&farmerId=${data?.farmer_id}`
        );
        if (res.success) {
          setFarmerTable(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

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
                  <Link href="/services/premium-validation">
                    Premium Validation - Farmer
                  </Link>
                </li>
                <li>View Premium Farmer</li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="bg-black h-1 mb-8 mt-8" />
        <div className="flex justify-end customButtonGroup">
          <button
            className="btn-outline-purple"
            onClick={() => router.push("/services/premium-validation")}
          >
            {translations?.common?.back}
          </button>
        </div>
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <Accordian
              title={"Premium Validation Details"}
              content={
                data && (
                  <div className="mt-6 space-y-2 font-bold text-sm flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <span className="font-semibold w-20">
                        {translations?.transactions?.date} :
                      </span>
                      <p className="font-bold mr-8">
                        {data?.date?.substring(0, 10)}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="font-semibold w-20">
                        {translations?.transactions?.season} :
                      </span>
                      <p className="font-bold mr-8">{data?.season?.name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-semibold ">
                        {translations?.transactions?.farmerName} :
                      </span>
                      <p className="font-bold mr-8">
                        {data?.farmer?.firstName}
                      </p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold ">{translations?.farmGroup}:</p>
                      <p className="mr-8 font-bold">{data?.farmGroup?.name}</p>
                    </div>
                    {farmerTable?.length > 0 && (
                      <div>
                        <table className="table w-full border-collapse border border-gray-400 mt-5 mb-5">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-2 font-bold">
                                {translations?.common?.srNo}
                              </th>
                              <th className="p-2 font-bold">
                                {translations?.transactions?.date}
                              </th>
                              <th className="p-2 font-bold">Ginner</th>
                              <th className="p-2 font-bold">
                                Procured Quantity
                              </th>
                              <th className="p-2 font-bold">
                                {translations?.transactions?.price}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {farmerTable?.map((item: any, index: any) => {
                              return (
                                <tr key={index} className="hover:bg-gray-50 ">
                                  <td className="p-2 ml-6 font-bold">
                                    {index + 1}
                                  </td>
                                  <td className="p-2 font-bold">
                                    {item?.date?.substring(0, 10)}
                                  </td>
                                  <td className="p-2 font-bold">
                                    {item?.ginner?.name}
                                  </td>
                                  <td className="p-2 font-bold">
                                    {item?.qty_purchased}
                                  </td>
                                  <td className="p-2 font-bold">
                                    {item?.rate}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="flex items-end justify-between">
                      <p className="font-bold">Identity Validation :</p>
                      <p className="mr-8 font-bold">{data?.valid_identity}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold">Purchaser of cotton :</p>
                      <p className="mr-8 font-bold">{data?.cotton_purchaser}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold">
                        Market rate at the day of sale (In INR) :
                      </p>
                      <p className="mr-8 font-bold">{data?.market_rate}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold">Mode Of Payment :</p>
                      <p className="mr-8 font-bold">{data?.payment_mode}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="font-bold">
                        Whether ginner supported by any other means :
                      </p>
                      <p className="mr-8 font-bold">
                        {data?.is_ginner_supported ? "Yes" : "No"}
                      </p>
                    </div>
                    {data?.is_ginner_supported && (
                      <>
                        <div className="flex items-end justify-between">
                          <p className="font-bold">
                            Ginner Supported Details :
                          </p>
                          <p className="mr-8 font-bold">
                            {data?.ginner_supported_details?.join(", ")}
                          </p>
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="font-bold">
                            Ginner Supported Others Details :
                          </p>
                          <p className="mr-8 font-bold">
                            {data?.ginner_supported_others
                              ?.filter(Boolean)
                              ?.join(", ")}
                          </p>
                        </div>
                      </>
                    )}
                    <div className="flex items-end justify-between">
                      <p className="font-bold">Mode of support :</p>
                      <p className="mr-8 font-bold">
                        {data?.support_mode?.join(", ")}
                      </p>
                    </div>
                    {data?.verifier_inference === "partially_verified" && (
                      <div className="flex items-end justify-between">
                        <p className="font-bold">Verifier inference :</p>
                        <p className="mr-8 font-bold">
                          {data?.verifier_inference}
                        </p>
                      </div>
                    )}
                    <div className="flex items-end justify-between">
                      <p className="font-bold">Partially Verified Details :</p>
                      <p className="mr-8 font-bold">
                        {data?.partially_verified}
                      </p>
                    </div>
                  </div>
                )
              }
            />
          </div>
          <div className="col-md-6 col-sm-12">
            <Accordian
              title={"Farmer Image"}
              content={
                <>
                  <div className="block ml-12 mt-6">
                    <img
                      src={
                        farmerImage
                          ? farmerImage
                          : "/images/image-placeholder.png"
                      }
                      width={200}
                      height={150}
                      alt="Farmer Image"
                    />
                  </div>
                  <div className="mt-3 block">
                    <button
                      className="block bg-green-700 rounded text-white px-10 py-2 text-sm mb-2 ml-12 mr-5"
                      onClick={() => handleView(farmerImage)}
                    >
                      <div className="flex items-center">
                        <AiOutlineEye className="mr-2" size={20} />
                        <span>View Document#1</span>
                      </div>
                    </button>

                    <button
                      className="block bg-green-700 rounded text-white px-10 py-2 text-sm ml-12 mr-5"
                      onClick={() =>
                        handleDownload(farmerImage, "document1.jpg")
                      }
                    >
                      <div className="flex items-center">
                        <MdDownload className="mr-2" size={20} />
                        <span>Download Document#1</span>
                      </div>
                    </button>
                  </div>
                </>
              }
            />
            <Accordian
              title={"Identity Validation Image"}
              content={
                <>
                  <div className="block ml-12 mt-6">
                    <img
                      src={
                        IdentityValidationImage
                          ? IdentityValidationImage
                          : "/images/image-placeholder.png"
                      }
                      width={200}
                      height={150}
                      alt="Identity Validation Image"
                    />
                  </div>
                  <div className="mt-3 block">
                    <button
                      className="block bg-green-700 rounded text-white px-10 py-2 text-sm mb-2 ml-12 mr-5"
                      onClick={() => handleView(IdentityValidationImage)}
                    >
                      <div className="flex items-center">
                        <AiOutlineEye className="mr-2" size={20} />
                        <span>View Document#1</span>
                      </div>
                    </button>

                    <button
                      className="block bg-green-700 rounded text-white px-10 py-2 text-sm ml-12 mr-5"
                      onClick={() =>
                        handleDownload(IdentityValidationImage, "document1.jpg")
                      }
                    >
                      <div className="flex items-center">
                        <MdDownload className="mr-2 " size={20} />
                        <span>Download Document#1</span>
                      </div>
                    </button>
                  </div>
                </>
              }
            />
            <Accordian
              title={"Proof Documents"}
              content={
                <>
                  <div className="block ml-12 mt-6">
                    {isPDF(ProofDocument) ? (
                      <img
                        src="/images/pdf-icon.png"
                        width={200}
                        height={150}
                        alt="PDF Icon"
                      />
                    ) : (
                      <img
                        src={
                          ProofDocument
                            ? ProofDocument
                            : "/images/image-placeholder.png"
                        }
                        width={200}
                        height={150}
                        alt="Identity Validation Image"
                      />
                    )}
                  </div>

                  {ProofDocument && (
                    <>
                      <button
                        className="block bg-green-700 rounded text-white px-10 py-2 mb-2 ml-12 mt-5 mr-5 text-sm"
                        onClick={() => handleView(ProofDocument)}
                      >
                        <div className="flex items-center">
                          <AiOutlineEye className="mr-2" size={20} />
                          <span>View Document#1</span>
                        </div>
                      </button>
                      <button
                        className="block bg-green-700 rounded text-white px-10 py-2 text-sm ml-12 mr-5"
                        onClick={() =>
                          handleDownload(ProofDocument, "document1")
                        }
                      >
                        <div className="flex items-center">
                          <MdDownload className="mr-2" size={20} />
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
