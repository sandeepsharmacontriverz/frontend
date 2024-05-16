"use client";
import { useRouter } from "@lib/router-events";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import DataTable from "react-data-table-component";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import useTitle from "@hooks/useTitle";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import User from "@lib/User";

import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { exportToExcel } from "@components/core/ExcelExporter";
interface TableData {
  id: number,
  cropGrade: string;
  cropGrade_status: boolean,
  cropVariety: {
    id: number,
    cropVariety: string,
    cropVariety_status: boolean,
    cropType: {
      id: number,
      cropType_name: string
      cropType_status: boolean,
      crop: {
        id: number,
        crop_name: string
        crop_status: boolean,
      }
    }
  }
}

interface data {

}

interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}


export default function YourComponent({
  params,
}: {
  params: { slug: string };
}) {
  useTitle("Crop Grade");

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editedCrop, setEditedCrop] = useState<TableData | null>(null);
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const [editedFormData, setEditedFormData] = useState<any>({
    id: "",
    cropGrade: "",
    cropTypeVariety: ""
  });


  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    User.role()
  }, [])

  useEffect(() => {
    fetchCropGrade();
  }, [searchQuery, page, limit])


  const fetchCropGrade = async () => {
    try {
      const res = await API.get(`crop/crop-grade?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
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
    fetchCropGrade();
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading translations...</div>;
  }

  const handleEdit = (row: TableData) => {
    setShowEditPopup(true);

    const editedData = {
      id: row.id,
      cropNameId: row.cropVariety?.cropType.crop.id,
      cropTypeId: row.cropVariety?.cropType.id,
      cropTypeVarietyId: row.cropVariety?.id,
      cropGrade: row.cropGrade,
    };

    setEditedFormData(editedData);
    setEditedCrop(row);
  };
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const changeStatus = async (row: any) => {
    const newStatus = !row.cropGrade_status;
    const url = "crop/crop-grade-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchCropGrade()
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
      selector: (row: TableData) => row.cropVariety?.cropType?.crop.crop_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.crop?.cropType}</p>,
      selector: (row: TableData) => row.cropVariety?.cropType?.cropType_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.crop?.cropVariety}</p>,
      selector: (row: TableData) => row.cropVariety?.cropVariety,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.crop?.cropGrade}</p>,
      selector: (row: TableData) => row.cropGrade,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.cropGrade_status ? "text-green-500" : "text-red-500"}>
          {row.cropGrade_status ? (
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

  const handleSubmit = async (formData: any) => {

    try {
      const res = await API.put("crop/crop-grade", {
        id: formData.id,
        cropGrade: formData.cropGrade,
        cropVarietyId: Number(formData.cropVariety)
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully', res.data.id, 3000);
          setShowEditPopup(false)
          fetchCropGrade();
        }

      } else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'Crop Grade already exists' : res.error.code, res.data.id, 3000);
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
  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          crop_name: element.cropVariety?.cropType?.crop?.crop_name,
          cropType_name: element.cropVariety?.cropType?.cropType_name,
          cropVariety: element.cropVariety?.cropVariety,
          cropGrade: element.cropGrade,
          cropGrade_status: element.cropGrade_status
        }
      });
      exportToExcel(dataToExport, "Master-Crop-Grade Data");
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
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this?"
          onDelete={async () => {
            if (deleteItemId !== null) {
              const url = "crop/crop-grade"
              try {
                const response = await API.delete(url, {
                  id: deleteItemId
                })
                if (response.success) {
                  toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                  fetchCropGrade()
                } else {
                  toasterError("");
                }
              }
              catch (error) {
                console.log(error, "error")
                toasterError('An error occurred', deleteItemId, 5000);
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
                      <li>Crop Grade</li>
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
                            <form className="form-group mb-0 search-bar-inner" onSubmit={handleSearchSubmit}>
                              <input
                                type="text"
                                className="form-control form-control-new jsSearchBar "
                                placeholder="Search by Crop Grade"
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
                            onClick={() => router.push("/master/crop/crop-grade/add-crop-grade")}
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
        "Loading..."
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
  const [cropType, setCropType] = useState<any>();
  const [cropVariety, setCropVariety] = useState<any>();
  const [cropGrade, setCropGrade] = useState<any>();
  const [data, setData] = useState<any>({
    id: formData.id,
    cropname: formData.cropNameId,
    cropTypeName: formData.cropTypeId,
    cropVariety: formData.cropTypeVarietyId,
    cropGrade: formData.cropGrade
  })

  const [errors, setErrors] = useState({
    cropname: '',
    cropTypeName: '',
    cropVariety: '',
    cropGrade: ''
  })

  const handleSubmit = () => {
    if (!data.cropname) {
      setErrors((prevError) => ({
        ...prevError,
        cropname: "Crop name is required",
      }));
    }
    if (!data.cropTypeName) {
      setErrors((prevError) => ({
        ...prevError,
        cropTypeName: "Crop type is required",
      }));
    }
    if (!data.cropVariety) {
      setErrors((prevError) => ({
        ...prevError,
        cropVariety: "Crop variety is required",
      }));
    }
    if (!data.cropGrade) {
      setErrors((prevError) => ({
        ...prevError,
        cropGrade: "Crop Grade is required",
      }));
    } else if (!/^[\(\)_\-a-zA-Z0-9\s]+$/.test(data.cropGrade)) {
      setErrors((prevError) => ({
        ...prevError,
        cropGrade: "Only letters, digits, white space, (, ), _ and - allowed.",
      }));
    } else {
      if (data.cropname && data.cropTypeName && data.cropVariety && data.cropGrade) {
        const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');
        if (!hasMergeErrors) {
          onSubmit(data);
        }
      }
    }
  }

  useEffect(() => {
    getCropNames();
  }, [])

  useEffect(() => {
    if (data.cropname) {
      getCropTypes();
    }
  }, [data.cropname])

  useEffect(() => {
    if (data.cropTypeName) {
      getCropVarieties();
    }
  }, [data.cropTypeName])

  const getCropNames = async () => {
    try {
      const res = await API.get("crop/crop-name")

      if (res.success) {
        setCropName(res.data.crops)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCropTypes = async () => {
    try {
      const res = await API.get(`crop/crop-type?pagination=false&cropId=${data.cropname}`)

      if (res.success) {
        setCropType(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCropVarieties = async () => {
    try {
      const res = await API.get(`crop/crop-variety?pagination=false&cropTypeId=${data.cropTypeName}`);

      if (res.success) {
        setCropVariety(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("crop/check-crop-grades", {
      id: data?.id,
      cropVarietyId: Number(data?.cropVariety),
      cropGrade: value
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
    if (data?.cropVariety && value !== "") {
      const onBlurError = await alreadyExistName(value);
      newErrors['cropGrade'] = onBlurError;
    } else {
      newErrors['cropGrade'] = "";
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

  return (
    <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between">
          <h3
          >Edit Crop Grade </h3>
          <span
            onClick={onClose}
            className="cursor-pointer  transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />
        <div className="mb-4 flex">
          <label className="block mb-1 font-medium text-sm w-32">Crop Name:</label>
          <div>
            <select
              name="cropname"
              value={data.cropname}
              onChange={handleChange}
              className="flex-grow p-1 w-60 border rounded-md text-sm"
            >
              <option value="">Select a crop</option>
              {cropname &&
                cropname.map((crop: any) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.crop_name}
                  </option>
                ))}
            </select>
            {errors.cropname && <p className="text-red-500 ml-4 text-sm mt-1">{errors.cropname}</p>}
          </div>
        </div>

        <div className="mb-4 flex">
          <label className="block mb-1 font-medium text-sm w-32">Crop Type:</label>
          <div>
            <select
              name="cropTypeName"
              value={data.cropTypeName}
              onChange={handleChange}
              className="flex-grow p-1 w-60 border rounded-md text-sm"
            >
              <option value="">Select a crop type</option>
              {cropType &&
                cropType.map((type: any) => (
                  <option key={type.id} value={type.id}>
                    {type.cropType_name}
                  </option>
                ))}
            </select>
            {errors.cropTypeName && <p className="text-red-500 ml-4 text-sm mt-1">{errors.cropTypeName}</p>}

          </div>
        </div>

        <div className="mb-4 flex">
          <label className="block mb-1  font-medium text-sm w-32">Crop Variety:</label>
          <div>
            <select
              name="cropVariety"
              value={data.cropVariety}
              onChange={handleChange}
              className="flex-grow p-1 w-60 border rounded-md text-sm"
            >
              <option value="">Select a crop variety</option>
              {cropVariety &&
                cropVariety.map((variety: any) => (
                  <option key={variety.id} value={variety.id}>
                    {variety.cropVariety}
                  </option>
                ))}
            </select>
            {errors.cropVariety && <p className="text-red-500 ml-4 text-sm mt-1">{errors.cropVariety}</p>}

          </div>
        </div>

        <div className="mb-4 flex">
          <label className="block mb-1 font-medium text-sm w-32">Crop Grade:</label>
          <div>
            <input
              type="text"
              name="cropGrade"
              onChange={handleChange}
              onBlur={onBlurCheck}
              value={data.cropGrade}
              className="flex-grow p-1 border w-60 rounded-md text-sm"
            />
            {errors.cropGrade && <p className="text-red-500 ml-4 text-sm mt-1">{errors.cropGrade}</p>}

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
