"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import { FaDownload, FaEye } from "react-icons/fa";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import CommonDataTable from "@components/core/Table";
import ChartsGrouped from "@components/charts/ChartsGrouped";
import Accordian from "@components/core/Accordian";
import { handleDownload } from "@components/core/Download";
import API from "@lib/Api";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import ConfirmPopup from "@components/core/ConfirmPopup";
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';


export default function page() {
  useTitle("DashBoard");
  const [roleLoading, hasAccess] = useRole();
  const { translations } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);
  const [dataAlert, setDataAlert] = useState<any>([]);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [graphYarnData, setGraphYarnData] = useState<any>([]);
  const [graphData, setGraphData] = useState<any>([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showFilterList, setShowFilterList] = useState(false);
  const [showFilterAlert, setShowFilterAlert] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [program, setProgram] = useState<any>([]);
  const [weaverYarn, setWeaverYarn] = useState<any>();
  const [weaverFabric, setWeaverFabric] = useState<any>();

  const [alertFilter, setAlertFilters] = useState<any>({
    spinner: [],
    invoiceNo: [],
    lotNo: [],
    yarnCount: [],
    yarnType: [],
  });

  const [listFilter, setListFilter] = useState<any>({
    spinner: [],
    invoiceNo: [],
    lotNo: [],
    yarnCount: [],
    yarnType: [],
  });

  const [checkedProgramAlert, setCheckedProgramAlert] = useState<any>([]);
  const [checkedSpinnerAlert, setCheckedSpinnerAlert] = useState<any>([]);
  const [checkedInvoiceAlert, setCheckedInvoiceAlert] = useState<any>([]);
  const [checkedSpinLotAlert, setCheckedSpinLotAlert] = useState<any>([]);
  const [checkedYarnCountAlert, setCheckedYarnCountAlert] = useState<any>([]);
  const [checkedYarnTypeAlert, setCheckedYarnTypeAlert] = useState<any>([]);

  const [checkedProgramList, setCheckedProgramList] = useState<any>([]);
  const [checkedSpinnerList, setCheckedSpinnerList] = useState<any>([]);
  const [checkedInvoiceList, setCheckedInvoiceList] = useState<any>([]);
  const [checkedSpinLotList, setCheckedSpinLotList] = useState<any>([]);
  const [checkedYarnCountList, setCheckedYarnCountList] = useState<any>([]);
  const [checkedYarnTypeList, setCheckedYarnTypeList] = useState<any>([]);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>({});
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [dataInvoiceAlert, setDataInvoiceAlert] = useState<Array<string>>([]);

  const [isConfirm, setIsConfirm] = useState<any>(true);
  const [isClear, setIsClear] = useState(false);
  const [isAlertClear, setIsAlertClear] = useState(false);
  const code = encodeURIComponent(searchQuery);
  const weaverId = User.LabId;

  useEffect(() => {
    if (weaverId) {
      fetchAlertData();
      // getYarnChart()
      // getDashboardData()
    }
  }, [weaverId, isAlertClear]);

  useEffect(() => {
    if (weaverId) {
      fetchTransActionList();
    }
  }, [weaverId, page, searchQuery, limit, isClear]);

  useEffect(() => {
    const getIds = Object.keys(selectedRows).map(
      (rowId) =>
        selectedRows[rowId] === "accept" || selectedRows[rowId] === "reject"
    );
    if (getIds?.length > 0) {
      setIsConfirm(false);
    } else {
      setIsConfirm(true);
    }
  }, [selectedRows]);

  useEffect(() => {
    const fetchWeaverYarn = async () => {
      try {
        const res = await API.get(`dashboard/processor/weaver/yarn?weaverId=${weaverId}`);
        if (res.success) {
          setWeaverYarn(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchWeaverFabric = async () => {
      try {
        const res = await API.get(`dashboard/processor/weaver/fabric?weaverId=${weaverId}`);
        if (res.success) {
          setWeaverFabric(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if(weaverId){
      fetchWeaverYarn();
      fetchWeaverFabric();
    }
  }, [weaverId]);

  const fetchAlertData = async () => {
    const url = `weaver-process/transaction?weaverId=${ weaverId }&status=Pending&spinnerId=${ checkedSpinnerAlert }&programId=${ checkedProgramAlert }&invoice=${ checkedInvoiceAlert }&lotNo=${ checkedSpinLotAlert }&yarnType=${ checkedYarnTypeAlert }&yarnCount=${ checkedYarnCountAlert }`;
    try {
      const response = await API.get(url);
      let data = response.data.map((obj: any) => {
        return { ...obj, qtyStock: obj.total_qty };
      });
      setDataAlert(data);
      const weight = response?.data?.map((qty: any) => {
        return Number(qty.total_qty);
      });
      const sum = weight?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );
      setTotalWeight(sum);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTransActionList = async () => {
    const url = `weaver-process/transaction?weaverId=${ weaverId }&status=Sold&search=${ code }&limit=${ limit }&page=${ page }&spinnerId=${ checkedSpinnerList }&programId=${ checkedProgramList }&invoice=${ checkedInvoiceList }&lotNo=${ checkedSpinLotList }&yarnType=${ checkedYarnTypeList }&yarnCount=${ checkedYarnCountList }&pagination=true`;
    try {
      const response = await API.get(url);
      setDataList(response.data);
      setCount(response.count);
    } catch (error) {
      setCount(0);
    }
  };

  // const getDashboardData = async () => {
  //     const url = `weaver-process/transaction/count?weaverId=${weaverId}`;
  //     try {
  //         const result = await API.get(url);
  //         setGraphData(result.data?.data)
  //     } catch (error) {
  //         console.log(error, "error");
  //     }
  // }

  // const series = graphData?.map((item: any) => {
  //     return {
  //         type: "column",
  //         name: item.fabric?.fabricType_name,
  //         data: [
  //             parseFloat(item.total),
  //         ],
  //     };
  // })

  // const getYarnChart = async () => {
  //     const url = `weaver-process/transaction/count?weaverId=${weaverId}`;
  //     try {
  //         const result = await API.get(url);
  //         setGraphYarnData(result.data?.weaver)
  //     } catch (error) {
  //         console.log(error, "error");
  //     }
  // }
  // const seriesYarn = [
  //     {
  //         type: "column",
  //         name: ['Total Quantity'],
  //         data: [graphYarnData ? parseFloat(graphYarnData[0]?.totalQuantity) : []],
  //     },
  //     {
  //         type: "column",
  //         name: ['Stock Quantity'],
  //         data: [graphYarnData ? parseFloat(graphYarnData[0]?.totalQuantityStock) : []],
  //     }
  // ]

  const handleSelectAllChange = () => {
    setSelectAllChecked(!selectAllChecked);
    const updatedSelectedRows: any = {};

    if (!selectAllChecked) {
      dataAlert?.forEach((dataAlert: any) => {
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

  useEffect(() => {
    if (weaverId) {
      getProgram();
      getSpinners();
    }
  }, [weaverId]);

  useEffect(() => {
    if (checkedSpinnerAlert?.length > 0) {
      getFilterData();
    } else {
      setAlertFilters((prevFormData: any) => ({
        ...prevFormData,
        invoiceNo: [],
        lotNo: [],
        yarnCount: [],
        yarnType: [],
      }));
    }
  }, [checkedSpinnerAlert]);

  useEffect(() => {
    if (checkedSpinnerList?.length > 0) {
      getFilterData();
    } else {
      setListFilter((prevFormData: any) => ({
        ...prevFormData,
        invoiceNo: [],
        lotNo: [],
        yarnCount: [],
        yarnType: [],
      }));
    }
  }, [checkedSpinnerList]);

  const getProgram = async () => {
    const url = `weaver-process/get-program?weaverId=${ weaverId }`;
    try {
      const response = await API.get(url);
      if (response?.success) {
        const res = response?.data;
        setProgram(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSpinners = async () => {
    try {
      const res = await API.get(
        `weaver-process/get-spinner-trans?weaverId=${ weaverId }&status=Pending`
      );
      if (res.success) {
        const data = res?.data?.map((item: any) => {
          return item?.spinner;
        });
        setAlertFilters((prevFormData: any) => ({
          ...prevFormData,
          spinner: data,
        }));
      }
      const resList = await API.get(
        `weaver-process/get-spinner-trans?weaverId=${ weaverId }&status=Sold`
      );
      if (resList.success) {
        const data = resList?.data?.map((item: any) => {
          return item?.spinner;
        });
        setListFilter((prevFormData: any) => ({
          ...prevFormData,
          spinner: data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterData = async () => {
    try {
      if (checkedSpinnerAlert.length > 0) {
        const res = await API.get(
          `weaver-process/get-invoice-trans?weaverId=${ weaverId }&status=Pending&spinnerId=${ checkedSpinnerAlert }`
        );
        if (res.success) {
          const lotNo = res?.data?.invoice;
          setAlertFilters((prevFormData: any) => ({
            ...prevFormData,
            spinLotNo: lotNo,
            invoiceNo: lotNo,
          }));

          const yarn = res?.data?.yarn_type?.filter((item: any) => item.yarn_type !== null && item.yarn_type !== "" && item.yarn_type.length != 0)
          setAlertFilters((prevFormData: any) => ({
            ...prevFormData,
            yarnType: yarn,
          }));

          const yarncount = res.data?.yarncount?.filter((count: any) => count !== null)
          setAlertFilters((prevFormData: any) => ({
            ...prevFormData,
            yarnCount: yarncount,
          }));
        }
      }

      if (checkedSpinnerList.length > 0) {
        const res = await API.get(
          `weaver-process/get-invoice-trans?weaverId=${ weaverId }&status=Sold&spinnerId=${ checkedSpinnerList }`
        );
        if (res.success) {
          const lotNo = res?.data?.invoice;
          setListFilter((prevFormData: any) => ({
            ...prevFormData,
            spinLotNo: lotNo,
            invoiceNo: lotNo,
          }));

          const yarn = res?.data?.yarn_type?.filter((item: any) => item.yarn_type !== null && item.yarn_type !== ""  && item.yarn_type?.length != 0)
          setListFilter((prevFormData: any) => ({
            ...prevFormData,
            yarnType: yarn,
          }));

          const yarncount = res.data?.yarncount?.filter((count: any) => count !== null)
          setListFilter((prevFormData: any) => ({
            ...prevFormData,
            yarnCount: yarncount,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
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
        name: <p className="text-[13px] font-medium">{ translations?.common?.srNo }</p>,
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.File }</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">{ translations?.common?.Action }</p>,
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={ 18 }
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={ () => handleView(row) }
              />
              <FaDownload
                size={ 18 }
                className="text-black  hover:text-blue-600 cursor-pointer"
                onClick={ () => handleDownloadData(row, "Cotton-connect|Invoice File") }
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
        { openFilter && (
          <>
            <div
              ref={ popupRef }
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{ translations?.common?.InVoiceFiles }</h3>
                  <button
                    className="text-[20px]"
                    onClick={ () => type === "List" ? setShowInvoiceList(!showInvoiceList) : setShowInvoiceAlert(!showInvoiceAlert) }
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <DataTable
                          columns={ columnsArr }
                          data={ type === "List" ? dataInvList : dataInvoice }
                          persistTableHead
                          fixedHeader={ true }
                          noDataComponent={ "No data available in table" }
                          fixedHeaderScrollHeight="600px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) }
      </div>
    );
  };
  const columnList = [
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.srNo }</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.date }</p>,
      cell: (row: any) => row?.date?.substring(0, 10),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.spinnerName }</p>,
      cell: (row: any) => row?.spinner?.name,
      width: '170px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.orderRefernce }</p>,
      cell: (row: any) => row?.order_ref,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.invoiceNumber }</p>,
      cell: (row: any) => row?.invoice_no,
      sortable: false,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.spinlotNo }</p>,
      cell: (row: any) => row?.batch_lot_no,
      width: '120px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.yarnReellotno }</p>,
      cell: (row: any) => row?.reel_lot_no,
      width: '160px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.yarnType }</p>,
      cell: (row: any) => row?.yarn_type?.map((item:any)=> item)?.join(','),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.yarnCount }</p>,
      cell: (row: any) => row?.yarncount?.map((item:any)=> item.yarnCount_name)?.join(','),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.noOfBoxes }</p>,
      cell: (row: any) => row?.no_of_boxes || 0,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.boxId }</p>,
      cell: (row: any) => row?.box_ids,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.totalWeight }</p>,
      cell: (row: any, index: any) => row?.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.program }</p>,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.vehicleNo }</p>,
      cell: (row: any) => row?.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.transactionViatrader }</p>,
      width: "auto",
      cell: (row: any) => (row?.transaction_via_trader === true ? "Yes" : "No"),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.agentDetails }</p>,
      cell: (row: any) => row?.transaction_agent || "NA",
    },
    {
      name: <p className="text-[13px] font-medium">TC File</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          { row?.tc_file && (
            <>
              <FaEye
                size={ 18 }
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={ () => handleView(row?.tc_file) }
              />
              <FaDownload
                size={ 18 }
                className="text-black ml-3 hover:text-blue-600 cursor-pointer"
                onClick={ () => handleDownloadData(row?.tc_file, "TcFile") }
              />
            </>
          ) }
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          { row?.contract_file && (
            <>
              <FaEye
                size={ 18 }
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={ () => handleView(row?.contract_file) }
              />
              <FaDownload
                size={ 18 }
                className="text-black ml-3 hover:text-blue-600 cursor-pointer"
                onClick={ () =>
                  handleDownloadData(row?.contract_file, "Contract_File")
                }
              />
            </>
          ) }
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.InVoiceFiles }</p>,
      center: true,
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={ () => handleToggleFilter(row?.invoice_file) }
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
          { row?.delivery_notes && (
            <>
              <FaEye
                size={ 18 }
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={ () => handleView(row?.delivery_notes) }
              />
              <FaDownload
                size={ 18 }
                className="text-black ml-3 hover:text-blue-600 cursor-pointer"
                onClick={ () =>
                  handleDownloadData(row?.delivery_notes, "DeliverNotes")
                }
              />
            </>
          ) }
        </>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          { translations?.mandiInterface?.qrCode }
        </p>
      ),
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          <img
            className=""
            src={ process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr }
          />

          <button
            className=""
            onClick={ () =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr,
                "QR",
                ".png"
              )
            }
          >
            <FaDownload size={ 18 } color="black" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const coulumnsAlert = [
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.srNo }</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.date }</p>,
      cell: (row: any) => row?.date?.substring(0, 10),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.spinnerName }</p>,
      cell: (row: any) => row?.spinner?.name,
      width: '170px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.orderRefernce }</p>,
      cell: (row: any) => row?.order_ref,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.invoiceNumber }</p>,
      cell: (row: any) => row?.invoice_no,
      sortable: false,
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.spinlotNo }</p>,
      cell: (row: any) => row?.batch_lot_no,
      width: '120px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.yarnReellotno }</p>,
      cell: (row: any) => row?.reel_lot_no,
      width: '160px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.yarnType }</p>,
      cell: (row: any) => row?.yarn_type?.map((item:any)=> item)?.join(','),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.yarnCount }</p>,
      cell: (row: any) => row?.yarncount?.map((item:any)=> item.yarnCount_name)?.join(','),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.noOfBoxes }</p>,
      cell: (row: any) => row?.no_of_boxes || 0,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.millInterface?.boxId }</p>,
      cell: (row: any) => row?.box_ids,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.totalWeight }</p>,
      cell: (row: any, index: any) => row?.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.program }</p>,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.vehicleNo }</p>,
      cell: (row: any) => row?.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.transactionViatrader }</p>,
      width: "auto",
      cell: (row: any) => (row?.transaction_via_trader === true ? "Yes" : "No"),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.agentDetails }</p>,
      cell: (row: any) => row?.transaction_agent || "NA",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          { translations?.mandiInterface?.qrCode }
        </p>
      ),
      center: true,
      cell: (row: any) => (
        <>
          <img
            className=""
            src={ process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr }
          />

          <button
            className=""
            onClick={ () =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr,
                "QR",
                ".png"
              )
            }
          >
            <FaDownload size={ 18 } color="black" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.InVoiceFiles }</p>,
      center: true,
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={ () => handleToggleAlertFilter(row?.invoice_file) }
              title="Click to View All Files"
            />
          </>
        ),
    },
    {
      name: (
        <div className="flex justify-between ">
          { " " }
          <input
            name="view"
            type="checkbox"
            className="mr-2"
            onChange={ handleSelectAllChange }
            checked={ selectAllChecked }
          />
          Accept All{ " " }
        </div>
      ),

      cell: (row: any) => (
        <div className="flex justify-between flex-wrap gap-2">
          <label>
            <input
              type="radio"
              name={ `acceptReject_${ row.id }` }
              value="accept"
              checked={ selectedRows[row.id] === "accept" }
              onChange={ () => handleAcceptRejectChange(row.id, "accept") }
              className="mr-2"
            />
            Accept
          </label>
          <label>
            <input
              type="radio"
              name={ `acceptReject_${ row.id }` }
              value="reject"
              checked={ selectedRows[row.id] === "reject" }
              onChange={ () => handleAcceptRejectChange(row.id, "reject") }
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
    if (name === "program") {
      if (checkedProgramList?.includes(itemId)) {
        setCheckedProgramList(
          checkedProgramList?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgramList, itemId]);
      }
    } else if (name === "spinner") {
      setCheckedSpinLotList([]);
      setCheckedInvoiceList([]);
      setCheckedYarnCountList([]);
      setCheckedYarnTypeList([]);
      if (checkedSpinnerList?.includes(itemId)) {
        setCheckedSpinnerList(
          checkedSpinnerList?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinnerList([...checkedSpinnerList, itemId]);
      }
    } else if (name === "invoiceNo") {
      if (checkedInvoiceList?.includes(selectedItem?.invoice_no)) {
        setCheckedInvoiceList(
          checkedInvoiceList?.filter(
            (item: any) => item !== selectedItem?.invoice_no
          )
        );
      } else {
        setCheckedInvoiceList([
          ...checkedInvoiceList,
          selectedItem?.invoice_no,
        ]);
      }
    } else if (name === "spinLotNo") {
      if (checkedSpinLotList?.includes(selectedItem?.batch_lot_no)) {
        setCheckedSpinLotList(
          checkedSpinLotList?.filter(
            (item: any) => item !== selectedItem?.batch_lot_no
          )
        );
      } else {
        setCheckedSpinLotList([
          ...checkedSpinLotList,
          selectedItem?.batch_lot_no,
        ]);
      }
    } else if (name === "yarnCount") {
      if (checkedYarnCountList?.includes(itemId)) {
        setCheckedYarnCountList(
          checkedYarnCountList?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedYarnCountList([...checkedYarnCountList, itemId]);
      }
    } else if (name === "yarnType") {
      if (checkedYarnTypeList?.includes(selectedItem?.yarn_type)) {
        setCheckedYarnTypeList(
          checkedYarnTypeList?.filter(
            (item: any) => item !== selectedItem?.yarn_type
          )
        );
      } else {
        setCheckedYarnTypeList([
          ...checkedYarnTypeList,
          selectedItem?.yarn_type,
        ]);
      }
    }
  };

  const handleChangeAlert = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "program") {
      if (checkedProgramAlert?.includes(itemId)) {
        setCheckedProgramAlert(
          checkedProgramAlert?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramAlert([...checkedProgramAlert, itemId]);
      }
    } else if (name === "spinner") {
      setCheckedSpinLotAlert([]);
      setCheckedInvoiceAlert([]);
      setCheckedYarnCountAlert([]);
      setCheckedYarnTypeAlert([]);
      if (checkedSpinnerAlert?.includes(itemId)) {
        setCheckedSpinnerAlert(
          checkedSpinnerAlert?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinnerAlert([...checkedSpinnerAlert, itemId]);
      }
    } else if (name === "invoiceNo") {
      if (checkedInvoiceAlert?.includes(selectedItem?.invoice_no)) {
        setCheckedInvoiceAlert(
          checkedInvoiceAlert?.filter(
            (item: any) => item !== selectedItem?.invoice_no
          )
        );
      } else {
        setCheckedInvoiceAlert([
          ...checkedInvoiceAlert,
          selectedItem?.invoice_no,
        ]);
      }
    } else if (name === "spinLotNo") {
      if (checkedSpinLotAlert?.includes(selectedItem?.batch_lot_no)) {
        setCheckedSpinLotAlert(
          checkedSpinLotAlert?.filter(
            (item: any) => item !== selectedItem?.batch_lot_no
          )
        );
      } else {
        setCheckedSpinLotAlert([
          ...checkedSpinLotAlert,
          selectedItem?.batch_lot_no,
        ]);
      }
    } else if (name === "yarnCount") {
      if (checkedYarnCountAlert?.includes(itemId)) {
        setCheckedYarnCountAlert(
          checkedYarnCountAlert?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedYarnCountAlert([...checkedYarnCountAlert, itemId]);
      }
    } else if (name === "yarnType") {
      if (checkedYarnTypeAlert?.includes(selectedItem?.yarn_type)) {
        setCheckedYarnTypeAlert(
          checkedYarnTypeAlert?.filter(
            (item: any) => item !== selectedItem?.yarn_type
          )
        );
      } else {
        setCheckedYarnTypeAlert([
          ...checkedYarnTypeAlert,
          selectedItem?.yarn_type,
        ]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedProgramList([]);
    setCheckedSpinnerList([]);
    setCheckedInvoiceList([]);
    setCheckedSpinLotList([]);
    setCheckedYarnCountList([]);
    setCheckedYarnTypeList([]);
    setIsClear(!isClear);
  };

  const clearFilterAlert = () => {
    setCheckedProgramAlert([]);
    setCheckedSpinnerAlert([]);
    setCheckedInvoiceAlert([]);
    setCheckedSpinLotAlert([]);
    setCheckedYarnCountAlert([]);
    setCheckedYarnTypeAlert([]);
    setIsAlertClear(!isAlertClear);
  };

  const getWeaverYarnOptions = (): HighCharts.Options => {
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
        categories: weaverYarn ? weaverYarn.program : [],
      },
      series: [{
        type: 'column',
        name: "Total Quantity",
        data: weaverYarn ? weaverYarn.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Stock Quantity",
        data: weaverYarn ? weaverYarn.stockQty : [],
        color: '#ff9900'
      }]
    };
  };

  const getWeaverFabricOptions = (): HighCharts.Options => {
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
      xAxis: {
        categories: weaverFabric ? weaverFabric.program : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: weaverFabric ? weaverFabric.fabricList : []
    };
  };

  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        { openFilter && (
          <div
            ref={ popupRef }
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
                <button
                  className="text-[20px]"
                  onClick={ () => setShowFilterList(!showFilterList) }
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
                          Spinner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ listFilter?.spinner?.filter(
                            (item: any) => checkedSpinnerList?.includes(item.id)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinner"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinner"
                            )
                          }
                          options={ listFilter?.spinner }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={ program?.filter((item: any) =>
                            checkedProgramList?.includes(item.id)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          } }
                          options={ program }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          InVoice No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="invoice_no"
                          selectedValues={ listFilter?.invoiceNo?.filter(
                            (item: any) =>
                              checkedInvoiceList?.includes(item.invoice_no)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "invoiceNo"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "invoiceNo"
                            );
                          } }
                          options={ listFilter?.invoiceNo }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Spin Lot No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="batch_lot_no"
                          selectedValues={ listFilter?.spinLotNo?.filter(
                            (item: any) =>
                              checkedSpinLotList?.includes(item.batch_lot_no)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinLotNo"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinLotNo"
                            );
                          } }
                          options={ listFilter?.spinLotNo }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Count
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="yarnCount_name"
                          selectedValues={ listFilter?.yarnCount?.filter(
                            (item: any) =>
                              checkedYarnCountList?.includes(item.id)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarnCount"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarnCount"
                            );
                          } }
                          options={ listFilter?.yarnCount }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="yarn_type"
                          selectedValues={ listFilter?.yarnType?.filter(
                            (item: any) =>
                              checkedYarnTypeList?.includes(item.yarn_type)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarnType"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarnType"
                            );
                          } }
                          options={ listFilter?.yarnType }
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={ () => {
                            fetchTransActionList();
                            setShowFilterList(false);
                          } }
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={ () => {
                            clearFilterList();
                          } }
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
        ) }
      </div>
    );
  };

  const FilterPopupAlert = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        { openFilter && (
          <div
            ref={ popupRef }
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
                <button
                  className="text-[20px]"
                  onClick={ () => setShowFilterAlert(!showFilterAlert) }
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
                          Spinner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ alertFilter.spinner?.filter(
                            (item: any) => checkedSpinnerAlert.includes(item.id)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "spinner"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) =>
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "spinner"
                            )
                          }
                          options={ alertFilter.spinner }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={ program?.filter((item: any) =>
                            checkedProgramAlert.includes(item.id)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          } }
                          options={ program }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          InVoice No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="invoice_no"
                          selectedValues={ alertFilter.invoiceNo?.filter(
                            (item: any) =>
                              checkedInvoiceAlert.includes(item.invoice_no)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "invoiceNo"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "invoiceNo"
                            );
                          } }
                          options={ alertFilter.invoiceNo }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Spin Lot No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="batch_lot_no"
                          selectedValues={ alertFilter.spinLotNo?.filter(
                            (item: any) =>
                              checkedSpinLotAlert.includes(item.batch_lot_no)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "spinLotNo"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "spinLotNo"
                            );
                          } }
                          options={ alertFilter.spinLotNo }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Count
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="yarnCount_name"
                          selectedValues={ alertFilter?.yarnCount?.filter(
                            (item: any) =>
                              checkedYarnCountAlert.includes(item.id)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "yarnCount"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "yarnCount"
                            );
                          } }
                          options={ alertFilter?.yarnCount }
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="yarn_type"
                          selectedValues={ alertFilter.yarnType?.filter(
                            (item: any) =>
                              checkedYarnTypeAlert.includes(item?.yarn_type)
                          ) }
                          onKeyPressFn={ function noRefCheck() { } }
                          onRemove={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "yarnType"
                            );
                          } }
                          onSearch={ function noRefCheck() { } }
                          onSelect={ (selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "yarnType"
                            );
                          } }
                          options={ alertFilter.yarnType }
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={ () => {
                            fetchAlertData();
                            setShowFilterAlert(false);
                          } }
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={ () => {
                            clearFilterAlert();
                          } }
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
        ) }
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

      const acceptedUpdateRequests = acceptedRowIds
        .map((rowId) => {
          const matchingItem = dataAlert?.find((item: any) => item.id == rowId);
          if (matchingItem) {
            return {
              id: Number(rowId),
              status: "Sold",
              qtyStock: matchingItem.qtyStock,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      const rejectedUpdateRequests = rejectedRowIds
        .map((rowId) => {
          const matchingItem = dataAlert?.find((item: any) => item.id == rowId);
          if (matchingItem) {
            return {
              id: Number(rowId),
              status: "Rejected",
              qtyStock: matchingItem.qtyStock,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      const updateRequests = [
        ...acceptedUpdateRequests,
        ...rejectedUpdateRequests,
      ];

      const url = "weaver-process/transaction";
      const dataToSend = {
        items: updateRequests,
      };

      const response = await API.put(url, dataToSend);

      if (response.success) {
        const updatedDataAlert = dataAlert?.filter(
          (row: any) =>
            !acceptedRowIds.includes(row.id) && !rejectedRowIds.includes(row.id)
        );
        setDataAlert(updatedDataAlert);
        setShowConfirmPopup(!showConfirmPopup);
        setSelectedRows({});
        setSelectAllChecked(false);

        const acceptedRows = dataAlert?.filter((row: any) =>
          acceptedRowIds.includes(row.id)
        );
        const rejectedRows = dataAlert?.filter((row: any) =>
          rejectedRowIds.includes(row.id)
        );
        const updatedDataList = [...dataList, ...acceptedRows, ...rejectedRows];
        setDataList(updatedDataList);

        fetchAlertData();
        fetchTransActionList();
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  if (!roleLoading && !hasAccess?.processor.includes("Weaver")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor.includes("Weaver")) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/weaver/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li> DashBoard</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getWeaverYarnOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getWeaverFabricOptions() }
              highcharts={ HighCharts }
            />
          </div>
        {/* <div className="w-full">
                    <div className="lg:flex w-full gap-4 md:w-full sm:w-full">

                        <Accordian title={'Yarn'} content={
                            <ChartsGrouped
                                type="column"

                                categoriesList={['REEL']}
                                dataChart={seriesYarn}
                            />
                        }
                        />

                        <Accordian title={'Fabric Inventory'} content={
                            <ChartsGrouped
                                type="column"

                                categoriesList={['REEL']}
                                dataChart={series}
                            />
                        } />

                    </div>

                </div>
                <hr className="my-6" /> */}

        <div>
          <h4 className="text-xl font-semibold">
            TRANSACTION ALERT
          </h4>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth min-w-[650px]">
                  {/* search */ }
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="fliterBtn">
                        <button
                          className="flex"
                          type="button"
                          onClick={ () => setShowFilterAlert(!showFilterAlert) }
                        >
                          FILTERS <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupAlert
                            openFilter={ showFilterAlert }
                            onClose={ !showFilterAlert }
                          />
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center mr-5 text-[14px] font-medium">
                      { translations?.common?.totalWeight }: { totalWeight }
                    </label>
                  </div>
                  <DocumentPopup
                    openFilter={ showInvoiceAlert }
                    dataInvoice={ dataInvoiceAlert }
                    type='Alert'
                    onClose={ () => setShowInvoiceAlert(false) }
                  />
                  <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                    <DataTable
                      columns={ coulumnsAlert }
                      data={ dataAlert }
                      persistTableHead
                      fixedHeader={ true }
                      noDataComponent={
                        <p className="py-3 font-bold text-lg">
                          No data available in table
                        </p>
                      }
                      fixedHeaderScrollHeight="auto"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      className="btn-purple"
                      disabled={ isConfirm }
                      style={
                        isConfirm
                          ? { cursor: "not-allowed", opacity: 0.8 }
                          : { cursor: "pointer", backgroundColor: "#D15E9C" }
                      }
                      onClick={ handleConfirmActions }
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-6" />

        <div>
          <h4 className="text-xl font-semibold">
            TRANSACTION LIST
          </h4>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth">
                  {/* search */ }
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder="Search..."
                            value={ searchQuery }
                            onChange={ searchDataList }
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
                          onClick={ () => setShowFilterList(!showFilterList) }
                        >
                          FILTERS <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupList
                            openFilter={ showFilterList }
                            onClose={ !showFilterList }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DocumentPopup
                    openFilter={ showInvoiceList }
                    dataInvList={ dataInvoiceList }
                    type='List'
                    onClose={ () => setShowInvoiceList(false) }
                  />

                  <ConfirmPopup showModal={ showConfirmPopup } setShowModal={ setShowConfirmPopup } />

                  <CommonDataTable
                    columns={ columnList }
                    count={ count }
                    data={ dataList }
                    updateData={ updatePageList }
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
