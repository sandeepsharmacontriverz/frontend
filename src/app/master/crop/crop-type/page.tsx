"use client";
import { useRouter } from "@lib/router-events";
import React, { useState, useEffect } from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import API from "@lib/Api";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import useTitle from "@hooks/useTitle";
import User from "@lib/User";
import { exportToExcel } from "@components/core/ExcelExporter";

interface TableData {
  id: number;
  cropId: number;
  crop_name: string;
  cropType_name: string;
  cropType_status: boolean;
}

interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function CropType({
  params,
}: {
  params: { slug: string };
}) {
  useTitle("Crop Type");

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [count, setCount] = useState<any>()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [editedFormData, setEditedFormData] = useState<any>({
    id: "",
    cropId: "",
    cropTypeName: "",

  });

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    User.role();
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchCropType();
  }, [searchQuery, page, limit])


  const fetchCropType = async () => {
    try {
      const res = await API.get(`crop/crop-type?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);

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

  const handleEdit = (row: TableData) => {
    setShowEditPopup(true);
    setEditedFormData(row);
  }
  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };


  const handleSubmit = async (formData: any) => {
    try {
      const res = await API.put("crop/crop-type", {
        id: formData.id,
        cropId: formData.cropId,
        cropTypeName: formData.cropTypeName
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully', res.data.id, 3000);
          setShowEditPopup(false)
          fetchCropType();
        }
      } else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'Crop type already exists' : res.error.code, res.data.id, 3000);
        setShowEditPopup(false)
      }
    } catch (error) {
      console.log(error);
      toasterError('An error occurred');
    }

    setShowEditPopup(false);
  };
  const changeStatus = async (row: any) => {
    const newStatus = !row.cropType_status;
    const url = "crop/crop-type-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchCropType()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,

      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.crop?.cropName}</p>,

      selector: (row: any) => row.crop?.crop_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.crop?.cropType}</p>,

      selector: (row: TableData) => row.cropType_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.cropType_status ? "text-green-500" : "text-red-500"}>
          {row.cropType_status ? (
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
            <AiFillDelete size={20} color="white" />
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
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          crop_name: element.crop?.crop_name,
          cropType_name: element.cropType_name,
          cropType_status: element.cropType_status
        }
      });
      exportToExcel(dataToExport, "Master-Crop-Type Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

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
              const url = "crop/crop-type"
              try {
                const response = await API.delete(url, {
                  id: deleteItemId
                })
                if (response.success) {
                  toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                  fetchCropType()
                } else {
                  toasterError(response.error.code, deleteItemId, 5000);
                }
              }
              catch (error) {
                // toasterError('An error occurred');
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
                      <li>Master</li>
                      <li>Crop</li>
                      <li>Crop Type</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* farmgroup start */}
              <div className="farm-group-box">
                <div className="farm-group-inner">
                  <div className="table-form ">
                    <div className="table-minwidth min-w-[650px]">
                      {/* search */}
                      <div className="search-filter-row">
                        <div className="search-filter-left ">
                          <div className="search-bars">
                            <form className="form-group mb-0 search-bar-inner" onSubmit={handleSearchSubmit}>
                              <input
                                type="text"
                                className="form-control form-control-new jsSearchBar "
                                placeholder="Search by crop type and name"
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
                            onClick={() => router.push("/master/crop/crop-type/add-crop-type")}
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
        </>
      ) : (
        <div className="w-full min-h-screen flex justify-center items-center">
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}

const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
  onFieldChange,
}) => {

  const [cropname, setCropName] = useState<any>();
  const [data, setData] = useState<any>({
    id: formData.id,
    cropId: formData.crop_id,
    cropTypeName: formData.cropType_name
  });

  const [errors, setErrors] = useState<any>({
    name: '', type: ''
  })

  const getCropNames = async () => {
    try {
      const res = await API.get("crop/crop-name?status=true")
      if (res.success) {
        setCropName(res.data.crops)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getCropNames();
  }, [])


  const alreadyExistName = async (value: string) => {
    const res = await API.post("crop/check-crop-types", {
      id: data?.id,
      cropId: Number(data?.cropId),
      cropTypeName: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const handleChange = async (e: any) => {
    const { name, value } = e.target;
    setData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newErrors: any = {};
    if (value.trim() !== "" && data?.cropId) {
      const onBlurError = await alreadyExistName(value);
      newErrors['type'] = onBlurError;
    } else {
      newErrors['type'] = "";
    }

    setErrors(newErrors);
  };

  const handleErrors = () => {
    let isError = true;
    const newErrors: any = { ...errors };

    if (!data.cropId || data.cropId === '') {
      newErrors["name"] = "Crop Name is required",
        isError = false;
    }
    if (!data.cropTypeName) {
      newErrors["type"] = "Crop Type is required",
        isError = false;
    } else if (!/^[\(\)_\-a-zA-Z0-9\s]+$/.test(data.cropTypeName)) {
      newErrors["type"] = "Only letters, digits, white space, (, ), _ and - allowed.",
        isError = false;
    }
    const hasMergeErrors = Object.values(newErrors).some((error: any) => error !== '');
    if (!hasMergeErrors) {
      setErrors({});
      return isError;
    } else {
      setErrors(newErrors);
    }
  }
  const handleSubmit = () => {
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
          >Edit Crop Type </h3>
          <span
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />

        <div className="mb-4 flex items-center">
          <label className="block mb-1 font-medium text-sm w-32">Crop Name:</label>
          <div>
            <select
              name="cropId"
              value={data.cropId}
              onChange={handleChange}
              className="p-1 w-44 border rounded-md text-sm ml-4"
            >
              <option value="">Select a crop</option>
              {cropname?.map((crop: any) => (
                <option key={crop.id} value={crop.id}>
                  {crop.crop_name}
                </option>
              ))}
            </select>
            {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <label className="block mb-1 font-medium text-sm w-32">Crop Type:</label>
          <div>
            <input
              type="text"
              name="cropTypeName"
              onChange={handleChange}
              onBlur={onBlurCheck}
              value={data.cropTypeName}
              className="w-44 p-1 border rounded-md text-sm ml-4"
            />
            {errors.type && <p className="text-red-500 ml-4 text-sm mt-1">{errors.type}</p>}
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