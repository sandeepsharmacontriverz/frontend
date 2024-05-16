"use client";
import React, { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import useTitle from "@hooks/useTitle";
import Link from '@components/core/nav-link';
import API from "@lib/Api";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import Select from "react-select";


export default function addTransaction() {
  useTitle("Add User");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [formData, setFormData] = useState<any>({
    userRegId: null,
    DeviceID: "",
    staffName: "",
    programId: null,
    programName: "",
    accessLevel: "",
    mandi: null,
    username: "",
    firstName: "",
    lastName: "",
    mobile: null,
    email: null,
    status: null,
    brandId: null,
    countryId: null,
    stateId: null,
    district: null,
    block: null,
    village: null,
    password: null,
    agentId: null,
    garmentId: null,
    subagent: null,
    // weaver: null,
    cms: null,
    mill: null,
    admin: null,
    confirm_password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [brands, setBrands] = useState<any>();
  const [agents, setAgents] = useState<any>();
  const [programs, setPrograms] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [villages, setVillages] = useState<any>();
  const [mandis, setMandis] = useState<any>();
  const [mills, setMills] = useState<any>();
  const [cmses, setCmses] = useState<any>();
  // const [weavers, setWeavers] = useState<any>();
  const [checkedDistrict, setCheckedDistrict] = useState<any>([]);
  const [checkedBlock, setCheckedBlock] = useState<any>([]);
  const [checkedVillage, setCheckedVillage] = useState<any>([]);
  const [checkedMandi, setCheckedMandi] = useState<any>([]);
  const [initiallySelected, setIntiallySelected] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState<any>(false);

  useEffect(() => {
    getAgents();
    getBrands();
    getPrograms();
    getMills();
    getCmses();
    // getWeavers();
    getUnRegister();
  }, []);


  useEffect(() => {
    if (checkedVillage && checkedVillage.length > 0) {
      const matchNames: any = villages
        ?.filter((village: any) => checkedVillage?.includes(village?.id))
        ?.map((item: any) => item?.village_name);
      setIntiallySelected(formData?.allVillage === true ? ["All"] : matchNames);
    }
  }, [villages, checkedVillage]);

  useEffect(() => {
    if (formData.accessLevel !== "subagent") {
      setFormData({ ...formData, countryId: null });
    } // im change
    if (formData?.brandId) {
      getCountries();
    } else {
      setCountries([]);
      setFormData({ ...formData, countryId: null, stateId: null });
      setCheckedDistrict([]);
      setCheckedBlock([]);
      setCheckedVillage([]);
      setCheckedMandi([]);
    }
  }, [formData.brandId]);

  useEffect(() => {
    if (formData.accessLevel !== "subagent") {
      setFormData({ ...formData, stateId: null });
    } // im chnage this
    if (formData.accessLevel === "mandi") {
      getMandis();
    } else {
      setMandis([]);
    }
  }, [formData.accessLevel]);

  useEffect(() => {
    if (formData.accessLevel !== "subagent") {
      setFormData({ ...formData, stateId: null });
    }
    if (formData?.countryId) {
      getStates();
    } else {
      setStates([]);
      setFormData({ ...formData, countryId: null, stateId: null });
      setCheckedDistrict([]);
      setCheckedBlock([]);
      setCheckedVillage([]);
      setCheckedMandi([]);
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.accessLevel !== "subagent") {
      setCheckedMandi([]);
      setCheckedDistrict([]);
    }
    if (formData?.stateId && formData?.stateId !== "") {
      getDistricts();
      getMandis();
    } else {
      setDistricts([]);
      if (formData.accessLevel !== "mandi") {
        setMandis([]);
        setCheckedMandi([]);
      }
      setCheckedBlock([]);
      setCheckedDistrict([]);
      setCheckedVillage([]);
    }
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.accessLevel !== "subagent") {
      setCheckedBlock([]);
    }
    if (checkedDistrict.length !== 0) {
      getBlocks();
    } else {
      setBlocks([]);
      setCheckedBlock([]);
      setCheckedVillage([]);
    }
  }, [checkedDistrict]);
  useEffect(() => {
    if (formData.accessLevel !== "subagent") {
      setIntiallySelected([]);
      setCheckedVillage([]);
    }
    if (checkedBlock.length !== 0) {
      GetVillages();
    } else {
      setVillages([]);
      setIntiallySelected([]);
      setCheckedVillage([]);
    }
  }, [checkedBlock]);

  const getUnRegister = async () => {
    try {
      const res = await API.get(`qr-app/unregister-devices?id=${id}`);
      const data = res.data.find((data: any) => data.id == id);
      if (res.success) {
        setFormData({
          ...formData,
          userRegId: data?.id,
          staffName: !data?.lastName ? data?.firstName : data?.firstName + " " + data?.lastName,
          DeviceID: data?.device_id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAgents = async () => {
    try {
      const res = await API.get("qr-app/get-agent-list?program=REEL");
      if (res.success) {
        setAgents(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get(`program?status=true`);
      if (res.success) {
        setPrograms(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMandis = async () => {
    let url =
      formData.accessLevel === "mandi"
        ? "mandi"
        : `mandi?stateId=${formData?.stateId}`;
    try {
      const res = await API.get(url);
      if (res.success) {
        setMandis(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMills = async () => {
    try {
      const res = await API.get(`mill`);
      if (res.success) {
        setMills(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCmses = async () => {
    try {
      const res = await API.get("container-management-system");
      if (res.success) {
        setCmses(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getWeavers = async () => {
  //   try {
  //     const res = await API.get(`weaver`);
  //     if (res.success) {
  //       setWeavers(res.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getCountries = async () => {
    try {
      if (formData?.brandId !== null) {
        const res = await API.get(
          `brand-interface/get-countries?brandId=${formData?.brandId}`
        );
        if (res.success) {
          setCountries(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStates = async () => {
    try {
      if (formData?.countryId !== null) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${formData?.countryId}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      if (formData?.stateId !== null) {
        const res = await API.get(
          `location/get-districts?stateId=${formData?.stateId}`
        );
        if (res.success) {
          setDistricts(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      if (checkedDistrict !== 0) {
        const res = await API.get(
          `location/get-blocks?districtId=${checkedDistrict}`
        );
        if (res.success) {
          setBlocks(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetVillages = async () => {
    try {
      if (checkedBlock.length !== 0) {
        const res = await API.get(
          `location/get-villages?blockId=${checkedBlock}`
        );
        if (res.success) {
          setVillages(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
    const errors = {};

    if (name == "username") {
      if (value != "") {
        alreadyExistsCheck(name, value);
      }
      if (value != "" && type == "alphaNumeric") {
        const valid = regexAlphaNumeric.test(value);
        if (!valid) {
          setErrors((prev: any) => ({
            ...prev,
            [name]:
              "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()",
          }));
        }
        return;
      }
    }

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only Alphabets and special characters like comma(,),_,-,(),.",
        }));
      }
      return;
    }

    if (value != "" && type == "numbers") {
      const numericValue = value.replace(/[^\d.]/g, "");
      const isValidValue = /^(0*[1-9]\d*(\.\d+)?|0*\.\d+)$/.test(numericValue);

      if (!isValidValue) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value should be greater than zero.",
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
      return;
    }

    if (value != "" && type == "numeric") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: Number(value).toFixed(2),
        }));
      }
      return;
    }

    if (value != "" && type == "alphaNumeric") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()",
        }));
      }
      return;
    }

    if (type === "bill") {
      if (value != "") {
        const valid = regexBillNumbers.test(value);
        if (!valid) {
          setErrors((prev: any) => ({
            ...prev,
            [name]:
              "Accepts only AlphaNumeric values  and special characters like comma(,),_,-,(),/",
          }));
        }
      }
      return;
    }
  };

  const alreadyExistsCheck = async (name: string, value: string) => {
    const res = await API.post("qr-app/find-user", {
      username: value,
    });
    if (res?.data?.user === true) {
      setErrors((pre: any) => ({
        ...pre,
        [name]: "User Id already exist. Please try another",
      }));
    }
  };

  const handleSelectionChange = (
    selectedOptions: string[],
    name: string,
    index: number = 0
  ) => {
    if (name === "villages") {
      if (selectedOptions.length > 0 && selectedOptions.includes("All")) {
        const result = villages.map((item: any) => item.id);
        setCheckedVillage(result);
        setIntiallySelected(["All"]);
        setFormData((prevData: any) => ({
          ...prevData,
          allVillage: true,
        }));
      } else {
        const result = selectedOptions
          .map((item: string) => {
            const find: any = villages.find((option: any) => {
              return option.village_name === item;
            });
            return find ? find.id : null;
          })
          .filter((id) => id !== null);
        setCheckedVillage(result);
        setIntiallySelected(selectedOptions);
        setFormData((prevData: any) => ({
          ...prevData,
          allVillage: false,
        }));
      }
      setErrors((prev: any) => ({
        ...prev,
        village: "",
      }));
    } else if (name === "mandi") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = mandis.find((option: any) => {
            return option.name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);
      setCheckedMandi(result);
    } else if (name === "district") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = districts.find((option: any) => {
            return option?.district_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);
      setCheckedDistrict(result);
    } else if (name === "block") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = blocks.find((option: any) => {
            return option?.block_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);
      setCheckedBlock(result);
    }
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleChange = (e: any, value?: any, label?: any) => {
    const setFormDataValue = (field: string, fieldValue: any) => {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: fieldValue,
      }));
    };

    if (e == "brandId" || e == "countryId" || e == "stateId" || e == "programId" || e == "subagent"
      || e == "mandi" || e == "mill" || e == "cms") {
      if (e === "programId") {
        const agentValue = label?.toLowerCase() === "organic" ? "agent" : "";

        setFormData((prevData: any) => ({
          ...prevData,
          programName: label,
          accessLevel: agentValue,
          subagent: null,
          // firstName: "",
          // weaver: null,
          cms: null,
          mill: null,
          mandi: null,
          brandId: null,
          countryId: null,
          stateId: null,
        }));
        setSelectedOption(agentValue);
        setCheckedBlock([]);
        setCheckedDistrict([]);
        setCheckedVillage([]);
        setErrors((prev: any) => ({
          ...prev,
          accessLevel: "",
        }));
      }

      if (
        value !== null && value !== undefined &&
        formData?.accessLevel &&
        formData?.accessLevel == "subagent" &&
        e == "subagent"
      ) {
        const findDate = agents?.find(
          (data: any) => Number(data.id) === Number(value)
        );

        setFormData((prevData: any) => ({
          ...prevData,
          brandId: findDate?.acs_brand,
          countryId: findDate?.acs_country_id,
          stateId: findDate?.acs_state_id,
          allVillage: findDate?.acs_all_village,
        }));
        setCheckedBlock(findDate?.acs_block);
        setCheckedDistrict(findDate?.acs_district);
        setCheckedVillage(findDate?.acs_village);
        setErrors((prev: any) => ({
          ...prev,
          brandId: '',
          countryId: '',
          stateId: '',
          district: '',
          block: '',
          village: '',
        }));
      }

      if (
        value == null && value == undefined &&
        formData?.accessLevel === "subagent" &&
        e === "subagent"
      ) {
        setFormData((prevData: any) => ({
          ...prevData,
          brandId: null,
          countryId: null,
          stateId: null,
        }));
        setCheckedBlock([]);
        setCheckedDistrict([]);
        setCheckedVillage([]);
      }

      setFormDataValue(e, value);
      setErrors((prev: any) => ({
        ...prev,
        [e]: "",
      }));
    } else {
      const { name, value, type } = e.target;

      if (type === "radio" && name === "status") {
        setFormDataValue("status", value === "active");
      }

      if (formData.accessLevel === name) {
        setFormDataValue("firstName", label);
      }

      if (name === "mobile" && value.length <= 10) {
        setFormDataValue(name, value);
      } else if (type !== "radio" && name !== "mobile") {
        setFormDataValue(name, value);
      }

      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSelectedOption(value);
    setFormData((prevData: any) => ({
      ...prevData,
      accessLevel: value,
      brandId: null,
      countryId: null,
      stateId: null,
      subagent: null,
      mandi: null,
      admin: null,
      mill: null,
      cms: null,
      // weaver: null,
      firstName: "",
      lastName: "",
    }));
    setCheckedBlock([]);
    setCheckedDistrict([]);
    setCheckedVillage([]);

    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const requireGarmentFields = [
    "email",
    "username",
    "programId",
    "accessLevel",
    "mandi",
    "brandId",
    "firstName",
    "lastName",
    "mobile",
    "status",
    "countryId",
    "stateId",
    "district",
    "block",
    "village",
    "password",
    "subagent",
    // "weaver",
    "cms",
    "mill",
    "admin",
    "confirm_password",
  ];

  const validateField = (name: string, value: any, index: number = 0) => {
    // const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const strongPasswordRegex =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;

    if (requireGarmentFields.includes(name)) {
      const programName = formData?.programName?.toLowerCase();
      switch (name) {
        case "username":
          return value?.length === 0 || value === null
            ? " User ID is Required"
            : value?.length > 12
              ? "Value should not exceed 12 characters"
              : "";
        case "email":
          if (value?.length === 0 || value === null) {
            return "";
          } else {
            return value?.length > 70
              ? "Value should not exceed 70 characters"
              : regexEmail.test(value) === false
                ? "Enter valid email"
                : "";
          }
        case "programId":
          return value?.length === 0 || value === null
            ? " Program is Required"
            : "";
        case "accessLevel":
          return value?.length === 0 || value === null
            ? " Access Level is Required"
            : "";
        case "mandi":
          if (formData?.accessLevel === "mandi" && programName !== "organic") {
            return value?.length === 0 || value === null
              ? "Mandi is Required"
              : "";
          } else {
            return (programName !== "organic" &&
              (formData?.accessLevel === "agent" ||
                formData?.accessLevel === "subagent") &&
              checkedMandi?.length === 0) ||
              checkedMandi === null
              ? " Mandi is Required"
              : "";
          }
        case formData?.accessLevel:
          return formData?.accessLevel !== "admin" &&
            (value?.length === 0 || value === null)
            ? ` ${formData?.accessLevel === "subagent"
              ? "Agent"
              : formData?.accessLevel?.charAt(0).toUpperCase() +
              formData?.accessLevel?.slice(1)
            } is Required`
            : "";
        case "firstName":
          return value?.length === 0 || value === null
            ? " First Name is Required "
            : value?.length > 50
              ? "Value should not exceed 50 characters"
              : regexAlphabets.test(value) === false
                ? "Accepts only Alphabets and special characters like comma(,),_,-,(),."
                : "";
        case "lastName":
          return value?.length > 12
            ? "Value should not exceed 12 characters"
            : regexAlphabets.test(value) === false
              ? "Accepts only Alphabets and special characters like comma(,),_,-,(),."
              : "";
        case "brandId":
          return (!programName || programName !== "organic") &&
            formData?.accessLevel !== "mill" &&
            formData?.accessLevel !== "cms" &&
            // formData?.accessLevel !== "weaver" &&
            (!value || value.length === 0 || value === null)
            ? " Brand is Required"
            : "";

        case "mobile":
          return value?.length === 0 || value === null
            ? " Mobile Number is Required"
            : value?.length < 10
              ? "Mobile number should be 10 digits"
              : "";
        case "status":
          return value?.length === 0 || value === null
            ? " Status is Required"
            : "";
        case "countryId":
          return (!programName || programName !== "organic") &&
            formData?.accessLevel !== "mill" &&
            formData?.accessLevel !== "cms" &&
            // formData?.accessLevel !== "weaver" &&
            (!value || value.length === 0 || value === null)
            ? " Country is Required"
            : "";
        case "stateId":
          return (!programName || programName !== "organic") &&
            formData?.accessLevel !== "mill" &&
            formData?.accessLevel !== "cms" &&
            // formData?.accessLevel !== "weaver" &&
            (!value || value.length === 0 || value === null)
            ? " State is Required"
            : "";
        // case "password":
        //   return value?.length === 0 || value === null
        //     ? "Password is Required"
        //     : value?.length > 10
        //       ? "Value should not exceed 10 characters"
        //       : "";
        case "password":
            if (value?.length === 0 || value === null) {
              return "Password is required";
            } else if (value?.length > 10) {
              return "Value should not exceed 10 characters";
            } else if (!strongPasswordRegex.test(value)) {
                return "Password should include special characters, numbers, capital letters and  it should be minimum of 8 characters.";
            } else {
              return "";
            }
        case "confirm_password":
          return value?.length === 0 || value === null
            ? "Re-enter Password is Required"
            : formData.password !== value?.trim()
              ? "Re-enter Password and Password do not match "
              : value?.length > 10
                ? "Value should not exceed 10 characters"
                : "";
        case "district":
          return ((!programName || programName !== "organic") &&
            formData?.accessLevel !== "admin" &&
            formData?.accessLevel !== "mill" &&
            formData?.accessLevel !== "cms" &&
            // formData?.accessLevel !== "weaver" &&
            checkedDistrict?.length === 0) ||
            checkedDistrict === null
            ? "District is Required"
            : "";
        case "block":
          return ((!programName || programName !== "organic") &&
            formData?.accessLevel !== "admin" &&
            formData?.accessLevel !== "mill" &&
            formData?.accessLevel !== "cms" &&
            // formData?.accessLevel !== "weaver" &&
            checkedBlock?.length === 0) ||
            checkedBlock === null
            ? "Block is Required"
            : "";
        case "village":
          return ((!programName || programName !== "organic") &&
            formData?.accessLevel !== "admin" &&
            formData?.accessLevel !== "mill" &&
            formData?.accessLevel !== "cms" &&
            // formData?.accessLevel !== "weaver" &&
            checkedVillage?.length === 0) ||
            checkedVillage === null
            ? " Village is Required"
            : "";
        default:
          return "";
      }
    }
  };

  const handleSubmit = async () => {
    const newGarmentErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newGarmentErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });

    const hasGarmentErrors = Object.values(newGarmentErrors).some(
      (error) => !!error
    );

    if (hasGarmentErrors) {
      setErrors(newGarmentErrors);
    }
    try {
      if (!hasGarmentErrors) {
        setIsSubmitting(true);
        const response = await API.post("qr-app/create-user-app", {
          ...formData,
          accessLevel:
            formData?.accessLevel === "subagent"
              ? "SubAgent"
              : formData?.accessLevel?.charAt(0).toUpperCase() +
              formData?.accessLevel?.slice(1),
          programId: Number(formData?.programId),
          agentId: Number(formData?.subagent),
          brandId: Number(formData?.brandId),
          countryId: Number(formData?.countryId),
          stateId: Number(formData?.stateId),
          mobile: Number(formData?.mobile),
          userRegId: Number(formData?.userRegId),
          mandiId: Number(formData?.mandi),
          millId: Number(formData?.mill),
          // weaverId: Number(formData?.weaver),
          cmsId: Number(formData?.cms),
          garmentId: Number(formData?.garment),
          districtsId: checkedDistrict,
          blocksId: checkedBlock,
          villagesId: checkedVillage,
          allVillage: initiallySelected.includes("All") ? true : false,
          acsMandi: formData?.accessLevel === "mandi" ? [] : checkedMandi,
          platform: null,
          status: formData.status,
        });
        if (response.success) {
          toasterSuccess("Processor created successfully");
          router.back();
        } else {
          toasterError(response.error?.code, 3000, formData.code);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      toasterError("An Error occurred.");
      setIsSubmitting(false);
    }
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <>
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
              <li>QR-App</li>
              <li>
                <Link href="/qr-app/agent-user-management">
                  Agent User Management
                </Link>
              </li>
              <li>Add User</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className="w-100 mt-2">
          <div className="row">
            <div className="col-12 col-sm-6 col-md-6">
              <label className="text-gray-500 text-[12px] font-medium">
                Device ID
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Device Id"
                name="DeviceID"
                value={formData?.DeviceID || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="col-12 col-sm-6 col-md-6">
              <label className="text-gray-500 text-[12px] font-medium">
                Credentials <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Enter Password"
                name="password"
                value={formData.password || ""}
                onChange={(event) => handleChange(event)}
              />
              {errors.password && (
                <div className="text-sm text-red-500 ">{errors.password}</div>
              )}
              <input
                type="password"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Re-Enter Password"
                name="confirm_password"
                value={formData.confirm_password || ""}
                onChange={(event) => handleChange(event)}
              />
              {errors.confirm_password && (
                <div className="text-sm text-red-500 ">
                  {errors.confirm_password}
                </div>
              )}
            </div>

            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Staff Name
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Seal No"
                name="sealno"
                value={formData?.staffName || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Program <span className="text-red-500">*</span>
              </label>
              {/* <select
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                name="programId"
                value={formData?.programId || ""}
                onChange={(event) => handleChange(event)}
              >
                <option value="">Select Program</option>
                {programs?.map((program: any) => (
                  <option
                    key={program?.id}
                    data-name={program?.program_name}
                    value={program?.id}
                  >
                    {program?.program_name}
                  </option>
                ))}
              </select> */}
              <Select
                name="programId"
                value={formData?.programId ? { label: programs?.find((county: any) => county.id == formData?.programId)?.program_name, value: formData?.programId } : null}
                menuShouldScrollIntoView={false}
                isClearable
                placeholder="Select Program"
                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                options={(programs || []).map(({ id, program_name }: any) => ({
                  label: program_name,
                  value: id,
                  key: id
                }))}
                onChange={(item: any) => {
                  handleChange("programId", item?.value, item?.label);
                }}
              />
              {errors?.programId && (
                <p className="text-red-500 text-sm mt-1">{errors?.programId}</p>
              )}
            </div>
            {formData?.programId !== null && formData?.programId !== undefined && (
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Access Level <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        className="form-radio"
                        name="accessLevel"
                        value="agent"
                        checked={selectedOption === "agent"}
                        onChange={handleRadioChange}
                      />
                      <span></span>
                    </section>
                    Agent
                  </label>
                  {formData?.programName?.toLowerCase() !== "organic" && (
                    <>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            className="form-radio"
                            name="accessLevel"
                            value="subagent"
                            checked={selectedOption === "subagent"}
                            onChange={handleRadioChange}
                          />
                          <span></span>
                        </section>
                        Sub Agent
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            className="form-radio"
                            name="accessLevel"
                            value="mandi"
                            checked={selectedOption === "mandi"}
                            onChange={handleRadioChange}
                          />
                          <span></span>
                        </section>
                        Mandi
                      </label>
                      {formData?.programName?.toLowerCase() !== "organic" &&
                        formData?.programName?.toLowerCase() === "reel" && (
                          <>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  className="form-radio"
                                  name="accessLevel"
                                  value="admin"
                                  checked={selectedOption === "admin"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>
                              Admin
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  className="form-radio"
                                  name="accessLevel"
                                  value="mill"
                                  checked={selectedOption === "mill"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>
                              Mill
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  className="form-radio"
                                  name="accessLevel"
                                  value="cms"
                                  checked={selectedOption === "cms"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>
                              CMS
                            </label>
                            {/* <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  className="form-radio"
                                  name="accessLevel"
                                  value="weaver"
                                  checked={selectedOption === "weaver"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>
                              Weaver
                            </label> */}
                          </>
                        )}
                    </>
                  )}
                </div>
                {errors.accessLevel && (
                  <div className="text-sm text-red-500 ">
                    {errors.accessLevel}
                  </div>
                )}
              </div>
            )}
            {formData.accessLevel !== "" &&
              formData.accessLevel !== "agent" &&
              formData.accessLevel !== "admin" && (
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    {formData?.accessLevel === "subagent"
                      ? "Agent"
                      : formData?.accessLevel?.charAt(0).toUpperCase() +
                      formData?.accessLevel?.slice(1)}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name={formData.accessLevel}
                    value={
                      formData.accessLevel === "subagent" && formData.subagent !== null && formData.subagent !== undefined
                        ? {
                          label: agents?.find((agent: any) => agent.id == formData.subagent)?.firstName,
                          value: formData.subagent
                        }
                        : (formData.accessLevel === "mill" || formData.accessLevel === "mandi" || formData.accessLevel === "cms")
                          && formData[formData.accessLevel as keyof any] !== null && formData[formData.accessLevel as keyof any] !== undefined
                          ? {
                            label: (formData.accessLevel === "mill" ? mills :
                              formData.accessLevel === "mandi" ? mandis :
                                formData.accessLevel === "cms" ? cmses : []).find((item: any) => item.id == formData[formData.accessLevel as keyof any])?.name,
                            value: formData[formData.accessLevel as keyof any]
                          }
                          : null
                    }
                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder={
                      formData.accessLevel !== null && formData.accessLevel !== ""
                        ? `Select ${formData?.accessLevel === "subagent" ? "Agent" : formData?.accessLevel?.charAt(0).toUpperCase() + formData?.accessLevel?.slice(1)}`
                        : null
                    }
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={formData.accessLevel === "subagent"
                      ? (agents || []).map((item: any) => ({
                        label: item.firstName,
                        value: item.id,
                        key: item.id
                      }))
                      : (formData.accessLevel === "mill" ? mills :
                        formData.accessLevel === "mandi" ? mandis :
                          formData.accessLevel === "cms" ? cmses : []).map((item: any) => ({
                              label: item.name,
                              value: item.id,
                              key: item.id
                            }))}
                    onChange={(item: any) => {
                      handleChange(formData.accessLevel, item?.value);
                    }}
                  />
                  {/* <select
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    name={formData.accessLevel}
                    value={formData[formData.accessLevel as keyof any] || ""}
                    onChange={(event) => handleChange(event)}
                  >
                    <option value="">
                      Select{" "}
                      {formData?.accessLevel === "subagent"
                        ? "Agent"
                        : formData?.accessLevel?.charAt(0).toUpperCase() +
                        formData?.accessLevel?.slice(1)}
                    </option>
                    {(() => {
                      switch (formData.accessLevel) {
                        case "subagent":
                          return agents.map((agents: any) => (
                            <option
                              key={agents?.id}
                              data-name={agents?.name}
                              value={agents?.id}
                            >
                              {agents?.firstName + " " + agents?.lastName}
                            </option>
                          ));
                        case "spinner":
                          return spinners.map((spinner: any) => (
                            <option
                              key={spinner?.id}
                              data-name={spinner?.name}
                              value={spinner?.id}
                            >
                              {spinner?.name}
                            </option>
                          ));
                        case "ginner":
                          return ginners.map((ginner: any) => (
                            <option
                              key={ginner?.id}
                              data-name={ginner?.name}
                              value={ginner?.id}
                            >
                              {ginner?.name}
                            </option>
                          ));
                        case "knitter":
                          return knitters.map((kniiter: any) => (
                            <option
                              key={kniiter?.id}
                              data-name={kniiter?.name}
                              value={kniiter?.id}
                            >
                              {kniiter?.name}
                            </option>
                          ));
                        case "weaver":
                          return weavers.map((weaver: any) => (
                            <option
                              key={weaver?.id}
                              data-name={weaver?.name}
                              value={weaver?.id}
                            >
                              {weaver?.name}
                            </option>
                          ));
                        default:
                          return null;
                      }
                    })()}
                  </select> */}
                  {errors[formData?.accessLevel] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[formData?.accessLevel]}
                    </p>
                  )}
                </div>
              )}

            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Enter user Id"
                name="username"
                value={formData?.username || ""}
                onBlur={(e) => onBlur(e, "alphaNumeric")}
                onChange={(event) => handleChange(event)}
              />
              {errors?.username && (
                <p className="text-red-500 text-sm mt-1">{errors?.username}</p>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Enter First Name"
                name="firstName"
                value={formData.firstName || ""}
                onBlur={(e) => onBlur(e, "alphabets")}
                onChange={(event) => handleChange(event)}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Last Name
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Enter Last Name"
                name="lastName"
                value={formData.lastName || ""}
                onBlur={(e) => onBlur(e, "alphabets")}
                onChange={(event) => handleChange(event)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Mobile No <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Enter Mobile Number"
                name="mobile"
                maxLength={10}
                value={formData?.mobile || ""}
                onChange={(event) => handleChange(event)}
              />
              {errors?.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors?.mobile}</p>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Email ID
              </label>
              <input
                type="email"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                placeholder="Enter Email ID"
                name="email"
                value={formData?.email || ""}
                onChange={(event) => handleChange(event)}
              />
              {errors?.email && (
                <p className="text-red-500 text-sm mt-1">{errors?.email}</p>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                <label className="mt-1 d-flex mr-4 align-items-center">
                  <section>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === true}
                      onChange={(event) => handleChange(event)}
                      className="form-radio"
                    />
                    <span></span>
                  </section>
                  Active
                </label>
                <label className="mt-1 d-flex mr-4 align-items-center">
                  <section>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === false}
                      onChange={(event) => handleChange(event)}
                      className="form-radio"
                    />
                    <span></span>
                  </section>
                  InActive
                </label>
              </div>
              {errors.status && (
                <div className="text-sm text-red-500 ">{errors.status}</div>
              )}
            </div>
            {formData?.programName?.toLowerCase() !== "organic" &&
              // formData.accessLevel !== "weaver" &&
              formData.accessLevel !== "cms" &&
              formData.accessLevel !== "mill" && (
                <>
                  <div className="col-md-6 col-sm-12 mt-4 ">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    {/* <select
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="brandId"
                      value={formData?.brandId || ""}
                      onChange={(event) => handleChange(event)}
                      disabled={formData?.subagent !== null}
                    >
                      <option value="">Select Brand</option>
                      {brands?.map((brand: any) => (
                        <option key={brand?.id} value={brand?.id}>
                          {brand?.brand_name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      name="brandId"
                      value={formData?.brandId ? { label: brands?.find((brand: any) => brand.id == formData?.brandId)?.brand_name, value: formData?.brandId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      isDisabled={formData?.subagent !== null}
                      placeholder="Select Brand"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(brands || []).map(({ id, brand_name }: any) => ({
                        label: brand_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("brandId", item?.value);
                      }}
                    />
                    {errors?.brandId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors?.brandId}
                      </p>
                    )}
                  </div>
                  <div className="col-md-6 col-sm-12 mt-4 ">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Country <span className="text-red-500">*</span>
                    </label>
                    {/* <select
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="countryId"
                      value={formData?.countryId || ""}
                      onChange={(event) => handleChange(event)}
                      disabled={formData?.subagent !== null}
                    >
                      <option value="">Select Country</option>
                      {countries?.map((county: any) => (
                        <option key={county?.id} value={county?.id}>
                          {county?.county_name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      name="countryId"
                      value={formData.countryId ? { label: countries?.find((county: any) => county.id == formData.countryId)?.county_name, value: formData.countryId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      isDisabled={formData?.subagent !== null}
                      placeholder="Select a Country"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(countries || []).map(({ id, county_name }: any) => ({
                        label: county_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("countryId", item?.value);
                      }}
                    />
                    {errors?.countryId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors?.countryId}
                      </p>
                    )}
                  </div>
                  <div className="col-md-6 col-sm-12 mt-4 ">
                    <label className="text-gray-500 text-[12px] font-medium">
                      State <span className="text-red-500">*</span>
                    </label>
                    {/* <select
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="stateId"
                      value={formData?.stateId || ""}
                      onChange={(event) => handleChange(event)}
                      disabled={formData?.subagent !== null}
                    >
                      <option value="">Select State</option>
                      {states?.map((state: any) => (
                        <option key={state?.id} value={state?.id}>
                          {state?.state_name}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      name="stateId"
                      value={formData.stateId ? { label: states?.find((state: any) => state.id == formData.stateId)?.state_name, value: formData.stateId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      isDisabled={formData?.subagent !== null}
                      placeholder="Select State"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(states || []).map(({ id, state_name }: any) => ({
                        label: state_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("stateId", item?.value);
                      }}
                    />
                    {errors?.stateId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors?.stateId}
                      </p>
                    )}
                  </div>
                  {formData.accessLevel !== "admin" && (
                    <>
                      <div className="col-md-6 col-sm-12 mt-4 ">
                        <label className="text-gray-500 text-[12px] font-medium">
                          District <span className="text-red-500">*</span>
                        </label>
                        <MultiSelectDropdown
                          name="district"
                          initiallySelected={districts
                            ?.filter((item: any) =>
                              checkedDistrict?.includes(item.id)
                            )
                            .map((district: any) => district.district_name)}
                          options={districts?.map((item: any) => {
                            return item.district_name;
                          })}
                          disabled={formData?.subagent !== null}
                          onChange={handleSelectionChange}
                        />
                        {errors?.district && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors?.district}
                          </p>
                        )}
                      </div>
                      <div className="col-md-6 col-sm-12 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Block <span className="text-red-500">*</span>
                        </label>
                        <MultiSelectDropdown
                          name="block"
                          initiallySelected={blocks
                            ?.filter((item: any) =>
                              checkedBlock.includes(item.id)
                            )
                            .map((block: any) => block.block_name)}
                          options={blocks?.map((item: any) => {
                            return item.block_name;
                          })}
                          onChange={handleSelectionChange}
                          disabled={formData?.subagent !== null}
                        />

                        {errors?.block && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors?.block}
                          </p>
                        )}
                      </div>
                      <div className="col-md-6 col-sm-12 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Village <span className="text-red-500">*</span>
                        </label>
                        <MultiSelectDropdown
                          name="villages"
                          initiallySelected={initiallySelected}
                          options={[
                            villages.length > 0 ? "All" : null,
                            ...villages?.map((item: any) => {
                              return item.village_name;
                            }),
                          ]}
                          onChange={handleSelectionChange}
                        />
                        {errors?.village !== "" && (
                          <div className="text-sm px-2 py-1 text-red-500">
                            {errors.village}
                          </div>
                        )}
                      </div>
                      {formData.accessLevel !== "mandi" &&
                        formData.accessLevel !== "" && (
                          <div className="col-md-6 col-sm-12 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                            Mandi <span className="text-red-500">*</span>
                            </label>
                            <MultiSelectDropdown
                              name="mandi"
                              initiallySelected={mandis
                                ?.filter((item: any) =>
                                  checkedMandi?.includes(item?.id)
                                )
                                .map((mandi: any) => mandi?.name)}
                              options={mandis?.map((item: any) => {
                                return item.name;
                              })}
                              onChange={handleSelectionChange}
                            />
                            {errors?.mandi && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors?.mandi}
                              </p>
                            )}
                          </div>
                        )}
                    </>
                  )}
                </>
              )}
          </div>
          <hr className="mb-3 mt-3" />

          <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup ">
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
              {translations.common.submit}
            </button>
            <button
              className="btn-outline-purple"
              onClick={() => router.push("/qr-app/agent-user-management")}
            >
              {translations.common.cancel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
