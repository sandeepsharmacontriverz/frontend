"use client"

import { useRouter } from '@lib/router-events';
import { useState, useEffect } from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from '@components/core/Table';
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from '@hooks/useTranslation';
import User from '@lib/User';
import API from '@lib/Api';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import useTitle from '@hooks/useTitle';
import Link from '@components/core/nav-link';
import { exportToExcel } from '@components/core/ExcelExporter';
import { assert } from 'console';
import Router from '@hooks/useRouter';
interface TableData {

  id: number;
  name: string;
  brand: any;
  status: boolean;
}

interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Farm Group")

  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editedFormData, setEditedFormData] = useState<any>({
    brand_id: "",
    name: "",
    latitude: "",
    longitude: ""

  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFarmGroup();
  }, [limit, page, searchQuery])
  useEffect(() => {
    setIsClient(true)
  }, [])
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const fetchFarmGroup = async () => {
    try {
      const res = await API.get(`farm-group?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)
      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.status;

    const url = "farm-group/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchFarmGroup()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }
  const handleEdit = (row: any) => {
    setShowEditPopup(true);
    setEditedFormData(row);
  }
  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.farmGroup}</p>,

      selector: (row: TableData) => row.name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.brand}</p>,

      selector: (row: TableData) => row?.brand?.brand_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,

      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.status ? "text-green-500" : "text-red-500"}>
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

      cell: (row: TableData) => (
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
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }
  const handleSubmit = async (formData: any) => {

    try {
      const res = await API.put("farm-group", {
        id: formData.id,
        brandId: formData.brand_name,
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully', res?.data?.id, 3000);
          setShowEditPopup(false)
          fetchFarmGroup();
        }

      } else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'Farm group name already exist' : res.error.code, res?.data?.id, 3000);
        setShowEditPopup(false)
      }

    } catch (error) {
      console.log(error);
      toasterError('An error occurred');
    }

    setShowEditPopup(false);
  };


  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          farmGroup: element.name,
          brand: element.brand?.brand_name,
          status: element.status,
        }
      });
      exportToExcel(dataToExport, "Master-Farm-Group Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
  };
  return (
    <div >
      {showEditPopup && (
        <EditPopup
          onClose={() => setShowEditPopup(false)}
          onSubmit={handleSubmit}
          formData={editedFormData}
        />
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this?"
          onDelete={async () => {
            if (deleteItemId !== null) {
              const url = "farm-group"
              try {
                const response = await API.delete(url, {
                  id: deleteItemId
                })
                if (response.success) {
                  toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                  fetchFarmGroup()
                } else {
                  toasterError('Failed to delete record', deleteItemId, 5000);
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

      {isClient ?
        (
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
                        <li>Farm</li>
                        <li>Farm Group</li>
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
                              <form className="form-group mb-0 search-bar-inner" onSubmit={handleSearchSubmit}>
                                <input
                                  type="text"
                                  className="form-control form-control-new jsSearchBar "
                                  placeholder="Search by Farm Group"
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
                              onClick={() => router.push("/master/farm-group/add-farm-group")}
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

                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </>)
        : 'Loading...'}
    </div>
  );
}


const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
}) => {
  const [brandName, setBrandname] = useState<any>();
  const [data, setData] = useState<any>({
    id: formData?.id || 0,
    name: formData?.name || "",
    brand_name: formData?.brand_id,
    latitude: formData?.latitude || "",
    longitude: formData?.longitude || ""
  })

  const [errors, setErrors] = useState({
    name: '',
    brand_name: ''
  })

  const getBrandName = async () => {
    try {
      const res = await API.get("brand")

      if (res.success) {
        setBrandname(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getBrandName();
  }, [])


  const alreadyExistName = async (value: string) => {
    const res = await API.post("farm-group/check-farm-groups", {
      id: data.id,
      brandId: data.brand_name,
      name: value
    });

    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regexAlphabets.test(value);
    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors['name'] = value.trim() === "" ? "Farm Group Name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _";
    } else {
      const onBlurError = await alreadyExistName(value);
      newErrors['name'] = onBlurError;
    }
    setErrors(newErrors);
  };

  const handleChange = async (e: any) => {
    const { name, value } = e.target;
    setData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    let isError = false;
    if (!data.brand_name) {
      setErrors((prevError) => ({
        ...prevError,
        brand_name: "Brand Name is required",
      }));
      isError = true;
    }

    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(data.name);
    if (!data.name || !valid) {
      setErrors((prevError) => ({
        ...prevError,
        name: !data.name ? "Farm Group Name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
      }));
      isError = true;
    }

    if (!isError) {
      const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');
      if (!hasMergeErrors) {
        onSubmit(data)
      }
    }
  };

  return (
    <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between mb-2">
          <h3
          >Edit Farm Group</h3>
          <span
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />

        <div className="mb-4 flex items-center">
          <label className="block mb-1 font-medium text-sm w-32">Brand Name:</label>
          <div>
            <select
              name="brand_name"
              value={data.brand_name}
              onChange={handleChange}
              className="flex-grow p-1 w-60 border rounded-md text-sm"
            >
              <option value="">Select a brand type</option>
              {brandName && brandName.map((brand: any) => (
                <option key={brand.id} value={brand.id}>
                  {brand.brand_name}
                </option>
              ))}
            </select>
            {errors.brand_name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.brand_name}</p>}
          </div>
        </div>


        <div className="mb-4 flex items-center">
          <label className="block mb-1 font-medium text-sm w-32">Farm Group Name:</label>
          <div>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              onBlur={onBlurCheck}
              value={data.name}
              className="flex-grow p-1 w-60 border rounded-md text-sm"
            />
            {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <label className="block mb-1 font-medium text-sm w-32">Latitude:</label>
          <input
            type="number"
            name="latitude"
            onChange={handleChange}
            value={data.latitude}
            className="flex-grow p-1 border rounded-md text-sm"
          />
        </div>

        <div className="mb-4 flex items-center">
          <label className="block mb-1 font-medium text-sm w-32">Longitude:</label>
          <input
            type="number"
            name="longitude"
            onChange={handleChange}
            value={data.longitude}
            className="flex-grow p-1 border rounded-md text-sm"
          />
        </div>

        <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                            <button
                                className="btn-purple mr-2"
                                onClick={handleSubmit}
                                // disabled={isSubmitting}
                                style={
                                         { cursor: "pointer", backgroundColor: "#D15E9C" }
                                }
                            >
Submit                            </button>
                            <button
                                type="button"
                                className="btn-outline-purple"
                                onClick={onClose}

                            >
                               Cancel
                            </button>
                        </div>
          </div>
      </div>
    </div>

  );
};


