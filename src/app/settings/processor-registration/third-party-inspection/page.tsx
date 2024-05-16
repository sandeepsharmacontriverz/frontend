"use client"
import React, { useState, useEffect, useRef } from 'react'

import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import { useRouter } from "@lib/router-events";
import Link from '@components/core/nav-link';
import API from '@lib/Api';
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { BiFilterAlt } from "react-icons/bi";
import useTitle from '@hooks/useTitle';
import useRole from '@hooks/useRole';
import Loader from '@components/core/Loader';

interface TableData {
  id: number;
  knittingName: string;
  Address: string;
  Website?: string;
  MobileNumber: string;
  LandLineNo?: string;
  Email: string;
  delete: boolean;
}

export default function page() {
  useTitle("Knitter")
  const [roleLoading] = useRole();

  const router = useRouter()

  const { translations, loading } = useTranslations();
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [data, setData] = useState([])
  const [showFilter, setShowFilter] = useState(false);
  const [countries, setCountries] = useState<any>()
  const [states, setStates] = useState<any>()
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [searchFilter, setSearchFilter] = useState('')

  const [isActive, setIsActive] = useState<any>({
    country: false,
    state: false,
  })
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    getKnitter();
  }, [limit, page, searchQuery]);
  useEffect(() => {
    getCountries()
  }, [])

  useEffect(() => {
    if (checkedCountries) {
      getStates()
    }
  }, [checkedCountries])

  const getKnitter = async () => {
    const res = await API.get(`knitter?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`)
    if (res.success) {
      setData(res.data);
      setCount(res.count)
    }
  }
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

  if (loading) {
    return <div>  <Loader /></div>;
  }
  const columns = [
    {
      name: "S No.",
      selector: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: "Knitting Unit Name",
      selector: (row: any) => row.name,
      cell: (row: any) => (
        <Link href={`/settings/processor-registration/knitter/view-knitter?id=${row.id}`} >
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
    }, {
      name: "LandLine No.",
      selector: (row: any) => row.landline,
      sortable: false,
    }, {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: false,
    }, {
      name: "Delete",
      cell: (row: TableData) => (
        <>
          <button onClick={() => handleDelete(row.id)}>
            <AiFillDelete size={30} className="mr-4  p-1.5  bg-red-500 text-white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },

  ];

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }
  const handleCancel = () => {
    setShowDeleteConfirmation(false)
  }

  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }
  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true)
  };
  const handleChange = (itemId: any, name: string) => {
    if (name === 'country') {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(checkedCountries.filter((item: any) => item !== itemId));
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    }
    else if (name === 'state') {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    }

  }
  const filterData = async () => {
    try {
      // const res = await API.get(`premium-validation/farmer?search=${searchFilter}&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}&limit=${limit}&page=${page}&pagination=true`);

      const res = await API.get(`knitter?search=${searchFilter}&countryId=${checkedCountries}&stateId=${checkedStates}&limit=${limit}&page=${page}&pagination=true`);
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

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (popupRef.current && !(popupRef.current as any).contains(event.target)) {
          setShowFilter(false)
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [popupRef, onClose]);

    const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      setSearchFilter(e.target.value)
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


    return (
      <div>
        {openFilter && (
          <div ref={popupRef} className="absolute flex h-fit w-auto z-40 justify-center bg-transparent  p-3 ">
            <div className="bg-white border w-auto py-3  px-2 border-gray-300 shadow-lg rounded-md">


              <input
                type="text"
                name="searchFilter"
                placeholder={translations.common.search}
                className="border bg-inherit rounded text-sm w-80 p-2 mb-3"
                value={searchFilter}
                onChange={filterSearch}
              />

              <div className="filter-accodian"  >
                <span className={`${isActive.country ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  country: !prevData.country
                }))
                }
                >Country</span>
                {isActive.country === true &&
                  <div className="filter-body" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((country: any) => (
                        <div key={country.id}>
                          <input name="country" id="country" value={country.id} type="checkbox" checked={checkedCountries.includes(country.id)} onChange={() => handleChange(country.id, 'country')} />
                          <span className="text-sm">  {country.county_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              <div className="filter-accodian" style={{ fontSize: 10 }} >
                <span className={`${isActive.state ? "active" : ""} filters-row filters-links text-md`} onClick={() => {
                  setIsActive((prevData: any) => ({
                    ...prevData,
                    state: !prevData.state
                  }))
                }
                }>State</span>
                {isActive.state === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {states?.map((state: any) => (
                        <div key={state.id}>
                          <input name="state" value={state.id} type="checkbox" checked={checkedStates.includes(state.id)} onChange={() => handleChange(state.id, 'state')} />
                          <span className="text-sm">  {state.state_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
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
    )

  }
  if (!roleLoading) {
    return (
      <>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "knitter"
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId
                  })
                  if (response.success) {
                    toasterSuccess('Record has been deleted successfully')
                    getKnitter()
                  } else {
                    toasterError('Failed to delete record');
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
        {isClient ? (
          <>

            <section className="right-content">
              <div className="right-content-inner">
                {/* breadcrumb */}
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

                        <li>Process Registration</li>
                        <li>Knitter</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* farmgroup start */}
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
                                  placeholder="Search by Knitter Name"
                                  value={searchQuery}
                                  onChange={searchData}
                                />
                                <button type="submit" className="search-btn">
                                  <span className="icon-search"></span>
                                </button>
                              </form>
                            </div>
                            <div>
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
                            <button
                              className="btn btn-all btn-purple"
                              onClick={() => router.push("/settings/processor-registration/add-processor")}
                            >
                              {translations.common.add}
                            </button>
                          </div>
                        </div>

                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>


          </>) : ("loading")}
      </>
    )
  }
}
