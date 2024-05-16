"use client";
import React, { useState, useEffect } from "react";
import CommonDataTable from "@components/core/Table";
import NavLink from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import Loader from "@components/core/Loader";
import Select, { GroupBase } from "react-select";

const tempData = [
  {
    mail_type: "Any Time",
  },
  {
    mail_type: "Daily",
  },
  {
    mail_type: "Weekly",
  },
];

export default function () {
  useTitle("Email Management");
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [dataList, setDataList] = useState<any>([]);
  const [isShowUsers, setIsShowUsers] = useState(false);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<any>([]);

  const [initialData, setInitialData] = useState<any>({
    initialProgramData: [],
    initialBrandsData: [],
    initialCountryData: [],
  });

  const [data, setData] = useState<any>({
    templatesData: [],
    mailData: [],
    userGroupData: [],
    programData: [],
    brandsData: [],
    countryData: [],
    userData: [],
  });

  const [formData, setFormData] = useState<any>({
    templateId: undefined,
    mailType: "",
    userGroup: [],
    programIds: [],
    brandIds: [],
    countryIds: [],
    userIds: [],
  });

  useEffect(() => {
    setIsClient(true);
    setCount(0)
    getRole();
  }, []);

  useEffect(() => {
    getTemplates();
  }, [formData.templateId]);

  useEffect(() => {
    getPrograms();
  }, []);

  useEffect(() => {
    setData((prevData: any) => ({
      ...prevData,
      brandsData: [],
      countryData: [],
    }));
    setInitialData((prevFormData: any) => ({
      ...prevFormData,
      initialBrandsData: [],
      initialCountryData: [],
    }));
    if (formData.programIds.length > 0) {
      getBrands();
    } else {
      setData((prevData: any) => ({
        ...prevData,
        brandsData: [],
        countryData: [],
      }));
    }
  }, [formData.programIds]);

  useEffect(() => {
    if (formData.brandIds.length > 0) {
      getCountries();
    } else {
      setData((prevData: any) => ({
        ...prevData,
        countryData: [],
      }));
    }
  }, [formData.brandIds]);

  useEffect(() => {
    if (
      formData.countryIds?.length > 0 &&
      formData.userGroup?.length > 0 &&
      isShowUsers
    ) {
      getUsers();
    }
  }, [searchQuery, page, limit, isShowUsers]);

  const getTemplates = async () => {
    const url = "email/get-email-templates";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const filteredData = response?.data?.filter(
          (item: any) => item.template_name !== 'When new entity creates' && item.template_name !== 'Spinner Transaction Pending Notification' && item.template_name !== 'Pscp Procurement and Sell Live Tracker'
        );
        setData((prevData: any) => ({
          ...prevData,
          templatesData: filteredData,
        }));
        if (formData.templateId) {
          const mailType = response?.data
            ?.filter((item: any) => item.id == formData.templateId)
            .map((item: any) => item.mail_type);
          setData((prevData: any) => ({
            ...prevData,
            mailData: mailType[0],
          }));
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get("program?status=true");
      if (res.success) {
        setData((prevData: any) => ({
          ...prevData,
          programData: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const res = await API.get(`brand?programId=${formData.programIds}`);
      if (res.success) {
        setData((prevData: any) => ({
          ...prevData,
          brandsData: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCountries = async () => {
    const url = `brand-interface/get-countries?brandId=${formData.brandIds}`;
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        setData((prevData: any) => ({
          ...prevData,
          countryData: response.data,
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getRole = async () => {
    try {
      const res = await API.get("user/get-user-roles");
      if (res.success) {
        const dataStore = res.data.filter(
          (item: any) =>
            item?.userCategory?.category_name !== "Superadmin" &&
            item.user_role !== ""
        );
        setData((prevData: any) => ({
          ...prevData,
          userGroupData: dataStore,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      const res = await API.get(
        `user/get-users?countryId=${formData.countryIds}&userGroupId=${formData.userGroup}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`
      );
      if (res.success) {
        setDataList(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleCancel = () => {
    router.back();
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  // const handleChange = (
  //   event:
  //     | React.ChangeEvent<HTMLSelectElement>
  //     | React.ChangeEvent<HTMLInputElement>,
  //   index: number = 0
  // ) => {
  const handleChange = (name?: any, value?: any, event?: any) => {

    setIsSubmitting(true);
    setDataList([]);
    setFormData((prevData: any) => ({
      ...prevData,
      userIds: [],
    }));
    setSelectAllChecked(false);
    setSelectedRowIds([]);
    if (name === "templateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
        mailType: "",
      }));

      setErrors((prevError: any) => ({
        ...prevError,
        [name]: "",
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));

      setErrors((prevError: any) => ({
        ...prevError,
        [name]: "",
      }));
    }
  };

  const handleMultiSelect = (
    selectedOptions: string[],
    name: string,
    index: number = 0
  ) => {
    setIsSubmitting(true);
    setDataList([]);
    setFormData((prevData: any) => ({
      ...prevData,
      userIds: [],
    }));
    setSelectAllChecked(false);
    setSelectedRowIds([]);
    if (name === "countryIds") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = data.countryData.find((option: any) => {
            return option.county_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id: any) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        countryIds: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "brandIds") {
      setFormData((prevData: any) => ({
        ...prevData,
        countryIds: [],
      }));
      const result = selectedOptions
        .map((item: string) => {
          const find: any = data.brandsData.find((option: any) => {
            return option.brand_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id: any) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        brandIds: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "programIds") {
      setFormData((prevData: any) => ({
        ...prevData,
        brandIds: [],
        countryIds: [],
      }));
      const result = selectedOptions
        .map((item: string) => {
          const find: any = data.programData.find((option: any) => {
            return option.program_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id: any) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        programIds: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "userGroup") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = data.userGroupData?.find((option: any) => {
            return option.user_role === item;
          });
          return find ? find.id : null;
        })
        .filter((id: any) => id !== null);
      setFormData((prevData: any) => ({
        ...prevData,
        userGroup: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const requiredFields = [
    "templateId",
    "mailType",
    "userGroup",
    "programIds",
    "brandIds",
    "countryIds",
    "userIds",
  ];

  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      let errorMessage = "This field is Required"
      switch (name) {
        case "templateId":
          return value === undefined || value === ""
            ? errorMessage
            : "";
        case "mailType":
          return value === undefined || value.trim() === "" ? errorMessage : "";
        case "userGroup":
          return value.length == 0 ? errorMessage : "";
        case "programIds":
          return value.length == 0 ? errorMessage : "";
        case "brandIds":
          return value.length == 0 ? errorMessage : "";
        case "countryIds":
          return value.length == 0 ? errorMessage : "";
        case "userIds":
          return formData.userIds?.length === 0 &&
            isShowUsers === true &&
            isSubmitting === false
            ? "Please select any users to submit."
            : "";
        default:
          return "";
      }
    }
  };
  const handleGo = async (event: any) => {
    event.preventDefault();
    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (!hasErrors) {
      setIsShowUsers(true);
      setFormData((prevData: any) => ({
        ...prevData,
        userIds: [],
      }));
      setSelectAllChecked(false);
      setSelectedRowIds([]);
      setIsSubmitting(true);
      getUsers();
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (!hasErrors) {
      setIsSubmitting(true);
      try {
        const response = await API.post("email/set-email-job", formData);
        if (response.success) {
          toasterSuccess(
            "Email job has been saved successfully.",
            3000,
            formData.code
          );
          router.push("/settings/email-management");
        } else {
          toasterError(response.error?.code, 3000, formData.code);
          setIsSubmitting(false);
        }
      } catch (error) {
        toasterError("An Error occurred.");
        setIsSubmitting(false);
      }
    }
  };

  const handleSelectAllChange = () => {
    const allIds = dataList.map((item: any) => item.id);

    if (selectAllChecked) {
      setSelectedRowIds([]);
      setSelectAllChecked(false);
      setIsSubmitting(true);
      setFormData((prevData: any) => ({
        ...prevData,
        userIds: [],
      }));
    } else {
      setSelectedRowIds(allIds);
      setSelectAllChecked(true);

      setFormData((prevData: any) => ({
        ...prevData,
        userIds: allIds,
      }));
      if (allIds.length > 0) {
        setIsSubmitting(false);
      } else {
        setIsSubmitting(true);
      }
    }
  };

  const handleRowCheckboxChange = (id: number, row: any) => {
    let updatedSelectedRowIds;
    if (selectedRowIds.includes(id)) {
      updatedSelectedRowIds = selectedRowIds.filter(
        (rowId: number) => rowId !== id
      );
    } else {
      updatedSelectedRowIds = [...selectedRowIds, id];
    }

    setSelectedRowIds(updatedSelectedRowIds);

    const updatedData = updatedSelectedRowIds.map((selectedId: any) => {
      const selectedRow = dataList?.find((item: any) => item.id === selectedId);
      return selectedRow.id;
    });
    setFormData((prevData: any) => ({
      ...prevData,
      userIds: updatedData,
    }));
    if (dataList?.length === updatedSelectedRowIds?.length) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }

    if (updatedData.length > 0) {
      setIsSubmitting(false);
    } else {
      setIsSubmitting(true);
    }
  };

  const columns = [
    {
      name: (
        <div className="flex justify-between ">
          {" "}
          <input
            name="view"
            type="checkbox"
            className="mr-2"
            onChange={handleSelectAllChange}
            checked={selectAllChecked}
          />
        </div>
      ),
      cell: (row: any) => (
        <div>
          <input
            type="checkbox"
            name="selectedId"
            checked={selectedRowIds.includes(row.id)}
            onChange={(e) => handleRowCheckboxChange(row.id, row)}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      selector: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Name</p>,
      selector: (row: any) => row.username,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Email</p>,
      selector: (row: any) => row.email,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Mobile</p>,
      selector: (row: any) => row.mobile,
      sortable: false,
    },
  ];

  return (
    <div>
      {isClient ? (
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
                  <li>
                    <NavLink href="/settings/email-management">
                      Email Management
                    </NavLink>
                  </li>
                  <li>Add Email Management</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div className="customFormSet">
              <div className="row">
                <div className="col-12 col-md-6 col-lg-4 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Mail Template
                  </label>
                  <Select
                    name="templateId"
                    value={formData.templateId ? { label: data.templatesData?.find((template: any) => template.id === formData.templateId)?.template_name, value: formData.templateId } : null}
                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder=" Select Mail Template"
                    className=" dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={(data.templatesData || []).map(({ id, template_name }: any) => ({
                      label: template_name,
                      value: id,
                      key: id
                    }))}
                    onChange={(item: any) => {
                      handleChange("templateId", item?.value);
                    }}
                  />
                  {/* <Form.Select
                    aria-label="templateId"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                    value={formData.templateId}
                    onChange={(event) => handleChange(event)}
                    name="templateId"
                  >
                    <option value="" className="text-sm">
                      Select Mail Template
                    </option>
                    {data.templatesData.map((template: any) => (
                      <option key={template.id} value={template.id}>
                        {template.template_name}
                      </option>
                    ))}
                  </Form.Select> */}
                  {errors?.templateId !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.templateId}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-4 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Mail Type
                  </label>
                  {/* <Form.Select
                    aria-label="mailType"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                    value={formData.mailType}
                    onChange={(event) => handleChange(event)}
                    name="mailType"
                  >
                    <option value="" className="text-sm">
                      Select Mail Type
                    </option>
                    {formData.templateId
                      ? data.mailData?.map((mailType: any, index: any) => (
                        <option key={index} value={mailType}>
                          {mailType}
                        </option>
                      ))
                      : tempData.map((mailType: any, index: any) => (
                        <option key={index} value={mailType.mail_type}>
                          {mailType.mail_type}
                        </option>
                      ))}
                  </Form.Select> */}
                  <Select
                    name="mailType"
                    value={formData.mailType ? { label: formData.mailType, value: formData.mailType } : null}
                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder="Select Mail Type"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={(formData.templateId ? (data.mailData || []).map((item: any) =>
                    (

                      {
                        label: item,
                        value: item,
                        key: item
                      }
                    )) : (tempData || []).map((item: any) =>
                    (
                      {
                        label: item.mail_type,
                        value: item.mail_type,
                        key: item.id
                      }
                    )))}
                    onChange={(item: any) => {
                      handleChange("mailType", item?.value);
                    }}
                  />



                  {errors?.mailType !== "" && (
                    <div className="text-sm text-red-500">{errors.mailType}</div>
                  )}
                </div>

                <div className="col-12 col-md-6 col-lg-4 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select User Group
                  </label>

                  <MultiSelectDropdown
                    name="userGroup"
                    options={data.userGroupData?.map((item: any) => {
                      return item.user_role;
                    })}
                    onChange={handleMultiSelect}
                  />
                  {errors?.userGroup !== "" && (
                    <div className="text-sm text-red-500">{errors.userGroup}</div>
                  )}
                </div>

                <div className="col-12 col-md-6 col-lg-4 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Programs
                  </label>

                  <MultiSelectDropdown
                    name="programIds"
                    initiallySelected={data.programData
                      .filter((program: any) =>
                        formData.programIds.includes(program.id)
                      )
                      .map((name: any) => name.program_name)}
                    options={data.programData?.map((item: any) => {
                      return item.program_name;
                    })}
                    onChange={handleMultiSelect}
                  />
                  {errors?.programIds !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.programIds}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6 col-lg-4 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Brand
                  </label>
                  <MultiSelectDropdown
                    name="brandIds"
                    initiallySelected={data.brandsData
                      .filter((brand: any) =>
                        formData.brandIds.includes(brand.id)
                      )
                      .map((name: any) => name.brand_name)}
                    options={data.brandsData?.map((item: any) => {
                      return item.brand_name;
                    })}
                    onChange={handleMultiSelect}
                  />
                  {errors?.brandIds !== "" && (
                    <div className="text-sm text-red-500">{errors.brandIds}</div>
                  )}
                </div>

                <div className="col-12 col-md-6 col-lg-4 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Country
                  </label>
                  <MultiSelectDropdown
                    name="countryIds"
                    initiallySelected={data.countryData
                      .filter((country: any) =>
                        formData.countryIds.includes(country.id)
                      )
                      .map((name: any) => name.county_name)}
                    options={data.countryData?.map((item: any) => {
                      return item.county_name;
                    })}
                    onChange={handleMultiSelect}
                  />
                  {errors?.countryIds !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.countryIds}
                    </div>
                  )}
                </div>

                <div className="flex flex-col place-items-end justify-end mt-4">
                  <button
                    className="bg-[#d15e9c] rounded text-white px-3 py-1 text-sm"
                    onClick={handleGo}
                  >
                    GO
                  </button>
                </div>
              </div>
            </div>

            <div className="farm-group-box p-[10px]">
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
                      data={dataList}
                      count={count}
                      updateData={updatePage}
                    />
                    {errors?.userIds !== "" && (
                      <div className="text-sm text-red-500">{errors.userIds}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 w-100 d-flex justify-end gap-2 customButtonGroup">
              <section>
                <button className="btn-outline-purple" onClick={handleCancel}>
                  CANCEL
                </button>
              </section>

              <section>
                <button
                  className="btn-purple mr-2"
                  disabled={isSubmitting}
                  style={
                    isSubmitting
                      ? { cursor: "not-allowed", opacity: 0.8 }
                      : { cursor: "pointer", backgroundColor: "#D15E9C" }
                  }
                  onClick={handleSubmit}
                >
                  SUBMIT
                </button>
              </section>
            </div>
          </div>
        </div>
      ) : (
        "Loading"
      )}
    </div>
  );
}
