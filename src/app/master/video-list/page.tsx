"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";

import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { exportToExcel } from "@components/core/ExcelExporter";

const videoList: React.FC = () => {
  useTitle("Video");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([])
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [brands, setBrands] = useState([])
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    getCountry();
    getBrand()
  }, []);

  const getVideoList = async () => {
    const url = `video?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
    try {
      const response = await API.get(url)
      setData(response.data)
      setCount(response.count)
    }
    catch (error) {
      console.log(error, "error")
      setCount(0)
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true)
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          country: getCountryNames(element.country),
          brand: getBrandNames(element.brand),
          processor: element.processor,
          title: element.title,
          description: element.description,
          video: element.video,
          status: element.status,
        }
      });
      exportToExcel(dataToExport, "Master-Video-List Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }


  const getBrand = async () => {
    const url = "brand"
    try {
      const response = await API.get(url)
      if (response.success) {
        const res = response.data
        setBrands(res)
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const getCountry = async () => {
    const url = "location/get-countries?status=true"
    try {
      const response = await API.get(url)
      if (response.success) {
        const res = response.data
        setCountries(res)
      }
    }
    catch (error) {
      console.log(error, "error")
    }

  }


  const getBrandNames = (ids: any) => {
    const matchId = brands?.filter((item: any) => ids.includes(item.id))
      .map((item: any) => item.brand_name);
    const getId = matchId.map((brand: any) => brand)
    return getId.join(', ')
  }

  const getCountryNames = (ids: any) => {
    const matchId = countries?.filter((item: any) => ids.includes(item.id))
      .map((item: any) => item.county_name);
    const getId = matchId.map((country: any) => country)
    return getId.join(', ')
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.status;
    const url = "video/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        getVideoList()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  useEffect(() => {
    getVideoList()
  }, [searchQuery, page, limit]);

  const handleCancel = () => {
    setShowDeleteConfirmation(false)
  }

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Country</p>,
      cell: (row: any) => getCountryNames(row.country),

    },
    {
      name: <p className="text-[13px] font-medium">Brand</p>,
      cell: (row: any) => getBrandNames(row.brand),

    },
    {
      name: <p className="text-[13px] font-medium">Processor</p>,

      cell: (row: any) => row.processor,

    },
    {
      name: <p className="text-[13px] font-medium">Title</p>,
      cell: (row: any) => row.title,

    },
    {
      name: <p className="text-[13px] font-medium">Description</p>,
      cell: (row: any) => row.description,
    },
    {
      name: <p className="text-[13px] font-medium">Video</p>,

      cell: (row: any) => (row.video ?
        <Link legacyBehavior href={row.video}>
          <a className="text-orange-500  hover:text-orange-600" target="_blank" rel="noopener noreferrer">
            Click to view
          </a>
        </Link>
        :
        ''
      ),
    },

    {
      name: <p className="text-[13px] font-medium">{translations.common.status}</p>,

      cell: (row: any) => (
        <button onClick={() => changeStatus(row)}
          className={row.status ? "text-green-500" : "text-red-500"}>
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
      name: <p className="text-[13px] font-medium">{translations.common.action}</p>,

      cell: (row: any) => (
        <>
          <Link href={`/master/video-list/edit-video?id=${row.id}`} >
            <div className="bg-green-500 p-2 rounded">
              <LuEdit size={18} color="white" />
            </div>
          </Link>
          <button className="bg-red-500 p-2 ml-3 rounded" onClick={() => handleDelete(row.id)}>
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
                    <li>Video</li>
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

                      </div>
                      <div className="search-filter-right">
                        <button className="btn btn-all btn-purple" onClick={() => router.push("/master/video-list/add-video")} >{translations.common.add}</button>
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
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "video"
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId
                      })
                      if (response.success) {
                        toasterSuccess('Record has been deleted successfully')
                        getVideoList()
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
          </div>
        ) : (
          <div className="w-full min-h-screen flex justify-center items-center">
            <span>Processing...</span>
          </div>
        )}
      </div>
    )
  }
};

export default videoList;
