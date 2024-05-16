"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import useTranslations from "@hooks/useTranslation";
import DataTable from "react-data-table-component";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";


export default function page() {
  const { translations, loading } = useTranslations();
  useTitle(translations?.common?.embOtherProcessInfo);

  const router = useRouter();
  const [data, setData] = useState<any>([]);
  const [Access, setAccess] = useState<any>({});
  const [roleLoading, hasAccesss] = useRole();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  const fetchData = async () => {
    try {
      const response = await API.get(`garment-sales/embroidering?id=${id}`);
      if (response.success) {
        setData([response.data]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.transactions?.date}</p>,
      selector: (row: any) => row.createdAt?.substring(0, 10),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.ProcessorName}</p>,
      selector: (row: any) => row.processor_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.ProcessorType}</p>,
      selector: (row: any) => row.process_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.RecievedPieces}</p>,
      selector: (row: any) => row.no_of_pieces,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.DeliveredPieces}</p>,
      selector: (row: any) => row.final_no_of_pieces,
    },
  ];

  if (loading) {
    return <Loader />;
  }

  if (!roleLoading && !Access?.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/garment/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/garment/process">{translations?.knitterInterface?.Process}</NavLink>
                </li>
                <li>{translations?.common?.embOtherProcessInfo}</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        <DataTable
          columns={columns}
          data={data}
          persistTableHead
          fixedHeader={true}
          noDataComponent={
            <p className="py-3 font-bold text-lg">{translations?.common?.Nodata}</p>
          }
        />
        <div className="pt-8 w-100 d-flex justify-end  customButtonGroup">
          <button
            className="btn-purple mr-2"
            onClick={() => router.push("/garment/process")}
          >
            {translations?.common?.back}
          </button>
        </div>
        <div></div>
      </>
    );
  }
}
