"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import useRole from "@hooks/useRole";

interface FormDataState {
  username: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  countriesWeb: string[];
  farmGroups: string[];
  accessLevel: string[];
  country: number | null;
  state: number | null;
  districtsId: number[];
  blocksId: number[];
  villagesId: string[];
  role: any;
  status: boolean | null;
  password: string;
  confirmPassword: string;
  brandsId: number[];
  mobileData: string[];
  isManagementUser: boolean;
}

export default function page() {
  useTitle("Add User");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [farmGroups, setFarmGroup] = useState([]);
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [villages, setVillages] = useState([]);
  const [role, setRole] = useState<any>([]);
  const [brands, setBrands] = useState([]);
  const [isBrandMaster, setIsBrandMaster] = useState<any>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    username: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    countriesWeb: [],
    farmGroups: [],
    accessLevel: [],
    country: null,
    state: null,
    districtsId: [],
    blocksId: [],
    villagesId: [],
    role: null,
    status: null,
    password: "",
    confirmPassword: "",
    brandsId: [],
    mobileData: [],
    isManagementUser: true,
  });

  const [errors, setErrors] = useState<any>({});

  const [initialData, setInitialData] = useState<any>({
    initailCountries: [],
    initialDistrict: [],
    initialBlock: [],
    initialVillage: [],
    initialFarmGroups: []
  });

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (formData?.countriesWeb && formData.countriesWeb.length >= 0) {
      getFarmGroups();
    } else {
      setFarmGroup([])
    }
  }, [formData.countriesWeb]);

  useEffect(() => {
    updateSelectedFarmGroup()
  }, [farmGroups])
  useEffect(() => {
    setStates([]);
    setDistricts([]);
    setBlocks([]);
    setVillages([]);
    setInitialData((prevFormData: any) => ({
      ...prevFormData,
      initialDistrict: [],
      initialBlock: [],
      initialVillage: [],
    }));
    if (formData.country) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        state: null,
        districtsId: [],
        blocksId: [],
        villagesId: [],
      }));

      getStates();
    }
  }, [formData.country]);

  useEffect(() => {
    setDistricts([]);
    setBlocks([]);
    setVillages([]);
    setInitialData((prevFormData: any) => ({
      ...prevFormData,
      initialDistrict: [],
      initialBlock: [],
      initialVillage: [],
    }));
    if (formData.state) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        districtsId: [],
        blocksId: [],
        villagesId: [],
      }));

      getDistricts();
    }
  }, [formData.state]);

  useEffect(() => {
    setVillages([]);
    setInitialData((prevFormData: any) => ({
      ...prevFormData,
      initialBlock: [],
      initialVillage: [],
    }));
    if (formData.districtsId?.length > 0) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        blocksId: [],
        villagesId: [],
      }));
      getBlocks();
    }
  }, [formData.districtsId]);

  useEffect(() => {
    setInitialData((prevFormData: any) => ({
      ...prevFormData,
      initialVillage: [],
    }));
    if (formData.blocksId?.length > 0) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        villagesId: [],
      }));
      getVillages();
    }
  }, [formData.blocksId]);

  useEffect(() => {
    getRole();
    getBrand();
  }, []);

  const getStates = async () => {
    try {
      const res = await API.get(
        `location/get-states?status=true&countryId=${formData.country}`
      );
      if (res.success) {
        if (formData.country !== formData.country) {
          setStates((prevData: any) => ({
            ...prevData,
            state: "",
            district: "",
            block: "",
          }));
        }
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.state}`
      );
      if (res.success) {
        setDistricts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      const res = await API.get(
        `location/get-blocks?districtId=${formData.districtsId}`
      );
      if (res.success) {
        setBlocks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVillages = async () => {
    try {
      const res = await API.get(
        `location/get-villages?blockId=${formData.blocksId}`
      );
      if (res.success) {
        setVillages(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getRole = async () => {
    try {
      const res = await API.get("user/get-user-roles");
      if (res.success) {
        const dataStore = res.data?.filter(
          (item: any) => item?.user_role !== "" &&
                item?.user_role !== "Mandi" &&
                item?.user_role !== "Mill" &&
                item?.user_role !== "Third_Party_Inspection" &&
                item?.user_role !== "Lab" &&
                item?.user_role !== "Container_Management_System" &&
                item?.user_role !== "Brand" &&
                item?.user_role !== "Superadmin");
        setRole(dataStore);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getBrand = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getCountries = async () => {
    const res = await API.get("location/get-countries?status=true");
    if (res.success) {
      setCountries(res.data);
    }
  };

  const getFarmGroups = async () => {
    try {
      if (formData?.countriesWeb && formData.countriesWeb.length > 0) {
        const res = await API.get(`farm-group?countryId=${formData?.countriesWeb}`);
        if (res.success) {
          setFarmGroup(res.data);
        }
      }
      else {
        setFarmGroup([])
        setFormData((prevFormData) => ({
          ...prevFormData,
          farmGroups: [],
        }));
      }
    } catch (error) {
      console.error("Error in getFarmGroups:", error);
    }
  };
  const updateSelectedFarmGroup = () => {
    const matchFarmGroup: any = farmGroups
      .filter((farm: any) => {
        const condition1 = initialData.initialFarmGroups.includes(farm.name);
        const condition2 = farm.brand.countries_id.some((countryId: any) => formData.countriesWeb.includes(countryId));
        return condition1 && condition2;
      })
      .map((farm: any) => ({
        id: farm.id,
        name: farm.name
      }));
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      farmGroups: matchFarmGroup.map((item: any) => item.id)
    }));
    setInitialData((prev: any) => ({
      ...prev,
      initialFarmGroups: matchFarmGroup.map((item: any) => item.name)
    }))
  }

  const alreadyExistsCheck = async (e: any) => {
    const { name, value } = e.target;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (name === "username") {
      const userexistResponse = await API.post("brand/user", {
        username: value,
      });
      if (userexistResponse.data?.user) {
        setErrors({
          ...errors,
          username: "User Id already exists. Please try another",
        });
      } else {
        setErrors({ ...errors, username: "" });
      }
    } else if (name === "email") {
      const valid = regexEmail.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid email",
        }));
      } else {
        const userexistResponse = await API.post("brand/user", {
          email: value,
        });
        if (userexistResponse.data?.user) {
          setErrors({
            ...errors,
            email: "Email Id already exist. Please try another",
          });
        } else {
          setErrors({ ...errors, email: "" });
        }
      }
    }
  };

  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value != "") {
      alreadyExistsCheck(e);
    }
  };

  const handleChange = async (event: any) => {
    const { name, value, checked, type } = event.target;

    if (name === "role") {
      setIsBrandMaster("");
      let BrandMaster = role.filter(
        (role: any) => role.user_role === "Brand_Master" && role.id == value
      );
      if (BrandMaster?.length > 0) {
        setIsBrandMaster("Brand_Master");
      } else {
        setIsBrandMaster("");
      }
    }

    if (type === "checkbox") {
      setFormData((prevData: any) => {
        if (checked) {
          return { ...prevData, accessLevel: [...prevData.accessLevel, value] };
        } else {
          return {
            ...prevData,
            accessLevel: prevData.accessLevel.filter(
              (item: string) => item !== value
            ),
          };
        }
      });
    } else if (name === "status") {
      setFormData((prevData) => ({
        ...prevData,
        status: value === "active" ? true : false,
      }));

    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSelectionChange = (selectedOptions: string[], name: string) => {
    if (name === "countriesWeb") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = countries.find((option: any) => {
            return option.county_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, countriesWeb: result };
      });
    }
    if (name === "farmGroups") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = farmGroups.find((option: any) => {
            return option.name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, farmGroups: result };
      });
      setInitialData((prevData: any) => {
        return { ...prevData, initialFarmGroups: selectedOptions };
      });
    }

    if (name === "districtsId") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = districts.find((option: any) => {
            return option.district_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, districtsId: result };
      });
    }

    if (name === "blocksId") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = blocks.find((option: any) => {
            return option.block_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, blocksId: result };
      });
    }

    if (name === "villagesId") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = villages.find((option: any) => {
            return option.village_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, villagesId: result };
      });
    }

    if (name === "brandsId") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = brands.find((option: any) => {
            return option.brand_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, brandsId: result };
      });
    }
  };

  const requiredFields = [
    "username",
    "firstName",
    "lastName",
    "mobile",
    "email",
    "password",
    "confirmPassword",
    "countriesWeb",
    "blocksId",
    "farmGroups",
    "villagesId",
    "districtsId",
    "country",
    "state",
    "role",
    "status",
    "accessLevel",
    "brandsId",
  ];

  const validateField = (name: string, value: any) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const stdCodeRegex = /^\+?1?[ -]?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/;
    const strongPasswordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;

    if (requiredFields.includes(name)) {
      switch (name) {
        case "username":
          if (value.trim() === "") {
            return "User Id is required";
          } else if (!alphanumericRegex.test(value)) {
            return "Accepts only AlphaNumeric values";
          } else {
            return errors?.username || "";
          }
        case "firstName":
          if (value.trim() === "") {
            return "First Name is required";
          } else if (!alphanumericRegex.test(value)) {
            return "Accepts only AlphaNumeric values";
          } else {
            return "";
          }
        case "lastName":
          if (value.trim() !== "" && !alphanumericRegex.test(value)) {
            return "Accepts only AlphaNumeric values";
          } else {
            return "";
          }
        case "password":
          if (value.trim() === "") {
            return "Password is required";
          } else if (!strongPasswordRegex.test(value)) {
            return "Password should include special characters, numbers, capital letters and  it should be minimum of 8 characters.";
          } else {
            return "";
          }
        case "confirmPassword":
          return formData && formData?.password !== value.trim()
            ? "Passwords not matched"
            : value.trim() === ""
              ? "Re-enter Password is required"
              : "";
        case "mobile":
          if (value.trim() === "") {
            return "Mobile No is required";
          } else if (!stdCodeRegex.test(value)) {
            return "Invalid mobile no., Accepts STD Code";
          } else {
            return "";
          }
        case "email":
          return value.trim() === ""
            ? "Email is Required"
            : errors.email !== ""
              ? errors.email
              : "";
        case "countriesWeb":
        case "farmGroups":
        case "accessLevel":
          return value.length === 0 ? "Select at least one option" : "";
        case "districtsId":
        case "blocksId":
        case "villagesId":
          return formData?.accessLevel?.includes("Mobile") && value.length === 0
            ? "Select at least one option"
            : "";
        case "country":
        case "state":
          return formData?.accessLevel?.includes("Mobile") &&
            (value === null || value == "")
            ? "Field is required"
            : "";
        // case 'brandsId':
        case "role":
          return formData?.accessLevel?.includes("Web") &&
            (value === null || value == "")
            ? "Field is required"
            : "";
        case "status":
          return typeof value !== "boolean" ? "Select at least one option" : "";
        case "brandsId":
          return isBrandMaster === "Brand_Master" && value.length === 0
            ? "Select at least one option"
            : "";
        default:
          return "";
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof FormDataState]
      );
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (!hasErrors) {
      const response = await API.post("auth/signup", formData);
      setIsSubmitting(true);
      if (response.success) {
        toasterSuccess("User Successfully Created");
        router.push("/settings/user-management");
        setErrors({});
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
      setIsSubmitting(false);
    }
  };


  if (!roleLoading) {
    return (
      <>
        <div className="mt-10 border-black dark:border-gray-800 w-full"></div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/settings/user-management">User Management</Link>
                </li>
                <li>Add User Management</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="mb-3 mt-2" />

        <div className="bg-white rounded-md p-4">
          <h1 className="mt-3 font-semibold text-lg">Credential:</h1>
          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* User Id */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    User Id <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="User Id"
                    name="username"
                    autoComplete="off"
                    onBlur={(e) => onBlurCheck(e)}
                    className="border rounded px-2 py-1 w-full text-sm"
                    onChange={handleChange}
                  />
                  {errors?.username !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.username}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Role */}
            <div className="w-full sm:w-1/2 my-1">
              {formData && formData.accessLevel?.includes("Web") && (
                <div className="flex">
                  <div className="w-1/2">
                    <label className="text-sm w-full">Role</label>
                  </div>
                  <div className="w-1/2">
                    <select
                      className="border rounded px-2 py-1 w-full text-sm"
                      value={formData.role}
                      name="role"
                      onChange={handleChange}
                    >
                      <option value="">Select Role</option>
                      {role?.map((role: any) => (
                        <option key={role.id} value={role.id}>
                          {role.user_role}
                        </option>
                      ))}
                    </select>
                    {errors?.role !== "" && (
                      <div className="text-sm text-red-500">{errors.role}</div>
                    )}

                    {isBrandMaster === "Brand_Master" && (
                      <div className="block mt-5">
                        <label className="text-sm">Brand</label>
                        <div className="mt-3 w-[200px]">
                          <MultiSelectDropdown
                            name="brandsId"
                            options={brands?.map(
                              (item: any) => item.brand_name
                            )}
                            onChange={handleSelectionChange}
                          />
                        </div>
                        {errors.brandsId !== "" && (
                          <div>
                            <div className="text-sm text-red-500">
                              {errors.brandsId}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* Password */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-sm"
                    placeholder="Password"
                  />
                  {errors?.password !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Re-enter password */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    Re-enter password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full text-sm"
                    placeholder="Re-enter Password"
                  />
                  {errors?.confirmPassword !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* First Name */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    First Name <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    autoComplete="off"
                    className="border rounded px-2 py-1 w-full text-sm"
                    onChange={handleChange}
                  />
                  {errors?.firstName !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.firstName}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Last Name */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">Last Name</label>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    autoComplete="off"
                    className="border rounded px-2 py-1 w-full text-sm"
                    onChange={handleChange}
                  />
                  {errors?.lastName !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* Mobile No. */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    Mobile No. <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="Mobile No"
                    name="mobile"
                    autoComplete="off"
                    className="border rounded px-2 py-1 w-full text-sm"
                    onChange={handleChange}
                  />
                  {errors?.mobile !== "" && (
                    <div className="text-sm text-red-500">{errors.mobile}</div>
                  )}
                </div>
              </div>
            </div>
            {/* Email Id */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    Email Id <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    placeholder="Email Id"
                    name="email"
                    autoComplete="off"
                    onBlur={(e) => onBlurCheck(e)}
                    className="border rounded px-2 py-1 w-full text-sm"
                    onChange={handleChange}
                  />
                  {errors?.email !== "" && (
                    <div className="text-sm text-red-500">{errors.email}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* Status */}
            <div className="w-full my-1">
              <div className="flex items-center">
                <div className="w-1/4">
                  <label className="text-sm">
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex justify-start gap-4">
                  <div className="flex gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status !== null && formData.status}
                      onChange={handleChange}
                      className="text-sm"
                    />
                    <label className="text-sm">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      onChange={handleChange}
                      className="text-sm"
                    />
                    <label className="text-sm">Inactive</label>
                  </div>
                </div>
              </div>
              {errors?.status !== "" && (
                <div className="text-sm text-red-500">{errors.status}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* Country */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex items-center">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    Country <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <MultiSelectDropdown
                    name="countriesWeb"
                    options={countries?.map((item: any) => {
                      return item.county_name;
                    })}
                    onChange={handleSelectionChange}

                  />
                  {errors?.countriesWeb !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.countriesWeb}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Farm group */}
            <div className="w-full sm:w-1/2 my-1">
              <div className="flex items-center">
                <div className="w-1/2">
                  <label className="text-sm w-full">
                    Farm group <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="w-1/2">
                  <MultiSelectDropdown
                    name="farmGroups"
                    options={farmGroups?.map((item: any) => {
                      return item.name;
                    })}
                    initiallySelected={initialData.initialFarmGroups}
                    onChange={handleSelectionChange}
                  />
                  {errors?.farmGroups !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.farmGroups}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 my-4">
            {/* Access Level */}
            <div className="w-full my-1">
              <div className="flex items-center">
                <div className="w-1/4">
                  <label className="text-sm">
                    Access Level <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex justify-start gap-4">
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      value="Mobile"
                      onChange={handleChange}
                      name="accessLevel"
                      className="mr-2"
                    />
                    Mobile
                  </label>
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      value="Web"
                      onChange={handleChange}
                      name="accessLevel"
                      className="mr-2"
                    />
                    Web
                  </label>
                </div>
              </div>
              {errors?.status !== "" && (
                <div className="text-sm text-red-500">{errors.status}</div>
              )}
            </div>
          </div>

          {formData && formData.accessLevel?.includes("Mobile") && (
            <>
              <h1 className="mt-3 font-semibold text-lg">Access Level:</h1>
              <div className="flex flex-col sm:flex-row gap-6 my-4">
                {/* Country */}
                <div className="w-full sm:w-1/2 my-1">
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <label className="text-sm w-full">
                        Country <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="w-1/2">
                      <select
                        name="country"
                        placeholder={"country"}
                        className="border rounded px-2 py-1 w-full text-sm"
                        onChange={handleChange}
                      >
                        <option value="">Select Country</option>
                        {countries?.map((country: any) => (
                          <option key={country.id} value={country.id}>
                            {country.county_name}
                          </option>
                        ))}
                      </select>
                      {errors?.country !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.country}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* State */}
                <div className="w-full sm:w-1/2 my-1">
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <label className="text-sm w-full">
                        State <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="w-1/2">
                      <select
                        name="state"
                        placeholder={"State"}
                        className="border rounded px-2 py-1 w-full text-sm"
                        onChange={handleChange}
                      >
                        <option value="">Select State</option>
                        {states?.map((state: any) => (
                          <option key={state.id} value={state.id}>
                            {state.state_name}
                          </option>
                        ))}
                      </select>
                      {errors?.state !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.state}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 my-4">
                {/* District */}
                <div className="w-full sm:w-1/2 my-1">
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <label className="text-sm w-full">
                        District <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="w-1/2">
                      <MultiSelectDropdown
                        name="districtsId"
                        initiallySelected={initialData.initialDistrict}
                        options={districts?.map((item: any) => {
                          return item.district_name;
                        })}
                        onChange={handleSelectionChange}
                      />

                      {errors?.districtsId !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.districtsId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Block */}
                <div className="w-full sm:w-1/2 my-1">
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <label className="text-sm w-full">
                        Block <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="w-1/2">
                      <MultiSelectDropdown
                        name="blocksId"
                        initiallySelected={initialData.initialBlock}
                        options={blocks?.map((item: any) => {
                          return item.block_name;
                        })}
                        onChange={handleSelectionChange}
                      />
                      {errors?.blocksId !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.blocksId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 my-4">
                {/* Village */}
                <div className="w-full sm:w-1/2 my-1">
                  <div className="flex items-center">
                    <div className="w-1/2">
                      <label className="text-sm w-full">
                        Block <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="w-1/2">
                      <MultiSelectDropdown
                        name="villagesId"
                        initiallySelected={initialData.initialVillage}
                        options={villages?.map((item: any) => {
                          return item.village_name;
                        })}
                        onChange={handleSelectionChange}
                      />
                      {errors?.villagesId !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.villagesId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 my-1"></div>
              </div>
            </>
          )}

          <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
            <button
              className="bg-green-600 text-sm rounded text-white px-2 py-1.5"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              Submit
            </button>
            <button
              className="bg-gray-300 text-sm rounded text-black px-2 py-1.5"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }
}