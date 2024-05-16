"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import Accordian from "@components/core/Accordian";

import Link from "next/link";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import checkAccess from "@lib/CheckAccess";
import moment from "moment";
import User from "@lib/User";

export default function page() {
  useTitle("View Transaction");
  const router = useRouter();
  const [roleLoading] = useRole();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const [transactionData, setTransactionData] = useState<any>([]);
  const [hasAccess, setHasAccess] = useState<any>({});

  const brandId = User.brandId;
  useEffect(() => {
    if (id) {
      getTransactionData();
    }
  }, [id, brandId]);

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Procurement");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  const getTransactionData = async () => {
    const url = `procurement/get-transaction/${id}`;
    try {
      const response = await API.get(url);
      setTransactionData(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  const transactionDetails = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Date:</p>
          </div>
          <div className="w-1/2">
            <p className="">{dateFormatter(transactionData?.date)}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>District:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.district?.district_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Taluk/Block:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.block?.block_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Village:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.village?.village_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Farmer Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {transactionData?.farmer?.firstName +
                " " +
                transactionData?.farmer?.lastName}
            </p>
          </div>
        </div>
        {/* <div className="flex mt-1">
          <div className="w-1/2">
            <p>Farm Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.farm?.district_name}</p>
          </div>
        </div> */}

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Farmer Brand:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.brand?.brand_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Farmer Code:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.farmer_code}</p>
          </div>
        </div>

        {/* <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mobile No:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.website}</p>
          </div>
        </div> */}
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Cotton Area:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.farm?.cotton_total_area}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Estimated Cotton (Kg):</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.farm?.total_estimated_cotton}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Available Cotton (Kg):</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.qty_stock}</p>
          </div>
        </div>
      </div>
    );
  };
  const transactionInfo = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Qty. Purchased (Kg):</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.qty_purchased}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Rate (INR/Kg):</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.rate}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Grade:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.grade?.cropGrade}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Program:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.program?.program_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Total Amount:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.total_amount}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Ginner:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.ginner?.name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Transport Vehicle:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.vehicle}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Payment Method:</p>
          </div>
          <div className="w-1/2">
            <p className="">{transactionData?.payment_method}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href={!brandId ? "/dashboard" : "/brand/dashboard"} className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Services</li>
              <li>Procurement</li>
              <li>
                <Link href="/services/procurement/transactions">Transactions</Link>
              </li>
              <li>Transaction Details</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-1">
        {hasAccess?.edit && (
          <div className="search-filter-right">
            <button
              className="btn btn-all btn-purple"
              onClick={() =>
                router.push(
                  `/services/procurement/transactions/edit-transaction?id=${id}`
                )
              }
            >
              Edit
            </button>
          </div>
        )}
        <div className="search-filter-right ml-3">
          <button className="btn btn-all border" onClick={() => router.back()}>
            Back
          </button>
        </div>
      </div>
      <div className="w-full ">
        <div className="row">
          <div className="col-12 col-lg-6 col-md-6">
            <Accordian
              title={"Transaction Details"}
              content={transactionDetails()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
          <div className="col-12 col-lg-6 col-md-6">
            <Accordian
              title={"Transaction Details"}
              content={transactionInfo()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
        </div>
      </div>
    </>
  );
}
