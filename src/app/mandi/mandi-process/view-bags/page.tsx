"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect } from "react";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { useSearchParams } from "next/navigation";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";

export default function Page() {
  useTitle("View Bags");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const search = useSearchParams();
  const id = search.get("id");

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const { translations, loading } = useTranslations();
  const [isApiLoaded, setIsApiLoaded] = useState(true);

  useEffect(() => {
    fetchBaleProcesses();
    setIsClient(true);
  }, []);

  const fetchBaleProcesses = async () => {
    try {
      const res = await API.get(`mandi-process/fetch-bag?processId=${id}`);
      if (res.success) {
        setData(res.data);
        setIsApiLoaded(false)
      }
    } catch (error) {
      setIsApiLoaded(false)
      console.log(error);
    }
  };



  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
      cell: (row: any, index: any) => index + 1,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Bag No</p>),
      selector: (row: any) => row.bag_no,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations?.mandiInterface?.weight}</p>),
      selector: (row: any) => row.weight,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q1</p>),

      selector: (row: any) => row.Q1,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q2</p>),
      selector: (row: any) => row.Q2,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q3</p>),
      selector: (row: any) => row.Q3,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q4</p>),
      selector: (row: any) => row.Q4,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q5</p>),
      selector: (row: any) => row.Q5,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q6</p>),
      selector: (row: any) => row.Q6,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">Q7</p>),
      selector: (row: any) => row.Q7,
      sortable: false,
    },
    
    {
      name: (<p className="text-[13px] font-medium"> {translations?.mandiInterface?.qrCode} </p>),
      cell: (row: any) => (
        <>
          <img
            className=" w-20 h-16"
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
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !hasAccess?.processor.includes("Mandi")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor.includes("Mandi")) {
    return (
      <div className="">
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href="/mandi/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li><Link href="/mandi/mandi-process">Process</Link></li>
                    <li>View Bags</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="search-bars">
                          <label className="text-md font-bold">
                          Bag Lot No:
                          </label>{" "}
                          <span className="text-sm">
                            {data ? data[0]?.mandiprocess?.lot_no : ""}
                          </span>
                        </div>
                      </div>
                      <div className="customButtonGroup">
                        <button
                          className="btn-outline-purple"
                          onClick={() => router.push("/mandi/mandi-process")}
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                    <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                      <DataTable
                        persistTableHead
                        fixedHeader={true}
                        progressPending={isApiLoaded}
                        progressComponent={<div className="h-48 flex items-center" ><Loader height={"10px"} /></div>}

                        noDataComponent={
                          <p className="py-3 font-bold text-lg">
                            No data available in table
                          </p>
                        }
                        fixedHeaderScrollHeight="auto"
                        paginationServer
                        columns={columns}
                        data={data}
                        sortServer
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}
