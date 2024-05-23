"use client";

import React, { useState, useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import useTranslations from "@hooks/useTranslation";
import { BiFilterAlt } from "react-icons/bi";
import { IoMdNotificationsOutline } from "react-icons/io";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import { Scrollbars } from "react-custom-scrollbars";
import Multiselect from "multiselect-react-dropdown";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import { MdLocationPin } from "react-icons/md";
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";

const L = typeof window !== 'undefined' ? require("leaflet") : null;

let Icon = null;
if (typeof window !== 'undefined') {
  Icon = require("leaflet").Icon;
}

const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), {
  ssr: false,
});

const customIcon = Icon ? new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(
    renderToString(<MdLocationPin />)
  )}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
}) : null;

export default function page() {
  useTitle("Processor Registration");
  const [roleLoading] = useRole();

  const [hasAccess, setHasAccess] = useState<any>({});
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const { translations, loading } = useTranslations();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [activeProcessor, setActiveProcessor] = useState("Mandi");
  const [isListViewActive, setIsListViewActive] = useState<any>(true);
  const [activeMapIndex, setActiveMapIndex] = useState<number>(0);
  const [isClear, setIsClear] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  const brandId = User.brandId;

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Processor Registration");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (checkedCountries?.length > 0) {
      getStates();
    } else {
      setStates([]);
    }
  }, [checkedCountries]);

  useEffect(() => {
    getProcessorList();
  }, [brandId, activeProcessor, limit, page, searchQuery, isClear]);

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const getProcessorList = async () => {
    let processor = activeProcessor.toLowerCase().split(' ').join('-');
    // let processor = 'mandi';
    const url = `${processor=="farm"?"farm-processor":processor}?search=${searchQuery}&brandId=${brandId ? brandId : ""
      }&countryId=${checkedCountries}&stateId=${checkedStates}&limit=${limit}&page=${page}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
      setActiveMapIndex(0);

      if (response.data.length > 0) {
        setSelectedLocation({
          name: response.data[0]?.name,
          latitude: response.data[0]?.latitude,
          longitude: response.data[0]?.longitude,
        });
      } else {
        setSelectedLocation(null);
        setCount(0);
      }
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedStates([]);
    setIsClear(!isClear);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "states") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
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
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full top-0 align-items-center w-auto z-[9999] fixed justify-center left-0 right-0 bottom-0 p-3 "
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Country
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            id="countries"
                            displayValue="county_name"
                            selectedValues={countries?.filter((item: any) =>
                              checkedCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              )
                            }
                            options={countries}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a States
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="state_name"
                            selectedValues={states?.filter((item: any) =>
                              checkedStates.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "states"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "states")
                            }
                            options={states}
                            showCheckbox
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getProcessorList();
                              setShowFilter(false);
                            }}
                          >
                            APPLY ALL FILTERS
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={clearFilter}
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
          </>
        )}
      </div>
    );
  };
  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  const handleActiveMapList = (index: number) => {
    setActiveMapIndex(index);
    setSelectedLocation({
      name: data[index]?.name,
      latitude: data[index]?.latitude,
      longitude: data[index]?.longitude,
    });
  };

  const switchProcessorTab = (processorType: string) => {
    setCheckedCountries([]);
    setCheckedStates([]);
    setSearchQuery("");
    setActiveProcessor(processorType);
  };

  if (loading && roleLoading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }
  if (!roleLoading && !hasAccess.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      width: '70px',
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium"> {`${activeProcessor} Name`}</p>,
      selector: (row: any) => row.name,
      cell: (row: any) => (
        <>
          {hasAccess?.edit ? (
            <Link
              // legacyBehavior
              href={`/settings/processor-registration/${activeProcessor.toLowerCase().split(' ').join('-')}/view-${activeProcessor.toLowerCase().split(' ').join('-')}?id=${row.id
                }`}
            // passHref
            >
              <span
                className="text-blue-500 hover:text-blue-300"
              // rel="noopener noreferrer"
              >
                {row.name}
              </span>
            </Link>
          ) : (
            <div>{row.name}</div>
          )}
        </>
      ),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Address</p>,
      selector: (row: any) => row.address,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Website</p>,
      selector: (row: any) => row.website,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Contact Person Name</p>,
      selector: (row: any) => row.contact_person,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Mobile No.</p>,
      selector: (row: any) => row.mobile,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">LandLine No.</p>,
      selector: (row: any) => row.landline,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Email</p>,
      selector: (row: any) => row.email,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Delete</p>,
      cell: (row: any) => (
        <>
          {hasAccess?.edit && (
            <button onClick={() => handleDelete(row.id)}>
              <AiFillDelete
                size={30}
                className="mr-4  p-1.5  bg-red-500 text-white"
              />
            </button>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  function renderView({ style, ...props }: any) {
    const viewStyle = {
      backgroundColor: `rgba(0,0,0,0.4)`,
    };
    return (
      <div className="box" style={{ ...style, ...viewStyle }} {...props} />
    );
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link
                  href={!brandId ? "/dashboard" : "/brand/dashboard"}
                  className="active"
                >
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Settings</li>
              <li>
                {" "}
                <Link
                  href="/settings/processor-registration"
                  className="active"
                >
                  Processor Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="traderMapCz">
        <div className="topTrader">
          <section>
             <button
              className={`${activeProcessor === "Mandi" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Mandi")}
            >
              Mandi
            </button>
            <button
              className={`${activeProcessor === "Mill" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Mill")}
            >
              Mill
            </button>
            <button
              className={`${activeProcessor === "Third Party Inspection" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Third Party Inspection")}
            >
              Third Party Inspection
            </button>
            <button
              className={`${activeProcessor === "Lab" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Lab")}
            >
              Lab
            </button>
            <button
              className={`${activeProcessor === "Container Management System" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Container Management System")}
            >
              Container Management System
            </button>
            <button
              className={`${activeProcessor === "Farm" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Farm")}
            >
             Farm
            </button>
            {/* 
            <button
              className={`${activeProcessor === "Knitter" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Knitter")}
            >
              Knitter
            </button>
            <button
              className={`${activeProcessor === "Weaver" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Weaver")}
            >
              Weaver
            </button>
            <button
              className={`${activeProcessor === "Fabric" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Fabric")}
            >
              Fabric
            </button>
            <button
              className={`${activeProcessor === "Garment" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Garment")}
            >
              Garment
            </button> */}
            {/* <button
              className={`${
                activeProcessor === "Trader" ? "activeFilter" : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Trader")}
            >
              Trader
            </button> */}
            {/* <button
              className={`${activeProcessor === "Physical Partner" ? "activeFilter" : ""
                }`}
              type="button"
              onClick={() => switchProcessorTab("Physical Partner")}
            >
              Physical Partner
            </button> */}
          </section>
          <section className="buttonTab">
            <button
              className={`${isListViewActive ? "" : "activeView"}`}
              type="button"
              onClick={() => setIsListViewActive(false)}
            >
              Map View
            </button>
            <button
              className={`${isListViewActive ? "activeView" : ""}`}
              type="button"
              onClick={() => setIsListViewActive(true)}
            >
              List View
            </button>
          </section>
          {hasAccess?.create && (
            <section>
              <button
                type="button"
                className=""
                onClick={() =>
                  router.push("/settings/processor-registration/add-processor")
                }
              >
                Add
              </button>
            </section>
          )}
        </div>
        {!isListViewActive ? (
          <div className="leftRightTrader">
            {/* Map View */}
            <div className="leftView">
              <div className="search-bars">
                <form className="form-group mb-0 search-bar-inner">
                  {/* search */}
                  <input
                    type="text"
                    className="form-control form-control-new jsSearchBar "
                    placeholder={translations.common.search}
                    value={searchQuery}
                    onChange={searchData}
                  />
                  <button type="submit" className="search-btn">
                    <span className="icon-search"></span>
                  </button>
                </form>
              </div>
              <div className="headTrader">
                <h6>All {activeProcessor}s </h6>
                <button
                  className="flex"
                  type="button"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  FILTERS <BiFilterAlt className="m-1" />
                </button>
              </div>
              <div className="listScrollable">
                <Scrollbars
                  renderThumbVertical={renderView}
                  autoHide
                  autoHideTimeout={5000}
                  autoHideDuration={500}
                  autoHeight
                  autoHeightMin={0}
                  autoHeightMax={200}
                  thumbMinSize={30}
                  universal={true}
                >
                  <ul>
                    {data?.map((item: any, index: number) => (
                      <li
                        key={item.id}
                        className={`${activeMapIndex === index ? "listActiveView" : ""
                          }`}
                        onClick={() => handleActiveMapList(index)}
                      >
                        <section>
                          <h6>{item?.short_name}</h6>{" "}
                          <span>
                            <IoMdNotificationsOutline />
                            {item?.mobile}
                          </span>
                        </section>
                        <p>{item?.name}</p>
                      </li>
                    ))}
                    {/* <li>
                      <section>
                        <h6>Crystal Xu</h6>{" "}
                        <span>
                          <IoMdNotificationsOutline />
                          76878965
                        </span>
                      </section>
                      <p>
                        Shanghai Chisage (U&K) International Trading
                        Cooperative.
                      </p>
                      <p>Ltd</p>
                    </li> */}
                  </ul>
                </Scrollbars>
              </div>
            </div>
            <div className="rightView">
              {(typeof window !== 'undefined' && selectedLocation) && (
                <MapContainer
                  key={Math.random()}
                  center={[
                    selectedLocation?.latitude || 0,
                    selectedLocation?.longitude || 0,
                  ]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {(typeof window !== 'undefined' && selectedLocation) && (
                    <Marker
                      position={[
                        selectedLocation?.latitude,
                        selectedLocation?.longitude,
                      ]}
                      icon={customIcon}
                    >
                      <Popup>
                        {(typeof window !== 'undefined' && selectedLocation) && (
                          <div>
                            <h2>{selectedLocation?.name}</h2>
                            <p>Latitude: {selectedLocation?.latitude}</p>
                            <p>Longitude: {selectedLocation?.longitude}</p>
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        ) : (
          <div className="farm-group-box">
            {/* List View */}
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
                            placeholder={translations.common.search}
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
                      </div>
                    </div>

                    {/* <div className="search-filter-right">
                      <button
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push(
                            "/settings/processor-registration/add-processor"
                          )
                        }
                      >
                        Add
                      </button>
                    </div> */}
                  </div>
                  <CommonDataTable
                    columns={columns}
                    count={count}
                    data={data}
                    updateData={updatePage}
                  />
                  {showDeleteConfirmation && (
                    <DeleteConfirmation
                      message="Are you sure you want to delete this?"
                      onDelete={async () => {
                        if (deleteItemId !== null) {
                          let url = activeProcessor.toLowerCase().split(' ').join('-');
                          try {
                            const response = await API.delete(url, {
                              id: deleteItemId,
                            });
                            if (response.success) {
                              toasterSuccess(
                                "Record has been deleted successfully"
                              );
                              getProcessorList();
                            } else {
                              toasterError("Failed to delete record");
                            }
                          } catch (error) {
                            console.log(error, "error");
                            toasterError("An error occurred");
                          }
                          setShowDeleteConfirmation(false);
                          setDeleteItemId(null);
                        }
                      }}
                      onCancel={handleCancel}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <FilterPopup openFilter={showFilter} onClose={!showFilter} />
        </div>
      </div>
    </div>
  );
}
