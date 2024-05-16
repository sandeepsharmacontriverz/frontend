"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import DataTable from "react-data-table-component";
import API from "@lib/Api";
import useTranslations from "@hooks/useTranslation";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
export default function page() {
  const [roleLoading,hasAccess] = useRole();
  const { translations, loading } = useTranslations();
  useTitle(translations?.knitterInterface?.DyeingInfo);
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any>([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
      const access = checkAccess("Knitter Process");
      if (access) setAccess(access);
    }
  }, [roleLoading,hasAccess]);

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await API.get(`weaver-process/get-dyeing?id=${id}`)
      if (response.success) {
        setData([response.data]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations?.transactions?.date} </p>),
      selector: (row: any) => row.createdAt?.substring(0, 10),
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.ProcessorName} </p>),
      selector: (row: any) => row.processor_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.ProcessorType} </p>),
      selector: (row: any) => row.process_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.ReceFabWeight} </p>),
      selector: (row: any) => row.yarn_delivered,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.DeliFabWeight}</p>),
      selector: (row: any) => row.net_yarn,
    },
  ];

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  
  if (!roleLoading && Access?.view) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/knitter/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li><Link href="/knitter/process">{translations?.knitterInterface?.Process}</Link></li>
                <li>{translations?.knitterInterface?.DyeingInfo}</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        <DataTable columns={columns} data={data} noDataComponent={<p className="py-3 font-bold text-lg">No data available in table</p>}
          persistTableHead fixedHeader={true} />
        <div className="pt-8 w-100 d-flex justify-end  customButtonGroup">
          <button
            className="btn-purple mr-2"
            onClick={() => router.push("/knitter/process")}
          >
            {translations?.common?.goBack}
          </button>
        </div>

      </>
    );
  }
}
