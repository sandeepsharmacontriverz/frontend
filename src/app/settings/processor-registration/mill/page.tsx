"use client";
import React, { useState, useEffect, useRef } from "react";

import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import API from "@lib/Api";
import useTranslations from "@hooks/useTranslation";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { BiFilterAlt } from "react-icons/bi";

export default function page() {
  useTitle("Mill Processing");
  const [roleLoading] = useRole();
  const { translations, loading }: any = useTranslations();

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkedCountries, setCheckedCountries] = useState<any>([]);
  const [checkedStates, setCheckedStates] = useState<any>([]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [programs, setPrograms] = useState<any>([]);
  const [isClient, setIsClient] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const search = searchFilter;
  const [isActive, setIsActive] = useState<any>({
    country: false,
    state: false,
  });

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchCountry();
    getPrograms();
  }, []);

  useEffect(() => {
    setStates([]);
    if (checkedCountries.length > 0) {
      fetchState();
    }
  }, [checkedCountries]);

  useEffect(() => {
    fetchSpinners();
    setIsClient(true);
  }, [limit, page, searchQuery]);

  const fetchSpinners = async () => {
    try {
      const res = await API.get(
        `spinner?countryId=${checkedCountries}&stateId=${checkedStates}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      setCount(0);
      console.log(error);
    }
  };

  const clearFilter = () => {
    setCheckedStates([]);
    setCheckedCountries([]);
    setIsActive({
      country: false,
      state: false,
    });
    setSearchFilter("");
  };

  const fetchCountry = async () => {
    try {
      const res = await API.get(`location/get-countries?status=true`);
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchState = async () => {
    try {
      const res = await API.get(
        `location/get-states?status=true&countryId=${checkedCountries}`
      );
      if (res.success) {
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPrograms = async () => {
    const url = "program?status=true";
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

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  //Delete Confirmation Popup
  const handleDelete = (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const getProgramName = (ids: any) => {
    const matchId = programs
      ?.filter((item: any) => ids.includes(item.id))
      .map((item: any) => item.program_name);
    const getId = matchId.map((country: any) => country);
    return getId.join(", ");
  };

  //set table rows data
  const columns = [
    {
      name: "S.No.",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: "Mill Processing Name",
      selector: (row: any) => row.name,
      cell: (row: any) => (
        <Link
          // legacyBehavior
          href={`/settings/processor-registration/mill-processing/view-mill?id=${row.id}`}
        // passHref
        >
          <span className="hover:text-blue-500" rel="noopener noreferrer">
            {row.name}
          </span>
        </Link>
      ),
      sortable: false,
    },

    {
      name: "Address",
      selector: (row: any) => row.address,
      sortable: false,
    },
    {
      name: "Program",
      selector: (row: any) => getProgramName(row.program_id),
      sortable: false,
    },
    {
      name: "Mobile No.",
      selector: (row: any) => row.mobile,
      sortable: false,
    },
    {
      name: "LandLine No.",
      selector: (row: any) => row.landline,
      sortable: false,
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: false,
    },
    {
      name: "Delete",
      cell: (row: any) => (
        <>
          <button onClick={() => handleDelete(row.id)}>
            <AiFillDelete
              size={30}
              className="mr-4  p-1.5  bg-red-500 text-white"
            />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  //handle filter change
  const handleFilterChange = (itemId: any, name: string) => {
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

  const filterData = async () => {
    try {
      const res = await API.get(
        `spinner?countryId=${checkedCountries}&stateId=${checkedStates}&limit=${limit}&page=${page}&search=${searchFilter}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
        setShowFilter(false);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilter(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

    const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setSearchFilter(e.target.value);
    };

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="absolute flex h-fit w-auto z-40 justify-center bg-transparent  p-3 "
          >
            <div className="bg-white border w-auto py-3  px-2 border-gray-300 shadow-lg rounded-md">
              <input
                type="text"
                autoFocus={true}
                name="searchFilter"
                placeholder={translations.common.search}
                className="border bg-inherit rounded text-sm w-80 p-2 mb-3"
                value={search}
                onChange={filterSearch}
              />

              <div className="filter-accodian">
                <span
                  className={`${isActive.country ? "active" : ""
                    } filters-row filters-links`}
                  onClick={() =>
                    setIsActive((prevData: any) => ({
                      ...prevData,
                      country: !prevData.country,
                    }))
                  }
                >
                  Country
                </span>
                {isActive.country === true && (
                  <div className="filter-body" style={{ display: "block" }}>
                    <div>
                      {countries?.map((country: any) => (
                        <div key={country.id}>
                          <input
                            name="countries"
                            id="countries"
                            value={country.id}
                            type="checkbox"
                            checked={checkedCountries.includes(country.id)}
                            onChange={() =>
                              handleFilterChange(country.id, "countries")
                            }
                          />
                          <span className="text-sm">
                            {" "}
                            {country.county_name}{" "}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="filter-accodian" style={{ fontSize: 10 }}>
                <span
                  className={`${isActive.state ? "active" : ""
                    } filters-row filters-links text-md`}
                  onClick={() => {
                    setIsActive((prevData: any) => ({
                      ...prevData,
                      state: !prevData.state,
                    }));
                  }}
                >
                  State
                </span>
                {isActive.state === true && (
                  <div className="" style={{ display: "block" }}>
                    <div>
                      {states?.map((state: any) => (
                        <div key={state.id}>
                          <input
                            name="states"
                            value={state.id}
                            type="checkbox"
                            checked={checkedStates.includes(state.id)}
                            onChange={() =>
                              handleFilterChange(state.id, "states")
                            }
                          />
                          <span className="text-sm"> {state.state_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-3 w-full px-2">
                <button
                  className="mr-2 w-1/2 text-sm text-blue-900 font-semibold py-2 px-4 rounded-[10px] border-1 border-blue-900"
                  onClick={clearFilter}
                >
                  Clear
                </button>
                <button
                  className="mr-2 bg-blue-900 w-1/2  text-white text-sm font-semibold py-2 px-4 rounded-[10px] border"
                  onClick={filterData}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (roleLoading || loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <Link href="/dashboard">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Settings</li>
              <li>
                <Link href="/services/processor-registration">Mill Processing</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {isClient ? (
        <>
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
                            placeholder={translations.common.search}
                            value={searchQuery}
                            onChange={(e: any) =>
                              setSearchQuery(e.target.value)
                            }
                          />
                          <button type="submit" className="search-btn">
                            <span className="icon-search"></span>
                          </button>
                        </form>
                      </div>

                      <div className="mt-2">
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
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push(
                            "/settings/processor-registration/add-processor"
                          )
                        }
                      >
                        {translations.common.add}
                      </button>
                    </div>
                  </div>
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
        </>
      ) : (
        "loading"
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this?"
          onDelete={async () => {
            if (deleteItemId !== null) {
              const url = "spinner";
              try {
                const response = await API.delete(url, {
                  id: deleteItemId,
                });
                if (response.success) {
                  toasterSuccess("Record has been deleted successfully");
                  fetchSpinners();
                } else {
                  toasterError(response.error.code, 5000, deleteItemId);
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
    </>
  );
}
