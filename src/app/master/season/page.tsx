"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuFileEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";

import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import User from "@lib/User";
import API from "@lib/Api";
import "react-datepicker/dist/react-datepicker.css";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import Link from "@components/core/nav-link";
import { exportToExcel } from "@components/core/ExcelExporter";

const season: React.FC = () => {
  useTitle("Season");
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [data, setData] = useState([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [editDefault, setEditDefault] = useState<string>("");
  const [editFrom, setEditFrom] = useState<string>("");
  const [editTo, setEditTo] = useState<string>("");
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getSeasons = async () => {
    const url = `season?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const editHandle = (row: any) => {
    setEditId(row.id);
    setEditDefault(row.name);
    setEditVisible(true);
    setEditFrom(row.from);
    setEditTo(row.to);
  };
  const handleCancel = () => {
    setEditVisible(false);
    setShowDeleteConfirmation(false);
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const changeStatus = async (row: any) => {
    const newStatus = !row.status;
    const url = "season/status";
    try {
      const response = await API.put(url, {
        id: row.id,
        status: newStatus,
      });
      if (response.success) {
        getSeasons();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: (page - 1) * limit + index + 1,
          season_name: element.name,
          from: dateFormatter(element.from),
          to: dateFormatter(element.to),
          status: element.status,
        };
      });
      exportToExcel(dataToExport, "Master-Season Data");
    } else {
      toasterError("Nothing to export!");
    }
  };

  useEffect(() => {
    getSeasons();
  }, [searchQuery, page, limit]);

  const dateFormatter = (date: any) => {
    const newDate = new Date(date);
    const formattedDate = newDate.toISOString().split("T")[0];
    return formattedDate;
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.seasonName}</p>,
      cell: (row: any) => row.name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.from}</p>,
      cell: (row: any) => dateFormatter(row.from),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.to}</p>,
      cell: (row: any) => dateFormatter(row.to),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,
      cell: (row: any) => (
        <button
          onClick={() => changeStatus(row)}
          className={row.status ? "text-green-500" : "text-red-500"}
        >
          {row.status ? (
            <BsCheckLg size={20} className="mr-4" />
          ) : (
            <RxCross1 size={20} className="mr-4" />
          )}
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.action}</p>,

      cell: (row: any) => (
        <>
          <button
            className="bg-green-500 p-2 rounded"
            onClick={() => editHandle(row)}
          >
            <LuFileEdit size={18} color="white" />
          </button>
          <button
            className="bg-red-500 p-2 ml-3 rounded"
            onClick={() => handleDelete(row.id)}
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
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
                      <Link href="/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Master</li>
                    <li>Season</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth min-w-[650px]">
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
                      </div>
                      <div className="search-filter-right">
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() =>
                            router.push("/master/season/add-season")
                          }
                        >
                          {translations.common.add}
                        </button>
                      </div>
                    </div>

                    <div className="flex mt-2 justify-end borderFix pt-2 pb-2">
                      <div className="search-filter-right">
                        <button
                          onClick={handleExport}
                          className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                        >
                          {translations.common.export}
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
            <div>
              <Edit
                openPopup={editVisible}
                onCancel={handleCancel}
                editId={editId}
                defaultValue={editDefault}
                defaultFrom={editFrom}
                defaultTo={editTo}
                getItems={getSeasons}
              />
            </div>
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "season";
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId,
                      });
                      if (response.success) {
                        toasterSuccess(
                          "Record has been deleted successfully",
                          deleteItemId,
                          5000
                        );
                        getSeasons();
                      } else {
                        toasterError(
                          "Failed to delete record",
                          deleteItemId,
                          5000
                        );
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
          <div className="w-full min-h-screen flex justify-center items-center">
            <span>Processing...</span>
          </div>
        )}
      </div>
    );
  }
};

export default season;

const Edit = ({
  openPopup,
  onCancel,
  editId,
  defaultValue,
  defaultFrom,
  defaultTo,
  getItems,
}: any) => {
  const [seasonName, setSeasonName] = useState<any>("");
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [selectedSDate, setSelectedSDate] = useState<any>(null);
  const [selectedEDate, setSelectedEDate] = useState<any>(null);
  const [errorCode, setErrorCode] = useState<any>(null);
  useEffect(() => {
    if (!openPopup) {
      setErrorCode(null);
    }
  }, [openPopup]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSeasonName(value);
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("season/check-seasons", {
      id: editId,
      name: value,
    });

    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return "";
    }
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regexAlphabets.test(value); // Use 'value' instead of 'countryName' here
    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors["name"] =
        value.trim() === ""
          ? "Season Name is required"
          : "Enter Only Digits and hyphen(-)";
    } else {
      const onBlurError = await alreadyExistName(value);
      newErrors["name"] = onBlurError;
    }

    setError(newErrors);
  };

  const handleCancel = () => {
    // setFrom(from)
    // setTo(to)
    onCancel();
    setSeasonName(defaultValue);

    if (defaultFrom && defaultTo) {
      const dateFrom = new Date(defaultFrom);
      setFrom(dateFrom);
      setSelectedSDate(defaultFrom);

      const dateTo = new Date(defaultTo);
      setTo(dateTo);
      setSelectedEDate(defaultTo);
    }
    setError({
      name: "",
      from: "",
      to: "",
    });
  };

  const handleFrom = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setFrom(date);
    setSelectedSDate(newDate);
  };

  const handleEndDate = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setTo(date);
    setSelectedEDate(newDate);
  };
  const [error, setError] = useState({
    name: "",
    from: "",
    to: "",
  });

  const handleSubmit = async () => {
    const regex: any = /^[0-9\-]+$/;
    const valid = regex.test(seasonName);
    if (!seasonName || !valid) {
      setError((prevError) => ({
        ...prevError,
        name: !seasonName
          ? "Season Name is required"
          : "Enter Only Digits and hyphen(-)",
      }));
    }
    if (!from) {
      setError((prevError) => ({
        ...prevError,
        from: "From date is required",
      }));
    }
    if (!to) {
      setError((prevError) => ({
        ...prevError,
        to: "To date is required",
      }));
    } else {
      const url = "season";
      if (seasonName && valid && from && to) {
        const hasMergeErrors = Object.values(error).some(
          (error: any) => error !== ""
        );
        if (!hasMergeErrors) {
          try {
            const response = await API.put(url, {
              id: editId,
              name: seasonName,
              from: selectedSDate,
              to: selectedEDate,
            });
            if (response.success) {
              toasterSuccess(
                "Record has been deleted successfully",
                response.data.id,
                3000
              );
              getItems();
              handleCancel();
            } else {
              setErrorCode(response.error.code);
            }
          } catch (error) {
            console.log(error, "error");
            setErrorCode(null);
          }
        }
      }
    }
  };

  useEffect(() => {
    setSeasonName(defaultValue);

    if (defaultFrom && defaultTo) {
      const dateFrom = new Date(defaultFrom);
      setFrom(dateFrom);
      setSelectedSDate(defaultFrom);

      const dateTo = new Date(defaultTo);
      setTo(dateTo);
      setSelectedEDate(defaultTo);
    }
  }, [defaultValue, defaultFrom, defaultTo]);

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }
  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3>Edit Season</h3>
              <button onClick={handleCancel}>&times;</button>
            </div>
            <hr />
            <div className="py-2">
              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Season Name *</span>
                <div>
                  <input
                    type="text"
                    id="fabricType"
                    name="fabricType"
                    value={seasonName}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder="Season Name"
                  />

                  {error.name ? (
                    <p className="text-red-500 text-sm mt-1">{error.name}</p>
                  ) : (
                    errorCode && (
                      <p className="text-red-500 text-sm mt-1">{errorCode}</p>
                    )
                  )}
                </div>
              </div>
              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">From*</span>
                <div>
                  <DatePicker
                    selected={from}
                    selectsStart
                    startDate={from}
                    endDate={to}
                    onChange={handleFrom}
                    showYearDropdown
                    placeholderText={translations.common.from + "*"}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                  />
                  {error.from && (
                    <p className="text-red-500 text-sm ml-5 mt-1">
                      {error.from}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">To*</span>
                <div>
                  <DatePicker
                    selected={to}
                    selectsEnd
                    startDate={from}
                    endDate={to}
                    minDate={from}
                    onChange={handleEndDate}
                    showYearDropdown
                    placeholderText={translations.common.to + "*"}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                  />
                  {error.to && (
                    <p className="text-red-500 text-sm ml-5 mt-1">{error.to}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-5 flex justify-end border-t">
              <button
                onClick={handleSubmit}
                className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
              >
                Submit
              </button>
              <button
                onClick={handleCancel}
                className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
