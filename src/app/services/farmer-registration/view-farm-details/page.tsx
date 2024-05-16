"use client";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";
import Accordian from "@components/core/Accordian";
import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";

export default function page() {
  useTitle("Farm Details");
  const router = useRouter();
  const searchParams = useSearchParams();

  const farmId: any = searchParams.get("id");
  const [farmDetails, setFarmerDetails] = useState<any>([]);

  useEffect(() => {
    getFarmDetails();
  }, [farmId]);

  const getFarmDetails = async () => {
    const url = `farmer/farm/get-farm?id=${farmId}`;
    try {
      const response = await API.get(url);
      setFarmerDetails(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const farmInformation = () => {
    return (
      <div className=" w-1/2">
        <div className="flex justify-between">
          <label>Farmer:</label>
          <p>
            {farmDetails?.farmer?.firstName +
              " " +
              farmDetails?.farmer?.lastName}
          </p>
          <label>Season:</label> <p>{farmDetails?.season?.name}</p>
        </div>
      </div>
    );
  };

  const agricultureArea = () => {
    return (
      <div className="w-full">
        <div className="flex justify-between">
          <label>Total Area:</label>
          <p>{farmDetails?.agri_total_area}</p>
        </div>
        <div className="flex justify-between">
          <label>Kg/Ac:</label>
          <p>{farmDetails?.agri_estimated_yeld}</p>
        </div>
        <div className="flex justify-between">
          <label>Total Estimation Production:</label>
          <p>{farmDetails?.agri_estimated_prod}</p>
        </div>
      </div>
    );
  };

  const cottonArea = () => {
    return (
      <div className="w-full">
        <div className="flex justify-between">
          <label>Total Area:</label>
          <p>{farmDetails?.cotton_total_area}</p>
        </div>
        <div className="flex justify-between">
          <label>Total Estimation Cotton:</label>
          <p>{farmDetails?.total_estimated_cotton}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Services</li>
              <li>
                <Link href="/services/farmer-registration">
                  Farmer Registration
                </Link>
              </li>
              <li>Farm Details</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-1">
        <div className="search-filter-right">
          <button
            className="btn btn-all btn-purple"
            onClick={() =>
              router.push(
                `/services/farmer-registration/edit-farm?id=${farmId}`
              )
            }
          >
            Edit
          </button>
        </div>
        <div className="search-filter-right ml-3">
          <button className="btn btn-all border" onClick={() => router.back()}>
            Back
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="w-full ">
          <Accordian
            title={"Farm Information"}
            content={farmInformation()}
            firstSign={<FaAngleDown color="white" />}
            secondSign={<FaAngleRight color="white" />}
          />
        </div>

        <div className="flex justify-between w-full flex-wrap">
          <div className="w-[800px]">
            <Accordian
              title={"Agriculture Area"}
              content={agricultureArea()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
          <div className="w-[800px]">
            <Accordian
              title={"Cotton Area"}
              content={cottonArea()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
