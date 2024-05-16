"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import Link from "@components/core/nav-link";

interface FormDataState {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  countriesWeb: string[];
  farmGroups: string[];
  accessLevel: string[];
  country: any;
  state: any;
  districtsId: number[];
  blocksId: number[];
  villagesId: string[];
  role: "";
  status: boolean | null;
  password: string;
  confirmPassword: string;
  brandsId: number[];
  isManagementUser: boolean;
}

export default function page() {
  useTitle("Edit User");
  const [roleLoading] = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [countries, setCountries] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villages, setVillages] = useState([]);
  const [farmGroups, setFarmGroups] = useState([]);
  const [initialCountry, setInitialCountry] = useState([]);
  const [initialFarmGroup, setInitialFarmGroup] = useState<any>([]);
  const [initialBlock, setInitialBlock] = useState([]);
  const [initialDistrict, setInitialDistrict] = useState([]);
  const [initialVillage, setInitialVillage] = useState([]);
  const [initialBrand, setInitialBrand] = useState([]);
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);
  const [role, setRole] = useState<any>([]);
  const [brands, setBrands] = useState([]);
  const [isBrandMaster, setIsBrandMaster] = useState<any>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    id: Number(id),
    username: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    countriesWeb: [],
    farmGroups: [],
    accessLevel: [],
    country: "",
    state: "",
    districtsId: [],
    blocksId: [],
    villagesId: [],
    role: "",
    status: null,
    password: "",
    confirmPassword: "",
    brandsId: [],
    isManagementUser: true
  });
  const [errors, setErrors] = useState<any>({});


  useEffect(() => {
    setInitialData()
    if (countries.length > 0 && farmGroups.length > 0 && districts.length > 0 && countries && blocks && villages && farmGroups && brands) {
      setInitialData();
    }
  }, [countries, farmGroups, districts, blocks, villages, brands, formData.countriesWeb, formData.farmGroups,]);


  useEffect(() => {
    setStates([]);
    setDistricts([])
    setBlocks([]);
    setVillages([]);
    if (formData.country) {
      getStates();
    }
  }, [formData.country]);

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (formData?.countriesWeb && formData.countriesWeb.length >= 0) {
      getFarmGroups();
    } else {
      setFarmGroups([])

    }
  }, [formData.countriesWeb]);

  useEffect(() => {
    setDistricts([])
    setBlocks([]);
    setVillages([]);
    if (formData.state) {
      getDistricts();
    }
  }, [formData.state]);

  useEffect(() => {
    setBlocks([]);
    setVillages([]);
    if (formData.districtsId?.length > 0) {
      getBlocks();
    }
  }, [formData.districtsId]);

  useEffect(() => {
    setVillages([]);

    if (formData.blocksId?.length > 0) {
      getVillages();
    }
  }, [formData.blocksId]);

  useEffect(() => {
    if (id) getUserData();
  }, [id]);

  useEffect(() => {
    getRole();
  }, []);

  useEffect(() => {
    getBrand();
  }, []);

  useEffect(() => {
    updateSelectedFarmGroup()
  }, [farmGroups])

  useEffect(() => {
    if (formData.role) {
      setIsBrandMaster("");
      let brandMaster = role?.filter(
        (item: any) => item.user_role === "Brand_Master" && item.id == formData.role
      );
      if (brandMaster?.length > 0) {
        setIsBrandMaster("Brand_Master");
      }
    }
  }, [formData.role, role])


  const getUserData = async () => {
    const res = await API.get(`user/get-user?id=${id}`);
    if (res.success) {
      setFormData((prevData) => {
        return {
          ...prevData,
          id: res.data.id,
          username: res.data.username,
          firstName: res.data.firstname,
          lastName: res.data.lastname,
          mobile: res.data.mobile,
          email: res.data.email,
          countriesWeb: res.data.countries_web,
          farmGroups: res.data.farm_group,
          accessLevel: res.data.access_level,
          country: res.data.country_id,
          state: res.data.state_id,
          districtsId: res.data.district_id,
          blocksId: res.data.block_id,
          villagesId: res.data.village_id,
          role: res.data.role,
          status: res.data.status,
          brandsId: res.data.brand_mapped,
        };
      });
    }
  };
  const getStates = async () => {
    try {
      const res = await API.get(
        `location/get-states?status=true&countryId=${formData.country}`
      );
      if (res.success) {
        setStates(res.data);
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
  const getFarmGroups = async () => {
    try {
      if (formData?.countriesWeb && formData.countriesWeb.length > 0) {
        const res = await API.get(`farm-group?countryId=${formData?.countriesWeb}`);
        if (res.success) {
          setFarmGroups(res.data);
          const matchFarmGroup: any = res.data
            .filter((farm: any) => formData?.farmGroups?.includes(farm.id))
            .map((farm: any) => farm.name);
          setInitialFarmGroup(matchFarmGroup);
        }
      }
      else {
        setFarmGroups([])
      }
    } catch (error) {
      console.error("Error in getFarmGroups:", error);
    }
  };
  const updateSelectedFarmGroup = () => {
    const matchFarmGroup: any = farmGroups
      .filter((farm: any) => {
        const condition1 = initialFarmGroup.includes(farm.name);
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
    setInitialFarmGroup(matchFarmGroup.map((item: any) => item.name))
  }

  const setInitialData = () => {
    const matchCountryNames: any = countries
      .filter((country: any) => formData?.countriesWeb?.includes(country.id))
      .map((country: any) => country.county_name);
    setInitialCountry(matchCountryNames);

    const matchDistricts: any = districts
      .filter((dis: any) => formData?.districtsId?.includes(dis.id))
      .map((dis: any) => dis.district_name);
    setInitialDistrict(matchDistricts);

    const matchBlocks: any = blocks
      .filter((block: any) => formData?.blocksId?.includes(block.id))
      .map((block: any) => block.block_name);
    setInitialBlock(matchBlocks);

    const matchVillages: any = villages
      .filter((village: any) => formData?.villagesId?.includes(village.id))
      .map((village: any) => village.village_name);
    setInitialVillage(matchVillages);

    const matchBrand: any = brands
      .filter((brand: any) => formData?.brandsId?.includes(brand.id))
      .map((brand: any) => brand.brand_name);
    setInitialBrand(matchBrand);
  };

  const alreadyExistsCheck = async (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if (value != "" && type == "alphaNumeric") {
      const valid = regexAlphaNumeric.test(value)
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only AlphaNumeric values and special characters like _,-,()",
        }));
      }
      else {

        if (name == "username") {
          const userexistResponse = await API.post("brand/user", { username: value, id: formData.id });
          if (userexistResponse.data?.user) {
            setErrors({ ...errors, username: "User Id already exists. Please try another" });
          }

          else {
            setErrors({ ...errors, username: "" })
          }
        }
      }
    }
    else if (value !== "" && type == "email") {
      const valid = regexEmail.test(value)
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid Format",
        }));
      }
      else {
        if (name == "email") {
          const userexistResponse = await API.post("brand/user", { email: value, id: formData.id });
          if (userexistResponse.data?.user) {
            setErrors({ ...errors, email: "Email Id already exist. Please try another" });
          }
          else {
            setErrors({ ...errors, email: "" })
          }
        }
      }
    }
  };

  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const { name, value } = e.target;
    if (value != "") {
      alreadyExistsCheck(e, type);
    }
  }

  const checkFormat = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value)
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      }
      else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
    else if (value !== "" && type == "email") {
      const valid = regexEmail.test(value)
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid format for email",
        }));
      }
      else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    }

  }

  const handleChange = async (event: any) => {
    const { name, value, checked, type } = event.target;

    if (name === "role") {
      setIsBrandMaster("");
      let BrandMaster = role.filter(
        (role: any) => role.user_role === "Brand_Master" && role.id == value
      );
      if (BrandMaster?.length > 0) {
        setIsBrandMaster("Brand_Master");
      }
      else {
        setIsBrandMaster("")
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
      if (name === "country") {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          state: "",
          districtsId: [],
          blocksId: [],
          villagesId: [],
        }));

        setInitialDistrict([]);
        setInitialBlock([])
        setInitialVillage([])
      }
      if (name === "state") {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          districtsId: [],
          blocksId: [],
          villagesId: [],
        }));
        setInitialDistrict([]);
        setInitialBlock([])
        setInitialVillage([])
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      setErrors((prevData: any) => ({
        ...prevData,
        [name]: "",
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
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        blocksId: [],
        villagesId: [],
      }));
      setInitialBlock([])
      setInitialVillage([])
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

      setFormData((prevFormData: any) => ({
        ...prevFormData,
        villagesId: [],
      }));

      setInitialVillage([])

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
    "brandsId"
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
          if (isChangePassword && value.trim() === "") {
            return "Password is required";
          } else if (isChangePassword && !strongPasswordRegex.test(value)) {
            return "Password should include special characters, numbers, capital letters and  it should be minimum of 8 characters.";
          } else {
            return "";
          }
        case "confirmPassword":
          return isChangePassword && formData?.password !== value.trim()
            ? "Passwords not matched"
            : isChangePassword && value.trim() === ""
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
          return value.trim() === "" ? "Email is Required" : errors.email !== "" ? errors.email : ""
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
          return formData?.accessLevel?.includes("Mobile") && (value === null || value == "")
            ? "Field is required"
            : "";
        // case 'brandsId':
        case "role":
          return formData?.accessLevel?.includes("Web") && (value === null || value == "")
            ? "Field is required"
            : "";
        case "status":
          return typeof value !== "boolean" ? "Select at least one option" : "";
        case "brandsId":
          return isBrandMaster === "Brand_Master" && value.length === 0 ? "Select at least one option" : "";
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
      try {
        const response = await API.put("user/update-user", formData);
        setIsSubmitting(true);
        if (response.success) {
          toasterSuccess("User Successfully Edited");
          router.push("/settings/user-management");
          setIsSubmitting(false);
        }
        else {
          setIsSubmitting(false);

        }
      } catch (error) {
        toasterError("Something went wrong!", 3000, 1);
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
      setIsSubmitting(false);
    }
  };

  if (roleLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }
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
              <li>Edit User Management</li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="mb-2 mt-2" />
      <div className="bg-white rounded-md p-4">
        <div className="flex">
          <div className="md:w-1/2 ml-5">
            <div className="mt-4">
              <label className="text-lg">
                User Id<span className="text-red-500">*</span>
              </label>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="User Id"
                  name="username"
                  onBlur={(e) => onBlurCheck(e, "alphaNumeric")}
                  autoComplete="off"
                  value={formData.username}
                  className="w-60 border rounded px-2 py-1 text-lg"
                  onChange={handleChange}
                />
                {errors?.username !== "" && (
                  <div className="text-lg text-red-500">{errors.username}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">
                First Name<span className="text-red-500">*</span>
              </label>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  autoComplete="off"
                  onBlur={(e) => checkFormat(e, "alphabets")}
                  className="w-60 border rounded px-2 py-1 text-lg"
                  onChange={handleChange}
                />
                {errors?.firstName !== "" && (
                  <div className="text-lg text-red-500">{errors.firstName}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">Last Name</label>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Last Name"
                  onBlur={(e) => checkFormat(e, "alphabets")}
                  name="lastName"
                  autoComplete="off"
                  className="w-60 border rounded px-2 py-1 text-lg"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors?.lastName !== "" && (
                  <div className="text-lg text-red-500">{errors.lastName}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">
                Mobile No.<span className="text-red-500">*</span>
              </label>
              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Mobile No"
                  name="mobile"
                  autoComplete="off"
                  className="w-60 border rounded px-2 py-1 text-lg"
                  value={formData.mobile}
                  onChange={handleChange}
                />
                {errors?.mobile !== "" && (
                  <div className="text-lg text-red-500">{errors.mobile}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">
                Email Id<span className="text-red-500">*</span>
              </label>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Email Id"
                  name="email"
                  autoComplete="off"
                  onBlur={(e) => onBlurCheck(e, "email")}
                  className="w-60 border rounded px-2 py-1 text-lg"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors?.email !== "" && (
                  <div className="text-lg text-red-500">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">
                Country<span className="text-red-500">*</span>
              </label>
              <div className="mt-3 w-[200px]">
                <MultiSelectDropdown
                  name="countriesWeb"
                  initiallySelected={initialCountry}
                  options={countries?.map((item: any) => {
                    return item.county_name;
                  })}
                  onChange={handleSelectionChange}
                />

                {errors?.countriesWeb !== "" && (
                  <div className="text-lg text-red-500">
                    {errors.countriesWeb}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">
                Farm Group<span className="text-red-500">*</span>
              </label>
              <div className="mt-3 w-[200px]">
                <MultiSelectDropdown
                  name="farmGroups"
                  initiallySelected={initialFarmGroup}
                  options={farmGroups?.map((item: any) => {
                    return item.name;
                  })}
                  onChange={handleSelectionChange}
                />

                {errors?.farmGroups !== "" && (
                  <div className="text-lg text-red-500">{errors.farmGroups}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-lg">
                Access level<span className="text-red-500">*</span>
              </label>
              <div className="mt-3">
                <div>
                  <label className="text-lg flex">
                    <input
                      type="checkbox"
                      value="Mobile"
                      checked={formData.accessLevel?.includes("Mobile")}
                      onChange={handleChange}
                      name="accessLevel"
                    />
                    Mobile
                  </label>
                  <label className="text-lg">
                    <input
                      type="checkbox"
                      value="Web"
                      checked={formData.accessLevel?.includes("Web")}
                      onChange={handleChange}
                      name="accessLevel"
                    />
                    Web
                  </label>
                  {errors?.accessLevel !== "" && (
                    <div className="text-lg text-red-500">
                      {errors.accessLevel}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {formData && formData.accessLevel?.includes("Mobile") ? (
              <div className="block mt-5">
                <div className="mb-3">
                  <label className="text-lg">
                    Country<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3">
                    <select
                      name="country"
                      placeholder={"country"}
                      className="w-60 border rounded px-2 py-1  text-lg"
                      value={formData.country}
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
                      <div className="text-lg text-red-500">{errors.country}</div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-lg">
                    State<span className="text-red-500">*</span>
                  </label>
                  <div>
                    <select
                      name="state"
                      placeholder={"State"}
                      className="w-60 border rounded px-2 py-1  text-lg"
                      value={formData.state}
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
                      <div className="text-lg text-red-500">{errors.state}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-sm">
                    District<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3 w-[200px]">
                    <MultiSelectDropdown
                      name="districtsId"
                      initiallySelected={initialDistrict}
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
                <div className="mb-3">
                  <label className="text-sm">
                    Block<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3 w-[200px]">
                    <MultiSelectDropdown
                      name="blocksId"
                      initiallySelected={initialBlock}
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
                <div className="mb-3">
                  <label className="text-sm">
                    Village<span className="text-red-500">*</span>
                  </label>
                  <div className="w-[200px]">
                    <MultiSelectDropdown
                      name="villagesId"
                      initiallySelected={initialVillage}
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
            ) : (
              ""
            )}
          </div>

          <div className="md:w-1/2">
            <div>
              <h3 className="bold">Credential:</h3>

              {isChangePassword && (
                <>
                  <div className="mt-4">
                    <label className="text-lg">
                      Password:<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-3">
                      <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        className="w-60 border rounded px-2 py-1  text-lg"
                        placeholder="Password"
                      />
                      {errors?.password !== "" && (
                        <div className="text-lg text-red-500">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-lg">
                      Re-enter Password:<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-3">
                      <input
                        type="password"
                        name="confirmPassword"
                        onChange={handleChange}
                        className="w-60 border rounded px-2 py-1  text-lg"
                        placeholder="Re-enter Password"
                      />
                      {errors?.confirmPassword !== "" && (
                        <div className="text-lg text-red-500">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              <div className="mt-5">
                <button
                  className="bg-[#00c0ef] p-2 text-white rounded text-lg "
                  onClick={() => setIsChangePassword(!isChangePassword)}
                >
                  {isChangePassword ? "Close" : "Change Password"}
                </button>
              </div>
            </div>

            <div>
              <div>
                <div className="mt-4">
                  <label className="text-lg">
                    Status:<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status !== null && formData.status}
                      onChange={handleChange}
                      className="text-lg"
                    />

                    <label className="text-lg">Active</label>
                  </div>
                </div>
                <div className="mt-3">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    onChange={handleChange}
                    className="text-lg"
                  />
                  <label className="text-lg">Inactive</label>
                </div>
                {errors?.status !== "" && (
                  <div className="text-lg text-red-500">{errors.status}</div>
                )}
              </div>
              {formData && formData.accessLevel?.includes("Web") ? (
                <div className="mt-4">
                  <label className="text-sm">
                    Role:<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-60 border rounded px-2 py-1 mt-5 text-sm"
                    value={formData.role}
                    name="role"
                    onChange={handleChange}
                  >
                    <option value="">select Role</option>
                    {role?.map((role: any) => (
                      <option key={role.id} value={role.id}>
                        {role.user_role}
                      </option>
                    ))}
                  </select>
                  {errors?.role !== "" && (
                    <div className="text-sm text-red-500">{errors.role}</div>
                  )}
                  {isBrandMaster === "Brand_Master" ? (
                    <div className="block mt-5">
                      <label className="text-sm">Brand</label>
                      <div className="mt-3 w-[200px]">
                        <MultiSelectDropdown
                          name="brandsId"
                          initiallySelected={initialBrand}
                          options={brands?.map((item: any) => item.brand_name)}
                          onChange={handleSelectionChange}
                        />
                      </div>
                      {errors.brandsId !== "" && (
                        <div>
                          <div className="text-sm text-red-500">{errors.brandsId}</div>
                        </div>
                      )}
                    </div>
                  ) : ""}

                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <div>
          <button
            className="bg-green-500 p-2 text-white rounded ml-5 text-sm mt-3 mb-2 "
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            className="bg-gray-300 p-2 text-black rounded ml-5 text-sm  mt-3 mb-2 "
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
