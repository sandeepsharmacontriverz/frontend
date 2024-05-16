"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";
import DataTable from "react-data-table-component";
import API from "@lib/Api";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

export default function page() {
  useTitle("Transaction Summary");

  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
      const access = checkAccess("Knitter Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await API.get(`knitter-process/get-sale?salesId=${id}`);
      if (res.success) {
        setData([res.data]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const columns: any = [
    {
      name: <p className="text-[13px] font-medium">Date </p>,
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Sold To</p>,
      selector: (row: any) =>
        row.buyer?.name
          ? row.buyer?.name
          : row.processor_name
          ? row.processor_name
          : row.dyingwashing?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Order Refernce</p>,
      selector: (row: any) => row.garment_order_ref,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Brand Order Refernce</p>,
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Finished Batch/Lot No </p>,
      selector: (row: any) => row.batch_lot_no,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Program </p>,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity </p>,
      selector: (row: any) => row.total_yarn_qty,
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

  if (roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
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
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <Link href="/knitter/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/knitter/sale">Sale</Link>
                  </li>
                  <li>Transaction Summary </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div className="items-center rounded-lg overflow-hidden border border-grey-100">
              <DataTable
                columns={columns}
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
                onClick={() => router.push("/knitter/sale")}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
