"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import API from "@lib/Api";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import useDebounce from "@hooks/useDebounce";
import ConfirmPopup from "@components/core/ConfirmPopup";
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';

export default function page() {
  const { translations } = useTranslations();
  useTitle(translations?.sidebar?.dashboard);
  const [roleLoading, hasAccess] = useRole();

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dataAlert, setDataAlert] = useState<any>([]);
  const [dataList, setDataList] = useState<any>([]);
  const [isConfirm, setIsConfirm] = useState<any>(false);
  const [isClear, setIsClear] = useState(false);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>({});
  const [showFilterAlert, setShowFilterAlert] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilterList, setShowFilterList] = useState(false);
  const garmentId = User.garmentId;

  const [programs, setPrograms] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [CheckedWeavKnitAlert, setCheckedWeavKnitAlert] = useState<any>([]);
  const [CheckedWeavKnitList, setCheckedWeavKnitList] = useState<any>([]);

  const [checkedProgramAlert, setCheckedProgramAlert] = useState<any>([]);
  const [checkedProgarmList, setCheckedProgramList] = useState<any>([]);

  const [checkedOrderRefList, setCheckedOrderRefList] = useState<any>([]);
  const [checkedLotNoAlert, setcheckedLotNoAlert] = useState<any>([]);
  const [checkedLotNoList, setcheckedLotNoList] = useState<any>([]);

  const [dataArray, setDataArray] = useState<Array<string>>([]);

  const [checkedKnitIdAlert, setCheckedKnitIdAlert] = useState([]);
  const [checkedWeaverIdAlert, setCheckedWeaverIdAlert] = useState([]);
  const [checkedFabricIdAlert, setCheckedFabricIdAlert] = useState([]);
  const [checkedFabricIdList, setCheckedFabricIdList] = useState([]);
  const [garmentOrderrefAlert, setgarmentorderrefAlert] = useState<any>([]);
  const [checkedGarmentOrderRefAlert, setCheckedGarmentOrderRefAlert] =
    useState<any>([]);
  const [brandorderReferncelist, setbrandOrderRefList] = useState<any>([]);
  const [brandorderRefernceAlert, setbrandOrderRefAlert] = useState<any>([]);
  const [garmentOrderrefList, setgarmentorderrefList] = useState<any>([]);
  const [lotNoList, setLotnoList] = useState<any>([]);
  const [lotNoAlert, setLotnoAlert] = useState<any>([]);
  const [checkedbrandOrderRefList, setCheckedBrandOrderRefList] = useState<any>(
    []
  );
  const [checkedGarmentOrderRefList, setCheckedGarmentOrderRefList] =
    useState<any>([]);

  const [checkedbrandOrderRefAlert, setCheckedBrandOrderRefAlert] =
    useState<any>([]);

  const [totalQuantity, setTotalQuantity] = useState<any>(0);
  const [checkedWeaverIdList, setCheckedWeaverIdList] = useState<any>([]);
  const [checkedknitIdList, setcheckedknitIdList] = useState<any>([]);
  const [WeavKnitlist, setWeavKnitList] = useState<any>([]);
  const [WeavKnitAlert, setWeavKnitAlert] = useState([]);
  const [garmentFabric, setGarmentFabric] = useState<any>();
  const [garmentInventory, setGarmentInventory] = useState<any>();

  const code = encodeURIComponent(searchQuery);
  const debouncedSearch = useDebounce(code, 200);

  useEffect(() => {
    const atLeastOneSelected =
      Object.values(selectedRows).some(
        (value) => value === "accept" || value === "reject"
      ) || selectAllChecked;

    setIsConfirm(atLeastOneSelected);
  }, [selectedRows, selectAllChecked]);

  useEffect(() => {
    if (garmentId) {
      getProgram();
    }
  }, [garmentId]);

  useEffect(() => {
    if (garmentId) {
      fetchProcessorDataList();
      getBatchLotNoList();
    }
  }, [garmentId, isClear]);

  useEffect(() => {
    if (garmentId) {
      fetchProcessorDataAlert();
      getBatchLotNoAlert();
    }
  }, [garmentId, isClear]);

  useEffect(() => {
    if (garmentId) {
      fetchTransList();
    }
  }, [garmentId, debouncedSearch, page, limit, isClear]);

  useEffect(() => {
    if (garmentId) {
      fetchTransAlert();
    }
  }, [isClear, garmentId]);

  useEffect(() => {
    const fetchGarmentFabric = async () => {
      try {
        const res = await API.get(`dashboard/processor/garment/fabric?garmentId=${garmentId}`);
        if (res.success) {
          setGarmentFabric(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    const fetchGarmentInventory = async () => {
      try {
        const res = await API.get(`dashboard/processor/garment/inventory?garmentId=${garmentId}`);
        if (res.success) {
          setGarmentInventory(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    
    if(garmentId){
      fetchGarmentFabric()
      fetchGarmentInventory()
    }

  }, [garmentId]);

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };
  const fetchProcessorDataList = async () => {
    const url = `garment-sales/get-processor?garmentId=${ garmentId }&status=Sold`;
    try {
      const response = await API.get(url);
      const data = response.data;

      const weaverNames = data
        .filter((item: any) => item.weaver)
        .map((item: any) => {
          return {
            ...item.weaver,
            key: item.weaver?.name + "-Weaver",
          };
        });

      const knitterNames = data
        .filter((item: any) => item.knitter)
        .map((item: any) => {
          return {
            ...item.knitter,
            key: item.knitter?.name + "-Knitter",
          };
        });

      const fabricNames = data
        .filter((item: any) => item.dying_fabric)
        .map((item: any) => {
          return {
            ...item.dying_fabric,
            key: item.dying_fabric?.name + "-Fabric",
          };
        });

      const allNames = weaverNames.concat(knitterNames, fabricNames);
      setWeavKnitList(allNames);
    } catch (error) {
      console.log(error);
    }
  };

  const getBatchLotNoList = async () => {
    try {
      const res = await API.get(
        `garment-sales/get-batch-lot?garmentId=${ garmentId }&status=Sold`
      );
      if (res.success) {
        setLotnoList(res.data.batchLot);
        const orders = res.data?.order_ref || [];

        const uniqueBrandRefs = new Set();
        const uniqueOrders = orders.reduce((acc: any, order: any) => {
          const isBrandValid =
            order.brand_order_ref !== null && order.brand_order_ref !== "";

          if (isBrandValid && !uniqueBrandRefs.has(order.brand_order_ref)) {
            uniqueBrandRefs.add(order.brand_order_ref);
            acc.push(order);
          }
          return acc;
        }, []);

        const uniqueOrdersGarment = orders.reduce((acc: any, order: any) => {
          const isGarmentValid =
            order.garment_order_ref !== null && order.garment_order_ref !== "";

          if (isGarmentValid && !uniqueBrandRefs.has(order.garment_order_ref)) {
            uniqueBrandRefs.add(order.garment_order_ref);
            acc.push(order);
          }
          return acc;
        }, []);

        setbrandOrderRefList(uniqueOrders);
        setgarmentorderrefList(uniqueOrdersGarment);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchProcessorDataAlert = async () => {
    const url = `garment-sales/get-processor?garmentId=${ garmentId }&status=Pending`;
    try {
      const response = await API.get(url);
      const data = response.data;

      const allNames = data
        .map((item: any) => {
          const names = [];
          if (item.weaver) {
            names.push({
              ...item.weaver,
              key: item.weaver.name + "-Weaver",
            });
          }
          if (item.knitter) {
            names.push({
              ...item.knitter,
              key: item.knitter.name + "-Knitter",
            });
          }
          if (item.dying_fabric) {
            names.push({
              ...item.dying_fabric,
              key: item.dying_fabric.name + "-Fabric",
            });
          }
          return names;
        })
        .flat();

      setWeavKnitAlert(allNames);
    } catch (error) {
      console.log(error);
    }
  };

  const getBatchLotNoAlert = async () => {
    try {
      const res = await API.get(
        `garment-sales/get-batch-lot?garmentId=${ garmentId }&status=Pending`
      );
      if (res.success) {
        setLotnoAlert(res.data.batchLot);

        const orders = res.data?.order_ref || [];

        const uniqueBrandRefs = new Set();
        const uniqueOrders = orders.reduce((acc: any, order: any) => {
          const isBrandValid =
            order.brand_order_ref !== null && order.brand_order_ref !== "";

          if (isBrandValid && !uniqueBrandRefs.has(order.brand_order_ref)) {
            uniqueBrandRefs.add(order.brand_order_ref);
            acc.push(order);
          }
          return acc;
        }, []);

        const uniqueOrdersGarment = orders.reduce((acc: any, order: any) => {
          const isGarmentValid =
            order.garment_order_ref !== null && order.garment_order_ref !== "";

          if (isGarmentValid && !uniqueBrandRefs.has(order.garment_order_ref)) {
            uniqueBrandRefs.add(order.garment_order_ref);
            acc.push(order);
          }
          return acc;
        }, []);

        setbrandOrderRefAlert(uniqueOrders);
        setgarmentorderrefAlert(uniqueOrdersGarment);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchTransAlert = async () => {
    const url = `garment-sales/dashboard-all?garmentId=${ garmentId }&status=Pending&knitterId=${ checkedKnitIdAlert }&weaverId=${ checkedWeaverIdAlert }&fabricId=${ checkedFabricIdAlert }&programId=${ checkedProgramAlert }&lotNo=${ checkedLotNoAlert }&brandOrderRef=${ checkedbrandOrderRefList }&garmentOrderRef=${ checkedGarmentOrderRefList }`;
    try {
      const response = await API.get(url);

      const newData = response?.data?.map((item: any, index: number) => ({
        ...item,
        id: index,
        processId: item.id,
      }));
      setDataAlert(newData);

      const quantityKnit = response?.data?.map((qty: any) => {
        return Number(qty.total_yarn_qty);
      }).filter((value: any) => !isNaN(value) && value !== "");

      const sumKnit = quantityKnit.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0);

      const quantityFab = response?.data?.map((qty: any) => {
        return Number(qty.total_fabric_quantity);
      }).filter((value: any) => !isNaN(value) && value !== "");

      const sumFab = quantityFab.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0);

      const totalSum = sumKnit + sumFab;
      setTotalQuantity(totalSum);

    } catch (error) {
      console.log(error);
    }
  };
  const fetchTransList = async () => {
    const url = `garment-sales/dashboard?garmentId=${ garmentId }&status=Sold&programId=${ checkedProgarmList }&lotNo=${ checkedLotNoList }&brandOrderRef=${ checkedbrandOrderRefList }&garmentOrderRef=${ checkedGarmentOrderRefList }&knitterId=${ checkedknitIdList }&weaverId=${ checkedWeaverIdList }&fabricId=${ checkedFabricIdList }&filter=Quantity&limit=${ limit }&page=${ page }&search=${ debouncedSearch }&pagination=true`;
    try {
      const response = await API.get(url);
      const newData = response?.data?.map((item: any, index: number) => ({
        ...item,
        id: index,
        processId: item.id,
      }));
      setDataList(newData);

      setCount(response.count);
    } catch (error) {
      setCount(0);
    }
  };
  const getProgram = async () => {
    const url = `garment-sales/get-program?garmentId=${ garmentId }`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setPrograms(res);
      }
    } catch (error) {
      console.log(error, "error");
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
  const coulumnsAlert = [
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.srNo }</p>,
      cell: (row: any, index: any) => index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.date }</p>,
      wrap: true,
      selector: (row: any) => row.date?.substring(0, 10),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.ProcessorName }</p>,
      wrap: true,
      selector: (row: any) =>
        row.knitter?.name
          ? row.knitter.name
          : (row.weaver?.name
            ? row.weaver.name
            : (row.dying_fabric?.name
              ? row.dying_fabric.name
              : (row.printing?.name
                ? row.printing.name
                : (row.washing?.name
                  ? row.washing?.name
                  : (row.compacting?.name
                    ? row.compacting?.name
                    : "")
                ))))
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.GarmentOrderReference } </p>,
      selector: (row: any) => row.garment_order_ref,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.BrandOrderReference } </p>,
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.invoiceNumber }</p>,
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.FinishedBatch }</p>,
      selector: (row: any) => row.batch_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total Weight</p>,
      selector: (row: any) => row?.total_yarn_qty ? row?.total_yarn_qty : row.total_fabric_quantity,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.program }</p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.vehicleNo }</p>,
      selector: (row: any) => row.vehicle_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.transactionViatrader }</p>,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.agentDetails }</p>,
      selector: (row: any) =>
        row.transaction_agent ? row.transaction_agent : "NA",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.InVoiceFiles }</p>,
      cell: (row: any) =>
       ( (row?.invoice_file && row?.invoice_file.length > 0  ) ||
        (row?.invoice_files &&  row?.invoice_files.length > 0)) && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={ () => handleToggleFilter(row?.invoice_file ? row?.invoice_file : row?.invoice_files) }

              title="Click to View All Files"
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.mandiInterface?.qrCode } </p>,
      cell: (row: any) =>
        row?.qr && (
          <>
            <img
              className=""
              src={ process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr }
            />

            <button
              className=""
              onClick={ () =>
                handleDownload(
                  process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
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
          { translations?.common?.AcceptAll }
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
  const handleView = (url: string) => {
    window.open(url, "_blank");
  };
  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
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
        name: <p className="text-[13px] font-medium">{ translations?.common?.action }</p>,
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
                onClick={ () => handleDownloadData(row, "Invoice File") }
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
              className="fixPopupFilters fixWidth flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{ translations?.common?.InVoiceFiles }</h3>
                  <button
                    className="text-[20px]"
                    onClick={ () => setShowFilter(!showFilter) }
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
                          data={ dataArray }
                          persistTableHead
                          fixedHeader={ true }
                          noDataComponent={ translations?.common?.Nodata }
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
  const columnList = [
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.srNo } </p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.date } </p>,
      selector: (row: any) => row.date?.substring(0, 10),
      width: "120px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.ProcessorName } </p>,
      selector: (row: any) =>
        row.knitter?.name
          ? row.knitter.name
          : (row.weaver?.name
            ? row.weaver.name
            : (row.dying_fabric?.name
              ? row.dying_fabric.name
              : (row.printing?.name
                ? row.printing.name
                : (row.washing?.name
                  ? row.washing?.name
                  : (row.compacting?.name
                    ? row.compacting?.name
                    : "")
                )))),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.GarmentOrderReference } </p>,
      selector: (row: any) => row.garment_order_ref,
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.BrandOrderReference }</p>,
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
      width: "120px"

    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.invoiceNumber } </p>,
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.knitterInterface?.FinishedBatch } </p>,
      selector: (row: any) => row.batch_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total Weight</p>,
      selector: (row: any) => row?.total_yarn_qty ? row?.total_yarn_qty : row.total_fabric_quantity,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.program } </p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.transactions?.vehicleNo } </p>,
      selector: (row: any) => row.vehicle_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.transactionViatrader } </p>,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.agentDetails } </p>,
      selector: (row: any) =>
        row.transaction_agent ? row.transaction_agent : "NA",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.tcFiles }</p>,
      center: true,
      cell: (row: any) =>
        row.tc_file && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={ () => handleView(row.tc_file) }
            />
            <FaDownload
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={ () => handleDownloadData(row.tc_file, "Tc File") }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.ContractFiles } </p>,
      center: true,
      cell: (row: any) =>
        row.contract_file && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={ () => handleView(row.contract_file) }
            />
            <FaDownload
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={ () =>
                handleDownloadData(row.contract_file, "Contract File")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.InVoiceFiles }</p>,
      cell: (row: any) =>
       ( (row?.invoice_file && row?.invoice_file.length > 0  ) ||
        (row?.invoice_files &&  row?.invoice_files.length > 0)) && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={ () => handleToggleFilter(row?.invoice_file ? row?.invoice_file : row?.invoice_files) }

              title="Click to View All Files"
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.DeliveryNotes }</p>,
      center: true,
      cell: (row: any) =>
        row.delivery_notes && (
          <>
            <FaEye
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={ () => handleView(row.delivery_notes) }
            />
            <FaDownload
              size={ 18 }
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={ () =>
                handleDownloadData(row.delivery_notes, "Delivery Notes")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.mandiInterface?.qrCode } </p>,
      cell: (row: any) =>
        row?.qr && (
          <>
            <img
              className=""
              src={ process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr }
            />

            <button
              className=""
              onClick={ () =>
                handleDownload(
                  process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
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
  const handleConfirmActions = async () => {
    try {
      const acceptedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "accept"
      );
      const rejectedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "reject"
      );
      const acceptedUpdateRequests = acceptedRowIds.map((rowId) => {
        const item: any = dataAlert.find((row: any) => row.id == rowId);
        return {
          id: item.processId,
          status: "Sold",
          knitter_id: item && item.knitter_id ? item.knitter_id : null,
          weaver_id: item && item.weaver_id ? item.weaver_id : null,
          dying_id: item && item.dying_id ? item.dying_id : null,
          printing_id: item && item.printing_id ? item.printing_id : null,
          washing_id: item && item.washing_id ? item.washing_id : null,
          compacting_id: item && item.compacting_id ? item.compacting_id : null,
          type: item?.knitter_id ? "Knitter" : item?.weaver_id ? "Weaver" : item?.dying_id ? "Dying" : item.printing_id ? "Printing" : item.washing_id ? "Washing" : " item.compacting_id" ? "Compacting" : null
        };
      });

      const rejectedUpdateRequests = rejectedRowIds.map((rowId) => {
        const item: any = dataAlert.find((row: any) => row.id == rowId);

        return {
          id: item.processId,
          status: "Rejected",
          weaver_id: item && item.weaver_id ? item.weaver_id : null,
          knitter_id: item && item.knitter_id ? item.knitter_id : null,
          dying_id: item && item.dying_id ? item.dying_id : null,
          printing_id: item && item.printing_id ? item.printing_id : null,
          washing_id: item && item.washing_id ? item.washing_id : null,
          compacting_id: item && item.compacting_id ? item.compacting_id : null,
          type: item?.knitter_id ? "Knitter" : item?.weaver_id ? "Weaver" : item?.dying_id ? "Dying" : item.printing_id ? "Printing" : item.washing_id ? "Washing" : " item.compacting_id" ? "Compacting" : null
        };
      });

      const updateRequests = [
        ...acceptedUpdateRequests,
        ...rejectedUpdateRequests,
      ];

      const url = "garment-sales/update-transaction";

      const dataToSend = {
        items: updateRequests,
      };

      const response = await API.post(url, dataToSend);
      if (response.success) {
        const updatedDataAlert = dataAlert.filter(
          (row: any) => {
            !acceptedRowIds.includes(row.id) && !rejectedRowIds.includes(row.id);
          }
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

        fetchTransAlert();
        fetchTransList();
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
  const updatePageList = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const clearFilterAlert = () => {
    setCheckedKnitIdAlert([]);
    setCheckedWeaverIdAlert([]);
    setCheckedFabricIdAlert([]);
    setCheckedProgramAlert([]);
    setCheckedBrandOrderRefAlert([]);
    setCheckedGarmentOrderRefAlert([]);
    setCheckedWeavKnitAlert([]);
    setcheckedLotNoAlert([]);
    setIsClear(!isClear);
  };
  const clearFilterList = () => {
    setcheckedknitIdList([]);
    setCheckedWeaverIdList([]);
    setCheckedProgramList([]);
    setCheckedOrderRefList([]);
    setCheckedFabricIdList([]);
    setCheckedBrandOrderRefList([]);
    setCheckedGarmentOrderRefList([]);
    setCheckedWeavKnitList([]);
    setcheckedLotNoList([]);
    setIsClear(!isClear);
  };
  const handleChangeAlert = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;

    if (name === "program") {
      if (checkedProgramAlert.includes(itemId)) {
        setCheckedProgramAlert(
          checkedProgramAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramAlert([...checkedProgramAlert, itemId]);
      }
    } else if (name === "garment") {
      let itemName = selectedItem?.garment_order_ref;

      if (checkedGarmentOrderRefAlert.includes(itemName)) {
        setCheckedGarmentOrderRefAlert(
          checkedGarmentOrderRefAlert.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedGarmentOrderRefAlert([
          ...checkedGarmentOrderRefAlert,
          itemName,
        ]);
      }
    } else if (name === "lotNo") {
      let itemName = selectedItem?.batch_lot_no;
      if (checkedLotNoAlert.includes(itemName)) {
        setcheckedLotNoAlert(
          checkedLotNoAlert.filter((item: any) => item !== itemName)
        );
      } else {
        setcheckedLotNoAlert([...checkedLotNoAlert, itemName]);
      }
    } else if (name === "brand") {
      let itemName = selectedItem?.brand_order_ref;
      if (checkedbrandOrderRefAlert.includes(itemName)) {
        setCheckedBrandOrderRefAlert(
          checkedbrandOrderRefAlert.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedBrandOrderRefAlert([...checkedbrandOrderRefAlert, itemName]);
      }
    } else if (name === "wevknit") {
      const selectedType = selectedItem.key?.split("-")[1];
      if (CheckedWeavKnitAlert.includes(selectedItem.key)) {
        setCheckedWeavKnitAlert((prevList: any) =>
          prevList.filter((item: any) => item !== selectedItem.key)
        );
        if (selectedType === "Weaver") {
          setCheckedWeaverIdAlert((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        } else if (selectedType === "Knitter") {
          setCheckedKnitIdAlert((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        }
        else if (selectedType === "Fabric") {
          setCheckedFabricIdAlert((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        }
      } else {
        setCheckedWeavKnitAlert((prevList: any) => {
          if (!prevList.includes(selectedItem.key)) {
            return [...prevList, selectedItem.key];
          }
          return prevList;
        });
        if (selectedType === "Weaver") {
          setCheckedWeaverIdAlert((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
        else if (selectedType === "Knitter") {
          setCheckedKnitIdAlert((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
        else if (selectedType === "Fabric") {
          setCheckedFabricIdAlert((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
      }
    }
  };
  const handleChangeList = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;

    if (name === "program") {
      if (checkedProgarmList.includes(itemId)) {
        setCheckedProgramList(
          checkedProgarmList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgarmList, itemId]);
      }
    } else if (name === "garment") {
      let itemName = selectedItem?.garment_order_ref;

      if (checkedGarmentOrderRefList.includes(itemName)) {
        setCheckedGarmentOrderRefList(
          checkedGarmentOrderRefList.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedGarmentOrderRefList([
          ...checkedGarmentOrderRefList,
          itemName,
        ]);
      }
    } else if (name === "lotNo") {
      let itemName = selectedItem?.batch_lot_no;
      if (checkedLotNoList.includes(itemName)) {
        setcheckedLotNoList(
          checkedLotNoList.filter((item: any) => item !== itemName)
        );
      } else {
        setcheckedLotNoList([...checkedLotNoList, itemName]);
      }
    } else if (name === "brand") {
      let itemName = selectedItem?.brand_order_ref;
      if (checkedbrandOrderRefList.includes(itemName)) {
        setCheckedBrandOrderRefList(
          checkedbrandOrderRefList.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedBrandOrderRefList([...checkedbrandOrderRefList, itemName]);
      }
    } else if (name === "wevknit") {
      const selectedType = selectedItem.key?.split("-")[1];
      if (CheckedWeavKnitList.includes(selectedItem.key)) {
        setCheckedWeavKnitList((prevList: any) =>
          prevList.filter((item: any) => item !== selectedItem.key)
        );
        if (selectedType === "Weaver") {
          setCheckedWeaverIdList((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        } else if (selectedType === "Knitter") {
          setcheckedknitIdList((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        }
        else if (selectedType === "Fabric") {
          setCheckedFabricIdList((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        }
      } else {
        setCheckedWeavKnitList((prevList: any) => {
          if (!prevList.includes(selectedItem.key)) {
            return [...prevList, selectedItem.key];
          }
          return prevList;
        });
        if (selectedType === "Weaver") {
          setCheckedWeaverIdList((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        } else if (selectedType === "Knitter") {
          setcheckedknitIdList((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
        else if (selectedType === "Fabric") {
          setCheckedFabricIdList((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
      }
    }
  };
  const getGarmentFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Total Quantity and Fabric Stock Quantity',
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
        categories: garmentFabric ? garmentFabric.program : [],
      },
      series: [{
        type: 'column',
        name: "Total Quantity",
        data: garmentFabric ? garmentFabric.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Stock Quantity",
        data: garmentFabric ? garmentFabric.stockQty : [],
        color: '#ff9900'
      }]
    };
  };

  const getGarmentInventoryOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Garment Inventory',
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
          text: 'Number of pieces'
        }
      },
      xAxis: {
        categories: garmentInventory ? garmentInventory.program : [],
      },
      series: garmentInventory ? garmentInventory.fabricList : []
    };
  };

  const FilterPopupAlert = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        { openFilter && (
          <>
            <div
              ref={ popupRef }
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-lg rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{ translations?.common?.Filters }</h3>
                  <button
                    className="text-[20px]"
                    onClick={ () => setShowFilterAlert(!showFilterAlert) }
                  >
                    &times;
                  </button>
                </div>
                <div className="filter-accodian">
                  <div className="w-100 mt-0">
                    <div className="customFormSet">
                      <div className="w-100">
                        <div className="row">
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.common?.SelectKnitWeav }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="key"
                              selectedValues={ WeavKnitAlert?.filter(
                                (item: any) =>
                                  CheckedWeavKnitAlert.includes(item.key)
                              ) }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "wevknit"
                                )
                              }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "wevknit"
                                )
                              }
                              options={ WeavKnitAlert }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.common?.SelectProgram }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="program_name"
                              selectedValues={ programs?.filter((item: any) =>
                                checkedProgramAlert.includes(item.id)
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "program"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "program"
                                )
                              }
                              options={ programs }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.comberNoil?.batchLotNo }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="batch_lot_no"
                              selectedValues={ lotNoAlert?.filter((item: any) =>
                                checkedLotNoAlert.includes(item.batch_lot_no)
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "lotNo"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "lotNo"
                                )
                              }
                              options={ lotNoAlert }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.knitterInterface?.GarmentOrderReference }

                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="garment_order_ref"
                              selectedValues={ garmentOrderrefAlert?.filter(
                                (item: any) =>
                                  checkedGarmentOrderRefAlert.includes(
                                    item.garment_order_ref
                                  )
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "garment"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "garment"
                                )
                              }
                              options={ garmentOrderrefAlert?.filter(
                                (item: any) =>
                                  item.garment_order_ref !== "" ||
                                  !item.garment_order_ref
                              ) }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.knitterInterface?.BrandOrderReference }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="brand_order_ref"
                              selectedValues={ brandorderRefernceAlert?.filter(
                                (item: any) =>
                                  checkedbrandOrderRefAlert.includes(
                                    item.brand_order_ref
                                  )
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "brand"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeAlert(
                                  selectedList,
                                  selectedItem,
                                  "brand"
                                )
                              }
                              options={ brandorderRefernceAlert?.filter(
                                (item: any) =>
                                  item.brand_order_ref !== "" ||
                                  !item.brand_order_ref
                              ) }
                              showCheckbox
                            />
                          </div>
                        </div>
                        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                          <section>
                            <button
                              className="btn-purple mr-2"
                              onClick={ () => {
                                fetchTransAlert();
                                setShowFilterAlert(false);
                              } }
                            >
                              { translations?.common?.ApplyAllFilters }
                            </button>
                            <button
                              className="btn-outline-purple"
                              onClick={ () => {
                                clearFilterAlert();
                              } }
                            >
                              { translations?.common?.ClearAllFilters }
                            </button>
                          </section>
                        </div>
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
  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        { openFilter && (
          <>
            <div
              ref={ popupRef }
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-lg rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{ translations?.common?.Filters }</h3>
                  <button
                    className="text-[20px]"
                    onClick={ () => setShowFilterList(!showFilterList) }
                  >
                    &times;
                  </button>
                </div>
                <div className="filter-accodian">
                  <div className="w-100 mt-0">
                    <div className="customFormSet">
                      <div className="w-100">
                        <div className="row">
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.common?.SelectKnitWeav }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="key"
                              selectedValues={ WeavKnitlist?.filter(
                                (item: any) =>
                                  CheckedWeavKnitList.includes(item.key)
                              ) }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "wevknit"
                                )
                              }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "wevknit"
                                )
                              }
                              options={ WeavKnitlist }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.common?.SelectProgram }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="program_name"
                              selectedValues={ programs?.filter((item: any) =>
                                checkedProgarmList.includes(item.id)
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "program"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "program"
                                )
                              }
                              options={ programs }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.comberNoil?.batchLotNo }

                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="batch_lot_no"
                              selectedValues={ lotNoList?.filter((item: any) =>
                                checkedLotNoList.includes(item.batch_lot_no)
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "lotNo"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "lotNo"
                                )
                              }
                              options={ lotNoList }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.knitterInterface?.GarmentOrderReference }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="garment_order_ref"
                              selectedValues={ garmentOrderrefList?.filter(
                                (item: any) =>
                                  checkedGarmentOrderRefList.includes(
                                    item.garment_order_ref
                                  )
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "garment"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "garment"
                                )
                              }
                              // options={garmentOrderrefList?.filter(
                              //   (item: any) =>
                              //     item.garment_order_ref !== "" || item.garment_order_ref !== null

                              // )}
                              options={ garmentOrderrefList }
                              showCheckbox
                            />
                          </div>
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              { translations?.knitterInterface?.BrandOrderReference }
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="brand_order_ref"
                              selectedValues={ brandorderReferncelist?.filter(
                                (item: any) =>
                                  checkedbrandOrderRefList.includes(
                                    item.brand_order_ref
                                  )
                              ) }
                              onKeyPressFn={ function noRefCheck() { } }
                              onRemove={ (
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "brand"
                                );
                              } }
                              onSearch={ function noRefCheck() { } }
                              onSelect={ (
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChangeList(
                                  selectedList,
                                  selectedItem,
                                  "brand"
                                )
                              }
                              // options={brandorderReferncelist?.filter(
                              //   (item: any) =>
                              //     item.brand_order_ref !== "" || !item.brand_order_ref

                              // )}
                              options={ brandorderReferncelist }
                              showCheckbox
                            />
                          </div>
                        </div>
                        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                          <section>
                            <button
                              className="btn-purple mr-2"
                              onClick={ () => {
                                fetchTransList();
                                setShowFilterList(false);
                              } }
                            >
                              { translations?.common?.ApplyAllFilters }
                            </button>
                            <button
                              className="btn-outline-purple"
                              onClick={ clearFilterList }
                            >
                              { translations?.common?.ClearAllFilters }
                            </button>
                          </section>
                        </div>
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
  if (!roleLoading && !hasAccess?.processor?.includes("Garment")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  if (!roleLoading && hasAccess?.processor.includes("Garment")) {
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
                <li>{ translations?.sidebar?.dashboard }</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getGarmentFabricOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getGarmentInventoryOptions() }
              highcharts={ HighCharts }
            />
          </div>
        <div>
          <div className="py-6">
            <h4 className="text-xl font-semibold">{ translations?.common?.transactionAlert }</h4>
          </div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="fliterBtn">
                        <button
                          className="flex"
                          type="button"
                          onClick={ () => setShowFilterAlert(!showFilterAlert) }
                        >
                          { translations?.common?.Filters } <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupAlert
                            openFilter={ showFilterAlert }
                            onClose={ !showFilterAlert }
                          />
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center mr-5 justify-end my-2 text-[14px] font-medium">
                      { translations?.common?.totalWeight }: { totalQuantity }
                    </label>
                  </div>
                  <DataTable
                    persistTableHead
                    fixedHeader={ true }
                    noDataComponent={
                      <p className="py-3 font-bold text-lg">
                        { translations?.common?.Nodata }
                      </p>
                    }
                    fixedHeaderScrollHeight="auto"
                    columns={ coulumnsAlert }
                    data={ dataAlert }
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      className="btn-purple"
                      disabled={ !isConfirm }
                      style={
                        isConfirm
                          ? { cursor: "pointer", backgroundColor: "#D15E9C" }
                          : { cursor: "not-allowed", opacity: 0.8 }
                      }
                      onClick={ handleConfirmActions }
                    >
                      { translations?.common?.Confirm }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-6" />

        <div>
          <div className="py-6">
            <h4 className="text-xl font-semibold">{ translations?.common?.transactionList }</h4>
          </div>

          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder={ translations?.common?.search }
                            value={ searchQuery }
                            onChange={ searchData }
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
                          { translations?.common?.Filters } <BiFilterAlt className="m-1" />
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
                    openFilter={ showFilter }
                    dataArray={ dataArray }
                    onClose={ () => setShowFilter(false) }
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
