"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import API from "@lib/Api";
import useTranslations from "@hooks/useTranslation";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";

export default function page() {
  useTitle("Retailer & Brand Registration");
  const [roleLoading] = useRole();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    getBrands();
  }, []);

  useEffect(() => {
    getBrands();
  }, [searchQuery, page, limit]);

  const getBrands = async () => {
    const res = await API.get(
      `brand?search=${searchQuery}&limit=${limit}&page=${page}&pagination=true`
    );
    if (res.success) {
      setData(res.data);
      setCount(res.count);
    } else {
      console.log(res.error);
      setCount(0);
    }
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const { translations, loading }: any = useTranslations();
  if (loading) {
    return <div>  <Loader /></div>;
  }

  const handleDelete = (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      selector: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Retailer & Brand Name</p>,

      selector: (row: any) => row.brand_name,
      cell: (row: any) => (
        <Link
          // legacyBehavior
          href={`/settings/retailer-brand-registration/view-retailer-brand-registration?id=${row.id}`}
        // passHref
        >
          <span
            className=" text-blue-500 hover:text-blue-300"
            rel="noopener noreferrer"
          >
            {row.brand_name}
          </span>
        </Link>
      ),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Address</p>,
      selector: (row: any) => row.address,
      cell: (row: any) => <p className="text-sm">{row.address}</p>,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Website</p>,
      selector: (row: any) => row.website,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Contact Person Name</p>,

      selector: (row: any) => row.contact_person,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Email Id</p>,
      selector: (row: any) => row.email,
      sortable: false,
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

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  if (roleLoading) {
    return <Loader />;
  }

  return (
    <>
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Settings</li>
                <li>Retailer & Brand Registration</li>
              </ul>
            </div>
          </div>
        </div>
        {isClient ? (
          <>
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
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
                              onChange={(e: any) =>
                                setSearchQuery(e.target.value)
                              }
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
                              "/settings/retailer-brand-registration/add-retailer-brand-registration"
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
          </>
        ) : (
          "Loading"
        )}

        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "brand";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully");
                    getBrands();
                  } else {
                    toasterError(response.error.code, 5000, deleteItemId);
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
    </>
  );
}
