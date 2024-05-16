"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import { FaDownload, FaEye } from "react-icons/fa";
import ConfirmPopup from "@components/core/ConfirmPopup";
import { handleDownload } from "@components/core/Download";
import checkAccess from "@lib/CheckAccess";
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';

export default function page() {
  useTitle("Dying DashBoard");
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);
  const [dataAlert, setDataAlert] = useState([]);
  const [Access, setAccess] = useState<any>({});

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>({});
  const [isClear, setIsClear] = useState(false);
  const [program, setProgram] = useState([]);
  const [isConfirm, setIsConfirm] = useState<any>(false);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [dataInvoiceAlert, setDataInvoiceAlert] = useState<Array<string>>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [fabricData, setFabricData] = useState<any>([]);
  const [fabricInventory, setFabricInventory] = useState<any>([]);

  const code = encodeURIComponent(searchQuery);

  const fabricId = User.fabricId;

  useEffect(() => {
    const fetchFabricData = async () => {
      try {
        if (fabricId) {
          const res = await API.get(`dashboard/processor/fabric/buyer/type?buyer=Dyeing&fabric=${ fabricId }`);
          if (res.success) {
            setFabricData(res.data);
          }
        } else {
          setFabricData([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchFabricInventory = async () => {
      try {
        if (fabricId) {
          const res = await API.get(`dashboard/processor/fabric/inventory/buyer/type?buyer=Dyeing&fabric=${ fabricId }`);
          if (res.success) {
            setFabricInventory(res.data);
          }
        } else {
          setFabricInventory([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchFabricData();
    fetchFabricInventory();
  }, [fabricId]);


  useEffect(() => {
    const atLeastOneSelected =
      Object.values(selectedRows).some(
        (value) => value === "accept" || value === "reject"
      ) || selectAllChecked;

    setIsConfirm(atLeastOneSelected);
  }, [selectedRows, selectAllChecked]);

  useEffect(() => {
    if (fabricId) {
      fetchAlertData();
    }
  }, [isClear, fabricId]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Fabric")) {
      const access = checkAccess("Fabric Dying Transaction");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (fabricId) {
      fetchTransActionList();
      getProgram();
    }
  }, [searchQuery, page, limit, isClear, fabricId]);

  const getProgram = async () => {
    const url = `fabric-process/get-program?fabricId=${ fabricId }`;
    try {
      const response = await API.get(url);
      setProgram(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const fetchAlertData = async () => {
    const url = `fabric-process/dying-dashboard-all?fabricId=${ fabricId }`;
    try {
      const response = await API.get(url);
      setDataAlert(response.data);
      const quantity = response?.data?.map((qty: any) => {
        return Number(qty.total_yarn_qty ? qty.total_yarn_qty : qty.total_fabric_quantity);
      });
      const sum = quantity?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );
      setTotalQuantity(sum);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const fetchTransActionList = async () => {
    const url = `fabric-process/dying-dashboard?fabricId=${ fabricId }&search=${ code }&page=${ page }&limit=${ limit }&pagination=true`;

    try {
      const response = await API.get(url);
      const newData = response.data.map((item: any, index: number) => ({
        ...item,
        id: index,
        processId: item.id,
      }));
      setDataList(newData);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

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

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataInvoiceList(rowData);
    setShowInvoiceList(!showInvoiceList);
  };

  const handleToggleAlertFilter = (rowData: Array<string>) => {
    setDataInvoiceAlert(rowData);
    setShowInvoiceAlert(!showInvoiceAlert);
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
      name: <p className="text-[13px] font-medium"> S. No </p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date </p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Knitter/ Weaver Name</p>,
      selector: (row: any) => row?.processor_name,
      wrap: true,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Garment Order Reference No </p>
      ),
      selector: (row: any) => row.garment_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Brand Order Reference No </p>
      ),
      selector: (row: any) => row.brand_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No </p>,
      selector: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Finished Batch/Lot No</p>,
      selector: (row: any) => row.batch_lot_no,
      wrap: true,
    },
    // {
    //   name: <p className="text-[13px] font-medium">Fabric Type </p>,
    //   selector: (row: any) => row.fabricType_name,
    //   wrap: true,
    // },
    {
      name: <p className="text-[13px] font-medium">Total Weight(Kgs) </p>,
      selector: (row: any) => row.total_yarn_qty,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Progarm </p>,
      selector: (row: any) => row.program_name,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Vehicle No. </p>,
      selector: (row: any) => row.vehicle_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.InVoiceFiles }</p>,
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
      name: translations?.mandiInterface?.qrCode,
      center: true,
      cell: (row: any) => row?.qr && (
        <div className="h-16 flex">
          <img
            className=""
            src={ process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr }
          />

          <button
            className=""
            onClick={ () =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                "qr",
                ".png"
              )
            }
          >
            <FaDownload size={ 18 } color="black" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const coulumnsAlert = [
    {
      name: <p className="text-[13px] font-medium">S. No </p>,
      cell: (row: any, index: any) => index + 1,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Date </p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Knitter/ Weaver Name </p>,
      selector: (row: any) =>
        row.weaver?.name ? row.weaver?.name : row.knitter?.name,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Reference No </p>,
      selector: (row: any) => row.garment_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Brand Reference No </p>,
      selector: (row: any) => row.brand_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Finished Batch/Lot No </p>,
      selector: (row: any) => row.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    // {
    //   name: <p className="text-[13px] font-medium">Fabric Type</p>,
    //   wrap: true,
    //   selector: (row: any) => row.fabric_type,
    // },
    {
      name: <p className="text-[13px] font-medium">Total Weight (Kgs) </p>,
      selector: (row: any) => row.total_yarn_qty,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Program </p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No </p>,
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{ translations?.common?.InVoiceFiles }</p>,
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
      name: translations?.mandiInterface?.qrCode,
      center: true,
      cell: (row: any) => row?.qr && (
        <div className="h-16 flex">
          <img
            className=""
            src={ process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr }
          />

          <button
            className=""
            onClick={ () =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                "qr",
                ".png"
              )
            }
          >
            <FaDownload size={ 18 } color="black" />
          </button>
        </div>
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
          Accept All{ " " }
        </div>
      ),

      cell: (row: any) => (
        <div className="flex flex-wrap gap-2">
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

  const updatePageList = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleConfirmActions = async () => {
    try {
      const acceptedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "accept"
      );
      const rejectedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "reject"
      );

      const acceptedUpdateRequests = acceptedRowIds?.map((rowId) => {
        const item: any = dataAlert.find((row: any) => row.id == rowId);

        return {
          id: Number(rowId),
          status: "Sold",
          knitter_id: item && item.knitter_id ? item.knitter_id : null,
          weaver_id: item && item.weaver_id ? item.weaver_id : null,
        };
      });

      const rejectedUpdateRequests = rejectedRowIds?.map((rowId) => {
        const item: any = dataAlert.find((row: any) => row.id == rowId);

        return {
          id: Number(rowId),
          status: "Rejected",
          knitter_id: item && item.knitter_id ? item.knitter_id : null,
          weaver_id: item && item.weaver_id ? item.weaver_id : null,
        };
      });

      const updateRequests = [
        ...acceptedUpdateRequests,
        ...rejectedUpdateRequests,
      ];

      const url = "fabric-process/update-transaction";

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
        console.error("Failed to update statuses");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const getFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Quantity and Fabric Stock Quantity',
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
        categories: fabricData ? fabricData.program : [],
      },
      series: [{
        type: 'column',
        name: "Total Quantity",
        data: fabricData ? fabricData.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Stock Quantity",
        data: fabricData ? fabricData.stockQty : [],
        color: '#ff9900'
      }]
    };
  };


  const getFabricInventoryOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Inventory',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25 ,
        type: 'column',
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
        categories: fabricInventory ? fabricInventory.programs : [],
      },
      series: fabricInventory ? fabricInventory.fabrics : []
    };
  };

  if (loading || roleLoading) {
    return <Loader />;
  }

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.view) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/fabric/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li> DashBoard</li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6" />

        {/* <div>
          <div>
            <div className="flex flex-wrap">
              <div className="w-full sm:w-1/2 mt-5 mb-5">
                <div className="w-full h-full">
                  <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-3 mt-3 mr-3">
                    Fabric
                  </h4>
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
        <div className="columns-2 mt-4">
          <HighChartsReact
            highcharts={ HighCharts }
            options={ getFabricOptions() }
          />
          <HighChartsReact
            highcharts={ HighCharts }
            options={ getFabricInventoryOptions() }
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
                        TRANSACTION ALERT
                      </h4>
                    </div>

                    <DocumentPopup
                      openFilter={ showInvoiceAlert }
                      dataInvoice={ dataInvoiceAlert }
                      type='Alert'
                      onClose={ () => setShowInvoiceAlert(false) }
                    />

                    <label className="flex items-center mr-5 justify-end my-2 text-[14px] font-medium">
                      { translations?.common?.totalWeight }: { totalQuantity }
                    </label>

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
                        disabled={ !isConfirm }
                        style={
                          isConfirm
                            ? { cursor: "pointer", backgroundColor: "#D15E9C" }
                            : { cursor: "not-allowed", opacity: 0.8 }
                        }
                        onClick={ handleConfirmActions }
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
                  {/* search */ }
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder="Search "
                            value={ searchQuery }
                            onChange={ searchData }
                          />
                          <button type="submit" className="search-btn">
                            <span className="icon-search"></span>
                          </button>
                        </form>
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
