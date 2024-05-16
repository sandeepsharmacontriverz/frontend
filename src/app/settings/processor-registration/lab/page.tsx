"use client";
import React, { useState, useEffect, useRef } from "react";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import useTranslations from "@hooks/useTranslation";
import { BiFilterAlt } from "react-icons/bi";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";

export default function page() {
  useTitle("Weaver");
  const [data, setData] = useState([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const { translations, loading } = useTranslations();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();

  const [isActive, setIsActive] = useState<any>({
    country: false,
    state: false,
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

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
  const router = useRouter();

  const getWeaverList = async () => {
    const url = `weaver?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };
  useEffect(() => {
    getWeaverList();
  }, [limit, page, searchQuery]);

  const filterData = async () => {
    try {
      const res = await API.get(
        `weaver?search=${searchFilter}&countryId=${checkedCountries}&stateId=${checkedStates}&limit=${limit}&page=${page}&pagination=true`
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

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedStates([]);
    setIsActive({
      country: false,
      state: false,
    });
    setSearchFilter("");
  };

  const handleChange = (itemId: any, name: string) => {
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

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (checkedCountries) {
      getStates();
    }
  }, [checkedCountries]);

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

    const search = searchFilter;
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
                name="searchFilter"
                key="search"
                autoFocus={true}
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
                              handleChange(country.id, "countries")
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
                            onChange={() => handleChange(state.id, "states")}
                          />
                          <span className="text-sm"> {state.state_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-3 w-full px-2 ">
                <button
                  className=" mr-2 w-1/2 text-sm border-blue-900 text-blue-900 font-bold py-2 px-4 rounded border"
                  onClick={clearFilter}
                >
                  Clear
                </button>
                <button
                  className="mr-2 bg-blue-900 w-1/2  text-white text-sm font-bold py-2 px-4 rounded border"
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
  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }
  const columns = [
    {
      name: "S No.",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: "Weaving Unit Name",
      selector: (row: any) => row.name,
      cell: (row: any) => (
        <Link
          // legacyBehavior
          href={`/settings/processor-registration/weaver/view-weaver?id=${row.id}`}
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
      name: "Website",
      selector: (row: any) => row.website,
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
              <li>Processor Registration</li>
              <li>Weaver</li>
            </ul>
          </div>
        </div>
      </div>

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
                        onChange={searchData}
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
                    Add
                  </button>
                </div>
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
                      const url = "weaver";
                      try {
                        const response = await API.delete(url, {
                          id: deleteItemId,
                        });
                        if (response.success) {
                          toasterSuccess(
                            "Record has been deleted successfully"
                          );
                          getWeaverList();
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
    </div>
  );
}
