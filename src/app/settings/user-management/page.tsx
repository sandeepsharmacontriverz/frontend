"use client";
import React, { useState, useEffect } from "react";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import Link from "@components/core/nav-link";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
export default function page() {
  useTitle("User Management");
  const [roleLodaing] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    getUsers();
  }, []);

  useEffect(() => {
    getUsers();
  }, [searchQuery, page, limit]);

  const getUsers = async () => {
    const res = await API.get(
      `user/get-users?search=${searchQuery}&limit=${limit}&page=${page}&pagination=true`
    );
    if (res.success) {
      setData(res.data);
      setCount(res.count);
    } else {
      setCount(0);
    }
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      selector: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">User Id</p>,
      selector: (row: any) => row.username,
      cell: (row: any) => (
        <Link
          // legacyBehavior
          href={`/settings/user-management/edit-user-management?id=${row.id}`}
        // passHref
        >
          <span className="text-blue-500 hover:text-blue-300"
            rel="noopener noreferrer">
            {row.username}
          </span>
        </Link>
      ),
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">First Name</p>,
      selector: (row: any) => row.firstname,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Last Name</p>,
      selector: (row: any) => row.lastname,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Mobile No</p>,
      selector: (row: any) => row.mobile,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Email Id</p>,
      selector: (row: any) => row.email,
      wrap: true
    },

    {
      name: <p className="text-[13px] font-medium">Delete</p>,
      cell: (row: any) => (
        <>
          <button onClick={() => handleDelete(row.id)}>
            <AiFillDelete
              size={30}
              className="mr-4  p-1.5  bg-red-500 text-white"
            />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (roleLodaing) {
    return <Loader />;
  }
  const handleCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {isClient ? (
        <>
          {showDeleteConfirmation && (
            <DeleteConfirmation
              message="Are you sure you want to delete this?"
              onDelete={async () => {
                if (deleteItemId !== null) {
                  const url = "user/delete-user";
                  try {
                    const response = await API.delete(url, {
                      id: deleteItemId,
                    });

                    if (response.success) {
                      toasterSuccess(
                        "Record has been deleted successfully",
                        3000,
                        deleteItemId
                      );
                      getUsers();
                    } else {
                      toasterError(
                        "Failed to delete record",
                        3000,
                        deleteItemId
                      );
                    }
                  } catch (error) {
                    console.error(error, "error");
                    toasterError("An error occurred");
                  }
                  setShowDeleteConfirmation(false);
                  setDeleteItemId(null);
                }
              }}
              onCancel={handleCancel}
            />
          )}

          <div>
            {/* Breadcrumbs */}
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
                    <li>
                      <Link href="">User Management</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* More content here */}

            {/* Farm Group */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
                    {/* Search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left">
                        <div className="search-bars">
                          <form className="form-group mb-0 search-bar-inner">
                            <input
                              type="text"
                              className="form-control form-control-new jsSearchBar"
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
                              "/settings/user-management/add-user-management"
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
          </div>
          <hr className="bg-black h-1 mb-8 mt-2" />
        </>
      ) : (
        "Loading"
      )}
    </>
  );
}
