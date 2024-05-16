"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import Accordian from "@components/core/Accordian";

import Link from "@components/core/nav-link";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import checkAccess from "@lib/CheckAccess";
import useRole from "@hooks/useRole";
import User from "@lib/User";

export default function page() {
  useTitle("View Mill Processing");
  const router = useRouter();
  const [roleLoading] = useRole();
  const [hasAccess, setHasAccess] = useState<any>({});
  const [millData, setMillData] = useState<any>([]);
  
  const searchParams = useSearchParams();
  
  const brandId = User.brandId;
  const id = searchParams.get("id");
  
  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Processor Registration");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  const getMillData = async () => {
    const url = `mill/get-mill?id=${id}`;
    try {
      const response = await API.get(url);
      setMillData(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
 
  useEffect(() => {
    getMillData();
  }, [id, brandId]);

  const millDetails = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mill Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mill Short Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.short_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Address:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.address}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Country:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.country?.county_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>State:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.state?.state_name}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>District:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.district?.district_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Program:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {millData?.programs &&
                millData.programs
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
              {millData?.latitude},{millData?.longitude}
            </p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Website:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.website}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Contact Person Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.contact_person}</p>
          </div>
        </div>
      </div>
    );
  };
  const millInformation = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Rice Type:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {millData?.riceType &&
                millData?.riceType
                  .map((name: any) => name.riceType_name)
                  .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Paddy/rice realization range- From:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.realisation_range_from}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Paddy/rice realization range- To:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.realisation_range_to}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Unit Certified For:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {millData?.unitCerts &&
                millData.unitCerts
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
            <p className="">{millData?.company_info}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Organisation Logo:</p>
          </div>
          <div className="w-1/2">
            <img
              alt="Organisation Logo"
              src={
                millData?.org_logo
                  ? millData.org_logo
                  : "/images/image-placeholder.png"
              }
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>

        <div className="flex mt-2">
          <div className="w-1/2">
            <p>Organisation Photo:</p>
          </div>
          <div className="w-1/2">
            <img
              alt="Organisation Photo"
              src={
                millData?.org_photo
                  ? millData.org_photo
                  : "/images/image-placeholder.png"
              }
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>

        <div className="flex mt-2">
          <div className="w-1/2">
            <p>Certificates:</p>
          </div>
          <div className="w-1/2">
            <img
              alt="Organisation Certificates"
              src={
                millData?.certs
                  ? millData.certs
                  : "/images/image-placeholder.png"
              }
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>

        <div className="flex mt-2">
          <div className="w-1/2">
            <p>Brand Mapped:</p>
          </div>
          <div className="w-1/2">
            {millData?.brands &&
              millData.brands.map((name: any) => name.brand_name).join(", ")}
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
            <p className="">{millData?.mobile}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Landline No:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.landline}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Email:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.email}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Rice Variety:</p>
          </div>
          <div className="w-1/2">
            <p className="">{millData?.riceVariety &&
                millData.riceVariety
                  .map((name: any) => name.variety_name)
                  .join(", ")}</p>
          </div>
        </div>
      </div>
    );
  };

  const userAccess = () => {
    return (
      <div>
        {millData?.userData?.map((user: any, index: number) => {
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
                  <p className="">{user?.user_role?.user_role}</p>
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
              <li>View Mill</li>
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
                    `/settings/processor-registration/edit-processor?id=${id}&type=Mill`
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
              title={"Mill Processing Details"}
              content={millDetails()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
            <Accordian
              title={"Mill Processing Details"}
              content={millInformation()}
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
