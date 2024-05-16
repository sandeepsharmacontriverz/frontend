"use client";

import { useRouter } from "@lib/router-events";
import { useState, useEffect } from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import User from "@lib/User";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";

interface TableData {
  id: number;
  name: string;
  address: string;
  country: string;
  contact_person?: any;
  mobile?: any;
  email?: any;
  status: boolean;
}

interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Co-operative");
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editedFormData, setEditedFormData] = useState<any>({
    name: "",
    address: "",
    country: "",
    contactPerson: "",
    mobile: "",
    email: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchcooperate();
    setIsClient(true);
  }, [limit, page, searchQuery]);
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const fetchcooperate = async () => {
    try {
      const res = await API.get(
        `cooperative?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true&sort=desc`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  useEffect(() => {
    User.role();
  }, []);

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.status;
    const url = "cooperative/status";
    try {
      const response = await API.put(url, {
        id: row.id,
        status: newStatus,
      });
      if (response.success) {
        fetchcooperate();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const handleEdit = (row: any) => {
    setShowEditPopup(true);
    setEditedFormData(row);
  };
  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: translations.common.name,
      selector: (row: TableData) => row.name,
      sortable: false,
    },
    {
      name: translations.common.address,
      selector: (row: TableData) => row.address,
      sortable: false,
    },

    {
      name: translations.common.country,
      selector: (row: TableData) => row.country,
      sortable: false,
    },
    {
      name: translations.common.contactPerson,
      selector: (row: TableData) => row.contact_person,
      sortable: false,
    },
    {
      name: translations.common.mobile,
      selector: (row: TableData) => row.mobile,
      sortable: false,
    },
    {
      name: translations.common.emailId,
      selector: (row: TableData) => row.email,
      sortable: false,
    },
    {
      name: translations.common.status,
      cell: (row: any) => (
        <button
          onClick={() => changeStatus(row)}
          className={row.status ? "text-green-500" : "text-red-500"}
        >
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
      name: translations.common.action,
      cell: (row: TableData) => (
        <>
          <button
            className="bg-green-500 p-2 rounded "
            onClick={() => handleEdit(row)}
          >
            <LuEdit size={18} color="white" />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 p-2 ml-3 rounded"
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const handleSubmit = async (formData: any) => {
    try {
      const res = await API.put("cooperative", {
        id: formData.id,
        address: formData.address,
        name: formData.name,
        country: formData.country,
        contactPerson: formData.contactPerson,
        mobile: formData.mobile,
        email: formData.email,
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess("Record has been updated successfully");
          setShowEditPopup(false);
          fetchcooperate();
        }
      } else {
        toasterError(
          res.error.code === "ALREADY_EXITS"
            ? "Cooperative list name already exist"
            : res.error.code
        );
        setShowEditPopup(false);
      }
    } catch (error) {
      console.log(error);
      toasterError("An error occurred");
    }

    setShowEditPopup(false);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
  };
  return (
    <div>
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
              const url = "cooperative";
              try {
                const response = await API.delete(url, {
                  id: deleteItemId,
                });
                if (response.success) {
                  toasterSuccess("Record has been deleted successfully");
                  fetchcooperate();
                } else {
                  toasterError("Failed to delete record");
                }
              } catch (error) {
                console.log(error, "error");
                toasterError("An error occurred");
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
                      <li>Cooperative List</li>
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
                            <form
                              className="form-group mb-0 search-bar-inner"
                              onSubmit={handleSearchSubmit}
                            >
                              <input
                                type="text"
                                className="form-control form-control-new jsSearchBar "
                                placeholder="Search by Cooperative List"
                                value={searchQuery}
                                onChange={searchData}
                              />
                              <button type="submit" className="search-btn">
                                <span className="icon-search"></span>
                              </button>
                            </form>
                          </div>
                        </div>
                        <CommonDataTable
                          columns={columns}
                          count={count}
                          data={data}
                          updateData={updatePage}
                        />
                      </div>
                      <CommonDataTable
                        columns={columns}
                        count={count}
                        data={data}
                        updateData={updatePage}
                      />
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
}) => {
  const [data, setData] = useState<any>({
    id: formData?.id || 0,
    name: formData?.name || "",
    address: formData.address,
    country: formData.country,
    contactPerson: formData.contact_person,
    mobile: formData.mobile,
    email: formData.email,
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    country: "",
    contactPerson: "",
    mobile: "",
    email: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const isInputEmpty = (inputValue: any) => {
    return inputValue.trim() === "";
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let isError = false;
    const newErrors = {
      name: "",
      address: "",
      country: "",
      contactPerson: "",
      mobile: "",
      email: "",
    };
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;

    if (isInputEmpty(data.name.trim())) {
      newErrors.name = "Name is required";
      isError = true;
    } else if (!regex.test(data.name.trim())) {
      newErrors.name = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (isInputEmpty(data.address.trim())) {
      newErrors.address = "Address is required";
      isError = true;
    } else if (!regex.test(data.address.trim())) {
      newErrors.address = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (isInputEmpty(data.country.trim())) {
      newErrors.country = "Country is required";
      isError = true;
    } else if (!regex.test(data.country.trim())) {
      newErrors.country = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (
      !isInputEmpty(data.contactPerson.trim()) &&
      !regex.test(data.contactPerson.trim())
    ) {
      newErrors.contactPerson =
        "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (!isInputEmpty(data.mobile.trim()) && !regex.test(data.mobile.trim())) {
      newErrors.mobile = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (!isInputEmpty(data.email.trim()) && !regex.test(data.email.trim())) {
      newErrors.email = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    setErrors(newErrors);

    if (!isError) {
      onSubmit(data);
    }
  };

  return (
    <div className="flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between">
          <h3>Edit Cooperative</h3>
          <span
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />

        <div className="my-4">
          <div className="flex items-center">
            <label className="block mb-1 font-medium text-sm w-32">Name:</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              className="flex-grow p-1 border rounded-md text-sm"
            />
          </div>
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <label className="block mb-1 font-medium text-sm w-32">
              Address:
            </label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              value={data.address}
              className="flex-grow p-1 border rounded-md text-sm"
            />
          </div>
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <label className="block mb-1 font-medium text-sm w-32">
              Country:
            </label>
            <input
              type="text"
              name="country"
              onChange={handleChange}
              value={data.country}
              className="flex-grow p-1 border rounded-md text-sm"
            />
          </div>
          {errors.country && (
            <p className="text-red-500 text-sm">{errors.country}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <label className="block mb-1 font-medium text-sm w-32">
              Contact Person Name:
            </label>
            <input
              type="text"
              name="contactPerson"
              onChange={handleChange}
              value={data.contactPerson}
              className="flex-grow p-1 border rounded-md text-sm"
            />
          </div>
          {errors.contactPerson && (
            <p className="text-red-500 text-sm">{errors.contactPerson}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <label className="block mb-1 font-medium text-sm w-32">
              Mobile:
            </label>
            <input
              type="text"
              name="mobile"
              onChange={handleChange}
              value={data.mobile}
              className="flex-grow p-1 border rounded-md text-sm"
            />
          </div>
          {errors.mobile && (
            <p className="text-red-500 text-sm">{errors.mobile}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <label className="block mb-1 font-medium text-sm w-32">
              Email:
            </label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
              value={data.email}
              className="flex-grow p-1 border rounded-md text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
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
