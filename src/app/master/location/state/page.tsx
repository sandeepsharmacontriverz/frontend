"use client";

import { useRouter } from '@lib/router-events';
import React, { useState, useEffect, useRef } from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { BiFilterAlt } from "react-icons/bi";
import CommonDataTable from '@components/core/Table';
import useTranslations from '@hooks/useTranslation';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import useTitle from '@hooks/useTitle';
import useRole from '@hooks/useRole';
import Link from '@components/core/nav-link';
import Multiselect from 'multiselect-react-dropdown';
import { exportToExcel } from '@components/core/ExcelExporter';


interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("State")
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<any>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editedFormData, setEditedFormData] = useState<any>({
    county_name: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [searchFilter, setSearchFilter] = useState('')
  const [country, setCountry] = useState<any>()
  const [isActive, setIsActive] = useState<any>({
    country: false,
  })
  const [showFilter, setShowFilter] = useState(false);

  const router = useRouter();

  useEffect(() => {
    getCountries()
  }, [])

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true")
      if (res.success) {
        setCountry(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }


  const handleChange = (itemId: any, name: string) => {
    if (name === 'countries') {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(checkedCountries.filter((item: any) => item !== itemId));
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    }
  }

  const filterData = async () => {
    try {
      const res = await API.get(`location/get-states?countryId=${checkedCountries}&search=${searchFilter}&limit=${limit}&page=${page}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)
        setShowFilter(false)
      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  const clearFilter = () => {
    setCheckedCountries([])
    setIsActive({
      country: false,
    })
    setSearchFilter('')
  }

  useEffect(() => {
    fetchStates();
    setIsClient(true)
  }, [searchQuery, page, limit])

  const fetchStates = async () => {
    try {
      const res = await API.get(`location/get-states?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)

      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }


  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }
  const changeStatus = async (row: any) => {
    const newStatus = !row.state_status;
    const url = "location/update-state-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchStates()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }
  const handleEdit = (row: any) => {
    setShowEditPopup(true);
    setEditedFormData(row);
    setEditedFormData((prevFormData: any) => ({
      ...prevFormData,
      countryId: row.country_id,
      state_latitude: row.state_latitude,
      state_longitude: row.state_longitude,
    }));
  };

  const handleSubmit = async (formData: any) => {
    try {
      const res = await API.post("location/update-state", {
        id: formData.id,
        countryId: formData.countryId,
        stateName: formData.state_name,
        latitude: formData.state_latitude,
        longitude: formData.state_longitude,
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully', res.data.id, 3000);
          setShowEditPopup(false)
          fetchStates();
        }
      } else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'State Name already exists' : res.error.code, res.data.id, 3000);
        setShowEditPopup(false)
      }
    } catch (error) {
      toasterError('An error occurred');
    }

    setShowEditPopup(false);
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.location?.countryName}</p>,
      selector: (row: any) => row.country.county_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.location?.stateName}</p>,
      selector: (row: any) => row.state_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.state_status ? "text-green-500" : "text-red-500"}>
          {row.state_status ? (
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
          <button className="bg-green-500 p-2 rounded " onClick={() => handleEdit(row)}>
            <LuEdit
              size={18}
              color="white"
            />
          </button>

          <button onClick={() => handleDelete(row.id)} className="bg-red-500 p-2 ml-3 rounded">
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
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          country_name: element.country.county_name,
          state_name: element.state_name,
          state_status: element.state_status
        }
      });
      exportToExcel(dataToExport, "Master-Location-State Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);


  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }


  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <>
            <div ref={popupRef} className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Filters</h3>
                  <button className="text-[20px]" onClick={() => {
                    setShowFilter(!showFilter)
                  }
                  }>&times;</button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Country
                          </label>
                          <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={country?.filter((item: any) => checkedCountries.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "countries");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "countries");
                            }}
                            options={country}
                            showCheckbox
                          />
                        </div>
                      </div>

                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              filterData();
                              setShowFilter(false);
                            }}
                          >
                            APPLY ALL FILTERS
                          </button>
                          <button className="btn-outline-purple" onClick={clearFilter}>CLEAR ALL FILTERS</button>
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
    )
  }


  if (!roleLoading) {
    return (
      <div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "location/delete-state"
                try {
                  const response = await API.post(url, {
                    id: deleteItemId
                  })
                  if (response.success) {
                    toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                    fetchStates()
                  } else {
                    toasterError(response.error.code, deleteItemId, 5000);

                  }
                }
                catch (error) {
                  toasterError('An error occurred');
                }
                setShowDeleteConfirmation(false);
                setDeleteItemId(null);
              }
            }}
            onCancel={handleCancel}
          />
        )}

        {showEditPopup && (
          <EditPopup
            onClose={() => setShowEditPopup(false)}
            onSubmit={handleSubmit}
            formData={editedFormData}
          />
        )}
        {isClient ?
          (
            <div >
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
                      <li>State</li>
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
                                onChange={searchData} />
                              <button type="submit" className="search-btn">
                                <span className="icon-search"></span>
                              </button>
                            </form>
                          </div>

                          <div  className="fliterBtn">
                            <button className="flex" type="button" onClick={() => setShowFilter(!showFilter)} >
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
                          <button className="btn btn-all btn-purple" onClick={() => router.push("/master/location/state/add-state")} >{translations.common.add}</button>
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

                      <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
          : 'Loading...'}
      </div>
    )
  };
}

