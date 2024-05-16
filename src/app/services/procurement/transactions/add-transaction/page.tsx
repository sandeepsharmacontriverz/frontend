"use client";
import React, { useEffect, useState } from "react";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import SelectWrapper from "@components/core/SelectWrapper";

import "react-datepicker/dist/react-datepicker.css";
import useRole from "@hooks/useRole";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
import User from "@lib/User";
import Select from "react-select";

export default function addTransaction() {
  const router = useRouter();
  useTitle("Add Transactions");
  const [roleLoading] = useRole();
  const [hasAccess, setHasAccess] = useState<any>({});
  const { translations, loading } = useTranslations();
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [villages, setVillages] = useState<any>();
  const [season, setSeason] = useState<any>();
  const [farmerData, setFarmerData] = useState<any>();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [ginner, setGinner] = useState<any>();
  const [grade, setGrade] = useState<any>();
  const [brandName, setBrandName] = useState<any>("");
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<any>(new Date());

  const brandId = User.brandId;

  const getDate = () => {
    const date = new Date();

    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    const newDate: any = date.toISOString();

    return newDate;
  };

  const [formData, setFormData] = useState<any>({
    date: getDate(),
    season: "",
    farmerId: "",
    brandId: "",
    farmerName: "",
    countryId: "",
    stateId: "",
    districtId: "",
    blockId: "",
    villageId: "",
    farmId: "",
    farmerCode: "",
    grade: "",
    program: "",
    totalAmount: "",
    qtyPurchased: "",
    ginner: "",
    vehicle: "",
    paymentMethod: "",
    proof: "",
    rate: "",
  });
  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Procurement");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    getCountries();
    getGrade();
  }, []);

  useEffect(() => {
    if (formData.brandId) {
      getGinner();
    } else {
      setGinner([]);
    }
  }, [formData.brandId]);

  useEffect(() => {
    if (farmerData) {
      const id = farmerData?.farmer?.brand_id;
      getBrandData(id);
    }
  }, [farmerData]);

  useEffect(() => {
    setStates([]);
    setDistricts([]);
    setBlocks([]);
    setVillages([]);
    setFormData((prevData: any) => ({
      ...prevData,
      stateId: "",
      districtId: "",
      blockId: "",
      villageId: "",
    }));
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

  useEffect(() => {
    setBlocks([]);
    setVillages([]);
    setFormData((prevData: any) => ({
      ...prevData,
      districtId: "",
      blockId: "",
      villageId: "",
    }));
    if (formData.stateId) {
      getDistrict();
    }
  }, [formData.stateId]);

  useEffect(() => {
    setBlocks([]);
    setVillages([]);
    setFormData((prevData: any) => ({
      ...prevData,
      blockId: "",
      villageId: "",
    }));
    if (formData.districtId) {
      getBlocks();
    }
  }, [formData.districtId]);

  useEffect(() => {
    setVillages([]);
    setFormData((prevData: any) => ({
      ...prevData,
      villageId: "",
    }));
    if (formData.blockId) {
      getVillages();
    }
  }, [formData.blockId]);

  useEffect(() => {
    setFormData((prevData: any) => ({
      ...prevData,
      season: "",
      farmerCode: "",
      farmerName: "",
      program: "",
      farmId: undefined,
      totalCottonArea: "",
      estimatedCottonArea: "",
      riceVarietyId:"",
      availableCotton: "",
      programName: "",
      ginner: "",
    }));
    setBrandName("");
    if (formData.villageId !== "" && formData.villageId !== null && formData.villageId !== undefined) {
      loadOptions(1);
    } else {
      setOptions([]);
      setSelectedValue("");
      setNextPageLoading(false);
      setHasNextPage(false);
      setPage(1);
      setFormData((prevData: any) => ({
        ...prevData,
        farmerId: "",
        brandId: "",
      }));
    }
  }, [formData.villageId, searchQuery]);
  useEffect(() => {
    setFormData((prevData: any) => ({
      ...prevData,
      season: "",
      farmerCode: "",
      farmerName: "",
      program: "",
      farmId: undefined,
      totalCottonArea: "",
      estimatedCottonArea: "",
      availableCotton: "",
      riceVarietyId:"",
      programName: "",
      ginner: "",
    }));
    setBrandName("");
    if (formData.farmerId !== "" && formData.farmerId !== undefined && formData.farmerId !== null) {
      getSeason();
    } else {
      setSeason([]);
    }
  }, [formData.farmerId]);

  useEffect(() => {
    setFormData((prevData: any) => ({
      ...prevData,
      farmerCode: "",
      farmerName: "",
      program: "",
      totalCottonArea: "",
      estimatedCottonArea: "",
      riceVarietyId:"",
      availableCotton: "",
      programName: "",
      ginner: "",
      brandId: "",
    }));
    setBrandName("");
    if (formData.season !== undefined && formData.season !== null && formData.season !== "") {
      farmersData();
    }
  }, [formData.season]);

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStates = async () => {
    try {
      if (formData.countryId) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${formData.countryId}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistrict = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.stateId}`
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
      if (formData.districtId !== "") {
        const res = await API.get(
          `location/get-blocks?districtId=${formData.districtId}`
        );
        if (res.success) {
          setBlocks(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVillages = async () => {
    try {
      if (formData.blockId !== "") {
        const res = await API.get(
          `location/get-villages?blockId=${formData.blockId}`
        );
        if (res.success) {
          setVillages(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFrom = (date: any) => {
    date?.setHours(date.getHours() + 5);
    date?.setMinutes(date.getMinutes() + 30);
    const newDate: any = date?.toISOString();
    setSelectedDate(date);
    setFormData((prevData: any) => ({
      ...prevData,
      date: newDate,
    }));

    setErrors((prevData: any) => ({
      ...prevData,
      date: "",
    }));
  };

  const [options, setOptions] = useState([]);
  const [pageNo, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setNextPageLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const loadOptions = async (page: any) => {
    try {
      setNextPageLoading(true);
      let data: any = [];
      let count = 0;
      if (formData.villageId !== "" && formData.villageId !== null && formData.villageId !== undefined) {
        const res = await API.get(
          `farmer/farmer-precurement?villageId=${formData.villageId}&page=${page}&search=${searchQuery}&limit=200&pagination=true`
        );
        if (res.success) {
          data = res.data;
          count = res.count;
        }
      }

      const dataOptions = data?.map(
        ({ id, firstName, lastName, code }: any) => ({
          label: firstName + " " + lastName + "-" + code,
          value: id,
        })
      );

      setOptions(dataOptions);
      setNextPageLoading(false);
      setHasNextPage(dataOptions.length < count);
      setPage(page);
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (inputValue: any) => {
    setSearchQuery(inputValue);
  };

  const loadNextPage = async () => {
    await loadOptions(pageNo + 1);
  };
  const getSeason = async () => {
    try {
      if (formData.farmerId !== "" && formData.farmerId !== undefined && formData.farmerId !== null) {
        const res = await API.get(`farmer/farm?farmerId=${formData.farmerId}`);
        if (res.success) {
          setSeason(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinner = async () => {
    try {
      const res = await API.get(`mandi?programId=${formData.program}&brandId=${formData.brandId}`);
      if (res.success) {
        setGinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGrade = async () => {
    try {
      const res = await API.get(`crop/crop-grade`);
      if (res.success) {
        setGrade(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const farmersData = () => {
    if (formData.season !== undefined && formData.season !== null && formData.season !== "") {
      const data = season?.find((i: any) => i.season?.id == formData.season);
      setFarmerData(data);
      setFormData((prevData: any) => ({
        ...prevData,
        farmerCode: data ? data?.farmer.code : "",
        farmerName: data ? (data?.farmer?.firstName && data?.farmer?.lastName) ? data?.farmer?.firstName + " " + data?.farmer?.lastName : data?.farmer?.firstName?.trim() : "",
        program: data ? data?.program.id : "",
        season: data ? data?.season?.id : "",
        farmId: data ? data?.id : undefined,
        qtyPurchased: "",
        rate: "",
        totalAmount: "",
        totalCottonArea: data ? data?.paddy_total_area : "",
        estimatedCottonArea: data ? data?.total_estimated_paddy : "",
        availableCotton: data
          ? Number(data?.total_estimated_paddy) - Number(data?.paddy_transacted)
          : "",
        programName: data ? data?.program.program_name : "",
        riceVarietyId:data ? data?.farmer?.rice_variety?.id:"",
        riceVarietyName:data ? data?.farmer?.rice_variety?.variety_name:"",
      }));
    }
  };

  const getBrandData = async (id: number) => {
    if (farmerData) {
      const url = `brand?id=${id}`;
      try {
        const response = await API.get(url);
        if (response.success) {
          setFormData((prevData: any) => ({
            ...prevData,
            brandId: id,
          }));
          let brand = response?.data?.find((obj: any) => obj.id == id);
          setBrandName(brand?.brand_name);
        }
      } catch (error) {
        console.log(error, "error");
      }
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        brandId: "",
      }));
      setBrandName("");
    }
  };

  const handleRadioChange = (name?: any, value?: any, event?: any) => {
    setSelectedOption(value);
    setFormData((prevData: any) => ({
      ...prevData,
      paymentMethod: value,
    }));
  };
  const handleChange = (name?: any, value?: any, event?: any) => {

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const requiredFields = [
    "date",
    "countryId",
    "stateId",
    "districtId",
    "blockId",
    "villageId",
    "farmerId",
    "season",
    "grade",
    "program",
    "ginner",
    "qtyPurchased",
    "rate",
  ];

  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      switch (name) {
        case "date":
          return !value ? "Select Date is Required" : "";
        case "countryId":
          return value === "" || value === undefined || value === null ? "Country is Required" : "";
        case "stateId":
          return value === "" || value === undefined || value === null ? "State is Required" : "";
        case "districtId":
          return value === "" || value === undefined || value === null ? "District is Required" : "";
        case "blockId":
          return value === "" || value === undefined || value === null ? "Taluk/Block is Required" : "";
        case "villageId":
          return value === "" || value === undefined || value === null ? "Village is Required" : "";
        case "farmerId":
          return value == "" || null || undefined
            ? "Farmer Name is Required"
            : "";
        case "season":
          return value == null || undefined || ""
            ? "Season Name is Required"
            : "";
        case "grade":
          return value === "" || value === undefined || value === null ? "Crop Grade is Required" : "";
        case "qtyPurchased":
          return value.trim() === ""
            ? "Qty. Purchased is Required"
            : errors.qtyPurchased !== ""
              ? errors.qtyPurchased
              : "";
        case "rate":
          return value.trim() === ""
            ? "Rate is Required"
            : errors.rate !== ""
              ? errors.rate
              : "";
        case "ginner":
          return value === "" || value === undefined || value === null ? "Mandi is Required" : "";
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
        formData[fieldName as keyof any]
      );
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (!hasErrors && !errors.qtyPurchased) {
      try {
        setIsSubmitting(true);
        const response = await API.post("procurement/set-transaction", {
          date: formData.date,
          season: Number(formData.season),
          farmerId: Number(formData.farmerId),
          farmId: Number(formData.farmId),
          brandId: Number(formData.brandId),
          riceVarietyId: Number(formData.riceVarietyId),
          farmerName: formData.farmerName,
          countryId: Number(formData.countryId),
          stateId: Number(formData.stateId),
          districtId: Number(formData.districtId),
          blockId: Number(formData.blockId),
          villageId: Number(formData.villageId),
          farmerCode: formData.farmerCode,
          grade: Number(formData.grade),
          program: Number(formData.program),
          totalAmount: (
            Number(formData.qtyPurchased) * Number(formData.rate)
          ).toFixed(2),
          qtyPurchased: formData.qtyPurchased,
          mandi: Number(formData.ginner),
          vehicle: formData.vehicle,
          paymentMethod: formData.paymentMethod,
          proof: "",
          rate: formData.rate,
        });
        if (response.success) {
          toasterSuccess(
            "Transaction Successfully Created",
            3000,
            formData.farmerCode
          );
          router.push("/services/procurement/transactions");
        } else {
          toasterError(response.error?.code, 3000, formData.farmerCode);
          setIsSubmitting(false);
        }
      } catch (error) {
        console.log(error);
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "vehicle") {
      const regexAlphaNumeric = /^[a-zA-Z0-9 ]*$/;
      if (value != "") {
        const valid = regexAlphaNumeric.test(value);
        if (!valid) {
          setErrors((prev: any) => ({
            ...prev,
            [name]: "Accepts only AlphaNumeric values",
          }));
        } else {
          setErrors({ ...errors, [name]: "" });
        }
      }
      return;
    }

    if (Number(value) <= 0) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "Value Should be more than 0",
      }));
      return;
    } else {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "qtyPurchased") {
      const availData =
        farmerData &&
        Number(farmerData?.total_estimated_paddy) -
        Number(farmerData?.paddy_transacted);
      if (Number(value) > availData) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Quantity should be less than or equal to Available Paddy or Should be more than 0",
        }));
      } else if (Number(value) > 10000) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Quantity should be less than 10,000",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: Number(value).toFixed(2),
        }));
      }
    }
    if (name === "rate") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: Number(value).toFixed(2),
      }));
    }
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  if (!roleLoading) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href={!brandId ? "/dashboard" : "/brand/dashboard"} className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Services</li>
                <li>Procurement</li>
                <li>
                  <Link href="/services/procurement/transactions">Transactions</Link>
                </li>
                <li>Add Transactions</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <h2 className="text-xl font-semibold flex justify-center">PROCUREMENT DETAILS</h2>
            <div className="customFormSet">
              <div className="w-100">
                <div className="mt-4">
                  <h4 className="text-md font-semibold">FARMER INFORMATION:</h4>
                </div>
                <div className="row mb-4">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleFrom}
                      showYearDropdown
                      maxDate={new Date()}
                      placeholderText={translations.common.from + "*"}
                      className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Select Country *
                    </label>

                    <Select
                      name="countryId"
                      value={formData.countryId ? { label: countries?.find((county: any) => county.id == formData.countryId)?.county_name, value: formData.countryId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
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
                    {errors.countryId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.countryId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      State *
                    </label>

                    <Select
                      name="stateId"
                      value={formData.stateId ? { label: states?.find((state: any) => state.id == formData.stateId)?.state_name, value: formData.stateId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
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
                    {errors.stateId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.stateId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      District *
                    </label>

                    <Select
                      name="districtId"
                      value={formData.districtId ? { label: districts?.find((district: any) => district.id == formData.districtId)?.district_name, value: formData.districtId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select District"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(districts || []).map(({ id, district_name }: any) => ({
                        label: district_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("districtId", item?.value);
                      }}
                    />
                    {errors.districtId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.districtId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Taluka/Block *
                    </label>
                    <Select
                      name="blockId"
                      value={formData.blockId ? { label: blocks?.find((taluk: any) => taluk.id == formData.blockId)?.block_name, value: formData.blockId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Block/Taluk "
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(blocks || []).map(({ id, block_name }: any) => ({
                        label: block_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("blockId", item?.value);
                      }}
                    />
                    {errors.blockId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.blockId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Village *
                    </label>
                    <Select
                      name="villageId"
                      value={formData.villageId ? { label: villages?.find((taluk: any) => taluk.id == formData.villageId)?.village_name, value: formData.villageId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Village "
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(villages || []).map(({ id, village_name }: any) => ({
                        label: village_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("villageId", item?.value);
                      }}
                    />
                    {errors.villageId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.villageId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Farmer Name *
                    </label>

                    <SelectWrapper
                      value={selectedValue}
                      placeholder="Select"
                      isClearable
                      name="farmerId"
                      handleMenuClose={(e: any) => loadOptions(e)}
                      hasNextPage={hasNextPage}
                      isNextPageLoading={isNextPageLoading}
                      options={options}
                      setSearchQuery={(selected: any) =>
                        handleInputChange(selected)
                      }
                      loadNextPage={loadNextPage}
                      onChange={(selected: any) => {
                        setSelectedValue(selected);
                        setFormData((prevData: any) => ({
                          ...prevData,
                          farmerId: selected?.value,
                        }));
                      }}
                    />
                    {errors?.farmerId !== "" && (
                      <div className="text-sm px-2 py-1 text-red-500">
                        {errors.farmerId}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season *
                    </label>
                    <Select
                      name="season"
                      value={formData.season ? { label: season?.find((seasonId: any) => seasonId.season?.id == formData.season)?.season?.name, value: formData.season } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Season"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(season || []).map((season: any) => ({
                        label: season?.season?.name,
                        value: season?.season?.id,
                        key: season?.season?.id
                      }))}
                      onChange={(item: any) => {
                        handleChange("season", item?.value);
                      }}
                    />
                    {errors.season && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.season}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Farmer Brand
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={brandName || ""}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Farmer Code
                    </label>
                    <input
                      placeholder="Farmer Code *"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="farmerCode"
                      value={formData?.farmerCode}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Paddy Area
                    </label>

                    <input
                      placeholder="Paddy Area"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="totalCottonArea"
                      value={formData?.totalCottonArea}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Estimated Paddy Area (Kg)
                    </label>

                    <input
                      placeholder="Estimated Paddy Area (Kg)"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="estimatedCottonArea"
                      value={formData?.estimatedCottonArea}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Available Paddy (Kg)
                    </label>

                    <input
                      placeholder="Available Paddy (Kg)"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="availableCotton"
                      value={formData?.availableCotton}
                    />
                  </div>


                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Rice Variety *
                    </label>
                    <input
                      placeholder="Rice Variety"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="riceVarietyName"
                      value={formData?.riceVarietyName}
                    />
                  </div>
                </div>
                <hr />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">
                    TRANSACTION INFORMATION:
                  </h4>
                </div>
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Qty Purchased (Kg) *
                    </label>
                    <input
                      placeholder="Enter Total Agriculture Area"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="qtyPurchased"
                      onBlur={onBlurCheck}
                      value={formData.qtyPurchased}
                      onChange={(e) => handleChange("qtyPurchased", e.target.value)}
                    />
                    {errors?.qtyPurchased !== "" && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.qtyPurchased}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Rate (INR/Kg) *
                    </label>
                    <input
                      placeholder="Enter Rate (INR/Kg) *"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="rate"
                      onBlur={onBlurCheck}
                      value={formData.rate}
                      onChange={(e) => handleChange("rate", e.target.value)}
                    />
                    {errors?.rate !== "" && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.rate}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Grade *
                    </label>
                    <Select
                      name="grade"
                      value={formData.grade ? { label: grade?.find((grade: any) => grade?.id == formData.grade)?.cropGrade, value: formData.grade } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Grade"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(grade || []).map((cropGrade: any, id: any) => ({
                        label: cropGrade.cropGrade,
                        value: cropGrade?.id,
                        key: cropGrade?.id,
                      }))}

                      onChange={(item: any) => {
                        handleChange("grade", item?.value);
                      }}
                    />

                    {errors?.grade !== "" && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.grade}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Program
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={formData?.programName || ""}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Amount *
                    </label>
                    <input
                      placeholder="Total Amount *"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="totalAmount"
                      value={(
                        Number(formData.qtyPurchased) * Number(formData.rate)
                      ).toFixed(2)}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Mandi *
                    </label>
                    <Select
                      name="ginner"
                      value={formData.ginner ? { label: ginner?.find((ginner: any) => ginner?.id == formData.ginner)?.name, value: formData.ginner } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Mandi"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(ginner || []).map((ginner: any, id: any) => ({
                        label: ginner?.name,
                        value: ginner?.id,
                        key: ginner?.id,
                      }))}

                      onChange={(item: any) => {
                        handleChange("ginner", item?.value);
                      }}
                    />
                    {errors?.ginner !== "" && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.ginner}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Transport Vehicle
                    </label>
                    <input
                      placeholder="Enter Transport Vehicle"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="vehicle"
                      onBlur={onBlurCheck}
                      value={formData.vehicle}
                      onChange={(e) => handleChange("vehicle", e.target.value)}
                    />
                    {errors?.vehicle !== "" && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.vehicle}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Payment
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            id="1"
                            type="radio"
                            name="paymentMethod"
                            value="Cash"
                            checked={selectedOption === "Cash"}
                            onChange={(e) => handleRadioChange("paymentMethod", e.target.value)}
                          />
                          <span></span>
                        </section>{" "}
                        Cash
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            id="2"
                            type="radio"
                            name="paymentMethod"
                            value="Cheque"
                            checked={selectedOption === "Cheque"}
                            onChange={(e) => handleRadioChange("paymentMethod", e.target.value)}
                          />
                          <span></span>
                        </section>{" "}
                        Cheque
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            id="3"
                            type="radio"
                            name="paymentMethod"
                            value="Bank Credit"
                            checked={selectedOption === "Bank Credit"}
                            onChange={(e) => handleRadioChange("paymentMethod", e.target.value)}
                          />
                          <span></span>
                        </section>{" "}
                        Bank Credit
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
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
                <section>
                  <button
                    className="btn-outline-purple"
                    onClick={() =>
                      router.push("/services/procurement/transactions")
                    }
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
