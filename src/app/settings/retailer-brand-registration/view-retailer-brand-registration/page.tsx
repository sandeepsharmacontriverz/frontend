"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import Accordian from "@components/core/Accordian";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import API from "@lib/Api";
import Link from "@components/core/nav-link";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import Image from "next/image";

export default function page() {
  useTitle("View Retailer & Brand");
  const [roleLoading] = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<any>();

  useEffect(() => {
    if (id) getBrandData();
  }, [id]);

  const getBrandData = async () => {
    const res = await API.get(`brand/${id}`);
    if (res.success) {
      setData(res.data);
    }
  };
  const brandDetails = () => {
    return (
      <div className="text-xs px-3  font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.brand_name}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Address:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.address}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Website:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.website}</p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Contact Person Name:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.contact_person}</p>
          </div>
        </div>
      </div>
    )
  }

  const brandInformation = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Participating Programs:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {data?.programs &&
                data.programs
                  .map((name: any) => name.program_name)
                  .join(", ")}
            </p>
          </div>
        </div>
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mapped Countries:</p>
          </div>
          <div className="w-1/2">
            <p className="">
              {data?.countries &&
                data.countries
                  .map((name: any) => name.county_name)
                  .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Company Information:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.company_info}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Organisation Logo:</p>
          </div>
          <div className="w-1/2">
            <img
              src={data?.logo ? data.logo : '/images/image-placeholder.png'}
              alt="Organisation Logo"
              className="w-[150px] h-[150px]"
            />

          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Organisation Photo:</p>
          </div>
          <div className="w-1/2">
            <img
              src={data?.photo ? data.photo : '/images/image-placeholder.png'}
              alt="Organisation Logo"
              className="w-[150px] h-[150px]"
            />
          </div>
        </div>
      </div>
    )
  }

  const contactDetails = () => {
    return (
      <div className="text-xs px-3 font-bold">
        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Mobile No:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.mobile}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Landline No:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.landline}</p>
          </div>
        </div>

        <div className="flex mt-1">
          <div className="w-1/2">
            <p>Email:</p>
          </div>
          <div className="w-1/2">
            <p className="">{data?.email}</p>
          </div>
        </div>
      </div>
    )
  }

  const userAccess = () => {
    return (
      <div>
        {data?.userData?.map((user: any, index: number) => {
          return (
            <div key={user.id} className="text-xs px-3  font-bold">
              <div className="text-sm my-3">User {index + 1}</div>
              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Name:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user.firstname + " " + user.lastname}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Username:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user.username}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Position:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user.position}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Role:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.user_role?.user_role}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Email:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Mobile:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.mobile}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Status:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.status ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Ticket Approve Access:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.ticketApproveAccess ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Ticket Country Access:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.ticketCountryAccess?.map((country: any) => {
                      const matchedCountry = data?.countries &&
                        data.countries.find((item: any) => item.id === Number(country));
                      return matchedCountry ? matchedCountry.county_name : null;
                    }).filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex mt-1">
                <div className="w-1/2">
                  <p>Ticket Approve Access Only:</p>
                </div>
                <div className="w-1/2">
                  <p className="">
                    {user?.ticketApproveOnly ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  if (roleLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Settings</li>
              <li>
                <Link href="/settings/retailer-brand-registration">Retailer & Brand Registration</Link>
              </li>
              <li>View Retailer & Brand</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className="flex justify-end gap-1 search-filter-right customButtonGroup buttotn560Fix">


          <button className="btn btn-all btn-purple" onClick={() => router.push(`/settings/retailer-brand-registration/edit-retailer-brand-registration?id=${data?.id}`)}>
            Edit
          </button>
          <button className="btn-outline-purple"
            onClick={() => router.back()}>
            Back
          </button>
        </div>
        <div className="w-full">
          <div className="lg:flex w-full gap-4 md:w-full sm:w-full">
            <Accordian title={'Retailer & Brand Details'} content={brandDetails()} firstSign={<FaAngleDown color='white' />} secondSign={<FaAngleRight color='white' />} />

            <Accordian title={'Retailer & Brand Details'} content={brandInformation()} firstSign={<FaAngleDown color='white' />} secondSign={<FaAngleRight color='white' />} />

          </div>
          <div className="lg:flex w-full gap-4 md:w-full sm:w-full">
            <Accordian title={'Contact Details'} content={contactDetails()} firstSign={<FaAngleDown color='white' />} secondSign={<FaAngleRight color='white' />} />
            <Accordian title={'User Access'} content={userAccess()} firstSign={<FaAngleDown color='white' />} secondSign={<FaAngleRight color='white' />} />
          </div>
        </div>

      </div>
    </>
  );
}
