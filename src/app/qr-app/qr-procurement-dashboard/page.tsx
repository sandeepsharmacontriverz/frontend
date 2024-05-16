"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";

import PageHeader from "@components/core/PageHeader";
import useTranslations from "@hooks/useTranslation";
import Accordian from "@components/core/Accordian";
import Chart from "@components/charts/Chart";
import useTitle from "@hooks/useTitle";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import Link from "@components/core/nav-link";
import ChartsGrouped from "@components/charts/ChartsGrouped";
import API from "@lib/Api";

export default function page() {
  useTitle("QR Procurement Dashboard");
  const { loading } = useTranslations();
  const [showFilter, setShowFilter] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [brands, setBrands] = useState([]);
  const [seasons, setSeasons] = useState<any>([]);
  const [countries, setCountries] = useState<any>([]);
  const [states, setState] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState<any>([]);
  const [villages, setVillages] = useState<any>([]);
  const [checkedProgram, setCheckedProgram] = useState<any>([]);
  const [checkedBrand, setCheckedBrand] = useState<any>([]);
  const [checkedSeason, setCheckedSeason] = useState<any>([]);
  const [checkedCountries, setCheckedCountries] = useState<any>([]);
  const [checkedState, setCheckedState] = useState<any>([]);
  const [checkedDistrict, setCheckedDistrict] = useState<any>([]);
  const [checkedBlock, setCheckedBlock] = useState<any>([]);
  const [checkedVillage, setCheckedVillage] = useState<any>([]);
  const [dashboard, setDashboard] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [percentage, setPercentage] = useState<any>({});

  const chartGroupData: any = Object?.values(dashboard);
  const chartData = chartGroupData?.splice(2)?.map(Number)
  useEffect(() => {
    const estimatedPaddy = chartGroupData[0];
    const seedPaddy = chartGroupData[1];
    const percentage = (seedPaddy / estimatedPaddy) * 100;
    const differenceFrom100 = 100 - Number(percentage.toFixed(2));
    setPercentage({
      estimate: Number(differenceFrom100?.toFixed(2)),
      total: Number(percentage?.toFixed(2)),
    });
  }, [dashboard]);

  useEffect(() => {
    getPrograms();
    getSeasons();
    getCountries();
  }, []);

  useEffect(() => {
    getDashboard();
  }, [isClear]);

  useEffect(() => {
    if (checkedProgram.length !== 0) {
      getBrands();
    } else {
      setBrands([]);
      setCheckedBrand([]);
    }
  }, [checkedProgram]);

  useEffect(() => {
    if (checkedCountries.length !== 0) {
      getStates();
    } else {
      setState([]);
      setCheckedState([]);
    }
  }, [checkedCountries]);

  useEffect(() => {
    if (checkedState.length !== 0) {
      getDistricts();
    } else {
      setDistricts([]);
      setCheckedDistrict([]);
    }
  }, [checkedState]);

  useEffect(() => {
    if (checkedDistrict.length !== 0) {
      getBlocks();
    } else {
      setBlocks([]);
      setCheckedBlock([]);
    }
  }, [checkedDistrict]);
  useEffect(() => {
    if (checkedBlock.length !== 0) {
      GetVillages();
    } else {
      setVillages([]);
      setCheckedVillage([]);
    }
  }, [checkedBlock]);

  const getDashboard = async () => {
    try {
      const res = await API.get(
        `qr-app/qr-dashboard?brandId=${checkedBrand}&countryId=${checkedCountries}&programId=${checkedProgram}&stateId=${checkedState}&districtId=${checkedDistrict}&blockId=${checkedBlock}&villageId=${checkedVillage}&seasonId=${checkedSeason}`
      );
      if (res.success) {
        setDashboard(res.data);
      } else {
        console.error("Failed to fetch dashboard data:", res.error);
      }
    } catch (error) {
      console.error("Error during dashboard data fetching:", error);
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get("program?status=true");
      if (res.success) {
        setPrograms(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      if (checkedProgram.length !== 0) {
        const res = await API.get(`brand?programId=${checkedProgram}`);
        if (res.success) {
          setBrands(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSeasons = async () => {
    try {
      const response = await API.get("season");
      setSeasons(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStates = async () => {
    try {
      if (checkedCountries.length !== 0) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${checkedCountries}`
        );
        if (res.success) {
          setState(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      if (checkedState.length !== 0) {
        const res = await API.get(
          `location/get-districts?stateId=${checkedState}`
        );
        if (res.success) {
          setDistricts(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      if (checkedDistrict.length !== 0) {
        const res = await API.get(
          `location/get-blocks?districtId=${checkedDistrict}`
        );
        if (res.success) {
          setBlocks(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetVillages = async () => {
    try {
      if (checkedBlock.length !== 0) {
        const res = await API.get(
          `location/get-villages?blockId=${checkedBlock}`
        );
        if (res.success) {
          setVillages(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "program") {
      if (checkedProgram.includes(itemId)) {
        setCheckedProgram(
          checkedProgram.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgram([...checkedProgram, itemId]);
      }
    } else if (name === "brand") {
      if (checkedBrand.includes(itemId)) {
        setCheckedBrand(checkedBrand.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrand([...checkedBrand, itemId]);
      }
    } else if (name === "season") {
      if (checkedSeason.includes(itemId)) {
        setCheckedSeason(checkedSeason.filter((item: any) => item !== itemId));
      } else {
        setCheckedSeason([...checkedSeason, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "state") {
      if (checkedState.includes(itemId)) {
        setCheckedState(checkedState.filter((item: any) => item !== itemId));
      } else {
        setCheckedState([...checkedState, itemId]);
      }
    } else if (name === "district") {
      if (checkedDistrict.includes(itemId)) {
        setCheckedDistrict(
          checkedDistrict.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedDistrict([...checkedDistrict, itemId]);
      }
    } else if (name === "block") {
      if (checkedBlock.includes(itemId)) {
        setCheckedBlock(checkedBlock.filter((item: any) => item !== itemId));
      } else {
        setCheckedBlock([...checkedBlock, itemId]);
      }
    } else if (name === "village") {
      if (checkedVillage.includes(itemId)) {
        setCheckedVillage(
          checkedVillage.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedVillage([...checkedVillage, itemId]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedProgram([]);
    setCheckedBrand([]);
    setCheckedSeason([]);
    setCheckedCountries([]);
    setCheckedState([]);
    setCheckedDistrict([]);
    setCheckedBlock([]);
    setCheckedVillage([]);
    setIsClear(!isClear);
  };
  //end
  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
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
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={programs?.filter((item: any) =>
                            checkedProgram.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "program");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "program")
                          }
                          options={programs}
                          showCheckbox
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Brand
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="brand_name"
                          selectedValues={brands?.filter((item: any) =>
                            checkedBrand.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "brand");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "brand")
                          }
                          options={brands}
                          showCheckbox
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Season
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
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "season")
                          }
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={countries?.filter((item: any) =>
                            checkedCountries.includes(item.id)
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
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          State
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="state_name"
                          selectedValues={states?.filter((item: any) =>
                            checkedState.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "state");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "state")
                          }
                          options={states}
                          showCheckbox
                        />
                      </div>

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          District
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="district_name"
                          selectedValues={districts?.filter((item: any) =>
                            checkedDistrict.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "district"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "district")
                          }
                          options={districts}
                          showCheckbox
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Block
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="block_name"
                          selectedValues={blocks?.filter((item: any) =>
                            checkedBlock.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "block");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "block")
                          }
                          options={blocks}
                          showCheckbox
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Village
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="village_name"
                          selectedValues={villages?.filter((item: any) =>
                            checkedVillage.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "village");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "village")
                          }
                          options={villages}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getDashboard();
                            setShowFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilterList}
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

  if (loading) {
    return <div> Loading...</div>;
  }
  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <Link href="/dashboard">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>QR Procurement Dashboard</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="farm-group-box">
        <div className="farm-group-inner">
          <div className="table-form ">
            <div className="table-minwidth w-100">
              <div className="search-filter-row">
                <div className="search-filter-left ">
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
              </div>
              <div>
                <div className="row">
                  <div className="col-md-6 col-sm-12">
                    <Accordian
                      title={"QR code procurement status"}
                      content={
                        <ChartsGrouped
                          type="column"
                          title="QR code procurement status"
                          categoriesList={[
                            "Total seed paddy procured through QR code",
                            "Total estimated production",
                          ]}
                          tooltipShow={{
                            pointFormat: "{series.name}: <b>{point.y:.2f}%</b>",
                          }}
                          dataChart={[
                            {
                              type: "pie",
                              name: "Qrcode Status",
                              data: [
                                {
                                  name: "Total seed paddy procured through QR code",
                                  y: percentage?.total || 0,
                                },
                                {
                                  name: "Total estimated production",
                                  y: percentage?.estimate || 0,
                                },
                              ],
                            },
                          ]}
                        />
                      }
                    />
                  </div>
                  <div className="col-md-6 col-sm-12">
                    <Accordian
                      title={"QR code transaction status"}
                      content={
                        <ChartsGrouped
                          type="column"
                          title="QR code transaction status"
                          categoriesList={[
                            "Total no of farmers in village",
                            "Total no of farmers using QR code in village",
                            "Total no of farmers present QR code single time",
                            "Total no of farmers present QR code double time",
                            "Total no of farmers present QR code triple time",
                          ]}
                          tooltipShow={{
                            pointFormat: "<b>{point.y}</b>",
                          }}
                          dataChart={[{
                            showInLegend: false,
                            name: "",
                            data: chartData,
                          }]}
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
