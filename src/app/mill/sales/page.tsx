"use client";
import React, { useState, useEffect, useRef } from "react";
import NavLink from "@components/core/nav-link";
import { FaDownload, FaEye } from "react-icons/fa";
import { useRouter } from "@lib/router-events";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";

import API from "@lib/Api";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { AiFillDelete } from "react-icons/ai";
import DataTable from "react-data-table-component";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
import Link from "@components/core/nav-link";
import { LuFileEdit } from "react-icons/lu";
import moment from "moment";
import Select from "react-select";


export default function page() {
  useTitle("Mill Sale");
  const [roleLoading, hasAccesss] = useRole();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [Access, setAccess] = useState<any>({});

  const millId = User.MillId;

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [isClear, setIsClear] = useState(false);
  const [showMainFilter, setShowMainFilter] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = useState<any>([]);
  const [checkedBuyerOptions, setCheckedBuyerOptions] = useState<any>([]);
  const [checkedYarnType, setCheckedYarnType] = useState<any>([]);
  const [checkedWeaverId, setCheckedWeaverId] = useState<any>([]);
  const [checkedKnitterId, setCheckedKnitterId] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>();
  const [programs, setProgram] = useState<any>();
  const [yarnType, setYarnType] = useState<any>();
  const [buyerOptions, setBuyerOptions] = useState<any>();
  const [knitters, setKnitters] = useState<any>();
  const [weavers, setWeavers] = useState<any>();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [showUploadedFilter, setShowUploadedFilter] = useState(false);
  const [uploadedDataArray, setUploadedDataArray] = useState<Array<string>>([]);

  const code = encodeURIComponent(searchQuery);

  const [isAdmin, setIsAdmin] = useState<any>(false);
  useEffect(() => {
    const isAdminData: any =
      sessionStorage.getItem("User") && localStorage.getItem("orgToken");
    if (isAdminData?.length > 0) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    getSeasons();
  }, []);

  useEffect(() => {
    if (millId) {
      getPrograms();
      fetchSales();
    }
  }, [millId, searchQuery, page, limit, isClear]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `mill-process/sales?millId=${millId}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${selectedOption === "knitter" ? checkedKnitterId : ""
        }&weaverId=${selectedOption === "weaver" ? checkedWeaverId : ""
        }&type=${selectedOption}&yarnType=${checkedYarnType}&limit=${limit}&page=${page}&search=${code}&pagination=true`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0);
    }
  };

  const getSeasons = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get(
        `mill-process/get-program?millId=${millId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadData = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const fetchExport = async () => {
    try {
      if (millId !== undefined || !millId) {
        const res = await API.get(
          `mill-process/sales/export?millId=${millId}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${selectedOption === "knitter" ? checkedKnitterId : ""
          }&weaverId=${selectedOption === "weaver" ? checkedWeaverId : ""
          }&type=${selectedOption}&yarnType=${checkedYarnType}&limit=${limit}&page=${page}&search=${code}`
        );
        if (res.success) {
          handleDownload(res.data, "Sales Report", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const handleUploadedFiles = (row:any) => {
    setUploadedDataArray(row);
    setShowUploadedFilter(!showUploadedFilter);
  };

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.common?.srNo}
          </p>
        ),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.knitterInterface?.File}
          </p>
        ),
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.common?.Action}
          </p>
        ),
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={() => handleView(row)}
              />
              <FaDownload
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row, "Invoice File")}
              />
            </div>
          </>
        ),
        center: true,
        wrap: true,
      },
    ];

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">
                    {translations?.common?.InVoiceFiles}
                  </h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <DataTable
                          columns={columnsArr}
                          data={dataArray}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={"No data available in table"}
                          fixedHeaderScrollHeight="600px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };


  const UploadedFilesPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    const data = dataArray
    
    const fileUrls = [
       {name:"Analysis Report",value: data.analysis_report,},
       {name:"Contract Basis Employee",value: data.contract_basis_employee,},
       {name:"Daily Packing Report",value: data.daily_packing_report,},
       {name:"Dryer Output",value: data.dryer_output,},
       {name:"Employee On Payroll",value: data.employee_on_payroll,},
       {name:"Entry Quality Analysis",value: data.entry_quality_analysis,},
       {name:"GRN",value: data.grn,},
       {name:"Hodi Katai",value: data.hodi_katai,},
       {name:"In Process",value: data.in_process,},
       {name:"Invoice For Po",value: data.invoice_for_po,},
       {name:"Labour Bill",value: data.labour_bill,},
       {name:"Lease Premises Expenses",value: data.lease_premises_expenses,},
       {name:"Plant Analysis Report",value: data.plant_analysis_report,},
       {name:"Production Schedule",value: data.production_schedule,},
       {name:"Purchase Order",value: data.purchase_order,},
       {name:"Salaried Employee Expenses Frl",value: data.salaried_employee_expenses_frl,},
       {name:"Truck Inward Details",value: data.truck_inward_details},
    ];

    const tableRows = fileUrls.map((url, index) => (
      url.value !=="" &&
      <tr key={index} >
        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
        <td className="border border-gray-300 px-4 py-2 text-sm">File {url.name }</td>
        <td className="border border-gray-300 px-4 py-2 text-sm">
          <div className="flex items-center">
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleView(url.value)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(url.value, `${url.name }`)}
            />
          </div>
        </td>
      </tr>
    ));
    
    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">
                    All Uploaded Files
                  </h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowUploadedFilter(!showUploadedFilter)}
                  >
                    &times;
                  </button>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full rounded-sm border-collapse border border-gray-300">
                  <thead>
                    <tr >
                      <th className="border border-gray-300 px-4 py-2">SR. NO</th>
                      <th className="border border-gray-300 px-4 py-2">File Name</th>
                      <th className="border border-gray-300 px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows}
                  </tbody>
                </table>
              </div>

              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  function formatTime(timeString: any) {
    if (timeString) {
      const [hourString, minute] = timeString?.split(":");
      const hour = +hourString % 24;
      return (hour % 12 || 12) + ":" + minute + (hour < 12 ? "AM" : "PM");
    } else {
      return "";
    }
  }

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };
  const { translations, loading } = useTranslations();
  if (loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "90px",
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Created Date
        </p>
      ),
      cell: (row: any) => row?.createdAt ? dateFormatter(row?.createdAt): "",
      wrap: true,
      width: '120px',
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      width: "120px",
      selector: (row: any) => row?.date ? dateFormatter(row?.date): '',
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      width: "100px",
      selector: (row: any) => row.season?.name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.milllotNo}
        </p>
      ),
      selector: (row: any) => row.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.qualityParameter.reelLotNumber}
        </p>
      ),
      width: "150px",
      // selector: (row: any) => row.reel_lot_no,
      selector: (row: any) => (
        // <Link
        //   href={`/mill/mill-process/view-tracing?reelLotNo=${row?.reel_lot_no}`}
        //   className="hover:text-blue-600 text-blue-500"
        // >
          row?.reel_lot_no
        // </Link>
      ),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Rice Type
        </p>
      ),
      selector: (row: any) => row?.ricetype?.map((item:any)=> item.riceType_name)?.join(','),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Rice Variety
        </p>
      ),
      selector: (row: any) => row?.riceVariety?.map((item:any)=> item.variety_name)?.join(','),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          No of Containers
        </p>
      ),
      selector: (row: any) => row.no_of_containers,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Container Name
        </p>
      ),
      selector: (row: any) => row.containers?.map((item:any)=> item.container_name)?.join(','),
      wrap: true,
      width: '160px'
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Container No
        </p>
      ),
      selector: (row: any) => row.containers?.map((item:any)=> item.container_no)?.join(','),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Container Weight
        </p>
      ),
      selector: (row: any) => row.containers?.map((item:any)=> item.container_weight)?.join(','),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Buyer Name</p>,
      width: "180px",
      selector: (row: any) => row.buyer_id ? row.containermanagement?.name :  row.processor_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Invoice No
        </p>
      ),
      selector: (row: any) => row.invoice_no,
    },
    {
      name: <p className="text-[13px] font-medium">Total Weight(Kgs)</p>,
      wrap: true,
      selector: (row: any) => row.total_qty,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.program}
        </p>
      ),
      selector: (row: any) => row.program?.program_name,
    },
    ,
    {
      name: <p className="text-[13px] font-medium"> Price / kg </p>,
      cell: (row: any) => row.price,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      selector: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via Trader</p>,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      wrap: true,
      selector: (row: any) => row.transaction_agent,
    },
    {
      name: <p className="text-[13px] font-medium">Dispatch Date</p>,
      width: "120px",
      selector: (row: any) => row?.dispatch_date ? dateFormatter(row?.dispatch_date) : '',
    },
    {
      name: <p className="text-[13px] font-medium">Fumigation Date</p>,
      width: "120px",
      selector: (row: any) => row?.dispatch_date ? dateFormatter(row?.fumigation_date) : '',
    },
    {
      name: <p className="text-[13px] font-medium">Fumigation Time</p>,
      width: "120px",
      cell: (row: any) =>
        row.fumigation_time ? formatTime(row.fumigation_time) : ''
    },
    {
      name: <p className="text-[13px] font-medium"> Total Fumigation Chemical Used </p>,
      wrap: true,
      selector: (row: any) => row.fumigation_total_chemical_used,
    },
    {
      name: <p className="text-[13px] font-medium"> Total Fumigation Quantity </p>,
      wrap: true,
      selector: (row: any) => row.fumigation_total_qty,
    },
    {
      name: <p className="text-[13px] font-medium"> Fumigation Chemical Details </p>,
      wrap: true,
      selector: (row: any) => row.fumigation_chemicals_details,
    },
    {
      name: <p className="text-[13px] font-medium"> Fumigation Invoice File </p>,
      width: '160px',
      cell: (row: any) =>
        row.fumigation_chemical_invoice && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.fumigation_chemical_invoice)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.fumigation_chemical_invoice, "Fumigation Chemical Invoice")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Quality Document</p>,
      cell: (row: any) =>
        row.quality_doc && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.quality_doc)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.quality_doc, "Quality Document")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">TC File</p>,
      center: true,
      cell: (row: any) =>
        row.tc_files && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.tc_files)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(row.tc_files, "Tc File")}
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      center: true,
      cell: (row: any) =>
        row.contract_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.contract_file)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.contract_file, "Contract File")
              }
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.InVoiceFiles}
        </p>
      ),
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.invoice_file)}
              title="Click to View All Files"
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium">Delivery Notes</p>,
      center: true,
      cell: (row: any) =>
        row.delivery_notes && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.delivery_notes)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.delivery_notes, "Delivery Notes")
              }
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium">View Uploaded Files</p>,
      center: true,
      cell: (row: any) =>
        row.status !== "To be Submitted" && (
          <>
          <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleUploadedFiles(row)}
              title="Click to View All Files"
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium">Status</p>,
      cell: (row: any) =>
        row.status === "To be Submitted" && Access.create ? (
          <button
            onClick={() =>
              router.push(`/mill/sales/mill-submitted?id=${row.id}`)
            }
            className="bg-yellow-500 px-1 py-1 rounded text-white "
          >
            {row.status}
          </button>
        ) : (
          row.status
        ),
      width: "120px",
    },
    {
      name: translations.mandiInterface.qrCode,
      cell: (row: any) =>
        row?.qr && (
          <>
            <img
              className=""
              src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
            />

            <button
              className=""
              onClick={() =>
                handleDownload(
                  process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                  "QR",
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
    //   isAdmin && {
    //     name: (
    //       <p className="text-[13px] font-medium">
    //         {translations.common.action}
    //       </p>
    //     ),
    //     cell: (row: any) =>
    //       row.status === "Sold" ? (
    //         ""
    //       ) : (
    //         <>
    //           <button
    //             onClick={() => handleDelete(row.id)}
    //             className="bg-red-500 p-2 ml-3 rounded"
    //           >
    //             <AiFillDelete size={18} color="white" />
    //           </button>
    //         </>
    //       ),
    //     ignoreRowClick: true,
    //     allowOverflow: true,
    //   },
    // ].filter(Boolean);
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.action}</p>
      ),
      cell: (row: any) => (
        <>
          {/* <button
            className="bg-green-500 p-2 rounded"
            onClick={() =>
              router.push(`/mill/sales/edit-mill-sale?id=${row.id}`)
            }
          >
            <LuFileEdit size={18} color="white" />
          </button> */}
          {isAdmin && (
            <>
              {row.status !== "Sold" && (
                <button
                  onClick={() => handleDelete(row.id)}
                  className="bg-red-500 p-2 ml-3 rounded"
                >
                  <AiFillDelete size={18} color="white" />
                </button>
              )}
            </>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ].filter(Boolean);

  const clearFilter = () => {
    setCheckedPrograms([]);
    setCheckedSeasons([]);
    setCheckedKnitterId([]);
    setCheckedWeaverId([]);
    setCheckedYarnType([]);
    setCheckedBuyerOptions([]);
    setSelectedOption("");
    setIsClear(!isClear);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "programs") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "yarnType") {
      if (checkedYarnType.includes(selectedItem?.name)) {
        setCheckedYarnType(
          checkedYarnType.filter((item: any) => item !== selectedItem?.name)
        );
      } else {
        setCheckedYarnType([...checkedYarnType, selectedItem?.name]);
      }
    } else if (name === "knitter") {
      if (checkedKnitterId.includes(itemId)) {
        setCheckedKnitterId(
          checkedKnitterId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedKnitterId([...checkedKnitterId, itemId]);
      }
    } else if (name === "weaver") {
      if (checkedWeaverId.includes(itemId)) {
        setCheckedWeaverId(
          checkedWeaverId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedWeaverId([...checkedWeaverId, itemId]);
      }
    }
  };

  // const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = event.target;
  //   setSelectedOption(value);
  // };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
                <button
                  className="text-[20px]"
                  onClick={() => setShowMainFilter(!showMainFilter)}
                >
                  &times;
                </button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "seasons");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "seasons")
                          }
                          options={seasons}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={programs?.filter((item: any) =>
                            checkedPrograms.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "programs"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "programs"
                            );
                          }}
                          options={programs}
                          showCheckbox
                        />
                      </div>
                      {/* <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Yarn Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={yarnType?.filter((item: any) =>
                            checkedYarnType.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "yarnType"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "yarnType")
                          }
                          options={yarnType}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6  mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Buyer
                        </label>

                        <Select
                          name="buyer"
                          value={selectedOption ? { label: selectedOption, value: selectedOption } : null}
                          menuShouldScrollIntoView={false}
                          placeholder="Select Buyer"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={[
                            { label: "Knitter", value: "knitter" },
                            { label: "Weaver", value: "weaver" },

                          ]}
                          onChange={(item: any) => {
                            setSelectedOption(item?.value);
                          }}
                        />
                      </div>

                      {selectedOption === "knitter" && (
                        <div className="col-12 col-md-6 col-lg-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Buyer Name
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={knitters?.filter((item: any) =>
                              checkedKnitterId.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "knitter"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "knitter"
                              )
                            }
                            options={knitters}
                            showCheckbox
                          />
                        </div>
                      )}

                      {selectedOption === "weaver" && (
                        <div className="col-12 col-md-6 col-lg-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Buyer Name
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={weavers?.filter((item: any) =>
                              checkedWeaverId.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "weaver"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "weaver")
                            }
                            options={weavers}
                            showCheckbox
                          />
                        </div>
                      )} */}
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchSales();
                            setShowMainFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilter();
                          }}
                        >
                          CLEAR ALL FILTERS
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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

  if (!roleLoading && Access.view) {
    return (
      <div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "mill-process/sales";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully");
                    fetchSales();
                  } else {
                    toasterError(response.error.code, 5000, deleteItemId);
                  }
                } catch (error) {
                  toasterError("An error occurred");
                }
                setShowDeleteConfirmation(false);
                setDeleteItemId(null);
              }
            }}
            onCancel={handleCancel}
          />
        )}
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/mill/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Sale</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth w-100">
                {/* search */}
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search "
                          value={searchQuery}
                          onChange={searchData}
                        />
                        <button type="submit" className="search-btn">
                          <span className="icon-search"></span>
                        </button>
                      </form>
                    </div>

                    <div className="fliterBtn">
                      <button
                        className="flex"
                        type="button"
                        onClick={() => setShowMainFilter(!showMainFilter)}
                      >
                        FILTERS <BiFilterAlt className="m-1" />
                      </button>

                      <div className="relative">
                        <FilterPopup
                          openFilter={showMainFilter}
                          onClose={!showMainFilter}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-x-4">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
                    >
                      Sales Report
                    </button>
                    {Access.create && (
                      <button
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push("/mill/sales/add-mill-sale")
                        }
                      >
                        New Sale
                      </button>
                    )}
                  </div>
                </div>

                <DocumentPopup
                  openFilter={showFilter}
                  dataArray={dataArray}
                  onClose={() => setShowFilter(false)}
                />

              <UploadedFilesPopup
                  openFilter={showUploadedFilter}
                  dataArray={uploadedDataArray}
                  onClose={() => setShowUploadedFilter(false)}
                />

                <CommonDataTable
                  columns={columns}
                  count={count}
                  data={data}
                  updateData={updatePage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
