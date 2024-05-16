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
  useTitle("View Container Management System");
  const router = useRouter();

  const [roleLoading] = useRole();
  const [hasAccess, setHasAccess] = useState<any>({});

  const [KnitterData, setKnitterData] = useState<any>([]);
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

  const getWeaverData = async () => {
    const url = `container-management-system/get-container-management-system?id=${id}`;
    try {
      const response = await API.get(url);
      setKnitterData(response.data);
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
    getWeaverData();
  }, [id, brandId]);

  const weaverDetails = () => {
    return (
      <div className="w-full text-xs px-3 ">
        <div className="flex w-full justify-between">
          <div className="w-1/2">
            <label>Container Management System Name:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.name}</p>
          </div>
        </div>
        <div className="flex w-full mt-2 justify-between">
          <div className="w-1/2">
            <label>Address:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.address}</p>
          </div>
        </div>
        <div className="flex w-full mt-2 justify-between">
          <div className="w-1/2">
            <label>Country:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.country?.county_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>State:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.state?.state_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>District:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.district?.district_name}</p>
          </div>
        </div>

        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Program:</label>
          </div>
          <div className="w-1/2">
            <p>{getProgramName(KnitterData?.program_id)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>GPS Information:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.latitude + " " + KnitterData?.longitude}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Website:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.website}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Contact Person Name:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.contact_person}</p>
          </div>
        </div>
      </div>
    );
  };
  const weaverInformation = () => {
    return (
      <div className="w-full text-xs px-3 ">
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Unit Certified For:</label>
          </div>
          <div className="w-1/2">
            <p>{getUnitCertificationName(KnitterData?.unit_cert)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Company Information:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.company_info}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Organisation Logo:</label>
          </div>
          <div className="w-1/2">
            <img
              src={
                KnitterData?.org_logo
                  ? KnitterData.org_logo
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
                KnitterData?.org_photo
                  ? KnitterData.org_photo
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
                KnitterData?.certs
                  ? KnitterData.certs
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
            <p>{getBrandName(KnitterData?.brand)}</p>
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
            <p>{KnitterData?.mobile}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Landline No:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.landline}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Email:</label>
          </div>
          <div className="w-1/2">
            <p>{KnitterData?.email}</p>
          </div>
        </div>
      </div>
    );
  };

  const userAccess = () => {
    return (
      <div>
        {KnitterData?.userData?.map((user: any, index: any) => (
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
  if (!roleLoading) {
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
                <li>View Container Management System</li>
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
                      `/settings/processor-registration/edit-processor?id=${id}&type=Container_Management_System`
                    )
                  }
                >
                  Edit
                </button>
              </div>
            )}
            <div className="search-filter-right ml-3">
              <button
                className="btn btn-all border"
                onClick={() => router.back()}
              >
                Back
              </button>
            </div>
          </div>

          <div className="w-full ">
            <div className="flex lg:w-full gap-4 md:w-full sm:w-full ">
              <Accordian
                title={"Container Management System  Details"}
                content={weaverDetails()}
                firstSign={<FaAngleDown color="white" />}
                secondSign={<FaAngleRight color="white" />}
              />
              <Accordian
                title={"Container Management System  Details"}
                content={weaverInformation()}
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
}
