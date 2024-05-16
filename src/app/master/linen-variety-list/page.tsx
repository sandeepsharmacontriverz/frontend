"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import Link from "@components/core/nav-link";

const linenVarietyList: React.FC = () => {
  useTitle("Linen variety");
  const [roleLoading] = useRole();

  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const [data, setData] = useState([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [editName, setEditName] = useState<string>("");
  const [editVariety, setEditVariety] = useState<string>("");
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLinenVariety = async () => {
    const url = `linen-variety?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const editHandle = (row: any) => {
    setEditId(row.id);
    setEditName(row.name);
    setEditVariety(row.variety);
    setEditVisible(true);
  };
  const handleCancel = () => {
    setEditVisible(false);
    setShowDeleteConfirmation(false);
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const changeStatus = async (row: any) => {
    const newStatus = !row.status;
    const url = "linen-variety/status";
    try {
      const response = await API.put(url, {
        id: row.id,
        status: newStatus,
      });
      if (response.success) {
        getLinenVariety();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getLinenVariety();
  }, [searchQuery, page, limit]);

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: translations.common.name,
      cell: (row: any) => row.name,
    },
    {
      name: translations.variety,
      cell: (row: any) => row.variety,
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
      cell: (row: any) => (
        <>
          <button
            className="bg-green-500 p-2 rounded"
            onClick={() => editHandle(row)}
          >
            <LuEdit size={18} color="white" />
          </button>
          <button
            className="bg-red-500 p-2 ml-3 rounded"
            onClick={() => handleDelete(row.id)}
          >
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
          <div>
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
                    <li>Linen Variety</li>
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
                          onClick={() =>
                            router.push(
                              "/master/linen-variety-list/add-linen-variety-list"
                            )
                          }
                        >
                          {translations.common.add}
                        </button>
                      </div>
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
            <div>
              <Edit
                openPopup={editVisible}
                onCancel={handleCancel}
                editId={editId}
                defaultName={editName}
                defaultVariety={editVariety}
                getItems={getLinenVariety}
              />
            </div>

            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "linen-variety";
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId,
                      });
                      if (response.success) {
                        toasterSuccess("Record has been deleted successfully");
                        getLinenVariety();
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
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
};

export default linenVarietyList;

const Edit = ({
  openPopup,
  onCancel,
  editId,
  defaultName,
  defaultVariety,
  getItems,
}: any) => {
  const [name, setName] = useState<any>("");
  const [variety, setVariety] = useState<any>("");

  const [errors, setErrors] = useState({
    name: "",
    variety: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "name") {
      setName(value);
      setErrors((prevError) => ({
        ...prevError,
        name: "",
      }));
    } else {
      setVariety(value);
      setErrors((prevError) => ({
        ...prevError,
        variety: "",
      }));
    }
  };

  const handleCancel = () => {
    onCancel();
    setName(defaultName);
    setVariety(defaultVariety);
    setErrors({
      name: "",
      variety: "",
    });
  };

  const handleSubmit = async () => {
    let isError = false;
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const newErrors = {
      name: "",
      variety: "",
    };

    if (!name) {
      newErrors.name = "Name is required";
      isError = true;
    } else if (!regex.test(name)) {
      newErrors.name = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (!variety) {
      newErrors.variety = "Variety is required";
      isError = true;
    } else if (!regex.test(variety)) {
      newErrors.variety = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }
    setErrors(newErrors);

    if (!isError) {
      const url = "linen-variety";
      try {
        const response = await API.put(url, {
          id: editId,
          name: name,
          variety: variety,
        });
        if (response.success) {
          toasterSuccess("Record has been updated successfully");
          setName("");
          getItems();
          onCancel();
        } else {
          toasterError(
            response.error.code === "ALREADY_EXITS"
              ? "Linen Variety already exist"
              : response.error.code
          );
          onCancel();
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  useEffect(() => {
    setName(defaultName);
    setVariety(defaultVariety);
  }, [defaultName, defaultVariety]);

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3>Edit Linen Variety</h3>
              <button onClick={handleCancel}>&times;</button>
            </div>
            <hr />
            <div className="py-2">
              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Name*</span>
                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={handleInputChange}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder="Name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Variety*</span>
                <div>
                  <input
                    type="text"
                    id="variety"
                    name="variety"
                    value={variety}
                    onChange={handleInputChange}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder="Variety"
                  />
                  {errors.variety && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.variety}
                    </p>
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
  );
};
