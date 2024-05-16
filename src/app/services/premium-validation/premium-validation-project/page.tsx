"use client"
import React, { useState, useEffect, useRef } from "react";
import Link from "@components/core/nav-link";

import CommonDataTable from "@components/core/Table";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import useTranslations from "@hooks/useTranslation";
import { BiFilterAlt } from "react-icons/bi";
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
interface TableData {
  id: number;
  date: string;
  season: {
    name: string;
  }
  farmGroup: {
    name: string;
  };
  delete: boolean

}

export default function page() {
  useTitle(" Validation Project")
  const [roleLoading] = useRole()
  const { translations, loading } = useTranslations();
  const router = useRouter()
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [data, setData] = useState([])

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchFarmer();
  }, [limit, page, searchQuery,])
  const fetchFarmer = async () => {
    try {

      const res = await API.get(`premium-validation/project?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)

      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }


  const columns = [
    {
      name: "S. No",
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: "Date",
      selector: (row: TableData) => row.date.substring(0, 10),
      sortable: false,
    },
    {
      name: "Season",
      selector: (row: TableData) => row.season?.name,
      sortable: false,
    },
    {
      name: "Farmer Group",
      selector: (row: TableData) => row.farmGroup?.name,
      sortable: false,
      cell: (row: TableData) => (
        <Link href={`/services/premium-validation/premium-validation-project/view-premium-validation-project?id=${row.id}`}>
          <span className="hover:text-blue-500" rel="noopener noreferrer">
            {row.farmGroup?.name}
          </span>
        </Link>
      ),

    },
    {
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
  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const [brands, setBrands] = useState<any>()
  const [farmGroups, setfarmGroups] = useState<any>()

  const [showFilter, setShowFilter] = useState(false);

  const [checkedBrand, setCheckBrand] = useState<any>([])
  const [checkedFarmGroup, setCheckFarmGroup] = useState<any>([])
  const [searchFilter, setSearchFilter] = useState('')


  const [isActive, setIsActive] = useState<any>({
    brand: false,
    farmGroup: false,
  })
  useEffect(() => {
    setIsClient(true)
  }, [])
  useEffect(() => {
    fetchBrand()
  }, [])


  useEffect(() => {
    if (checkedBrand) {
      fetchFarmGroup()
    }
  }, [checkedBrand])

  const fetchBrand = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data)

      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchFarmGroup = async () => {
    try {
      if (checkedBrand.length !== 0) {
        const res = await API.get(`farm-group?brandId=${checkedBrand}`);
        if (res.success) {
          setfarmGroups(res.data)

        }
      }
    } catch (error) {
      console.log(error)
    }
  }


  const clearFilter = () => {
    setCheckFarmGroup([])
    setCheckBrand([])
    setIsActive({
      brand: false,
      farmGroup: false,
      icsName: false,
    })
    setSearchFilter('')
  }
  const handleChange = (itemId: any, name: string) => {
    if (name === 'brands') {
      if (checkedBrand.includes(itemId)) {
        setCheckBrand(checkedBrand.filter((item: any) => item !== itemId));
      } else {
        setCheckBrand([...checkedBrand, itemId]);
      }
    }

    else if (name === 'farmGroups') {
      if (checkedFarmGroup.includes(itemId)) {
        setCheckFarmGroup(checkedFarmGroup.filter((item: any) => item !== itemId));
      } else {
        setCheckFarmGroup([...checkedFarmGroup, itemId]);
      }
    }
  }

  const filterData = async () => {
    try {
      const res = await API.get(`premium-validation/project?search=${searchFilter}&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&limit=${limit}&page=${page}&pagination=true`);
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
                <span className={`${isActive.brand ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  brand: !prevData.brand
                }))
                }
                >Brand</span>
                {isActive.brand === true &&
                  <div className="filter-body" style={{ display: 'block' }}>
                    <div >
                      {brands?.map((brand: any) => (
                        <div key={brand.id}>
                          <input name="brands" id="brands" value={brand.id} type="checkbox" checked={checkedBrand.includes(brand.id)} onChange={() => handleChange(brand.id, 'brands')} />
                          <span className="text-sm">  {brand.brand_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              <div className="filter-accodian" style={{ fontSize: 10 }} >
                <span className={`${isActive.farmGroup ? "active" : ""} filters-row filters-links text-md`} onClick={() => {
                  setIsActive((prevData: any) => ({
                    ...prevData,
                    farmGroup: !prevData.farmGroup
                  }))
                }
                }>Farm Group</span>
                {isActive.farmGroup === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {farmGroups?.map((farmGroup: any) => (
                        <div key={farmGroup.id}>
                          <input name="farmGroups" value={farmGroup.id} type="checkbox" checked={checkedFarmGroup.includes(farmGroup.id)} onChange={() => handleChange(farmGroup.id, 'farmGroups')} />
                          <span className="text-sm">  {farmGroup.name} </span>
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
  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  if (!roleLoading) {
    return (
      <>
        <div >
          {showDeleteConfirmation && (
            <DeleteConfirmation
              message="Are you sure you want to delete this?"
              onDelete={async () => {
                if (deleteItemId !== null) {
                  const url = "premium-validation/project"
                  try {
                    const response = await API.delete(url, {
                      id: deleteItemId
                    })
                    if (response.success) {
                      toasterSuccess('Record has been deleted successfully')
                      fetchFarmer()
                    } else {
                      toasterError('Failed to delete record');
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
                          <li>Services</li>
                          <li><Link href="/services/premium-validation">Premium Validation Farmer</Link></li>
                          <li>
                            Premium Validation Project /Ginner</li>

                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* farmgroup start */}
                  <div className="farm-group-box">
                    <div className="farm-group-inner">
                      <div className="table-form lr-mCustomScrollbar">
                        <div className="table-minwidth w-100">
                          {/* search */}
                          <div className="search-filter-row">
                            <div className="search-filter-left ">
                              <div className="search-bars">
                                {/* <form className="form-group mb-0 search-bar-inner" >
                                <input
                                  type="text"
                                  className="form-control form-control-new jsSearchBar "
                                  placeholder="Search by Farmer Name"
                                  value={searchQuery}
                                  onChange={searchData}
                                />
                                <button type="submit" className="search-btn">
                                  <span className="icon-search"></span>
                                </button>
                              </form> */}
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

                            </div>

                            <div className="search-filter-right">
                              <button
                                className="btn btn-all btn-purple"
                                onClick={() => router.push("/services/premium-validation/premium-validation-project/add-premium-validation-project ")}
                              >
                                {translations?.common?.add}
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
            </>
          ) : (
            "Loading"
          )}
        </div>
      </>
    );
  }
}

