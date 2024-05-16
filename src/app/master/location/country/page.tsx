"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect } from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1, RxCross2 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { BiCheck } from "react-icons/bi";
import { exportToExcel } from "@components/core/ExcelExporter";
import useDebounce from "@hooks/useDebounce";

interface TableData {
  id: number;
  county_name: string;
  country_status: boolean;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Country");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editId, setEditId] = useState<any>(null);
  const [editDefault, setEditDefault] = useState<string>("");

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [visibleMessage, setVisibleMessage] = useState({
    div1: true,
    div2: true,
  });

  const handleCrossClick = (divId: any) => {
    setVisibleMessage((prevVisibleDivs) => ({
      ...prevVisibleDivs,
      [divId]: false,
    }));
  };

  useEffect(() => {
    fetchCountries();
    setIsClient(true);
  }, [searchQuery, page, limit]);

  const fetchCountries = async () => {
    try {
      const res = await API.get(
        `location/get-countries?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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
  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }
  const changeStatus = async (row: any) => {
    const newStatus = !row.country_status;
    const url = "location/update-country-status";
    try {
      const response = await API.put(url, {
        id: row.id,
        status: newStatus,
      });
      if (response.success) {
        fetchCountries();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const editHandle = (row: any) => {
    setEditId(row.id);
    setEditDefault(row.county_name);
    setShowEditPopup(true);
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,

      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.location?.countryName}</p>,

      selector: (row: TableData) => row.county_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,

      cell: (row: any) => (
        <button
          onClick={() => changeStatus(row)}
          className={row.country_status ? "text-green-500" : "text-red-500"}
        >
          {row.country_status ? (
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

      cell: (row: TableData) => (
        <>
          <button
            className="bg-green-500 p-2 rounded "
            onClick={() => editHandle(row)}
          >
            <LuEdit size={18} color="white" />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 p-2 ml-3 rounded"
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element, index: number) => {
        return {
          srNo: (page - 1) * limit + index + 1,
          country_name: element.county_name,
          country_status: element.country_status,
        };
      });
      exportToExcel(dataToExport, "Master-Location-Country Data");
    } else {
      toasterError("Nothing to export!");
    }
  };

  const handleCancel = () => {
    setShowEditPopup(false);
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  if (!roleLoading) {
    return (
      <div className="">
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "location/delete-country";
                try {
                  const response = await API.post(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully", deleteItemId, 5000);
                    fetchCountries();
                  } else {
                    toasterError(response.error.code, deleteItemId, 5000);
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
                    <li>Location</li>
                    <li>Country</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form lr-mCustomScrollbar">
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
                            router.push("/master/location/country/add-country")
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
                openPopup={showEditPopup}
                onCancel={handleCancel}
                editId={editId}
                defaultValue={editDefault}
                getItems={fetchCountries}
              />
            </div>
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}

const Edit = ({ openPopup, onCancel, editId, defaultValue, getItems }: any) => {
  const [countryName, setCountryName] = useState<any>("");
  const [error, setError] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCountryName(value);
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSubmitting(true);
    const { value } = event.target;
    const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regexAlphabets.test(value);

    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors['country'] = value.trim() === "" ? "Field is required" : "Enter Only Alphabets";
    } else {
      const onBlurError = await alreadyExistName(value);
      newErrors['country'] = onBlurError;
    }
    setError(newErrors);
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("location/check-countries", {
      id: editId,
      countryName: value
    });

    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      setIsSubmitting(false);
      return '';
    }
  }

  const handleCancel = () => {
    setCountryName(defaultValue);
    onCancel();
    setError({});
  };

  const handleSubmit = async () => {
    const url = "location/update-country";

    const hasMergeErrors = Object.values(error).some((error: any) => error !== '');

    if (!hasMergeErrors) {
      try {
        const response = await API.post(url, {
          id: editId,
          countryName: countryName,
        });
        if (response.success) {
          toasterSuccess("Record has been updated successfully",
            response.data.id, 3000);
          getItems();
          onCancel();
          setError({});
        } else {
          toasterError(
            response.error.code === "ALREADY_EXITS"
              ? "Country already exist"
              : response.error.code,
            response.data.id,
            3000
          );
          onCancel();
        }
      } catch (error: any) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    setCountryName(defaultValue);
  }, [defaultValue]);

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3>Edit Country</h3>
              <button onClick={handleCancel}>&times;</button>
            </div>
            <hr />
            <div className="py-2">
              <div className="flex  justify-between">
                <span className="text-sm mr-8">Country Name * </span>
                <div>
                  <input
                    type="text"
                    id="countryName"
                    name="countryName"
                    value={countryName || ""}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder="Country Name"
                  />
                  {error?.country && (
                    <div className="text-red-500 py-1 text-sm">
                      {error.country}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-5 flex justify-end border-t">
              <button
                onClick={handleSubmit}
                className="bg-[#D15E9C] mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
                disabled={isSubmitting}
                style={
                  isSubmitting
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
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
