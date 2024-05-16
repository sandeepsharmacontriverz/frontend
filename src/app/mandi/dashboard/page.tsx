"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import Multiselect from "multiselect-react-dropdown";
import { handleDownload } from "@components/core/Download";
import DataTable from "react-data-table-component";
import ConfirmPopup from "@components/core/ConfirmPopup";
import User from "@lib/User";
import Loader from "@components/core/Loader";


const transaction = [
  {
    id: 1,
    name: "QR App",
    value: "app",
  },
  {
    id: 2,
    name: "Data Upload",
    value: "web",
  },
];

interface TransItem {
  program: {
    id: number;
    program_name: string;
    program_status: boolean;
  };
  data: {
    totalPurchased: string;
    totalBales: string;
    totalQuantity: number;
  };
}
export default function page() {
  useTitle("DashBoard");
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);
  const [dataAlert, setDataAlert] = useState<any>([]);
  const [chartDataSeed, setChartDataSeed] = useState([]);
  const [chartDataLint, setChartDataLint] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isConfirm, setIsConfirm] = useState<any>(false);
  const [showFilterList, setShowFilterList] = useState(false);
  const [riceVariety, setRiceVariety] = useState<any>([])
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showFilterAlert, setShowFilterAlert] = useState(false);
  const [searchFilterAlert, setSearchFilterAlert] = useState("");
  const [program, setProgram] = useState<any>([]);
  const [villages, setVillages] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>([]);
  const [farmers, setFarmers] = useState<any>([]);
  const [checkedProgramAlert, setCheckedProgramAlert] = useState<any>([]);
  const [checkedRiceVarietyAlert, setCheckedRiceVarietyAlert] = useState<any>([]);
  const [checkedProgramList, setCheckedProgramList] = useState<any>([]);
  const [checkedSeasonAlert, setCheckedSeasonAlert] = useState<any>([]);
  const [checkedSeasonList, setCheckedSeasonList] = useState<any>([]);
  const [checkedTransaction, setCheckedTransaction] = useState<any>([]);
  const [checkedAgent, setCheckedAgent] = useState<any>([]);
  const [checkedVillageList, setCheckedVillageList] = useState<any>([]);
  const [checkedRiceVarietyList, setCheckedRiceVarietyList] = useState<any>([]);
  const [checkedFarmerList, setcheckedFarmerList] = useState<any>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>({});
  const [isClear, setIsClear] = useState(false);
  const [isAlertClear, setIsAlertClear] = useState(false);
  const MandiId = User.MandiId;

  useEffect(() => {
    if (MandiId) {
      fetchTransActionList();
    }
  }, [page, limit, searchQuery, isClear, MandiId]);

  useEffect(() => {
    if (MandiId) {
      // fetchChartData()
      fetchAlertData();
    }
  }, [MandiId, isAlertClear]);

  useEffect(() => {
    const atLeastOneSelected =
      Object.values(selectedRows).some(
        (value) => value === "accept" || value === "reject"
      ) || selectAllChecked;

    setIsConfirm(atLeastOneSelected);
  }, [selectedRows, selectAllChecked]);

  useEffect(() => {
    if (MandiId) {
      getProgram();
      getRiceVariety()
      getSeason();
      getFilterOptions();
    }
  }, [MandiId]);

  const getSeason = async () => {
    const url = "season";
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
    const url = `mandi-process/get-program?mandiId=${MandiId}`;
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

  const getFilterOptions = async () => {
    try {
      const res = await API.get(
        `mandi-process/get-village-farmer?mandiId=${MandiId}`
      );

      if (res.success) {
        setVillages(res.data?.village);
        const farmerList = res.data?.farmers?.map((item: any) => {
          return {
            id: item?.id,
            farmer_name: item?.firstName + " " + item?.lastName,
          };
        });
        setFarmers(farmerList);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getRiceVariety = async () => {
    try {
      const res = await API.get("rice-variety");
      if (res.success) {
        setRiceVariety(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAlertData = async () => {
    const url = `procurement/get-transactions?mandiId=${MandiId}&RiceVarietyId=${checkedRiceVarietyAlert}&status=Pending&search=${searchFilterAlert}&programId=${checkedProgramAlert}&seasonId=${checkedSeasonAlert}&transactionVia=${checkedTransaction}&agent=${checkedAgent}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        setDataAlert(response.data);
        const quantity = response?.data?.map((qty: any) => {
          return Number(qty.qty_purchased);
        });
        const sum = quantity?.reduce(
          (accumulator: any, currentValue: any) => accumulator + currentValue,
          0
        );
        setTotalQuantity(sum)
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const fetchTransActionList = async () => {
    const url = `procurement/get-transactions?mandiId=${MandiId}&RiceVarietyId=${checkedRiceVarietyList}&status=Sold&programId=${checkedProgramList}&seasonId=${checkedSeasonList}&villageId=${checkedVillageList}&farmerId=${checkedFarmerList}&page=${page}&limit=${limit}&search=${searchQuery}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        setDataList(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await API.get(
        `mandi-process/dashboard?mandiId=${MandiId}`
      );
      if (response.success) {
        const seedData = response.data?.transaction?.map((item: TransItem) => ({
          name: item.program.program_name,
          y: parseFloat(item.data?.totalPurchased),
        }));
        setChartDataSeed(seedData);

        const LintData = response.data?.mandi?.map((item: TransItem) => ({
          name: item.program.program_name,
          y: parseFloat(item.data?.totalBales),
        }));
        setChartDataLint(LintData);
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

  const handleExport = async () => {
    const url = `mandi-process/export-mandi-transactions?mandiId=${MandiId}&programId=${checkedProgramList}&villageId=${checkedVillageList}&farmerId=${checkedFarmerList}&page=${page}&limit=${limit}&search=${searchQuery}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Transactions", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const columnList = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: '70px',
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      wrap: true,
      selector: (row: any) => row?.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Code</p>,
      wrap: true,
      selector: (row: any) => row.farmer?.code,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Name</p>,
      wrap: true,
      selector: (row: any) =>
        row.farmer?.firstName + " " + row.farmer?.lastName,
    },
    {
      name: <p className="text-[13px] font-medium">Rice Variety</p>,
      selector: (row: any) => row.rice_variety?.variety_name,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Village</p>,
      selector: (row: any) => row.village?.village_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity</p>,
      wrap: true,
      selector: (row: any) => row.qty_purchased,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      wrap: true,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle Information</p>,
      wrap: true,
      selector: (row: any) => row.vehicle,
    },
  ];

  const coulumnsAlert = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      cell: (row: any, index: any) => index + 1,
      width: '70px',
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      wrap: true,
      selector: (row: any) => row?.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Code</p>,
      wrap: true,
      selector: (row: any) => row.farmer?.code,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Name</p>,
      wrap: true,
      selector: (row: any) =>
        row.farmer?.lastName ? row.farmer?.firstName + " " + row.farmer?.lastName : row.farmer?.firstName,
    },
    {
      name: <p className="text-[13px] font-medium">Rice Variety</p>,
      selector: (row: any) => row.rice_variety?.variety_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Village</p>,
      selector: (row: any) => row.village?.village_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity</p>,
      selector: (row: any) => row.qty_purchased,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction Via</p>,
      selector: (row: any) => row.agent ? "Qr App" : "Data Upload",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Agent</p>,
      selector: (row: any) => row?.agent && row?.agent?.lastName ? row?.agent?.firstName + " " + row?.agent?.lastName : row?.agent?.firstName,
      wrap: true,
    },

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
          Accept All{" "}
        </div>
      ),

      cell: (row: any) => (
        <div className="flex justify-between gap-2">
          <input
            type="radio"
            name={`acceptReject_${row.id}`}
            value="accept"
            checked={selectedRows[row.id] === "accept"}
            onChange={() => handleAcceptRejectChange(row.id, "accept")}
            className="mr-1"
          />
          Accept
          <input
            type="radio"
            name={`acceptReject_${row.id}`}
            value="reject"
            checked={selectedRows[row.id] === "reject"}
            onChange={() => handleAcceptRejectChange(row.id, "reject")}
            className="mr-1"
          />
          Reject
        </div>
      ),
      width: "200px",
      sortable: false,
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
    } else  if (name === "riceVariety") {
      if (checkedRiceVarietyList.includes(itemId)) {
        setCheckedRiceVarietyList(
          checkedRiceVarietyList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedRiceVarietyList([...checkedRiceVarietyList, itemId]);
      }
    }
    
    else if (name === "program") {
      if (checkedProgramList.includes(itemId)) {
        setCheckedProgramList(
          checkedProgramList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgramList, itemId]);
      }
    } else if (name === "village") {
      if (checkedVillageList.includes(itemId)) {
        setCheckedVillageList(
          checkedVillageList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedVillageList([...checkedVillageList, itemId]);
      }
    } else if (name === "farmers") {
      if (checkedFarmerList.includes(itemId)) {
        setcheckedFarmerList(
          checkedFarmerList.filter((item: any) => item !== itemId)
        );
      } else {
        setcheckedFarmerList([...checkedFarmerList, itemId]);
      }
    }
  };

  const handleChangeAlert = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    let itemName = selectedItem?.name;
    if (name === "season") {
      if (checkedSeasonAlert.includes(itemId)) {
        setCheckedSeasonAlert(
          checkedSeasonAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasonAlert([...checkedSeasonAlert, itemId]);
      }
    } 
    
    else  if (name === "riceVariety") {
      if (checkedRiceVarietyAlert.includes(itemId)) {
        setCheckedRiceVarietyAlert(
          checkedRiceVarietyAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedRiceVarietyAlert([...checkedRiceVarietyAlert, itemId]);
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
    } else if (name === "transaction") {
      if (itemName === "QR App") {
        if (checkedTransaction.includes("app")) {
          setCheckedTransaction(
            checkedTransaction.filter((item: any) => item !== "app")
          );
        } else {
          setCheckedTransaction([...checkedTransaction, "app"]);
        }
      } else if (itemName === "Data Upload") {
        if (checkedTransaction.includes("web")) {
          setCheckedTransaction(
            checkedTransaction.filter((item: any) => item !== "web")
          );
        } else {
          setCheckedTransaction([...checkedTransaction, "web"]);
        }
      }
    } else if (name === "agent") {
      if (checkedAgent.includes(itemId)) {
        setCheckedAgent(checkedAgent.filter((item: any) => item !== itemId));
      } else {
        setCheckedAgent([...checkedAgent, itemId]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedProgramList([]);
    setCheckedRiceVarietyList([])
    setCheckedVillageList([]);
    setcheckedFarmerList([]);
    setCheckedSeasonList([]);
    setIsClear(!isClear);
  };

  const clearFilterAlert = () => {
    setCheckedProgramAlert([]);
    setCheckedRiceVarietyAlert([])
    setCheckedTransaction([]);
    setCheckedAgent([]);
    setCheckedSeasonAlert([]);
    setIsAlertClear(!isAlertClear);
  };

  const FilterPopupList = ({ openFilter, onClose }: any) => {
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
                  className="text-[25px]"
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
                          Programs
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
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Villages
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="village_name"
                          selectedValues={villages?.filter((item: any) =>
                            checkedVillageList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "village"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "village"
                            )
                          }
                          options={villages}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Farmers
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="farmer_name"
                          selectedValues={farmers?.filter((item: any) =>
                            checkedFarmerList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "farmers"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "farmers"
                            )
                          }
                          options={farmers}
                          showCheckbox
                        />
                      </div>


                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Rice Variety
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="variety_name"
                          selectedValues={riceVariety?.filter((item: any) =>
                            checkedRiceVarietyList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "riceVariety"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "riceVariety"
                            )
                          }
                          options={riceVariety}
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
                  className="text-[25px]"
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
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Transaction
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={transaction?.filter((item: any) =>
                            checkedTransaction.includes(item.value)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "transaction"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "transaction"
                            )
                          }
                          options={transaction}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Rice Variety
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="variety_name"
                          selectedValues={riceVariety?.filter((item: any) =>
                            checkedRiceVarietyAlert.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "riceVariety"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "riceVariety"
                            );
                          }}
                          options={riceVariety}
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

      const url = "mandi-process/update-status-transaction";
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

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !hasAccess?.processor?.includes("Mandi")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/mandi/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li> Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
        {/* <hr className="my-3" /> */}
        {/* <div>
          <div>
            <div className="flex flex-wrap ">
              <div className="w-full sm:w-1/2 mt-3 mb-5">
                <div className="w-full h-full">
                  <Accordian
                    title={"Seed Cotton"}
                    content={
                      <BarChart
                        title="Seed Cotton"
                        data={chartDataSeed}
                        type={"column"}
                      />
                    }
                  />
                </div>
              </div>

              <div className="w-full sm:w-1/2 mt-3 mb-5">
                <div className="w-full h-full">
                  <Accordian
                    title={"Lint Cotton"}
                    content={
                      <BarChart
                        title="Lint Cotton"
                        data={chartDataLint}
                        type={"column"}
                      />
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <hr className="my-6" />

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
                    <DataTable
                      columns={coulumnsAlert}
                      data={dataAlert}
                      persistTableHead
                      fixedHeader={true}
                      noDataComponent={
                        <p className="py-3 font-bold text-lg">
                          No data available in table
                        </p>
                      }
                      fixedHeaderScrollHeight="auto"
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
                            placeholder="Search by Farmer Name"
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
