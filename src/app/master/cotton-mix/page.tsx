"use client"

import { useRouter } from '@lib/router-events';
import { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import DataTable from "react-data-table-component";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from '@components/core/Table';
import useTranslations from '@hooks/useTranslation';
import User from '@lib/User';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import useTitle from '@hooks/useTitle';
import { exportToExcel } from '@components/core/ExcelExporter';

interface TableData {
  id: number;
  cottonMix_name: string;
  cottonMix_status: boolean;
}
interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Cotton Mix")

  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editedFormData, setEditedFormData] = useState<any>({
    name: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const router = useRouter();


  useEffect(() => {
    fetchCottonMix();
    setIsClient(true)

  }, [searchQuery, page, limit])
  const fetchCottonMix = async () => {
    try {
      const res = await API.get(`cottonmix?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)

      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  const fetchUserData = async (page: number, rowsPerPage: number) => {
    //Add api here
    return { data: [], total: 5 }
  };

  useEffect(() => {
    User.role()
  }, [])
  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading translations...</div>;
  }
  const changeStatus = async (row: any) => {
    const newStatus = !row.cottonMix_status;
    const url = "cottonmix/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchCottonMix()
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
  const handleSubmit = async (formData: { [yarnCountName: string]: string }) => {
    try {
      const res = await API.put("cottonmix", {

        id: formData.id,
        cottonMixName: formData.cottonMix_name,
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully', res.data.id, 3000);
          setShowEditPopup(false)
          fetchCottonMix();
        }
      } else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'Cotton Mix name already exists' : res.error.code, res.data.id, 3000);
        setShowEditPopup(false)
      }

    } catch (error) {
      console.log(error);
      toasterError('An error occurred');
    }

    setShowEditPopup(false);
  };

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: translations.cottonMix.cottonMix,
      selector: (row: TableData) => row.cottonMix_name,
      sortable: false,
    },
    {
      name: translations.common.status,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.cottonMix_status ? "text-green-500" : "text-red-500"}>
          {row.cottonMix_status ? (
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
      name: translations.common.action,
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
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          cottonMix_name: element.cottonMix_name,
          cottonMix_status: element.cottonMix_status,
        }
      });
      exportToExcel(dataToExport, "Master-Cotton-Mix Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleCancel = () => {
    // Close the delete confirmation popup and reset deleteItemId
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
              const url = "cottonmix"
              try {
                const response = await API.delete(url, {
                  id: deleteItemId
                })
                if (response.success) {
                  toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                  fetchCottonMix()
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

      {showEditPopup && (
        <EditPopup
          onClose={() => setShowEditPopup(false)}
          onSubmit={handleSubmit}
          formData={editedFormData}
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
                        <li>Cotton Blend Types</li>

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
                                  placeholder="Search by Cotton mix"
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
                              onClick={() => router.push("/master/cotton-mix/add-cotton-mix")}
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

                        <table className="table custom-tables">
                          <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )
        : 'Loading...'}
    </div>
  );
}

const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
}) => {

  const [data, setData] = useState<any>({
    id: formData?.id || 0,
    cottonMix_name: formData?.cottonMix_name || "",
  })

  const [errors, setErrors] = useState({
    name: ''
  })

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regexAlphabets.test(value); // Use 'value' instead of 'countryName' here
    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors['name'] = value.trim() === "" ? "Cotton Mix Name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _"
    } else {
      const onBlurError = await alreadyExistName(value);
      newErrors['name'] = onBlurError;
    }
    setErrors(newErrors);
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("cottonmix/check-cotton-mixs", {
      id: data?.id,
      cottonMixName: value
    });

    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const handleSubmit = () => {

    const updatedFormData = {
      ...formData,
      cottonMix_name: data.cottonMix_name,
    };
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(updatedFormData.cottonMix_name);
    if (!updatedFormData.cottonMix_name || !valid) {
      setErrors((prevError) => ({
        ...prevError,
        name: !updatedFormData.cottonMix_name ? "Cotton Mix Name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
      }));
    } else {
      const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');

      if (!hasMergeErrors) {
        onSubmit(updatedFormData);
      }
    }
  };

  return (
    <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between">
          <h3
          >Edit Cotton Blend</h3>
          <span
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />

        <div className="mb-4 flex">
          <label className="block mb-1 font-medium text-sm">Cotton Mix:</label>
          <div>
            <input
              type="text"
              name="cottonMix_name"
              onChange={handleChange}
              onBlur={onBlurCheck}
              value={data.cottonMix_name}
              className="w-full p-1 border rounded-md text-sm ml-4"
            />
            {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
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
