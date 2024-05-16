"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import Accordian from "@components/core/Accordian";

import Link from "@components/core/nav-link";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import checkAccess from "@lib/CheckAccess";
import User from "@lib/User";

export default function page() {
  useTitle("View Mandi");
  const router = useRouter();
  const [roleLoading] = useRole();
  const [mandiData, setMandiData] = useState<any>([]);
  const [program, setProgram] = useState([]);
  const [loomType, setLoomType] = useState([]);
  const [fabricType, setFabricType] = useState([]);
  const [productionCapacity, setProductionCapacity] = useState([]);
  const [unitCertification, setUnitCertification] = useState([]);
  const [brand, setBrands] = useState([]);
  const [hasAccess, setHasAccess] = useState<any>({});

  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const brandId = User.brandId;

  useEffect(() => {
    getProgram();
    // getFabricTypes();
    // getLoomTypes();
    getBrands();
    getProductionCapacity();
    getUnitCertification();
  }, []);

  useEffect(() => {
    getMandiData();
  }, [id, brandId]);

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Processor Registration");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  const getMandiData = async () => {
    const url = `mandi/get-mandi?id=${id}`;
    try {
      const response = await API.get(url);
      setMandiData(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getProgram = async () => {
    const url = "program?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProgram(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getFabricTypes = async () => {
    const url = "fabric-type?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setFabricType(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getLoomTypes = async () => {
    const url = "loom-type";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setLoomType(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getProductionCapacity = async () => {
    const url = "production-capacity";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProductionCapacity(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getUnitCertification = async () => {
    const url = "unit/unit-certification";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setUnitCertification(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getBrands = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgramName = (ids: any) => {
    const matchId = program
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.program_name);
    const getId = matchId.map((programName: any) => programName);
    return getId.join(", ");
  };

  const getFabricTypeName = (ids: any) => {
    const matchId = fabricType
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.fabricType_name);
    const getId = matchId.map((fabricTypeName: any) => fabricTypeName);
    return getId.join(", ");
  };

  const getLoomTypeName = (ids: any) => {
    const matchId = loomType
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.name);
    const getId = matchId.map((name: any) => name);
    return getId.join(", ");
  };

  const getProductionName = (ids: any) => {
    const matchId = productionCapacity
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.name);
    const getId = matchId.map((name: any) => name);
    return getId.join(", ");
  };

  const getUnitCertificationName = (ids: any) => {
    const matchId = unitCertification
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.certification_name);
    const getId = matchId.map((name: any) => name);
    return getId.join(", ");
  };
  const getBrandName = (ids: any) => {
    const matchId = brand
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.brand_name);
    const getId = matchId.map((name: any) => name);
    return getId.join(", ");
  };

  const mandiDetails = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mandi Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mandi Short Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.short_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Address:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.address}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Country:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.country?.county_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>State:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.state?.state_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>District:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.district?.district_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Program:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {mandiData?.programs &&
                mandiData?.programs
                  .map((name: any) => name.program_name)
                  .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>GPS Information:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {mandiData?.latitude},{mandiData?.longitude}
            </p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Website:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.website}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Contact Person Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.contact_person}</p>
          </div>
        </div>
      </div>
    );
  };
  const mandiInformation = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mandi Outurn Range - From:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.outturn_range_from}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mandi Outurn Range - To:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.outturn_range_to}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Bag Weight Range - From:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.bag_weight_from}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Bag Weight Range - To:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.bag_weight_to}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Unit Certified For:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {mandiData?.unitCerts &&
                mandiData?.unitCerts
                  .map((name: any) => name.certification_name)
                  .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Company Information:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.company_info}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Organisation Logo:</p>
          </div>
          <div className="w-1/2">
            <img
              src={
                mandiData?.org_logo
                  ? mandiData?.org_logo
                  : "/images/image-placeholder.png"
              }
              alt="Organisation Logo"
              className="w-[150px] h-[150px] "
            />
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Organisation Photo:</p>
          </div>
          <div className="w-1/2">
            <img
              src={
                mandiData?.org_photo
                  ? mandiData?.org_photo
                  : "/images/image-placeholder.png"
              }
              alt="Organisation Photo"
              className="w-[150px] h-[150px] "
            />
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Certificates:</p>
          </div>
          <div className="w-1/2">
            <img
              src={
                mandiData?.certs
                  ? mandiData?.certs
                  : "/images/image-placeholder.png"
              }
              alt="Certificate Photo"
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Brand Mapped:</p>
          </div>
          <div className="w-1/2">
            {mandiData?.brands &&
             mandiData?.brands.map((name: any) => name.brand_name).join(", ")}
          </div>
        </div>
      </div>
    );
  };

  const contactDetails = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mobile No:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.mobile}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Landline No:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.landline}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Email:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.email}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Type of Mandi:</p>
          </div>
          <div className="w-1/2">
            <p className="">{mandiData?.mandi_type}</p>
          </div>
        </div>
      </div>
    );
  };

  const userAccess = () => {
    return (
      <div>
        {mandiData?.userData?.map((user: any, index: number) => {
          return (
            <div key={user?.id} className="text-xs px-3 font-bold">
              <div className="text-sm my-3">User {index + 1}</div>
              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Name:</p>
                </div>
                <div className="w-1/2">
                  <p className="">{user?.firstname + " " + user?.lastname}</p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Username:</p>
                </div>
                <div className="w-1/2">
                  <p className="">{user?.username}</p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Position in company:</p>
                </div>
                <div className="w-1/2">
                  <p className="">{user?.position}</p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Role:</p>
                </div>
                <div className="w-1/2">
                  <p>{user?.user_role?.user_role}</p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Email:</p>
                </div>
                <div className="w-1/2">
                  <p className="">{user?.email}</p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Mobile:</p>
                </div>
                <div className="w-1/2">
                  <p className="">{user?.mobile}</p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Status:</p>
                </div>
                <div className="w-1/2">
                  <p className="">{user?.status ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>
          );
        })}
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
              <li>Settings</li>
              <li>
                {" "}
                <Link
                  href="/settings/processor-registration"
                  className="active"
                >
                  Processor Registration
                </Link>
              </li>
              <li>View Mandi</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className="flex justify-end p-1">
          {hasAccess?.edit && (
            <div className="search-filter-right">
              <button
                className="btn btn-all btn-purple"
                onClick={() =>
                  router.push(
                    `/settings/processor-registration/edit-processor?id=${id}&type=Mandi`
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
          <div className="flex lg:w-full gap-4 md:w-full sm:w-full ">
            <Accordian
              title={"Mandi Details"}
              content={mandiDetails()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
            <Accordian
              title={"Mandi Details"}
              content={mandiInformation()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
          <div className="flex lg:w-full gap-4 md:w-full sm:w-full ">
            <Accordian
              title={"Contact Details"}
              content={contactDetails()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
            <Accordian
              title={"User Access"}
              content={userAccess()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
        </div>
      </div>
    </>
  );
}
