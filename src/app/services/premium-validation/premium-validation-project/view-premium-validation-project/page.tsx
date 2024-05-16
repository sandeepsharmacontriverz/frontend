"use client";
import React, { useState, useEffect } from "react";
import NavLink from "@components/core/nav-link";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Accordian from "@components/core/Accordian";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  useTitle(" View Premium Project/Ginner");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const [data, setData] = useState<any>([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const handleBack = () => {
    router.push("/services/premium-validation?activeTab=Ginner");
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await API.get(`premium-validation/get-project?id=${id}`);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.log(error);
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
                  <NavLink href="/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Services</li>
                <li>
                  <NavLink href="/services/premium-validation?activeTab=Ginner">
                    Premium Validation - Project/Ginner
                  </NavLink>
                </li>
                <li>View Premium Project/Ginner</li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="bg-black h-1 mb-8 mt-8" />

        <div className="flex justify-end customButtonGroup">
          <button className="btn-outline-purple" onClick={handleBack}>
            {translations?.common?.back}
          </button>
        </div>

        <div className="row">
          <div className="col-md-6 col-sm-12">
            <Accordian
              title={"Premium Validation Project Details"}
              content={
                <div className="mt-6 mb-2 font-bold text-sm">
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">
                      {translations?.transactions?.date}:
                    </p>
                    <p className="flex justify-end font-bold">
                      {data?.date?.substring(0, 10)}
                    </p>
                  </div>

                  <div className="flex justify-between w-full mt-2">
                    <p className="font-bold">
                      {translations?.transactions?.season}:
                    </p>
                    <p className="flex justify-end font-bold">
                      {data?.season?.name}
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">{translations?.farmGroup}:</p>
                    <p className="flex justify-end font-bold">
                      {data?.farmGroup?.name}
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">Total Number of farmers:</p>
                    <p className="flex justify-end font-bold">
                      {data?.no_of_farmers || 0}
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">Total cotton purchased:</p>
                    <p className="flex justify-end font-bold">
                      {data?.qty_of_lint_sold / 1000 || 0} MT
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">
                      Total quantity of lint cotton sold to ginner:
                    </p>
                    <p className="flex justify-end font-bold">
                      {data?.cotton_purchased / 1000 || 0} MT
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">Premium received:</p>
                    <p className="flex justify-end font-bold">
                      {data?.premium_recieved} INR
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">Premium transferred to farmers:</p>
                    <p className="flex justify-end font-bold">
                      {data?.premium_transfered?.join(",")}
                    </p>
                  </div>

                  <div className="flex justify-between w-full  mt-2">
                    <p className="font-bold">Cost:</p>
                    <p className="flex justify-end font-bold">
                      {data?.premium_transfered_cost?.join(",")}
                    </p>
                  </div>
                </div>
              }
            />
          </div>
          <div className="col-md-6 col-sm-12">
            <Accordian
              title={"Price Comparison"}
              content={
                <div className="mt-6 mb-2 font-bold text-sm">
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">
                      Average Purchase Price (INR/Per Kg) :
                    </p>
                    <p className="font-bold">{data?.avg_purchase_price}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">
                      Average Market Price (INR/Per Kg) :
                    </p>
                    <p className="font-bold">{data?.avg_market_price}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">Price % Variance :</p>
                    <p className="font-bold">{data?.price_variance}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">
                      Calculated Average Variance Verified by CottonConnect
                      (INR/Kg) :
                    </p>
                    <p className="font-bold">{data?.calculated_avg_variance}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">
                      Claim by ginner of premium Transfer in Cash (INR/Kg) :
                    </p>
                    <p className="font-bold">{data?.premium_transfer_claim}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold">Claim % Variance :</p>
                    <p className="font-bold">{data?.claim_variance}</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </>
    );
  }
}
