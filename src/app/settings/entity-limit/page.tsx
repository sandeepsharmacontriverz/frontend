"use client";
import React, { useEffect, useState } from "react";
import CommonDataTable from "@components/core/Table";
import NavLink from "@components/core/nav-link";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";

export default function page() {
  useTitle("Entity Limit");
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>();
  const [formData, setFormData] = useState<any>({
    id: '',
    brand_name: '',
    entity_limit: ''
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [count, setCount] = useState<any>();
  const [error, setError] = useState<any>({});

  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    fetchEntity();
    setIsClient(true);
  }, [searchQuery, page, pageLimit]);

  const fetchEntity = async () => {
    try {
      const res = await API.get(
        `entity?limit=${pageLimit}&page=${page}&search=${code}&pagination=true`
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

  const fetchEntityById = async (id: any) => {
    const matchingItem = data.find((item: any) => item.id == id);
    if (matchingItem) {
      setFormData({
        id: matchingItem.id,
        brand_name: matchingItem.brand_name,
        entity_limit: matchingItem.entity_limit
      })
      setError({
        brand_name: "",
        entity_limit: ""
      });
    }

  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setPageLimit(limitData);
  };

  const handleErrors = () => {
    let isError = false;
    const errors: { [key: string]: string } = {};

    if (!formData || !formData.brand_name) {
      errors.brand_name = "Brand Name is Required";
      isError = true;
    }

    if (formData.entity_limit === "") {
      errors.entity_limit = "Limit is Required";
      isError = true;
    } else if (Number(formData.entity_limit) === 0) {
      errors.entity_limit = "Please enter greater than zero.";
      isError = true;
    }

    setError((prevError: any) => ({
      ...prevError,
      ...errors,
    }));

    return isError;
  };


  const handleSubmit = async () => {
    if (handleErrors()) {
      return;
    }

    const res = await API.put(`entity`, {
      id: formData.id,
      limit: Number(formData.entity_limit),
    });

    if (res.success) {
      if (res.data) {
        toasterSuccess("Entity Limit has been updated successfully.");
        setFormData({
          id: '',
          brand_name: '',
          entity_limit: ''
        })
        setError({
          brand_name: "",
          entity_limit: ""
        });
        fetchEntity();
      }
    } else {
      toasterError("Failed to update record");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "entity_limit") {
      if (Number(value) < 0 || Number(value) > 100) {
        setError((prev: any) => ({
          ...prev,
          [name]: "Entity Limit should be in between 0 and 100",
        }));
      } else {
        setError((prev: any) => ({
          ...prev,
          [name]: "",
        }));
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
      return;
    }
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      selector: (row: any, index: any) => (page - 1) * pageLimit + index + 1,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Brand Name</p>,
      cell: (row: any) => (
        <p onClick={() => fetchEntityById(row.id)} className="text-blue-500 hover:text-blue-600 cursor-pointer">
          {row.brand_name}
        </p>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">Limit</p>,
      selector: (row: any) => row.entity_limit,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Used</p>,
      selector: (row: any) => row.used_limit,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Remaining</p>,
      selector: (row: any) => row.remaining_limit,
      wrap: true

    },
  ];

  if (!roleLoading) {
    return (
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <NavLink href="/dashboard" className="active">
                      <span className="icon-home"></span>
                    </NavLink>
                  </li>
                  <li>Settings</li>
                  <li>Entity Limit</li>
                </ul>
              </div>
            </div>
          </div>
          {isClient ? (
            <>
              <div className="bg-white rounded-md p-4">
                <div>
                  <div>
                    <label className="text-gray-500 text-[12px] font-medium">Brand Name <span className="text-red-500">*</span></label>
                    <div>
                      <input
                        type="text"
                        name="brand_name"
                        placeholder="Brand Name"
                        value={formData.brand_name || ""}
                        disabled
                        className="w-96 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {error?.brand_name && (
                        <div className="text-red-500 text-sm mt-1">
                          {error.brand_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className="text-gray-500 text-[12px] font-medium">Set Limit Here <span className="text-red-500">*</span></label>
                    <div>
                      <input
                        type="number"
                        name="entity_limit"
                        value={formData.entity_limit}
                        onChange={handleChange}
                        placeholder="Limit"
                        className="w-96 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {error?.entity_limit && (
                        <div className="text-red-500 text-sm mt-1">
                          {error.entity_limit}
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        className="btn-purple mr-2 mt-4"

                        onClick={handleSubmit}
                      >
                        SUBMIT
                      </button>
                    </div>
                  </div>
                </div>


                <div className="farm-group-box">
                  <div className="farm-group-inner">
                    <div className="table-form">
                      <div className="search-filter-row">
                        <div className="search-filter-left ">
                          <div className="search-bars">
                            <form className="form-group mb-0 search-bar-inner" >
                              <input
                                type="text"
                                className="form-control form-control-new jsSearchBar "
                                placeholder="Search"
                                value={searchQuery}
                                onChange={searchData}
                              />
                              <button type="submit" className="search-btn">
                                <span className="icon-search"></span>
                              </button>
                            </form>
                          </div>
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
        </div>
      </>
    );
  }
}
