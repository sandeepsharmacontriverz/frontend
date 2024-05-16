"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import NavLink from "@components/core/nav-link";
import { useRouter, useSearchParams } from "next/navigation";
import DataTable from "react-data-table-component";
import API from "@lib/Api";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";

export default function page() {
  const router = useRouter();
  useTitle("Transaction Summary");
  const [roleLoading] = useRole();
  const [hasAccess, setHasAccess] = useState<any>({});
  const [data, setData] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Mandi Sale");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    if (id) {
      getTransaction()
    }
  }, [id])

  const getTransaction = async () => {
    try {
      const response = await API.get(`mandi-process/sales/get-mandi-sale?id=${id}`
      );

      if (response.success) {
        setData([response.data.mandi]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Sold To</p>,
      selector: (row: any) => row.buyerdata?.name,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">No of Bags</p>,
      selector: (row: any) => row.no_of_bags,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Bag Lot</p>,
      selector: (row: any) => row.lot_no,
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">Press No</p>,
      selector: (row: any) => row.bag_press_no
      ,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Total Weight</p>,
      selector: (row: any) => row.total_qty,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Status</p>,
      cell: (row: any) => (
        <div
          style={{
            color: "red",
          }}
        >
          {row.status}
        </div>
      ),
      wrap: true
    },
  ];

  if (roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !hasAccess.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.create) {
    return (
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li className="active">
                    <NavLink href="/mandi/dashboard">
                      <span className="icon-home"></span>
                    </NavLink>
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
                data={data}
              />
            </div>

            <div className="pt-8 w-100 d-flex justify-end  customButtonGroup">
              <button
                className="btn-purple mr-2"
                onClick={() => router.push("/mandi/sales")}
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
