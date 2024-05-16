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
  useTitle("View Lab");
  const router = useRouter();

  const [roleLoading] = useRole();
  const [hasAccess, setHasAccess] = useState<any>({});
  const [labData, setLabData] = useState<any>([]);
  const [program, setProgram] = useState([]);
  const [unitCertification, setUnitCertification] = useState([]);
  const [brand, setBrands] = useState([]);

  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const brandId = User.brandId;
  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Processor Registration");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  const getLabData = async () => {
    const url = `lab/get-lab?id=${id}`;
    try {
      const response = await API.get(url);
      setLabData(response.data);
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
  useEffect(() => {
    getProgram();
    getBrands();
    getUnitCertification();
  }, []);

  const getProgramName = (ids: any) => {
    const matchId = program
      ?.filter((item: any) => ids?.includes(item.id))
      .map((item: any) => item.program_name);
    const getId = matchId.map((programName: any) => programName);
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

  useEffect(() => {
    getLabData();
  }, [id, brandId]);

  const labDetails = () => {
    return (
      <div className="w-full text-xs px-3 ">
        <div className="flex w-full justify-between">
          <div className="w-1/2">
            <label>Lab Name:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.name}</p>
          </div>
        </div>
        <div className="flex w-full mt-2 justify-between">
          <div className="w-1/2">
            <label>Address:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.address}</p>
          </div>
        </div>
        <div className="flex w-full mt-2 justify-between">
          <div className="w-1/2">
            <label>Country:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.country?.county_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>State:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.state?.state_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>District:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.district?.district_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Program:</label>
          </div>
          <div className="w-1/2">
            <p>{getProgramName(labData?.program_id)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>GPS Information:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.latitude + " " + labData?.longitude}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Website:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.website}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Contact Person Name:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.contact_person}</p>
          </div>
        </div>
      </div>
    );
  };
  const labInformation = () => {
    return (
      <div className="w-full text-xs px-3 ">
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Unit Certified For:</label>
          </div>
          <div className="w-1/2">
            <p>{getUnitCertificationName(labData?.unit_cert)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Company Information:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.company_info}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Organisation Logo:</label>
          </div>
          <div className="w-1/2">
            <img
              src={
                labData?.org_logo
                  ? labData.org_logo
                  : "/images/image-placeholder.png"
              }
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Organisation Photo:</label>
          </div>
          <div className="w-1/2">
            <img
              src={
                labData?.org_photo
                  ? labData.org_photo
                  : "/images/image-placeholder.png"
              }
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Certificates:</label>
          </div>
          <div className="w-1/2">
            <img
              src={
                labData?.certs
                  ? labData.certs
                  : "/images/image-placeholder.png"
              }
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Brand Mapped:</label>
          </div>
          <div className="w-1/2">
            <p>{getBrandName(labData?.brand)}</p>
          </div>
        </div>
      </div>
    );
  };

  const contactDetails = () => {
    return (
      <div className="w-full text-xs px-3 ">
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Mobile No:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.mobile}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Landline No:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.landline}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Email:</label>
          </div>
          <div className="w-1/2">
            <p>{labData?.email}</p>
          </div>
        </div>
      </div>
    );
  };

  const userAccess = () => {
    return (
      <div>
        {labData?.userData?.map((user: any, index: any) => (
          <div className="w-full mb-5 text-xs px-3 " key={user?.id}>
            <p className="text-lg font-bold">User {index + 1}</p>
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Name:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.firstname + "" + user?.lastname}</p>
              </div>
            </div>
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Username:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.username}</p>
              </div>
            </div>

            {/* <div className="flex full mt-2 justify-between">
                            <div className='w-1/2'>
                                <label>Password:</label>
                            </div>
                            <div className='w-1/2'>
                                <input className='bg-inherit' type='password' value={user?.password} disabled />
                            </div>
                        </div> */}
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Position In Company:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.position}</p>
              </div>
            </div>
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Role:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.user_role?.user_role}</p>
              </div>
            </div>
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Email:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Mobile:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.mobile}</p>
              </div>
            </div>
            <div className="flex full mt-2 justify-between">
              <div className="w-1/2">
                <label>Status:</label>
              </div>
              <div className="w-1/2">
                <p>{user?.status === true ? "Active" : "InActive"}</p>
              </div>
            </div>
          </div>
        ))}
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
              <li>View Lab</li>
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
                    `/settings/processor-registration/edit-processor?id=${id}&type=Lab`
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
              title={"Lab Details"}
              content={labDetails()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
            <Accordian
              title={"Lab Details"}
              content={labInformation()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
          </div>
          <div className="flex lg:w-full gap-4 md:w-full sm:w-full">
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
