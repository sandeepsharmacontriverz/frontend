"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import { useSearchParams } from "next/navigation";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import { handleDownload } from "@components/core/Download";
import { FaDownload } from "react-icons/fa";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import useTranslations from "@hooks/useTranslation";

export default function page() {
  useTitle("Transaction Summary");
  const [roleLoading, hasAccesss] = useRole();
  const { loading } = useTranslations();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any[]>([]);
  const [Access, setAccess] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  const fetchData = async () => {
    try {
      const response = await API.get(`garment-sales/get-sale?id=${id}`);
      if (response.success) {
        setData([response.data]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const columns: any = [
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Brand/ Retailer Name</p>,
      selector: (row: any) =>
        row.buyer?.brand_name ? row.buyer?.brand_name : row.garment?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium"> Fabric Order Reference No</p>
      ),
      selector: (row: any) => row.fabric_order_ref,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium"> Brand Order Reference No</p>
      ),
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Style/Mark No</p>,
      selector: (row: any) => row.style_mark_no.join(", "),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Type</p>,
      selector: (row: any) => row.garment_type.join(", "),
      wrap: true,
    },
    // {
    //   name: (
    //     <p className="text-[13px] font-medium">Total Fabric Length (Woven)</p>
    //   ),
    //   selector: (row: any) => row.total_fabric_length,
    //   wrap: true,
    // },
    // {
    //   name: (
    //     <p className="text-[13px] font-medium">Total Fabric Weight (Knitted)</p>
    //   ),
    //   selector: (row: any) => row.total_fabric_weight,
    //   wrap: true,
    // },

    {
      name: <p className="text-[13px] font-medium"> Total No of Pieces</p>,
      selector: (row: any) => row.total_no_of_pieces,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total No of Boxes</p>,
      selector: (row: any) => row.total_no_of_boxes,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">QR Code</p>,
      cell: (row: any) => (
        <div className="h-16 flex">
          <img
            className=""
            src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
          />

          <button
            className=""
            onClick={() =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                "qr",
                ".png"
              )
            }
          >
            <FaDownload size={18} color="black" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">Status </p>,
      wrap: true,
      selector: (row: any) => (
        <span
          style={{
            color: "red",
          }}
        >
          {row.status}
        </span>
      ),
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
                <li>
                  <NavLink href="/garment/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/garment/sales">Sale</NavLink>
                </li>
                <li>Transaction Summary</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="items-center rounded-lg overflow-hidden border border-grey-100">
            <DataTable
              columns={columns}
              persistTableHead={true}
              data={data}
              noDataComponent={
                <p className="py-3 font-bold text-lg">
                  No data available in table
                </p>
              }
            />
          </div>

          <div className="pt-8 w-100 d-flex justify-end  customButtonGroup">
            <button
              className="btn-purple mr-2"
              onClick={() => router.push("/garment/sales")}
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  }
}