const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
}) => {
  const [countries, setCountries] = useState([])
  const [data, setData] = useState<any>({
    id: formData?.id || 0,
    countryId: formData.countryId,
    state_name: formData.state_name,
    state_latitude: formData.state_latitude,
    state_longitude: formData.state_longitude
  })
  const [error, setError] = useState<any>({})
  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data)
      }
    } catch (error) {
      console.log(error)

    }
  }

  const alreadyExistName = async (value: string) => {
    const res = await API.post("location/check-states", {
      id: data?.id,
      countryId: Number(data?.countryId),
      stateName: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newErrors: any = {};
    if (value.trim() !== "" && data?.countryId) {
      const onBlurError = await alreadyExistName(value);
      newErrors['stateName'] = onBlurError;
    } else {
      newErrors['stateName'] = "";
    }
    setError(newErrors);
  };

  const handleChange = async (e: any) => {
    const { name, value } = e.target;
    setData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleErrors = () => {
    let isError = true;

    if (!data.countryId || data.countryId === '') {
      setError((prevError: any) => ({
        ...prevError,
        countries: "Country is required",
      }));
      isError = false;
    }

    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(data.state_name);
    if (!valid || !data.state_name) {
      if (!data.state_name) {
        setError((prevError: any) => ({
          ...prevError,
          stateName: "State Name is required",
        }))
        isError = false;
      }
      else {
        setError((prevError: any) => ({
          ...prevError,
          stateName: 'Enter Only Alphabets, Digits, Space, (, ), - and _'
        }));
        isError = false;
      }

    }
    const hasMergeErrors = Object.values(error).some((error: any) => error !== '');
    if (!hasMergeErrors) {
      return isError;
    }
  }

  const submit = () => {
    if (handleErrors() !== true) {
      return
    }
    onSubmit(data);
  }
  return (
    <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between">
          <h3
          >Edit State</h3>
          <button
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <hr />
        <div className="py-2">

          <div className="flex py-3 justify-between">
            <span className="text-sm mr-8">Country Name *</span>
            <div>
              <select
                name="countryId"
                onChange={handleChange}
                value={data.countryId}
                className="w-80 border rounded px-2 py-1 text-sm"
              >
                <option value="">Country Name:</option>
                {countries.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select>
              {error?.countries && (
                <div className="text-red-500 text-sm mt-1">{error.countries}</div>
              )}
            </div>
          </div>

          <div className="flex py-3 justify-between">
            <div>
              <span className="text-sm mr-8">State Name:</span>
            </div>
            <div className="flex-col">
              <input
                type="text"
                name="state_name"
                onChange={handleChange}
                onBlur={onBlurCheck}
                value={data.state_name}
                className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
              />
              {error?.stateName && (
                <div className="text-red-500 text-sm mt-1">{error.stateName}</div>
              )}

            </div>
          </div>

          <div className="flex py-3 justify-between">
            <span className="text-sm mr-8">State Latitude:</span>
            <input
              type="number"
              name="state_latitude"
              onChange={handleChange}
              value={data.state_latitude}
              className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
            />
          </div>

          <div className="flex py-3 justify-between">
            <span className="text-sm mr-8">State Longitude:</span>
            <input
              type="number"
              name="state_longitude"
              onChange={handleChange}
              value={data.state_longitude}
              className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
            />
          </div>
        </div>

        <div className="pt-3 mt-5 flex justify-end border-t">
          <button
            onClick={submit}
            className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
