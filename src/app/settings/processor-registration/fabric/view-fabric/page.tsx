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
  useTitle("View Fabric");
  const router = useRouter();
  const [roleLoading] = useRole();
  const [hasAccess, setHasAccess] = useState<any>({});

  const [fabricData, setFabricData] = useState<any>([]);
  const [program, setProgram] = useState([]);
  const [loomType, setLoomType] = useState([]);
  const [fabricType, setFabricType] = useState([]);
  const [productionCapacity, setProductionCapacity] = useState([]);
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

  const getFabricData = async () => {
    const url = `fabric/get-fabric?id=${id}`;
    try {
      const response = await API.get(url);
      setFabricData(response.data);
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
  useEffect(() => {
    getProgram();
    getFabricTypes();
    getLoomTypes();
    getBrands();
    getProductionCapacity();
    getUnitCertification();
  }, []);

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

  useEffect(() => {
    getFabricData();
  }, [id, brandId]);

  const fabricDetails = () => {
    return (
      <div className="w-full text-xs px-3 ">
        <div className="flex w-full justify-between">
          <div className="w-1/2">
            <label>Fabric Processor Name:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.name}</p>
          </div>
        </div>
        <div className="flex w-full mt-2 justify-between">
          <div className="w-1/2">
            <label>Address:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.address}</p>
          </div>
        </div>
        <div className="flex w-full mt-2 justify-between">
          <div className="w-1/2">
            <label>Country:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.country?.county_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>State:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.state?.state_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>District:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.district?.district_name}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Program:</label>
          </div>
          <div className="w-1/2">
            <p>{getProgramName(fabricData?.program_id)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>GPS Information:</label>
          </div>
          <div className="w-1/2">
            <p>
              {fabricData?.latitude && fabricData?.longitude
                ? fabricData?.latitude + " " + fabricData?.longitude
                : ""}
            </p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Website:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.website}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Contact Person Name:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.contact_person}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Add Fabric Processor Type:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.contact_person}</p>
          </div>
        </div>
      </div>
    );
  };
  const fabricInformation = () => {
    return (
      <div className="w-full text-xs px-3">
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>No.of Machines:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.no_of_machines}</p>
          </div>
        </div>
        {/* <div className="flex full mt-2 justify-between">
                    <div className='w-1/2'>
                        <label>Fabric Type:</label>
                    </div>
                    <div className='w-1/2'>
                        <p>{getFabricTypeName(fabricData?.fabric_type)}</p>
                    </div>
                </div> */}
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Production Capacity:</label>
          </div>
          <div className="w-1/2">
            <p>{getProductionName(fabricData?.prod_cap)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Loss From %:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.loss_from}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Loss To %:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.loss_to}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Unit Certified For:</label>
          </div>
          <div className="w-1/2">
            <p>{getUnitCertificationName(fabricData?.unit_cert)}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Company Information:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.company_info}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Organisation Logo:</label>
          </div>
          <div className="w-1/2">
            <img
              src={
                fabricData?.org_logo
                  ? fabricData.org_logo
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
                fabricData?.org_photo
                  ? fabricData.org_photo
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
                fabricData?.certs
                  ? fabricData.certs
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
            <p>{getBrandName(fabricData?.brand)}</p>
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
            <p>{fabricData?.mobile}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Landline No:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.landline}</p>
          </div>
        </div>
        <div className="flex full mt-2 justify-between">
          <div className="w-1/2">
            <label>Email:</label>
          </div>
          <div className="w-1/2">
            <p>{fabricData?.email}</p>
          </div>
        </div>
      </div>
    );
  };

  const userAccess = () => {
    return (
      <div>
        {fabricData?.userData?.map((user: any, index: any) => (
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
              <li>View Fabric</li>
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
                    `/settings/processor-registration/edit-processor?id=${id}&type=Fabric`
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
              title={"Fabric Details"}
              content={fabricDetails()}
              firstSign={<FaAngleDown color="white" />}
              secondSign={<FaAngleRight color="white" />}
            />
            <Accordian
              title={"Fabric Details"}
              content={fabricInformation()}
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
