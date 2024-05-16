"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import { BiFilterAlt, BiUpload } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import BarChart from "@components/charts/BarChart";
import Accordian from "@components/core/Accordian";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import ConfirmPopup from "@components/core/ConfirmPopup";
import { GrAttachment } from "react-icons/gr";

interface TransItem {
  totalBales: string;
  totalQuantity: any;
  program: {
    id: number;
    program_name: string;
    program_status: boolean;
  };
}
export default function page() {
  useTitle("Dashboard");
  const millId = User.MillId;
  const [roleLoading, hasAccess] = useRole();
  const { translations } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);
  const [dataAlert, setDataAlert] = useState<any>([]);
  const [chartDataSeed, setChartDataSeed] = useState([]);
  const [chartDataLint, setChartDataLint] = useState([]);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showFilterList, setShowFilterList] = useState(false);
  const [showFilterAlert, setShowFilterAlert] = useState(false);
  const [searchFilterList, setSearchFilterList] = useState("");
  const [searchFilterAlert, setSearchFilterAlert] = useState("");
  const [program, setProgram] = useState<any>([]);
  const [mandi, setMandi] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>([]);

  const [checkedProgramAlert, setCheckedProgramAlert] = useState<any>([]);
  const [checkedProgramList, setCheckedProgramList] = useState<any>([]);
  const [checkedMandiAlert, setCheckedMandiAlert] = useState<any>([]);
  const [checkedMandiList, setCheckedMandiList] = useState<any>([]);
  const [checkedSeasonAlert, setCheckedSeasonAlert] = useState<any>([]);
  const [checkedSeasonList, setCheckedSeasonList] = useState<any>([]);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>({});
  const [isClear, setIsClear] = useState(false);
  const [isAlertClear, setIsAlertClear] = useState(false);
  const [errors, setErrors] = useState<any>([]);
  const [isConfirm, setIsConfirm] = useState<any>(true);
  const [showFilter, setShowFilter] = useState(false);

  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [dataInvoiceAlert, setDataInvoiceAlert] = useState<Array<string>>([]);
  const [error, setError] = useState<any>()

  const [checkedValues, setCheckedValues] = useState<any>({});

  const [totalQuantity, setTotalQuantity] = useState(0);
  const code = encodeURIComponent(searchQuery);

  const [fileName, setFileName] = useState({
    uploadSample: "",
  });

  const [formData, setFormData] = useState({
    id: null,
    uploadSample: "",
  });

  useEffect(() => {
    if (millId) {
      fetchAlertData();
      fetchTransActionList();
    }
  }, [millId, isClear, isAlertClear]);

  useEffect(() => {
    if (millId) {
      getMillData();
      getProgram();
      getSeason();

    }
  }, [millId]);

  useEffect(() => {
    if (millId) {
      fetchTransActionList();
    }
  }, [searchQuery, page, limit]);

  useEffect(() => {
    const getIds = Object.keys(selectedRows).map(
      (rowId) =>
        selectedRows[rowId] === "accept" || selectedRows[rowId] === "reject"
    );

    if (getIds.length > 0) {
      setIsConfirm(false);
    } else {
      setIsConfirm(true);
    }
  }, [dataAlert, selectedRows]);

  const getMillData = async () => {
    const url = `mill/get-mill?id=${millId}`;
    try {
      const response = await API.get(url);
      if (response?.data?.brand?.length > 0) {
        getMandi(response?.data?.brand);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSeason = async () => {
    const url = "Season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSeasons(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgram = async () => {
    const url = `mill-process/get-program?millId=${millId}`;
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

  const getMandi = async (id: any) => {
    try {
      const res = await API.get(`mandi?brandId=${id}`);
      if (res.success) {
        setMandi(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAlertData = async () => {
    const url = `mill-process/transaction?millId=${millId}&status=Pending&programId=${checkedProgramAlert}&seasonId=${checkedSeasonAlert}&mandiId=${checkedMandiAlert}`;
    try {
      const response = await API.get(url);
      let data = response.data.map((obj: any) => {
        return { ...obj, qtyStock: obj.total_qty };
      });
      setDataAlert(data);
      setCount(response.count);
      const quantity = response?.data?.map((qty: any) => {
        return Number(qty.total_qty) - Number(qty.qty_stock);
      });
      const sum = quantity?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );
      setTotalQuantity(sum);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };
  const fetchTransActionList = async () => {
    const url = `mill-process/transaction?millId=${millId}&status=Sold&search=${code}&programId=${checkedProgramList}&seasonId=${checkedSeasonList}&mandiId=${checkedMandiList}&limit=${limit}&page=${page}&pagination=true`;
    try {
      const response = await API.get(url);
      setDataList(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const handleSelectAllChange = () => {
    setSelectAllChecked(!selectAllChecked);
    const updatedSelectedRows: any = {};

    const newdata = dataAlert?.map((el: any) => {
    if (!selectAllChecked) {
        updatedSelectedRows[el.id] = "accept";
          return  {
              ...el,
              select: true,
              acceptRejectStatus: "accept",
              bags: el?.bags?.map((e: any) => ({
                ...e,
                select: true,
              })),
            }
    }else {
      return  {
        ...el,
        select: false,
        bags: el?.bags?.map((e: any) => ({
          ...e,
          select: false,
        })),
      }
    }
    
    })
    setDataAlert(newdata);
      const isSelectAllChecked = newdata?.every((el: any) => el.select);
      setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
    setSelectedRows(updatedSelectedRows);
  };

  const handleAcceptRejectChange = (row: any, value: any) => {
    // Ensure row is not null or undefined and has an id property
    if (!row || !row.id) {
      console.error("Invalid row object or missing 'id' property.");
      return;
    }
  
    const updatedSelectedRows = { ...selectedRows, [row.id]: value };
    setSelectedRows(updatedSelectedRows);
    setSelectAllChecked(false);
  
    const newdata = dataAlert?.map((el: any) => {
      // Ensure el is not null or undefined and has an id property
      if (!el || !el.id) {
        console.error("Invalid element in dataAlert or missing 'id' property.");
        return el;
      }
  
      if (el.id === row.id) {
        const alreadyExist = el.bags?.some((e: any) => e.select == true);
        return !alreadyExist
          ? {
              ...el,
              select: true,
              acceptRejectStatus: value,
              bags: el.bags?.map((e: any) => ({
                ...e,
                select: true,
              })),
            }
          : {
              ...el,
              select: true,
              acceptRejectStatus: value,
            };
      } else {
        return el;
      }
    });
  
    setDataAlert(newdata);
  
    // Ensure newdata is not null or undefined before using it
    if (newdata) {
      const isSelectAllChecked = newdata.every((el: any) => el.select);
      setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
    }
  };
  

  const handleExport = async () => {
    try {
      const res = await API.get(
        `mill-process/transaction/export?millId=${millId}&pagination=true`
      );
      if (res.success) {
        handleDownload(res.data, "Mill Transaction List", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (id: number, fieldName: string, fieldValue: any) => {
    const updatedData = dataAlert.map((item: any, index: any) => {
      if (index === id) {
        const updatedItem = { ...item, [fieldName]: fieldValue };
        return updatedItem;
      } else {
        return item;
      }
    });
    setDataAlert(updatedData);
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

  const generateInvoice = async (salesId: number, action: string) => {
    if (salesId) {
      try {
        const res = await API.get(
          `mill-process/sales-invoice?salesId=${salesId}`
        );
        if (res.success) {
          // handleDownload(res.data, "Spinner Transaction List", ".xlsx");
          if (action === "view") {
            handleView(res.data.file);
          } else if (action === "download") {
            handleDownloadData(res.data.file, `invoice-${salesId}`);
          }
        }
      } catch (error) { }
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataInvoiceList(rowData);
    setShowInvoiceList(!showInvoiceList);
  };

  const handleToggleAlertFilter = (rowData: Array<string>) => {
    setDataInvoiceAlert(rowData);
    setShowInvoiceAlert(!showInvoiceAlert);
  };

  const dataUpload = async (e: any, name: any, id: any) => {
    const url = "file/upload";
    const allowedFormats = ["application/pdf", "application/doc"];
    const dataVideo = new FormData();
    const updatedErrors = [...errors]; // Use a separate variable for updated errors
    let updated = false 

    if (!e) {
      updatedErrors[id] = "No File Selected";
    } else {
      if (!allowedFormats.includes(e?.type)) {
        updatedErrors[id] = "Invalid file format. Upload a valid format.";
        e = "";
        updated = true
      }

      const maxFileSize = 5 * 1024 * 1024;

      if (e.size > maxFileSize) {
        updatedErrors[id] = "File size exceeds the maximum limit (5MB).";
        e = "";
        updated = true
      }
    }

    setErrors(updatedErrors);
    if(updated){
      return;
    }
    dataVideo.append("file", e);

    try {
      const response = await API.postFile(url, dataVideo);
      if (response.success) {
        setFileName((prevFile: any) => ({
          ...prevFile,
          [name]: e.name,
        }));
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          id: id,
          [name]: response.data,
        }));
        if (e.name) {
          setShowUploadPopup(true);
        }

        updatedErrors[id] = ""; // Clear any previous error
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const uploadSampleFile = async () => {
    const url = "mill-process/transaction";

    const response = await API.put(url, formData);
    if (response.success) {
      setShowUploadPopup(false);
      fetchTransActionList();
    }
  }

  const UploadPopup = ({ showModal, setShowModal }: any) => {
    return (
      <>
        {showModal ? (
          <>
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div
                className="fixed inset-0 w-full h-full bg-black opacity-40"
                onClick={() => setShowModal(false)}
              ></div>
              <div className="flex items-center min-h-screen px-4 py-8">
                <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
                  <div className="mt-3">
                    <div className="flex items-center justify-center flex-none w-24 h-24 mx-auto bg-red-100 rounded-full">
                      <BiUpload size={50} color="green" />


                    </div>
                    <div className="mt-2 text-center sm:ml-4">
                      <h4 className="text-2xl font-medium text-gray-800">
                        Selected File: {fileName.uploadSample}
                      </h4>
                      Click on Upload Button to upload this File.
                      <div className="mt-4">
                        <button
                          className="btn-purple px-10"
                          onClick={() => {
                            uploadSampleFile()
                          }
                          }
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </>
    );
  }



  const DocumentPopup = ({
    openFilter,
    dataInvoice,
    dataInvList,
    onClose,
    type,
  }: any) => {
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
                onClick={() =>
                  handleDownloadData(row, "Rice-Traceability|Invoice File")
                }
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
                    onClick={() =>
                      type === "List"
                        ? setShowInvoiceList(!showInvoiceList)
                        : setShowInvoiceAlert(!showInvoiceAlert)
                    }
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
                          data={type === "List" ? dataInvList : dataInvoice}
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

  const columnList = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      wrap: true,
      selector: (row: any) => row.date.substring(0, 10),
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      wrap: true,
      selector: (row: any) => row.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Mandi Name</p>,
      wrap: true,
      selector: (row: any) => row.mandi?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      wrap: true,
      selector: (row: any) => row.invoice_no,
    },
    {
      name: <p className="text-[13px] font-medium">No of Bags </p>,
      wrap: true,
      width: 'auto',
      selector: (row: any) => row?.bags?.length ?? 0,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Bag Lot No</p>,
      wrap: true,
      selector: (row: any) => row.lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">REEL Lot No</p>,
      wrap: true,
      selector: (row: any) => row.reel_lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity (Kgs)</p>,
      wrap: true,
      width: '120px',
      selector: (row: any) => row.qty_stock,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      wrap: true,
      center: true,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      center: true,
      selector: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via trader</p>,
      wrap: true,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      wrap: true,
      center: true,
      selector: (row: any) =>
        row.transaction_agent ? row.transaction_agent : "NA",
    },
    {
      name: <p className="text-[13px] font-medium">Invoice</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          <span>{row.invoice_no}</span>
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Tc File</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          {row.tc_file && (
            <>
              <FaEye
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleView(row.tc_file)}
              />
              <FaDownload
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row.tc_file, "Tc File")}
              />
            </>
          )}
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          {row.contract_file && (
            <>
              <FaEye
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleView(row.contract_file)}
              />
              <FaDownload
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() =>
                  handleDownloadData(row.contract_file, "Contract Files")
                }
              />
            </>
          )}
        </>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.InVoiceFiles}
        </p>
      ),
      center: true,
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
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          {row.delivery_notes && (
            <>
              <FaEye
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleView(row.delivery_notes)}
              />
              <FaDownload
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() =>
                  handleDownloadData(row.delivery_notes, "Delivery Notes")
                }
              />
            </>
          )}
        </>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface?.qrCode}
        </p>
      ),
      wrap: true,
      center: true,
      cell: (row: any) => (
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
    {
      name: <p className="text-[13px] font-medium">Upload Sample Results</p>,
      wrap: true,
      width: "180px",
      center: true,
      cell: (row: any, index: any) => (
        <>
          {
            row.upload_sample ? (
           <div className="flex gap-2">
                <FaEye
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer"
                  onClick={() => handleView(row.upload_sample)}
                />
                <FaDownload
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer"
                  onClick={() =>
                    handleDownloadData(row.upload_sample, "upload_sample")
                  }
                />
              </div>
            ) : (
              <div className=" flex-col">
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      type="file"
                      name="uploadSample"
                      accept=".pdf, .doc, .docx"
                      onChange={(e) =>
                        dataUpload(e?.target?.files?.[0],
                          "uploadSample",
                          row.id
                        )
                      }
                    />
                  </label>
                </div>
                {errors[row.id] && (
                  <div className="text-sm text-red-500">{errors[row.id]}</div>
                )}
              </div>
            )
          }
        </>
      )
    },
  ];


  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const newdata = dataAlert.map((el: any) => {
      if (el.id === index) {
        const updatedBags = el?.bags?.map((bag: any) => {
          if (bag.id === id.id) {
            return {
              ...bag,
              select: isChecked,
            };
          }
          return bag;
        });
        const areAllChildRowsChecked = updatedBags.every(
          (bag: any) => bag.select
        );

        return {
          ...el,
          select: areAllChildRowsChecked ? isChecked : false,
          bags: updatedBags,
        };
      }
      return el;
    });

    setDataAlert(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };
  const coulumnsAlert: any = () => [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      width: "70px",
      cell: (row: any, index: any) => index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      wrap: true,
      selector: (row: any) => row.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Mandi Name</p>,
      wrap: true,
      selector: (row: any) => row.mandi?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      wrap: true,
      selector: (row: any) => (
        <span
          className="text-black hover:text-blue-600 cursor-pointer mr-2"
          onClick={() => handleToggleAlertFilter(row?.invoice_file)}
        >
          {" "}
          {row.invoice_no}
        </span>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">No of Bags</p>,
      selector: (row: any) => row?.bags?.length ?? 0,
    },
    {
      name: <p className="text-[13px] font-medium">Bag Lot No</p>,
      wrap: true,
      selector: (row: any) => row.lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">REEL Lot No</p>,
      wrap: true,
      selector: (row: any) => row.reel_lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity (Kgs) </p>,
      wrap: true,
      selector: (row: any) => Number(row.total_qty) - Number(row.qty_stock) ,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      wrap: true,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      selector: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via trader</p>,
      wrap: true,
      cell: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      selector: (row: any) => row.transaction_agent || "NA",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface?.qrCode}
        </p>
      ),
      center: true,
      cell: (row: any) => (
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
    // {
    //   name: (
    //     <p className="text-[13px] font-medium">
    //       {translations?.common?.InVoiceFiles}
    //     </p>
    //   ),
    //   center: true,
    //   cell: (row: any) =>
    //     row?.invoice_file &&
    //     row?.invoice_file.length > 0 && (
    //       <>
    //         <FaEye
    //           size={18}
    //           className="text-black hover:text-blue-600 cursor-pointer mr-2"
    //           onClick={() => handleToggleAlertFilter(row?.invoice_file)}
    //           title="Click to View All Files"
    //         />
    //       </>
    //     ),
    // },
    {
      name: (
        <div className="flex justify-between ">
          {" "}
          <input
            name="view"
            type="checkbox"
            className="mr-2"
            onChange={handleSelectAllChange}
            checked={selectAllChecked}
          />
          <p className="text-[13px] font-medium">Accept All</p>
        </div>
      ),

      cell: (row: any) => (
        <div className="flex justify-between flex-wrap gap-2">
          <label>
            <input
              type="radio"
              name={`acceptReject_${row.id}`}
              value="accept"
              checked={selectedRows[row.id] === "accept"}
              onChange={() => handleAcceptRejectChange(row, "accept")}
              className="mr-2"
            />
            Accept
          </label>
          <label>
            <input
              type="radio"
              name={`acceptReject_${row.id}`}
              value="reject"
              checked={selectedRows[row.id] === "reject"}
              onChange={() => handleAcceptRejectChange(row, "reject")}
              className="mr-2"
            />
            Reject
          </label>
        </div>
      ),
      sortable: false,
      width: "180px",
    },
  ];

  const searchDataList = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePageList = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleChangeList = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "season") {
      if (checkedSeasonList.includes(itemId)) {
        setCheckedSeasonList(
          checkedSeasonList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasonList([...checkedSeasonList, itemId]);
      }
    } else if (name === "program") {
      if (checkedProgramList.includes(itemId)) {
        setCheckedProgramList(
          checkedProgramList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgramList, itemId]);
      }
    } else if (name === "mandi") {
      if (checkedMandiList.includes(itemId)) {
        setCheckedMandiList(
          checkedMandiList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedMandiList([...checkedMandiList, itemId]);
      }
    }
  };
  const handleChangeAlert = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "season") {
      if (checkedSeasonAlert.includes(itemId)) {
        setCheckedSeasonAlert(
          checkedSeasonAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasonAlert([...checkedSeasonAlert, itemId]);
      }
    } else if (name === "program") {
      if (checkedProgramAlert.includes(itemId)) {
        setCheckedProgramAlert(
          checkedProgramAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramAlert([...checkedProgramAlert, itemId]);
      }
    } else if (name === "mandi") {
      if (checkedMandiAlert.includes(itemId)) {
        setCheckedMandiAlert(
          checkedMandiAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedMandiAlert([...checkedMandiAlert, itemId]);
      }
    }
  };
  const clearFilterList = () => {
    setCheckedProgramList([]);
    setCheckedMandiList([]);
    setCheckedSeasonList([]);
    setSearchQuery("");
    setIsClear(!isClear);
  };
  const clearFilterAlert = () => {
    setCheckedProgramAlert([]);
    setCheckedMandiAlert([]);
    setCheckedSeasonAlert([]);
    setIsAlertClear(!isAlertClear);
  };

  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilterList(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

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
                  onClick={() => setShowFilterList(!showFilterList)}
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
                          Seasons
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasonList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "season"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "season"
                            );
                          }}
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Mandi
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={mandi?.filter((item: any) =>
                            checkedMandiList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "mandi"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "mandi"
                            )
                          }
                          options={mandi}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedProgramList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          options={program}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchTransActionList();
                            setShowFilterList(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilterList();
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

  const FilterPopupAlert = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilterAlert(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

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
                  onClick={() => setShowFilterAlert(!showFilterAlert)}
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
                          Seasons
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasonAlert.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "season"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "season"
                            );
                          }}
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Mandi
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={mandi?.filter((item: any) =>
                            checkedMandiAlert.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "mandi"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "mandi"
                            )
                          }
                          options={mandi}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedProgramAlert.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          options={program}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchAlertData();
                            setShowFilterAlert(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilterAlert();
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

  const handleConfirmActions = async () => {
    try {
      const acceptedRowIds = dataAlert.filter(
        (rowId:any) => rowId.acceptRejectStatus === "accept"
      );
      const rejectedRowIds = dataAlert.filter(
        (rowId:any) => rowId.acceptRejectStatus === "reject"
      );
      const acceptedUpdateRequests = acceptedRowIds
        .map((rowId:any) => {
          const matchingItem = dataAlert.find((item: any) => item.id == rowId.id);
          const selectedBags = matchingItem.bags.filter((row:any) => row.select === true);
          if (matchingItem) {
            return {
              id: Number(rowId.id),
              status: "Sold",
              qtyStock: selectedBags.reduce((total:any, bag:any) => +total + +bag.weight, 0),
              bags : matchingItem.bags.filter(
                (rowId:any) => rowId.select == true
              )
            };
          }
          return null;
        })
        .filter((item:any) => item !== null);

      const rejectedUpdateRequests = rejectedRowIds
      .map((rowId:any) => {
        const matchingItem = dataAlert.find((item: any) => item.id == rowId.id);
        const selectedBags = matchingItem.bags.filter((row:any) => row.select === true);
        if (matchingItem) {
          return {
            id: Number(rowId.id),
            status: "Rejected",
            qtyStock: selectedBags.reduce((total:any, bag:any) => +total + +bag.weight, 0),
            bags : matchingItem.bags.filter(
              (rowId:any) => rowId.select == true
            )
          };
        }
        return null;
      })
      .filter((item:any) => item !== null);

      const updateRequests = [
        ...acceptedUpdateRequests,
        ...rejectedUpdateRequests,
      ];

      const url = "mill-process/transaction";
      const dataToSend = {
        items: updateRequests,
      };

      const response = await API.put(url, dataToSend);

      if (response.success) {
        const updatedDataAlert = dataAlert.filter(
          (row: any) =>
            !acceptedRowIds.includes(row.id) && !rejectedRowIds.includes(row.id)
        );
        setDataAlert(updatedDataAlert);
        setShowConfirmPopup(!showConfirmPopup);
        setSelectedRows({});
        setSelectAllChecked(false);

        const acceptedRows = dataAlert.filter((row: any) =>
          acceptedRowIds.includes(row.id)
        );
        const rejectedRows = dataAlert.filter((row: any) =>
          rejectedRowIds.includes(row.id)
        );
        const updatedDataList = [...dataList, ...acceptedRows, ...rejectedRows];
        setDataList(updatedDataList);

        fetchAlertData();
        fetchTransActionList();
      } else {
        console.error("Failed to update statuses");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!roleLoading && !hasAccess?.processor?.includes("Mill")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor?.includes("Mill")) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/mill/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        {/* <div className="w-100">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-6 mt-4">
              <Accordian
                title={"Cotton Bales"}
                content={
                  <BarChart
                    title="Cotton Bales"
                    data={chartDataSeed}
                    type={"column"}
                  />
                }
              />
            </div>
            <div className="col-12 col-sm-12 col-md-6 mt-4">
              <Accordian
                title={"Yarn Inventory"}
                content={
                  <BarChart
                    title="Yarn Inventory"
                    data={chartDataLint}
                    type={"bar"}
                  />
                }
              />
            </div>
          </div>
        </div>

        <hr className="my-6" /> */}

        <div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
                  <div className="pt-6">
                    <div className="py-6">
                      <h4 className="text-xl font-semibold">
                        TRANSACTION ALERT
                      </h4>
                    </div>

                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="fliterBtn">
                          <button
                            className="flex"
                            type="button"
                            onClick={() => setShowFilterAlert(!showFilterAlert)}
                          >
                            FILTERS <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopupAlert
                              openFilter={showFilterAlert}
                              onClose={!showFilterAlert}
                            />
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center mr-5 text-[14px] font-medium">
                        Total Quantity: {totalQuantity}
                      </label>
                    </div>
                    <DocumentPopup
                      openFilter={showInvoiceAlert}
                      dataInvoice={dataInvoiceAlert}
                      type="Alert"
                      onClose={() => setShowInvoiceAlert(false)}
                    />

                    <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                      <DataTable
                        columns={coulumnsAlert()}
                        data={dataAlert}
                        persistTableHead
                        noDataComponent={
                          <p className="py-3 font-bold text-lg">
                            {translations?.common?.Nodata}
                          </p>
                        }
                        expandableRows={true}
                        expandableRowExpanded={(row) =>
                          row?.bags?.some((data: any) => data.select === true)
                        }
                        // expandableRowExpanded={((row) => row?.select === true)}
                        expandableRowsComponent={({
                          data: tableData,
                        }: {
                          data: any;
                        }) => {
                          return (
                            <ExpandedComponent
                              data={dataAlert}
                              id={tableData?.id}
                              error={error}
                              setError={setError}
                              setData={setDataAlert}
                              checkedValues={checkedValues}
                              onChildCheckboxChange={handleChildCheckboxChange}
                            />
                          );
                        }}
                      />
                    </div>



                    <div className="flex justify-end mt-4">
                      <button
                        className="btn-purple"
                        disabled={isConfirm}
                        style={
                          isConfirm
                            ? { cursor: "not-allowed", opacity: 0.8 }
                            : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        onClick={handleConfirmActions}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <hr className="my-6" />

                  <div className="py-6">
                    <h4 className="text-xl font-semibold">TRANSACTION LIST</h4>
                  </div>
                  {/* search */}
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={searchDataList}
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
                          onClick={() => setShowFilterList(!showFilterList)}
                        >
                          FILTERS <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupList
                            openFilter={showFilterList}
                            onClose={!showFilterList}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="search-filter-right">
                      <button
                        className="py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                        onClick={handleExport}
                      >
                        Export All
                      </button>
                    </div>
                  </div>
                  <DocumentPopup
                    openFilter={showInvoiceList}
                    dataInvList={dataInvoiceList}
                    type="List"
                    onClose={() => setShowInvoiceList(false)}
                  />

                  <ConfirmPopup
                    showModal={showConfirmPopup}
                    setShowModal={setShowConfirmPopup}
                  />

                  <CommonDataTable
                    columns={columnList}
                    count={count}
                    data={dataList}
                    updateData={updatePageList}
                  />

                  <UploadPopup
                    showModal={showUploadPopup}
                    setShowModal={setShowUploadPopup}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}


const ExpandedComponent: React.FC<{
  data: any;
  id: number;
  error: any,
  setError: any,
  setData: any;

  checkedValues: any;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, checkedValues, onChildCheckboxChange, setData, error, setError, }) => {

  const handleChildCheckboxChange = (
    item: any,
    isChecked: boolean,
    index: any
  ) => {
    onChildCheckboxChange(item, isChecked, index);
  };

  return (
    <div className="flex" style={{ padding: "20px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              SR NO
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              BAG NO
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              BAG WEIGHT
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              QR CODE
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Select
            </th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((e: any) => e.id === id)
            .map((item: any, index: any) => {
              return (
                <React.Fragment key={index}>
                  {item.bags.map((bagData: any, baleIndex: any) => (
                    <tr key={baleIndex}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {baleIndex + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.bag_no}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.weight}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        <div className="h-16 flex">
                          <img
                            className=""
                            src={process.env.NEXT_PUBLIC_API_URL + "file/" + bagData?.qr}
                          />

                          <button
                            className=""
                            onClick={() =>
                              handleDownload(
                                process.env.NEXT_PUBLIC_API_URL + "file/" + bagData.qr,
                                "QR",
                                ".png"
                              )
                            }
                          >
                            <FaDownload size={18} color="black" />
                          </button>
                        </div>

                      </td>


                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        <input
                          type="checkbox"
                          name={bagData.id}
                          checked={bagData.select || false}
                          onChange={(e) =>
                            handleChildCheckboxChange(
                              bagData,
                              e.target.checked,
                              id
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};