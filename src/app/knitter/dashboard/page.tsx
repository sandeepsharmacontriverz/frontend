"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import CommonDataTable from "@components/core/Table";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import ConfirmPopup from "@components/core/ConfirmPopup";
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';

interface TransItem {
  totalPurchased: string;
  totalQuantity: string;
  totalQuantityStock: string;
  program: {
    id: number;
    program_name: string;
    program_status: boolean;
  };
}
export default function page() {
  useTitle("DashBoard");
  const [roleLoading, hasAccess] = useRole();
  const { translations } = useTranslations();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);
  const [dataAlert, setDataAlert] = useState([]);
  const [chartDataSeed, setChartDataSeed] = useState([]);
  const [chartDataLint, setChartDataLint] = useState([]);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilterList, setShowFilterList] = useState(false);
  const [showFilterAlert, setShowFilterAlert] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [seasons, setSeasons] = useState<any>([])
  const [checkedSpinnerAlert, setCheckedSpinnerAlert] = useState<any>([]);
  const [checkedSpinnerList, setCheckedSpinnerList] = useState<any>([]);

  const [checkedProgramAlert, setCheckedProgramAlert] = useState<any>([]);
  const [checkedProgarmList, setCheckedProgramList] = useState<any>([]);

  const [checkedSeasonAlert, setCheckedSeasonAlert] = useState<any>([]);
  const [checkedSeasonList, setCheckedSeasonList] = useState<any>([]);

  const [checkedInvoicenoAlert, setCheckedInvoiceAlert] = useState<any>([]);
  const [checkedInvoiceList, setCheckedInvoiceList] = useState<any>([]);

  const [checkedSpinLotNoAlert, setCheckedSpinLotNoAlert] = useState<any>([]);
  const [checkedSpinLotList, setcheckedSpinLotList] = useState<any>([]);

  const [checkedYarnCountAlert, setCheckedYarnCountAlert] = useState<any>([]);
  const [checkedYarnCountList, setCheckedYarnCountList] = useState<any>([]);

  const [checkedYArnTypeAlert, setCheckedYarnTypeAlert] = useState<any>([]);
  const [checkedYarnTypeList, setCheckedYarnTypeList] = useState<any>([]);

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [selectedRows, setSelectedRows] = useState<any>({});
  const [spinnerDataAlert, setSpinnerDataAlert] = useState<any>([]);
  const [spinnerDataList, setSpinnerDataList] = useState<any>([]);

  const [invoiceDataAlert, setinvoiceDataAlert] = useState<any>([]);
  const [invoiceDataList, setinvoiceDataList] = useState<any>([]);

  const [yarnTypeAlert, setyarnTypeAlert] = useState<any>([]);
  const [yarnTypeList, setyarnTypeList] = useState<any>([]);

  const [yarnCountAlert, setYarnCountAlert] = useState<any>([]);
  const [yarnCountList, setYarnCountList] = useState<any>([]);

  const [dependentDataAlert, setDependentDataAlert] = useState<any>([]);
  const [dependentDataList, setDependentDataList] = useState<any>([]);

  const [yarnChart, setYarnChart] = useState<any>([]);
  const [lintCotton, setLintCotton] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [program, setProgram] = useState([]);
  const [isConfirm, setIsConfirm] = useState<any>(false);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [dataInvoiceAlert, setDataInvoiceAlert] = useState<Array<string>>([]);
  const [knitterYarn, setKnitterYarn] = useState<any>();
  const [knitterFabric, setKnitterFabric] = useState<any>();

  const [totalWeight, setTotalWeight] = useState(0);

  const code = encodeURIComponent(searchQuery);
  const knitterId = User.ThirdPartyInspectionId;

  
  useEffect(() => {
    const atLeastOneSelected =
      Object.values(selectedRows).some(
        (value) => value === "accept" || value === "reject"
      ) || selectAllChecked;
    setIsConfirm(atLeastOneSelected);
  }, [selectedRows, selectAllChecked]);

  useEffect(() => {
    if (knitterId) {
      getSpinnerDataAlert();
      getSpinnerDataList();
      // fetchYarnchartData();
      // fetchLintchartData();
      fetchChartDataLint();
    }
  }, [knitterId]);

  useEffect(() => {
    if (knitterId) {
      fetchAlertData();
    }
  }, [isClear, knitterId]);

  useEffect(() => {
    if (knitterId) {
      fetchTransActionList();
      getProgram();
      getSeasons()
    }
  }, [searchQuery, page, limit, isClear, knitterId]);

  useEffect(() => {
    if (checkedSpinnerAlert.length > 0) {
      getDependentDataAlert();
    } else {
      setinvoiceDataAlert([]);
      setYarnCountAlert([]);
      setyarnTypeAlert([]);
      setCheckedInvoiceAlert([]);
      setCheckedSpinLotNoAlert([]);
      setCheckedYarnCountAlert([]);
      setCheckedYarnTypeAlert([]);
    }
  }, [checkedSpinnerAlert]);

  useEffect(() => {
    if (checkedSpinnerList.length > 0) {
      getDependentDataList();
    } else {
      setinvoiceDataList([]);
      setYarnCountList([]);
      setyarnTypeList([]);
      setCheckedInvoiceList([]);
      setcheckedSpinLotList([]);
      setCheckedYarnCountList([]);
      setCheckedYarnTypeList([]);
    }
  }, [checkedSpinnerList]);

  useEffect(()=> {
    const fetchKnitterYarn = async () => {
      try {
        const res = await API.get(`dashboard/processor/knitter/yarn?knitterId=${knitterId}`);
        if (res.success) {
          setKnitterYarn(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    const fetchKnitterFabric = async () => {
      try {
        const res = await API.get(`dashboard/processor/knitter/fabric?knitterId=${knitterId}`);
        if (res.success) {
          setKnitterFabric(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if(knitterId){
      fetchKnitterYarn();
      fetchKnitterFabric();
    }
  }, [knitterId])

  const getSpinnerDataAlert = async () => {
    const url = `knitter-process/get-spinner-trans?knitterId=${knitterId}&status=Pending`;
    try {
      const response = await API.get(url);
      if (response.success) {
        setSpinnerDataAlert(
          response.data.spinner.map((item: any) => item.spinner)
        );
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getSpinnerDataList = async () => {
    const url = `knitter-process/get-spinner-trans?knitterId=${knitterId}&status=Sold`;
    try {
      const response = await API.get(url);
      setSpinnerDataList(
        response.data?.spinner.map((item: any) => item.spinner)
      );
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getProgram = async () => {
    const url = `knitter-process/get-program?knitterId=${knitterId}`;
    try {
      const response = await API.get(url);
      setProgram(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSeasons = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      setSeasons(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getDependentDataList = async () => {
    if (checkedSpinnerList.length > 0) {
      const url = `knitter-process/get-invoice-trans?knitterId=${knitterId}&status=Sold&spinnerId=${checkedSpinnerList}`;
      try {
        const response = await API.get(url);
        setDependentDataList(response.data.spinner);
        setinvoiceDataList(response.data.invoice);
        setYarnCountList(
          response.data?.yarncount?.filter((count: any) => count !== null)
        );

        setyarnTypeList(
          response?.data?.yarn_type?.filter((item: any) => item?.yarn_type !== null && item?.yarn_type !== ""  && item?.yarn_type?.length != 0)
        );
      } catch (error) {
        console.log(error, "error");

      }
    }
  };
  const getDependentDataAlert = async () => {
    if (checkedSpinnerAlert.length > 0) {
      const url = `knitter-process/get-invoice-trans?knitterId=${knitterId}&status=Pending&spinnerId=${checkedSpinnerAlert}`;
      try {
        const response = await API.get(url);
        setDependentDataAlert(response.data.spinner);
        setinvoiceDataAlert(response.data.invoice);
        setYarnCountAlert(
          response.data?.yarncount?.filter((count: any) => count !== null)
        );
        setyarnTypeAlert(
          response?.data?.yarn_type?.filter((item: any) => item?.yarn_type !== null && item?.yarn_type !== "" && item?.yarn_type?.length != 0)
        );
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  const fetchAlertData = async () => {
    const url = `knitter-process/transaction?knitterId=${knitterId}&seasonId=${checkedSeasonAlert}&status=Pending`;
    try {
      const response = await API.get(url);
      setDataAlert(response.data);
      const weight = response.data.map((qty: any) => {
        return Number(qty.total_qty);
      });
      const sum = weight?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );

      setTotalWeight(sum)
    } catch (error) {
      console.log(error, "error");
    }
  };
  const fetchTransActionList = async () => {
    const url = `knitter-process/transaction?knitterId=${knitterId}&seasonId=${checkedSeasonList}&status=Sold&spinnerId=${checkedSpinnerList}&search=${code}&limit=${limit}&page=${page}&pagination=true`

    try {
      const response = await API.get(url);
      setDataList(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const fetchYarnchartData = async () => {
    try {
      const response = await API.get(
        `knitter-process/transaction/count?knitterId=${knitterId}`
      );
      if (response.success) {
        const seedData = response.data.weaver.map((item: TransItem) => ({
          name: item.program.program_name,
          y: parseFloat(item.totalQuantity),
        }));
        setYarnChart(seedData);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchLintchartData = async () => {
    try {
      const response = await API.get(
        `knitter-process/transaction/count?knitterId=${knitterId}`
      );
      if (response.success) {
        const seedData = response.data?.data.map((item: TransItem) => ({
          name: item.program.program_name,
          y: parseFloat(item.totalQuantity),
        }));
        setLintCotton(seedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChartDataLint = async () => {
    try {
      const response = await API.get("ticketing/count?status=Rejected");
      if (response.success) {
        setChartDataLint(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectAllChange = () => {
    setSelectAllChecked(!selectAllChecked);
    const updatedSelectedRows: any = {};

    if (!selectAllChecked) {
      dataAlert.forEach((dataAlert: any) => {
        updatedSelectedRows[dataAlert.id] = "accept";
      });
    }
    setSelectedRows(updatedSelectedRows);
  };
  const handleAcceptRejectChange = (rowId: any, value: any) => {
    const updatedSelectedRows = { ...selectedRows, [rowId]: value };
    setSelectedRows(updatedSelectedRows);
    setSelectAllChecked(false);
  };
  const handleView = (url: string) => {
    window.open(url, "_blank");
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


  const handleToggleFilter = (rowData: Array<string>) => {
    setDataInvoiceList(rowData);
    setShowInvoiceList(!showInvoiceList);
  };

  const handleToggleAlertFilter = (rowData: Array<string>) => {
    setDataInvoiceAlert(rowData);
    setShowInvoiceAlert(!showInvoiceAlert);
  };

  const DocumentPopup = ({ openFilter, dataInvoice, dataInvList, onClose, type }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };

    const columnsArr: any = [
      {
        name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">{translations?.common?.Action}</p>,
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
                onClick={() => handleDownloadData(row, "Cotton-connect|Invoice File")}
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
                  <h3 className="text-lg pb-2">{translations?.common?.InVoiceFiles}</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => type === "List" ? setShowInvoiceList(!showInvoiceList) : setShowInvoiceAlert(!showInvoiceAlert)}
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
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.transactions?.date}</p>,
      cell: (row: any) => row?.date?.substring(0, 10),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      cell: (row: any) => row?.season?.name,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.spinnerName}</p>,
      cell: (row: any) => row?.spinner?.name,
      width: '170px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.orderRefernce}</p>,
      cell: (row: any) => row?.order_ref,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.invoiceNumber}</p>,
      cell: (row: any) => row?.invoice_no,
      sortable: false,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.spinlotNo}</p>,
      cell: (row: any) => row?.batch_lot_no,
      width: '120px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.yarnReellotno}</p>,
      cell: (row: any) => row?.reel_lot_no ? row?.reel_lot_no : 'N/A',
      width: '160px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.yarnType}</p>,
      cell: (row: any) => row?.yarn_type?.map((item:any)=> item)?.join(','),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.yarnCount}</p>,
      cell: (row: any) => row?.yarncount?.map((item:any)=> item.yarnCount_name)?.join(','),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.noOfBoxes}</p>,
      cell: (row: any) => row?.no_of_boxes || 0,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.boxId}</p>,
      cell: (row: any) => row?.box_ids,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.totalWeight}</p>,
      cell: (row: any, index: any) => row?.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.program}</p>,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.transactions?.vehicleNo}</p>,
      cell: (row: any) => row?.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.transactionViatrader}</p>,
      width: "auto",
      cell: (row: any) => (row?.transaction_via_trader === true ? "Yes" : "No"),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.agentDetails}</p>,
      cell: (row: any) => row?.transaction_agent || "NA",
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.tcFiles} </p>,
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
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() => handleDownloadData(row.tc_files, "Tc File")}
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.ContractFiles}</p>,
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
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() =>
                handleDownloadData(row.contract_file, "Contract File")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
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
      name: <p className="text-[13px] font-medium">{translations?.common?.DeliveryNotes} </p>,
      selector: (row: any) => row.delivery_notes,
      cell: (row: any) => {
        return (
          <>
            {row.delivery_notes ? (
              <>
                <FaEye
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer"
                  onClick={() => handleView(row.delivery_notes)}
                />
                <FaDownload
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer ml-2"
                  onClick={() => handleDownloadData(row.delivery_notes, "Delivery Notes")}
                />
              </>
            ) : (
              ""
            )}
          </>
        );
      },
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.mandiInterface?.qrCode} </p>,
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
  ];
  const coulumnsAlert = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.transactions?.date}</p>,
      cell: (row: any) => row?.date?.substring(0, 10),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      cell: (row: any) => row?.season?.name,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.spinnerName}</p>,
      cell: (row: any) => row?.spinner?.name,
      width: '170px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.orderRefernce}</p>,
      cell: (row: any) => row?.order_ref,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.invoiceNumber}</p>,
      cell: (row: any) => row?.invoice_no,
      sortable: false,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.spinlotNo}</p>,
      cell: (row: any) => row?.batch_lot_no,
      width: '120px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.yarnReellotno}</p>,
      cell: (row: any) => row?.reel_lot_no ? row?.reel_lot_no : 'N/A',
      width: '160px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.yarnType}</p>,
      cell: (row: any) => row?.yarn_type?.map((item:any)=> item)?.join(','),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.yarnCount}</p>,
      cell: (row: any) => row?.yarncount?.map((item:any)=> item.yarnCount_name)?.join(','),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.noOfBoxes}</p>,
      cell: (row: any) => row?.no_of_boxes || 0,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.boxId}</p>,
      cell: (row: any) => row?.box_ids,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.totalWeight}</p>,
      cell: (row: any, index: any) => row?.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.program}</p>,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.transactions?.vehicleNo}</p>,
      cell: (row: any) => row?.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.transactionViatrader}</p>,
      width: "auto",
      cell: (row: any) => (row?.transaction_via_trader === true ? "Yes" : "No"),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.agentDetails}</p>,
      cell: (row: any) => row?.transaction_agent || "NA",
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.mandiInterface?.qrCode} </p>,

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
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
      center: true,
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleAlertFilter(row?.invoice_file)}
              title="Click to View All Files"
            />
          </>
        ),
    }, {
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
              onChange={() => handleAcceptRejectChange(row.id, "accept")}
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
              onChange={() => handleAcceptRejectChange(row.id, "reject")}
              className="mr-2"
            />
            Reject
          </label>
        </div>
      ),
      sortable: false,
      width: "180px"
    },

  ];

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
    if (name === "spinner") {
      if (checkedSpinnerList.includes(itemId)) {
        setCheckedSpinnerList(
          checkedSpinnerList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinnerList([...checkedSpinnerList, itemId]);
      }
    } else if (name === "program") {
      if (checkedProgarmList.includes(itemId)) {
        setCheckedProgramList(
          checkedProgarmList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgarmList, itemId]);
      }
    }
    else if (name === "season") {
      if (checkedSeasonList.includes(itemId)) {
        setCheckedSeasonList(
          checkedSeasonList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasonList([...checkedSeasonList, itemId]);
      }
    }
    else if (name === "invoiceno") {
      let itemName = selectedItem?.invoice_no;
      if (checkedInvoiceList.includes(itemName)) {
        setCheckedInvoiceList(
          checkedInvoiceList.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedInvoiceList([...checkedInvoiceList, itemName]);
      }
    } else if (name === "spinlotno") {
      let itemName = selectedItem?.batch_lot_no;

      if (checkedSpinLotList.includes(itemName)) {
        setcheckedSpinLotList(
          checkedSpinLotList.filter((item: any) => item !== itemName)
        );
      } else {
        setcheckedSpinLotList([...checkedSpinLotList, itemName]);
      }
    } else if (name === "yarncount") {
      if (checkedYarnCountList.includes(itemId)) {
        setCheckedYarnCountList(
          checkedYarnCountList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedYarnCountList([...checkedYarnCountList, itemId]);
      }
    } else if (name === "yarntype") {
      let itemName = selectedItem?.yarn_type;
      if (checkedYarnTypeList.includes(itemName)) {
        setCheckedYarnTypeList(
          checkedYarnTypeList.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedYarnTypeList([...checkedYarnTypeList, itemName]);
      }
    }
  };
  const handleChangeAlert = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;

    if (name === "spinner") {
      if (checkedSpinnerAlert.includes(itemId)) {
        setCheckedSpinnerAlert(
          checkedSpinnerAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinnerAlert([...checkedSpinnerAlert, itemId]);
      }
    }
    else if (name === "season") {
      if (checkedSeasonAlert.includes(itemId)) {
        setCheckedSeasonAlert(
          checkedSeasonAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasonAlert([...checkedSeasonAlert, itemId]);
      }
    }
    else if (name === "program") {
      if (checkedProgramAlert.includes(itemId)) {
        setCheckedProgramAlert(
          checkedProgramAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramAlert([...checkedProgramAlert, itemId]);
      }
    } else if (name === "invoiceno") {
      let itemName = selectedItem?.invoice_no;

      if (checkedInvoicenoAlert.includes(itemName)) {
        setCheckedInvoiceAlert(
          checkedInvoicenoAlert.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedInvoiceAlert([...checkedInvoicenoAlert, itemName]);
      }
    } else if (name === "spinlotno") {
      let itemName = selectedItem?.batch_lot_no;

      if (checkedSpinLotNoAlert.includes(itemName)) {
        setCheckedSpinLotNoAlert(
          checkedSpinLotNoAlert.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedSpinLotNoAlert([...checkedSpinLotNoAlert, itemName]);
      }
    } else if (name === "yarncount") {
      if (checkedYarnCountAlert.includes(itemId)) {
        setCheckedYarnCountAlert(
          checkedYarnCountAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedYarnCountAlert([...checkedYarnCountAlert, itemId]);
      }
    } else if (name === "yarntype") {
      let itemName = selectedItem?.yarn_type;

      if (checkedYArnTypeAlert.includes(itemName)) {
        setCheckedYarnTypeAlert(
          checkedYArnTypeAlert.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedYarnTypeAlert([...checkedYArnTypeAlert, itemName]);
      }
    }
  };
  const clearFilterList = () => {
    setCheckedProgramList([]);
    setCheckedSeasonList([])
    setCheckedSpinnerList([]);
    setCheckedInvoiceList([]);
    setCheckedYarnCountList([]);
    setCheckedYarnTypeList([]);
    setcheckedSpinLotList([]);
    setIsClear(!isClear);
  };
  const clearFilterAlert = () => {
    setCheckedSpinnerAlert([]);
    setCheckedInvoiceAlert([]);
    setCheckedSeasonAlert([])
    setCheckedProgramAlert([]);
    setCheckedSpinLotNoAlert([]);
    setCheckedYarnCountAlert([]);
    setCheckedYarnTypeAlert([]);
    setIsClear(!isClear);
  };
  const filterDataList = async () => {
    try {
      const res = await API.get(
        `knitter-process/transaction?knitterId=${knitterId}&status=Sold&seasonId=${checkedSeasonList}&spinnerId=${checkedSpinnerList}&programId=${checkedProgarmList}&yarnType=${checkedYarnTypeList}&yarnCount=${checkedYarnCountList}&lotNo=${checkedSpinLotList}&invoice=${checkedInvoiceList}&pagination=true`
      );

      if (res.success) {
        setDataList(res.data);
        setCount(res.count);
        setShowFilterList(false);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };
  const filterDataAlert = async () => {
    try {
      const res = await API.get(
        `knitter-process/transaction?knitterId=${knitterId}&status=Pending&seasonId=${checkedSeasonAlert}&spinnerId=${checkedSpinnerAlert}&programId=${checkedProgramAlert}&invoice=${checkedInvoicenoAlert}&yarnCount=${checkedYarnCountAlert}&yarnType=${checkedYArnTypeAlert}&limit=${limit}&page=${page}&pagination=true`
      );
      if (res.success) {
        setDataAlert(res.data);
        setShowFilterAlert(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-lg rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations?.common?.Filters}</h3>
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
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectSpinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={spinnerDataList?.filter(
                              (item: any) =>
                                checkedSpinnerList.includes(item?.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "spinner"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "spinner"
                              )
                            }
                            options={spinnerDataList}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={program?.filter((item: any) =>
                              checkedProgarmList.includes(item?.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "program"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "program"
                              )
                            }
                            options={program}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectInvoice}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="invoice_no"
                            selectedValues={invoiceDataList?.filter(
                              (item: any) =>
                                checkedInvoiceList.includes(item.invoice_no)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "invoiceno"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "invoiceno"
                              )
                            }
                            options={invoiceDataList}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectSpinLotNo}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="batch_lot_no"
                            selectedValues={invoiceDataList?.filter(
                              (item: any) =>
                                checkedSpinLotList.includes(item.batch_lot_no)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "spinlotno"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "spinlotno"
                              )
                            }
                            options={invoiceDataList}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectYarnCount}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="yarnCount_name"
                            selectedValues={yarnCountList?.filter((item: any) =>
                              checkedYarnCountList.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "yarncount"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "yarncount"
                              )
                            }
                            options={yarnCountList}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectYarnType}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="yarn_type"
                            selectedValues={yarnTypeList?.filter((item: any) =>
                              checkedYarnTypeList.includes(item?.yarn_type)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "yarntype"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "yarntype"
                              )
                            }
                            options={yarnTypeList}
                            showCheckbox
                          />
                        </div>


                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Season
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasons?.filter((item: any) =>
                              checkedSeasonList.includes(item?.id)
                            )
                            }
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "season"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "season"
                              )
                            }
                            options={seasons}
                            showCheckbox
                          />
                        </div>

                      </div>

                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              filterDataList();
                              setShowFilterList(false);
                            }}
                          >
                            {translations?.common?.ApplyAllFilters}
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={clearFilterList}
                          >
                            {translations?.common?.ClearAllFilters}

                          </button>
                        </section>
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
  const FilterPopupAlert = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-lg rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations?.common?.Filters}</h3>
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
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectSpinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={spinnerDataAlert?.filter(
                              (item: any) =>
                                checkedSpinnerAlert.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "spinner"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "spinner"
                              )
                            }
                            options={spinnerDataAlert}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={program?.filter((item: any) =>
                              checkedProgramAlert.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "program"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "program"
                              )
                            }
                            options={program}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectInvoice}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="invoice_no"
                            selectedValues={invoiceDataAlert?.filter(
                              (item: any) =>
                                checkedInvoicenoAlert.includes(item.invoice_no)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "invoiceno"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "invoiceno"
                              )
                            }
                            options={invoiceDataAlert}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectSpinLotNo}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="batch_lot_no"
                            selectedValues={invoiceDataAlert?.filter(
                              (item: any) =>
                                checkedSpinLotNoAlert.includes(
                                  item.batch_lot_no
                                )
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "spinlotno"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "spinlotno"
                              )
                            }
                            options={invoiceDataAlert}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectYarnCount}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="yarnCount_name"
                            selectedValues={yarnCountAlert?.filter(
                              (item: any) =>
                                checkedYarnCountAlert.includes(item?.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "yarncount"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "yarncount"
                              )
                            }
                            options={yarnCountAlert}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectYarnType}

                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="yarn_type"
                            selectedValues={yarnTypeAlert?.filter((item: any) =>
                              checkedYArnTypeAlert.includes(item?.yarn_type)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "yarntype"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "yarntype"
                              )
                            }
                            options={yarnTypeAlert}
                            showCheckbox
                          />
                        </div>


                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Season
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasons?.filter((item: any) =>
                              checkedSeasonAlert.includes(item?.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "season"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeAlert(
                                selectedList,
                                selectedItem,
                                "season"
                              )
                            }
                            options={seasons}
                            showCheckbox
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              // fetchAlertData();
                              filterDataAlert();
                              setShowFilterAlert(false);
                            }}
                          >
                            {translations?.common?.ApplyAllFilters}
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={clearFilterAlert}
                          >
                            {translations?.common?.ClearAllFilters}
                          </button>
                        </section>
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

  const handleConfirmActions = async () => {
    try {
      const acceptedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "accept"
      );
      const rejectedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "reject"
      );
      const acceptedUpdateRequests = acceptedRowIds.map((rowId) => ({
        id: rowId,
        status: "Sold",
      }));
      const rejectedUpdateRequests = rejectedRowIds.map((rowId) => ({
        id: rowId,
        status: "Rejected",
      }));
      const updateRequests = [
        ...acceptedUpdateRequests,
        ...rejectedUpdateRequests,
      ];

      const url = "knitter-process/transaction";

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
        setShowConfirmPopup(!showConfirmPopup)
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
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const getYarnOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Yarn Total Quantity and Yarn Stock Quantity',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: knitterYarn ? knitterYarn.program : [],
      },
      series: [{
        type: 'column',
        name: "Total Quantity",
        data: knitterYarn ? knitterYarn.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Stock Quantity",
        data: knitterYarn ? knitterYarn.stockQty : [],
        color: '#ff9900'
      }]
    };
  };

  const getFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Inventory',
        align: 'left'
      },
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: knitterFabric ? knitterFabric.program : [],
      },
      series: knitterFabric ? knitterFabric.fabricList : []
    };
  };

  if (!roleLoading && !hasAccess?.processor.includes("Knitter")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor.includes("Knitter")) {
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
                <li>{translations?.sidebar?.dashboard}</li>
              </ul>
            </div>
          </div>
        </div>
        {/* <hr className="my-6"/> */}
        {/* <div>
          <div>
            <div className="flex flex-wrap">
              <div className="w-full sm:w-1/2 mt-5 mb-5">
                <div className="w-full h-full">
                  <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-3 mt-3 mr-3">
                    Yarn
                  </h4>
                  <BarChart title="Yarn" seriesData={yarnChart} type={"column"} />
                  <BarChart
                    title="Yarn"
                    seriesData={[
                      {
                        name: "Yarn",
                        data: yarnChart,
                      },
                    ]}
                    type="column"
                  />
                </div>
              </div>

              <div className="w-full sm:w-1/2 mt-5 mb-5">
                <div className="w-full h-full">
                  <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-3 mt-3 mr-3">
                    Farbric Inventory
                  </h4>
                  <BarChart
                    title="Lint Cotton"
                    seriesData={lintCotton}
                    type={"column"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <hr className="my-6" />
        <div className="columns-2 mt-4">
          <HighChartsReact
            highcharts={ HighCharts }
            options={ getYarnOptions() }
          />
          <HighChartsReact
            highcharts={ HighCharts }
            options={ getFabricOptions() }
          />
        </div>
        <div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
                  <div className="pt-6">
                    <div className="py-6">
                      <h4 className="text-xl font-semibold">
                        {translations?.common?.transactionAlert}
                      </h4>
                    </div>

                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="fliterBtn">
                          <button
                            className="flex"
                            type="button"
                            onClick={() => setShowFilterAlert(!showFilterAlert)}
                          >
                            {translations?.common?.Filters} <BiFilterAlt className="m-1" />
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
                        {translations?.common?.totalWeight}: {totalWeight}
                      </label>
                    </div>
                    <DocumentPopup
                      openFilter={showInvoiceAlert}
                      dataInvoice={dataInvoiceAlert}
                      type='Alert'
                      onClose={() => setShowInvoiceAlert(false)}
                    />
                    <DataTable
                      columns={coulumnsAlert}
                      data={dataAlert}
                      persistTableHead
                      fixedHeader={true}
                      fixedHeaderScrollHeight="auto"
                      noDataComponent={<p className="py-3 font-bold text-lg">{translations?.common?.Nodata}</p>}
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        className="btn-purple"
                        disabled={!isConfirm}
                        style={
                          isConfirm
                            ? { cursor: "pointer", backgroundColor: "#D15E9C" }
                            : { cursor: "not-allowed", opacity: 0.8 }
                        }
                        onClick={handleConfirmActions}
                      >
                        {translations?.common?.Confirm}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <hr className="my-6" />

                  <div className="py-6">
                    <h4 className="text-xl font-semibold">
                      {translations?.common?.transactionList}

                    </h4>
                  </div>

                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder={translations?.common?.search}
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
                          onClick={() => setShowFilterList(!showFilterList)}
                        >
                          {translations?.common?.Filters} <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupList
                            openFilter={showFilterList}
                            onClose={!showFilterList}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DocumentPopup
                    openFilter={showInvoiceList}
                    dataInvList={dataInvoiceList}
                    type='List'
                    onClose={() => setShowInvoiceList(false)}
                  />

                  <ConfirmPopup showModal={showConfirmPopup} setShowModal={setShowConfirmPopup} />

                  <CommonDataTable
                    columns={columnList}
                    count={count}
                    data={dataList}
                    updateData={updatePageList}
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
