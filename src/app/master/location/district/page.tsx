"use client"

import { useRouter } from '@lib/router-events';
import React, { useState, useEffect } from 'react';
import CommonDataTable from '@components/core/Table';
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { BiFilterAlt } from "react-icons/bi";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import API from '@lib/Api';
import useTranslations from "@hooks/useTranslation";
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import useTitle from "@hooks/useTitle";
import useRole from '@hooks/useRole';
import Link from '@components/core/nav-link';
import Multiselect from 'multiselect-react-dropdown';
import { exportToExcel } from '@components/core/ExcelExporter';
import { assert } from 'console';

interface TableData {
  id: number;
  district_name: string;
  district_status: boolean;
  state: {
    id: number;
    state_name: string;
    state_status: boolean;
    state_latitude: string;
    state_longitude: string;
    country: {
      id: number;
      countryId: number;
      county_name: string;
      country_status: boolean;

    };
  };
}

interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  const { translations, loading } = useTranslations();
  useTitle("District")
  const [roleLoading] = useRole();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()

  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [searchFilter, setSearchFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const [editedFormData, setEditedFormData] = useState<any>({
    id: "",
    cropGrade: "",
    cropTypeVariety: ""
  });

  const [countries, setCountries] = useState<any>()
  const [states, setStates] = useState<any>()

  const [isActive, setIsActive] = useState<any>({
    country: false,
    state: false,
  })

  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    getCountries()
  }, [])

  useEffect(() => {
    if (checkedCountries.length > 0) {
      getStates()
    } else {
      setStates([]);
      setCheckedStates([])
    }
  }, [checkedCountries])

  useEffect(() => {
    fetchDistricts();
    setIsClient(true)

  }, [searchQuery, page, limit])


  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true")
      if (res.success) {
        setCountries(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getStates = async () => {
    try {
      if (checkedCountries.length !== 0) {
        const res = await API.get(`location/get-states?status=true&countryId=${checkedCountries}`)
        if (res.success) {
          setStates(res.data)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }



  const fetchDistricts = async () => {
    try {
      const res = await API.get(`location/get-districts?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)

      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  const handleEdit = (row: TableData) => {
    setShowEditPopup(true);
    const editedData = {

      id: row?.id,
      countryId: row?.state?.country?.id,
      stateId: row?.state?.id,
      district_name: row.district_name
    };
    setEditedFormData(editedData);
  };
  const changeStatus = async (row: any) => {
    const newStatus = !row.district_status;
    const url = "location/update-district-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchDistricts()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  useEffect(() => {
    setIsClient(true)
  }, [])

  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          country_name: element.state?.country?.county_name,
          state_name: element.state?.state_name,
          district_name: element.district_name,
          district_status: element.district_status
        }
      });
      exportToExcel(dataToExport, "Master-Location-District Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      const res = await API.post("location/update-district", {
        id: formData.id,
        stateId: formData.stateId,
        districtName: formData.district
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully', res.data.id, 3000);
          setShowEditPopup(false)
          fetchDistricts();
        }
      } else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'District Name already exists' : res.error.code, res.data.id, 3000);
        setShowEditPopup(false)
      }
    } catch (error) {
      console.log(error);
      toasterError('An error occurred');
    }

    setShowEditPopup(false);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }
  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };


  const handleChange = (itemId: any, name: string) => {
    if (name === 'countries') {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(checkedCountries.filter((item: any) => item !== itemId));

        // Clear states for the unselected country
        const stateToClear = states?.filter((dist: any) => {
          return dist?.country_id === itemId;
        });

        setCheckedStates(
          checkedStates.filter((item: any) => {
            const dist = stateToClear.find((dist: any) => dist.id === item);
            return !dist;
          })
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    }
    else if (name === 'states') {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    }
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,

      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Country Name</p>,
      selector: (row: TableData) => row.state?.country?.county_name
    },
    {
      name: <p className="text-[13px] font-medium">State Name</p>,
      selector: (row: TableData) => row.state?.state_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">District Name</p>,
      selector: (row: TableData) => row.district_name
    },
    {
      name: <p className="text-[13px] font-medium">{translations.common?.status}</p>,

      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.district_status ? "text-green-500" : "text-red-500"}>
          {row.district_status ? (
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
      name: <p className="text-[13px] font-medium">Action</p>,

      cell: (row: TableData) => (
        <>
          <button onClick={() => handleEdit(row)} className="bg-green-500 p-2 rounded " >
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

  const filterData = async () => {
    try {
      const res = await API.get(`location/get-districts?search=${searchFilter}&countryId=${checkedCountries}&stateId=${checkedStates}&limit=${limit}&page=${page}&pagination=true`);
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
    setCheckedStates([])
    setIsActive({
      country: false,
      state: false,
    })
    setSearchFilter('')
  }

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = React.useRef<HTMLDivElement>(null);

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
                            selectedValues={countries?.filter((item: any) => checkedCountries.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "countries");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "countries");
                            }}
                            options={countries}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a State
                          </label>
                          <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="state_name"
                            selectedValues={states?.filter((item: any) => checkedStates.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, 'states');
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, 'states');
                            }}
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
      <div >
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "location/delete-district"
                try {
                  const response = await API.post(url, {
                    id: deleteItemId
                  })
                  if (response.success) {
                    toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                    fetchDistricts()
                  } else {
                    toasterError(response.error.code, deleteItemId, 5000);

                  }
                }
                catch (error) {
                  console.log(error, "error")
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
            onSubmit={(formData) => {
              handleSubmit(formData)
            }}
            formData={editedFormData}
          />
        )}


        {isClient ?
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
                    <li>District</li>
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

                        <div className="fliterBtn">
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
                        <button className="btn btn-all btn-purple" onClick={() => router.push("/master/location/district/add-district")} >{translations.common.add}</button>
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
          : 'Loading...'}

      </div>


    )
  }
}

const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
  onFieldChange,
}) => {
  const [countries, setCountries] = useState<any>()
  const [states, setStates] = useState<any>();
  const [error, setError] = useState<any>({})
  const [data, setData] = useState<any>({
    id: formData.id,
    countryId: formData.countryId,
    stateId: formData.stateId,
    district: formData.district_name,
  })

  useEffect(() => {
    getCountryname();
  }, [])

  useEffect(() => {
    if (data.countryId !== '') {
      getStates();
    }
  }, [data.countryId]);

  const getCountryname = async () => {
    try {
      const res = await API.get("location/get-countries?status=true")
      if (res.success) {
        setCountries(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const getStates = async () => {
    try {
      const res = await API.get(`location/get-states?status=true&countryId=${data.countryId}`)
      if (res.success) {
        setStates(res.data)
        if (data.country !== formData.country) {
          setData((prevData: any) => ({
            ...prevData,
            state: "",
          }))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const alreadyExistName = async (value: string) => {
    const res = await API.post("location/check-districts", {
      id: Number(data?.id),
      stateId: Number(data?.stateId),
      districtName: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const handleChange = async (e: any) => {
    const { name, value } = e.target;
    const newErrors: any = { ...error };

    if (name == 'countryId') {
      setData((prevData: any) => ({
        ...prevData,
        stateId: ""
      }));
      newErrors["countryId"] = ""
    }

    if (name == 'stateId') {
      setData((prevData: any) => ({
        ...prevData,
        district: ""
      }));
      newErrors["stateId"] = ""
    }

    setData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
    setError(newErrors);
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newErrors: any = { ...error };
    if (data?.stateId && value !== "") {
      const onBlurError = await alreadyExistName(value);
      newErrors['district'] = onBlurError;
    } else {
      newErrors['district'] = "";
    }
    setError(newErrors);
  };

  const handleErrors = () => {
    let isError = true;

    if (!data.countryId || data.countryId === "") {
      setError((prevError: any) => ({
        ...prevError,
        countryId: "Country is required",
      }));
      isError = false;
    }

    if (!data.stateId || data.stateId === "") {
      setError((prevError: any) => ({
        ...prevError,
        stateId: "State Name is required",
      }));
      isError = false;
    }

    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(data.district);

    if (!valid || !data.district) {
      if (!data.district) {
        setError((prevError: any) => ({
          ...prevError,
          district: "District Name is required",
        }))
        isError = false;
      }
      else {
        setError((prevError: any) => ({
          ...prevError,
          district: 'Enter Only Alphabets, Digits, Space, (, ), - and _'
        }));
        isError = false;
      }
    };

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
          >Edit District</h3>
          <button
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <hr />
        <div className="py-2">

          <div className="flex py-3 justify-between">
            <span className="text-sm mr-8">Country Name*</span>
            <div>
              <select
                name="countryId"
                value={data.countryId}
                onChange={(event) => handleChange(event)}
                className="w-80 border rounded px-2 py-1 text-sm"

              >
                <option value="">Select a country</option>
                {countries?.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select>
              {error?.countryId && (
                <div className="text-red-500 text-sm mt-1">{error.countryId}</div>
              )}
            </div>
          </div>

          <div className="flex py-3 justify-between">
            <div>
              <span className="text-sm mr-8">State Name*</span>
            </div>
            <div className="flex-col">
              <select
                name="stateId"
                value={data.stateId}
                onChange={(event) => handleChange(event)}
                className="w-80 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a State</option>
                {states?.map((state: any) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}
              </select>
              {error?.stateId && (
                <div className="text-red-500 text-sm mt-1">{error.stateId}</div>
              )}
            </div>
          </div>

          <div className="flex py-3 justify-between">
            <span className="text-sm mr-8">District Name*</span>
            <div>
              <input
                type="text"
                name="district"
                onChange={(event) => handleChange(event)}
                onBlur={onBlurCheck}
                value={data.district}
                className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
              />
              {error?.district && (
                <div className="text-red-500 text-sm mt-1">{error.district}</div>
              )}
            </div>
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
