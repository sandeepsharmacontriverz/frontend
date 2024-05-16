"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import Image from "next/image";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import { handleDownload } from "@components/core/Download";
import Loader from "@components/core/Loader";

interface TableData {
  id: number;
  dateScutching: string;
  farmer_no: string;
  farmerName: string;
  total_weight: any;
  season: string;
  area: string;
  country: string;
  harvest: string;
  farmerNo: string;
  block: string;
  town: string;
  transactionId: string;
  quantityPurchased: string;
  scutchingLotNo: string;
  balesNo: string;
  linenVariety: string;
  totalWeight: string;
  cooperativeName: string;
  status: string;
  totalWeightAfter: string;
  shipmentDate: string;
  shipmentDetails: string;
  shipmentTo: string;
}

export default function transactions() {
  useTitle("Linen Transactions");
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [countries, setCountries] = useState([]);
  const [linenWeight, setlinenWeight] = useState<any>([]);
  const [cooperative, setCooperative] = useState([]);
  const [linen, setLinen] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [checkedSeason, setCheckedSeason] = useState<any>([]);
  const [checkedCountries, setCheckCountries] = useState<any>([]);
  const [checkedCooperative, setCheckedCooperative] = useState<any>([]);
  const [checkedLinen, setCheckedLinen] = useState<any>("");
  const [isClear, setIsClear] = useState(false);
  const [showExportMessage, setShowExportMessage] = useState(false);

  const [isActive, setIsActive] = useState<any>({
    season: false,
    country: false,
    cooperative: false,
    linen: false,
  });

  useEffect(() => {
    fetchLinenTransaction();
  }, [searchQuery, page, limit, isClear]);
  useEffect(() => {
    getSeason();
    fetchLinenWeight();
    fetchCooperative();
    fetchCountries();
    fetchLinenvariety();
    fetchCountries();
  }, []);

  const fetchLinenWeight = async () => {
    try {
      const res = await API.get("linen/get-total-weight-linens");
      if (res.success) {
        setlinenWeight(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchLinenTransaction = async () => {
    try {
      const res = await API.get(
        `linen/get-linens?seasonId=${checkedSeason}&country=${checkedCountries}&cooperatives=${checkedCooperative}&linenVariety=${checkedLinen}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };
  const getSeason = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCountries = async () => {
    try {
      const res = await API.get(`linen/fetch-country`);
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCooperative = async () => {
    try {
      const res = await API.get("cooperative");
      if (res.success) {
        setCooperative(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchLinenvariety = async () => {
    try {
      const res = await API.get("linen-variety");
      if (res.success) {
        setLinen(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const clearFilter = () => {
    setCheckCountries([]);
    setCheckedCooperative([]);
    setCheckedLinen([]);
    setCheckedSeason([]);

    setIsClear(!isClear);
  };

  const handleExport = async () => {
    const url = `linen/export-bulk-linens`;
    try {
      const response = await API.get(url);
      setShowExportMessage(true);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Linen Transactions", ".xlsx");
          setShowExportMessage(false);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations.common.srNo} </p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
      width: '70px'
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.harvest} </p>,
      selector: (row: TableData) => row.harvest,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.farmerNo} </p>,
      selector: (row: any) => row.farmer_no,
      wrap: true,
      width: '140px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.farmerName} </p>,
      selector: (row: any) => row.farmer_name,
      wrap: true,
      width: '140px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.sidebar.country} </p>,
      selector: (row: TableData) => row.country,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.town} </p>,
      selector: (row: TableData) => row.town,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.farmerDepartment} </p>,
      selector: (row: any) => row.department,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.area} </p>,
      selector: (row: any) => row.area,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.linenVariety} </p>,
      selector: (row: any) => row.linen_variety,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations.linenTransactions.corporationName}</p>,
      selector: (row: any) => row.cooperative_name,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.rawBalesNo} </p>,
      selector: (row: any) => row.no_of_bales,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.farmLotNo} </p>,
      selector: (row: any) => row.farm_lot_no,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.totalWeight} </p>,
      selector: (row: any) => row.total_weight,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.scutchingDate} </p>,
      selector: (row: any) => row.scutch_date?.substring(0, 10),
      width: '120px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.scutchingLotNo} </p>,
      selector: (row: any) => row.scutching_lot_no,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.balesNo + ')'} </p>,
      selector: (row: any) => row.bales_after_scutching,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.totalWeightAfter} </p>,
      selector: (row: any) => row.weight_after_scutching,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.shipmentDate} </p>,
      selector: (row: any) => row.shipment_date?.substring(0, 10),
      width: '120px',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.shipmentDetails} </p>,
      selector: (row: any) => row.shipment_details,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.linenTransactions.shippedTo} </p>,
      selector: (row: any) => row.shiped_to,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.common.status} </p>,
      selector: (row: TableData) => row.status,
    },
  ];
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "season") {
      if (checkedSeason.includes(itemId)) {
        setCheckedSeason(checkedSeason.filter((item: any) => item !== itemId));
      } else {
        setCheckedSeason([...checkedSeason, itemId]);
      }
    } else if (name === "country") {
      let itemName = selectedItem?.country;
      if (checkedCountries.includes(itemName)) {
        setCheckCountries(
          checkedCountries.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckCountries([...checkedCountries, itemName]);
      }
    } else if (name === "cooperative") {
      let itemName = selectedItem?.name;
      if (checkedCooperative.includes(itemName)) {
        setCheckedCooperative(
          checkedCooperative.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedCooperative([...checkedCooperative, itemName]);
      }
    } else if (name === "linen") {
      if (checkedLinen.includes(itemId)) {
        setCheckedLinen(checkedLinen.filter((item: any) => item !== itemId));
      } else {
        setCheckedLinen([...checkedLinen, itemId]);
      }
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeason.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "season");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "season");
                          }}
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="country"
                          selectedValues={countries?.filter((item: any) =>
                            checkedCountries.includes(item.country)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "country");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "country")
                          }
                          options={countries}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Cooperative
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={cooperative?.filter((item: any) =>
                            checkedCooperative.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "cooperative"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "cooperative"
                            )
                          }
                          options={cooperative}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Linen
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={linen?.filter((item: any) =>
                            checkedLinen.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "linen");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "linen")
                          }
                          options={linen}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchLinenTransaction();
                            setShowFilter(false);
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
      </>
    );
  };
  if (!roleLoading) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Services</li>
                <li>Linen Transaction</li>
              </ul>
            </div>
          </div>
        </div>
        {/* <div className="flex gap-5 flex-wrap">
        <div className="relative">
          <Image
            src="/images/bc_2.png"
            alt="Image Description"
            width={300}
            height={300}
          />
          <p className="absolute top-4 left-4 text-white font-bold">
            Linen</p>
          <p className="text-black mt-4">Total Weight: <span className='text-black font-bold text-sm mt-4'>{linenWeight[0]?.total_weight}</span> </p>

        </div>
        <div className="relative">
          <Image
            src="/images/brand.png"
            alt="Image Description"
            width={300}
            height={300}
          />
          <p className="absolute top-4 left-4 text-white font-bold">
            Linen Variety:</p>
          <p className="text-black mt-4">Total Weight: <span className='text-black font-bold text-sm mt-4'> Total Weight</span> </p>*/}
        {/* <p className="absolute top-4 left-4 text-white font-bold">
            Cooperative:</p> */}
        {/* </div>

      </div> */}
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
                          placeholder="Search by Farmer name,Group"
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
                        onClick={() => setShowFilter(!showFilter)}
                      >
                        FILTERS <BiFilterAlt className="m-1" />
                      </button>

                      <div className="relative">
                        <FilterPopup
                          openFilter={showFilter}
                          onClose={!showFilter}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="search-filter-right">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={() => {
                        handleExport();
                      }}
                    >
                      {translations.common.export}
                    </button>
                  </div>
                </div>
                {showExportMessage && (
                  <div className="flex justify-end">
                    <p className="text-right text-sm">
                      Note: Export all records will take time based on the speed
                      of internet and total no of records
                    </p>{" "}
                  </div>
                )}

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
