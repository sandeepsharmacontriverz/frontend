"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { exportToExcel } from "@components/core/ExcelExporter";

const unitCertification: React.FC = () => {
  useTitle("Unit Certification");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([])
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [certificationName, setCertificationName] = useState<string>('')
  const [certificationLogo, setCertificationLogo] = useState<string>('')
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getUnitCertifications = async () => {
    const url = `unit/unit-certification?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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
    setSearchQuery(e.target.value)
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          certification_name: element.certification_name,
          certification_logo: element.certification_logo,
          certification_status: element.certification_status
        }
      });
      exportToExcel(dataToExport, "Master-Unit-Certification Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.certification_status;
    const url = "unit/unit-certification-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        getUnitCertifications()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const editHandle = (row: any) => {
    setEditId(row.id)
    setCertificationName(row.certification_name)
    setCertificationLogo(row.certification_logo)
    setEditVisible(true)
  }

  const handleCancel = () => {
    setEditVisible(false)
    setShowDeleteConfirmation(false)
  }

  useEffect(() => {
    getUnitCertifications()
  }, [searchQuery, page, limit]);

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
      name: <p className="text-[13px] font-medium">{translations?.unit?.unitCertificationName}</p>,

      cell: (row: any) => row.certification_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.logo}</p>,

      center: true,
      cell: (row: any) => (
        <img
          src={row.certification_logo ? row.certification_logo : '/images/image-placeholder.png'}
          alt="logo"
          className="p-2 w-32"
        />
      ),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,

      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.certification_status ? "text-green-500" : "text-red-500"}>
          {row.certification_status ? (
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
          <button className="bg-green-500 p-2 rounded" onClick={() => editHandle(row)}>
            <LuEdit size={18} color="white" />
          </button>
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
        <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} editCertificationName={certificationName} editCertificationLogo={certificationLogo} getItems={getUnitCertifications} />

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
                        <li>Unit</li>
                        <li>Unit Certification</li>
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
                                  placeholder="Search by Unit Certification"
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
                              onClick={() => router.push("/master/unit/unit-certification/add-unit-certification")}
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
                        <div>
                          <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} editCertificationName={certificationName} editCertificationLogo={certificationLogo} getItems={getUnitCertifications} />
                        </div>
                        {showDeleteConfirmation && (
                          <DeleteConfirmation
                            message="Are you sure you want to delete this?"
                            onDelete={async () => {
                              if (deleteItemId !== null) {
                                const url = "unit/unit-certification"
                                try {
                                  const response = await API.delete(url, {
                                    id: deleteItemId
                                  })
                                  if (response.success) {
                                    toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                                    getUnitCertifications()
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          'Loading...'
        )}
      </div>
    )
  }
};

export default unitCertification;


const Edit = ({ openPopup, onCancel, editId, editCertificationLogo, editCertificationName, getItems }: any) => {
  const [unitId, setUnitId] = useState("")
  const [certificationName, setCertificationName] = useState<any>('');
  const [file, setFile] = useState<any>(null);
  const [errors, setErrors] = useState({
    logo: '',
    name: ''
  })

  const alreadyExistName = async (value: string) => {
    const res = await API.post("unit/check-unit-certification", {
      id: editId,
      certificationName: value
    });

    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCertificationName(value)
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regexAlphabets.test(value); // Use 'value' instead of 'countryName' here
    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors['name'] = value.trim() === "" ? "Unit certification name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _";
    } else {
      const onBlurError = await alreadyExistName(value);
      newErrors['name'] = onBlurError;
    }
    setErrors(newErrors);
  };

  const handleCancel = () => {
    onCancel()
    setCertificationName(editCertificationName)
    setErrors({
      logo: '',
      name: ''
    })
  };

  const handleSubmit = async () => {
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(certificationName);
    if (!certificationName || !valid) {
      if (!certificationName) {
        setErrors((prevError) => ({
          ...prevError,
          name: "Unit certification name is required",
        }));
      } else {
        setErrors((prevError) => ({
          ...prevError,
          name: "Enter Only Alphabets, Digits, Space, (, ), - and _",
        }));
      }
    } else {
      const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');

      if (!hasMergeErrors) {
        if (certificationName && errors.logo === "") {
          const url = "unit/unit-certification"
          try {
            const response = await API.put(url, {
              "id": editId,
              "certificationLogo": file,
              "certificationName": certificationName
            })
            if (response.success) {
              toasterSuccess('Record has been updated successfully', response?.data?.id, 3000)
              getItems()
              onCancel()
            }
            else {
              toasterError(response.error.code === 'ALREADY_EXITS' ? 'Unit certification name already exist' : response.error.code, response?.data?.id, 3000);
              onCancel()
            }
          }
          catch (error) {
            console.log(error, "error")
          }
        }
      }
    }
  };
  const previewImage = async (event: any) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      if (!['image/jpeg', 'image/jpg', 'image/bmp', 'image/png'].includes(imageFile.type)) {
        setErrors((prevError) => ({
          ...prevError,
          logo: "Invalid file type. Please select a JPG, JPEG, or BMP image.",
        }));
        return;
      }

      const maxSize = 100 * 1024;
      if (imageFile.size > maxSize) {
        setErrors((prevError) => ({
          ...prevError,
          logo: "File size exceeds the maximum allowed size (100 KB).",
        }));
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", imageFile)

    const url = "file/upload"
    try {
      const response = await API.postFile(url, formData)
      if (response.success) {
        setFile(response.data);
      }

      setErrors((prevError) => ({
        ...prevError,
        logo: "",
      }));
    }
    catch (error) {
      console.log(error, "error")
    }
  };

  useEffect(() => {
    setCertificationName(editCertificationName)
    setFile(editCertificationLogo)
  }, [editCertificationName])

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3
              >Edit Unit Certification</h3>
              <button
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">

              {/* <div className="flex justify-between">
                <div>
                  <span className="text-sm mr-8">Unit Certification Name*</span>
                </div>
                <div>
                  <select
                    className="w-80 border rounded px-2 py-1 text-sm"
                    value={farmItem}
                    onChange={(event) => handleChange(event)}
                    name="farmItem"
                  >
                    <option value="" className="text-sm">
                      Select Farm Item*
                    </option>
                    {farmItems.map((farmItem: any) => (
                      <option key={farmItem.id} value={farmItem.farmItem}>
                        {farmItem.farmItem}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}
              {/* {error.farmItem && <div className="text-red-500 text-sm ml-5 mt-1">{error.farmItem}</div>} */}

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Unit Certification Name*</span>
                <div>
                  <input
                    type="text"
                    id="certificationName"
                    name="certificationName"
                    value={certificationName}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder='Unit Certification Name'
                  />
                  {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Logo: </span>
                <div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/bmp"
                    className="block w-full py-1 px-1 text-sm  bg-white rounded-md focus:outline-none ml-3"
                    onChange={previewImage}
                  />
                  {errors.logo ? (
                    <p className="text-red-500 ml-4 text-sm mt-1">{errors.logo}</p>
                  ) : (
                    file && <img src={file} className="w-[200px] h-[200px] " />
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
  )
}

