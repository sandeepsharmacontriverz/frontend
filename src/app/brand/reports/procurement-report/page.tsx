"use client";

import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import Image from "next/image";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";
import moment from "moment";
import Loader from "@components/core/Loader";

export default function transactions() {
  useTitle("Procurement Report");
  const [roleLoading] = useRole();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionsCount, setTransactionsCount] = useState([]);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);
  const [program, setProgram] = useState([]);
  const [ginner, setGinner] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);

  const [showTransactionPopUp, setShowTransactionPopUp] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewData, setViewData] = useState<any>({
    transactionId: null,
    farmerId: null,
    farmerName: null,
    farmerCode: null,
    season: null,
    estimatedCotton: null,
    qualityPurchased: null,
    availableCotton: null,
  });
  const [isActive, setIsActive] = useState<any>({
    country: false,
    season: false,
    ginner: false,
    program: false,
  });
  const code = encodeURIComponent(searchQuery || searchFilter);

  const { translations, loading } = useTranslations();

  const router = useRouter();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getFarmersCount();
    getCountry();
    getSeason();
    getProgram();
  }, []);

  useEffect(() => {
    getGinner();
  }, [checkedCountries]);

  useEffect(() => {
    getTransactions();
  }, [searchQuery, page, limit]);

  const getFarmersCount = async () => {
    const url = "reports/get-procured-quantities";
    try {
      const response = await API.get(url);
      setTransactionsCount(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getTransactions = async () => {
    const url = `reports/get-transactions?brandId=4&search=${code}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setShowTransactionPopUp(false);
  };

  const viewTransactionDetails = (
    transactionId: number,
    farmerId: number,
    farmerCode: string,
    farmerName: string,
    season: any,
    estimatedCotton: number,
    qualityPurchased: number,
    availableCotton: number
  ) => {
    setShowTransactionPopUp(true);
    setViewData({
      transactionId: transactionId,
      farmerId: farmerId,
      farmerName: farmerName,
      farmerCode: farmerCode,
      season: season,
      estimatedCotton: estimatedCotton,
      qualityPurchased: qualityPurchased,
      availableCotton: availableCotton,
    });
  };

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountry(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSeason(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgram = async () => {
    const url = "program";
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

  const getGinner = async () => {
    const url = `ginner?countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleFilterChange = (itemId: any, name: string) => {
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "programs") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "ginners") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedGinners(
          checkedGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinners([...checkedGinners, itemId]);
      }
    }
  };

  const filterData = async () => {
    try {
      const res = await API.get(
        `reports/get-transactions?brandId=4&countryId=${checkedCountries}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&ginnerId=${checkedGinners}&search=${code}&page=${page}&limit=${limit}&pagination=true`
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
    setCheckedGinners([]);
    setCheckedPrograms([]);
    setCheckedSeasons([]);
    setIsActive({
      country: false,
      ginner: false,
      season: false,
      program: false,
    });
    setSearchFilter("");
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
            className="absolute flex w-auto z-40 justify-center p-3 "
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
                  className={`${isActive.program ? "active" : ""
                    } filters-row filters-links`}
                  onClick={() =>
                    setIsActive((prevData: any) => ({
                      ...prevData,
                      program: !prevData.program,
                    }))
                  }
                >
                  Program
                </span>
                {isActive.program && (
                  <div className="filter-body" style={{ display: "block" }}>
                    <div>
                      {program?.map((program: any) => (
                        <div key={program.id}>
                          <input
                            name="programs"
                            id="programs"
                            value={program.id}
                            type="checkbox"
                            checked={checkedPrograms.includes(program.id)}
                            onChange={() =>
                              handleFilterChange(program.id, "programs")
                            }
                          />
                          <span className="text-sm">
                            {" "}
                            {program.program_name}{" "}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                      {country?.map((country: any) => (
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

              <div className="filter-accodian">
                <span
                  className={`${isActive.ginner ? "active" : ""
                    } filters-row filters-links`}
                  onClick={() =>
                    setIsActive((prevData: any) => ({
                      ...prevData,
                      ginner: !prevData.ginner,
                    }))
                  }
                >
                  Ginner
                </span>
                {isActive.ginner && (
                  <div className="filter-body" style={{ display: "block" }}>
                    <div>
                      {ginner?.map((ginner: any) => (
                        <div key={ginner.id}>
                          <input
                            name="ginners"
                            id="ginners"
                            value={ginner.id}
                            type="checkbox"
                            checked={checkedGinners.includes(ginner.id)}
                            onChange={() =>
                              handleFilterChange(ginner.id, "ginners")
                            }
                          />
                          <span className="text-sm"> {ginner.name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="filter-accodian">
                <span
                  className={`${isActive.season ? "active" : ""
                    } filters-row filters-links`}
                  onClick={() =>
                    setIsActive((prevData: any) => ({
                      ...prevData,
                      season: !prevData.season,
                    }))
                  }
                >
                  Season
                </span>
                {isActive.season && (
                  <div className="filter-body" style={{ display: "block" }}>
                    <div>
                      {season?.map((season: any) => (
                        <div key={season.id}>
                          <input
                            name="seasons"
                            id="seasons"
                            value={season.id}
                            type="checkbox"
                            checked={checkedSeasons.includes(season.id)}
                            onChange={() =>
                              handleFilterChange(season.id, "seasons")
                            }
                          />
                          <span className="text-sm"> {season.name} </span>
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

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  if (loading) {
    return <div> <Loader /></div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      width: "70px",
      center: true,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: translations.transactions.date,
      width: "130px",
      center: true,
      wrap: true,
      selector: (row: any) => dateFormatter(row.date),
      sortable: false,
    },
    {
      name: translations.transactions.farmerCode,
      width: "130px",
      center: true,
      wrap: true,
      selector: (row: any) => row.farmer?.code,
      sortable: false,
    },
    {
      name: translations.transactions.farmerName,
      width: "130px",
      center: true,
      wrap: true,
      selector: (row: any) =>
        row.farmer?.firstName + " " + row.farmer?.lastName,
      sortable: false,
    },
    {
      name: translations.transactions.season,
      width: "100px",
      center: true,
      wrap: true,
      cell: (row: any) => (
        <button
          onClick={() =>
            viewTransactionDetails(
              row.id,
              row.farmer_id,
              row.farmer_code,
              row.farmer_name,
              row?.season?.name,
              row.estimated_cotton,
              row.qty_purchased,
              row.available_cotton
            )
          }
          className="hover:text-sky-800"
        >
          {" "}
          {row?.season?.name}{" "}
        </button>
      ),
      sortable: false,
    },
    {
      name: translations.location.countryName,
      width: "120px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.country?.county_name,
      sortable: false,
    },
    {
      name: translations.location.stateName,
      width: "120px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.state?.state_name,
      sortable: false,
    },
    {
      name: translations.location.districtName,
      width: "120px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.district?.district_name,
      sortable: false,
    },
    {
      name: translations.location.taluk,
      width: "140px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.block?.block_name,
      sortable: false,
    },
    {
      name: translations.location.village,
      width: "120px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.village?.village_name,
      sortable: false,
    },
    {
      name: translations.transactions.transactionId,
      width: "120px",
      center: true,
      wrap: true,
      selector: (row: any) => row.id,
      sortable: false,
    },
    {
      name: translations.transactions.totalEstimationProduction,
      width: "200px",
      center: true,
      wrap: true,
      selector: (row: any) => row.estimated_cotton,
      sortable: false,
    },
    {
      name: translations.transactions.quantityPurchased,
      width: "150px",
      center: true,
      wrap: true,
      selector: (row: any) => row.qty_purchased,
      sortable: false,
    },
    {
      name: translations.transactions.availableCotton,
      width: "140px",
      center: true,
      wrap: true,
      selector: (row: any) => row.available_cotton,
      sortable: false,
    },
    {
      name: translations.transactions.price,
      width: "190px",
      center: true,
      wrap: true,
      selector: (row: any) => row.rate,
      sortable: false,
    },
    {
      name: translations.transactions.program,
      width: "100px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.program?.program_name,
      sortable: false,
    },
    {
      name: translations.transactions.vehicleNo,
      width: "100px",
      center: true,
      wrap: true,
      selector: (row: any) => row.vehicle,
      sortable: false,
    },
    {
      name: translations.transactions.ginnerName,
      width: "120px",
      center: true,
      wrap: true,
      cell: (row: any) => row?.ginner?.name,
      sortable: false,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href="/brand/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Reports</li>
                    <li>Processing Report</li>
                    <li>Procurement</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm my-2">
              <span className="font-bold">Note:</span> Only the transactions
              accepted by ginners are listed here
            </p>
            <div className="flex flex-wrap gap-5 ml-5">
              {transactionsCount.map((transaction: any) => (
                <div className="w-auto" key={transaction.program_id}>
                  <div className="relative w-300 h-300 mb-10 border-b border-[#00a69a]">
                    <p className="absolute top-4 left-4 mt-2 text-white text-lg font-semibold">
                      {transaction.program_name}
                    </p>
                    <Image
                      src="/images/cottnchip.png"
                      alt="Image Description"
                      width={300}
                      height={300}
                    />
                    <div className="text-black mt-4 mb-2">
                      PROCURED QUANTITY:{" "}
                      <div className="text-black text-xs font-semibold">
                        {" "}
                        {transaction.total_qty_purchased} Kgs
                      </div>{" "}
                    </div>
                  </div>
                </div>
              ))}

              <div className="w-auto self-start ">
                <div className="relative w-300 h-300 mb-10 border-b border-[#d41b1c]">
                  <div className="absolute mt-2 left-4 text-white">
                    <p className="text-white py-1 text-sm font-semibold">
                      Brand: { }
                    </p>
                    <p className="text-white py-1 text-sm font-semibold">
                      Program: { }
                    </p>
                    <p className="text-white py-1 text-sm font-semibold">
                      Country: { }
                    </p>
                  </div>
                  <Image
                    src="/images/brand.png"
                    alt="Image Description"
                    width={300}
                    height={300}
                  />
                  <div className="text-black  text-sm mt-4 mb-2">
                    PROCURED QUANTITY:{" "}
                    <div className="text-black text-xs font-semibold">
                      {" "}
                      0 Kgs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form ">
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
                    </div>
                    <CommonDataTable
                      columns={columns}
                      count={count}
                      data={data}
                      updateData={updatePage}
                    />
                    <div>
                      <ViewDetailsPopUp
                        onCancel={handleCancel}
                        openPopup={showTransactionPopUp}
                        data={viewData}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "procurement/delete-transaction";
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId,
                      });
                      if (response.success) {
                        toasterSuccess("Record has been deleted successfully");
                        getTransactions();
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
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}

const ViewDetailsPopUp = ({ openPopup, data, onCancel }: any) => {
  const [details, setDetails] = useState<any>({
    transactionId: null,
    farmerId: null,
    farmerName: "",
    farmerCode: "",
    season: null,
    estimatedCotton: null,
    qualityPurchased: null,
    availableCotton: null,
  });

  const handleCancel = () => {
    onCancel();
  };

  useEffect(() => {
    setDetails({
      transactionId: data.transactionId,
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      farmerCode: data.farmerCode,
      season: data.season,
      estimatedCotton: data.estimatedCotton,
      qualityPurchased: data.qualityPurchased,
      availableCotton: data.availableCotton,
    });
  }, [data]);

  const dataToShow = [
    {
      transactionId: details.transactionId,
      estimatedCotton: details.estimatedCotton,
      qualityPurchased: details.qualityPurchased,
      availableCotton: details.availableCotton,
    },
  ];

  const columns = [
    {
      name: "Transaction Id",
      width: "130px",
      wrap: true,
      cell: (row: any) => row.transactionId,
    },
    {
      name: "Estimated Cotton",
      width: "150px",
      wrap: true,
      cell: (row: any) => row.estimatedCotton,
    },
    {
      name: "Quality Purchased",
      width: "150px",
      wrap: true,
      cell: (row: any) => row.qualityPurchased,
    },
    {
      name: "Available Cotton",
      width: "150px",
      wrap: true,
      cell: (row: any) => row.availableCotton,
    },
  ];
  return (
    <div>
      {openPopup && (
        <div className="fixPopup flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
            <div className="flex justify-between">
              <h3 className="text-lg pb-2">Transaction Detail</h3>
              <button className="text-xl" onClick={handleCancel}>
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">
              <div className="flex py-2 justify-between border-y">
                <span className="text-sm w-40 mr-8">Farmer Code</span>
                <p className="block w-60 py-1 px-3 text-sm  bg-white">
                  {details.farmerCode}
                </p>
              </div>

              <div className="flex py-2 justify-between">
                <span className="text-sm mr-8">Farmer Name</span>
                <p className="block w-60 py-1 px-3 text-sm  bg-white">
                  {details.farmerName}
                </p>
              </div>

              <div className="flex py-2 justify-between border-y">
                <span className="text-sm mr-8">Season</span>
                <p className="block w-60 py-1 px-3 mb-3 text-sm  bg-white">
                  {details.season}
                </p>
              </div>

              <DataTable
                persistTableHead
                fixedHeader={true}
                noDataComponent={
                  <p className="py-3 font-bold text-lg">
                    No data available in table
                  </p>
                }
                fixedHeaderScrollHeight={"500px"}
                columns={columns}
                data={dataToShow}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
