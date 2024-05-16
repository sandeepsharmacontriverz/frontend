"use client";
import React, { useEffect, useState } from "react";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import Form from "react-bootstrap/Form";
import SelectWrapper from "@components/core/SelectWrapper";

import "react-datepicker/dist/react-datepicker.css";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";

export default function editTransaction() {
  const [roleLoading] = useRole();
  const router = useRouter();
  useTitle("Edit Transactions");

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

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
  const [brandName, setBrandName] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<any>();
  const [hasAccess, setHasAccess] = useState<any>({});

  const brandId = User.brandId;

  const [formData, setFormData] = useState<any>({
    date: "",
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
    if (id) {
      getTransactionData();
    }
  }, [id]);


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
    if (formData.countryId) {
      getStates();
    } else {
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
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.stateId) {
      getDistrict();
    } else {
      setBlocks([]);
      setVillages([]);
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
        villageId: "",
      }));
    }
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.districtId) {
      getBlocks();
    } else {
      setBlocks([]);
      setVillages([]);
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        villageId: "",
      }));
    }
  }, [formData.districtId]);

  useEffect(() => {
    if (formData.blockId) {
      getVillages();
    } else {
      setVillages([]);
      setFormData((prevData: any) => ({
        ...prevData,
        villageId: "",
      }));
    }
  }, [formData.blockId]);

  useEffect(() => {
    if (formData.villageId !== "") {
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
        season: "",
        farmerCode: "",
        farmerName: "",
        program: "",
        farmId: undefined,
        totalCottonArea: "",
        estimatedCottonArea: "",
        availableCotton: "",
        programName: "",
        ginner: "",
      }));
      setBrandName("");
    }
  }, [formData.villageId, searchQuery]);

  useEffect(() => {
    if (formData.farmerId) {
      getSeason();
    } else {
      setSeason([]);
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
        programName: "",
        ginner: "",
      }));
      setBrandName("");
    }
  }, [formData.farmerId]);

  useEffect(() => {
    if (formData.farmId) {
      farmersData();
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        farmerCode: "",
        farmerName: "",
        program: "",
        totalCottonArea: "",
        estimatedCottonArea: "",
        availableCotton: "",
        programName: "",
        ginner: "",
        brandId: "",
      }));
      setBrandName("");
    }
  }, [formData.farmId, season]);

  const getTransactionData = async () => {
    const url = `procurement/get-transaction/${id}`;
    try {
      const response = await API.get(url);
      const data = response.data;
      setFormData((prevData: any) => ({
        ...prevData,
        date: new Date(data?.date),
        season: data?.season_id,
        farmerId: data?.farmer_id,
        brandId: data?.brand_id,
        farmerName: data?.farmer_name,
        countryId: data?.country_id,
        stateId: data?.state_id,
        districtId: data?.district_id,
        blockId: data?.block_id,
        villageId: data?.village_id,
        farmId: data?.farm_id,
        farmerCode: data?.farmer_code,
        grade: data?.grade_id,
        program: data?.program_id,
        totalAmount: data?.total_amount,
        qtyPurchased: data?.qty_purchased,
        ginner: data?.mapped_ginner,
        vehicle: data?.vehicle,
        paymentMethod: data?.payment_method,
        proof: data?.proof,
        rate: data?.rate,
      }));
      setSelectedDate(new Date(data?.date));
      setSelectedValue({
        label: data?.farmer_name + "-" + data?.farmer_code,
        value: data?.farmer_id,
      })
    } catch (error) {
      console.log(error, "error");
    }
  };

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

  const [options, setOptions] = useState([]);
  const [pageNo, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setNextPageLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>({});

  const loadOptions = async (page: any) => {
    try {
      setNextPageLoading(true);
      let data: any = [];
      let count = 0;
      if (formData.villageId !== "") {
        const res = await API.get(
          `farmer/farmer-precurement?villageId=${formData.villageId
          }&page=${page}&search=${searchQuery}&brandId=${brandId ? brandId : ""
          }&limit=200&pagination=true`
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
      console.log(err); // eslint-disable
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
      if (formData.farmerId !== "") {
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
      const res = await API.get(
        `mandi?programId=${formData.program}&brandId=${brandId ?? formData.brandId}`
      );
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
    const data = season?.find((i: any) => i.id == formData.farmId);

    setFarmerData(data);
    setFormData((prevData: any) => ({
      ...prevData,
      farmerCode: data ? data?.farmer.code : "",
      farmerName: data ? data?.farmer?.firstName + data?.farmer?.lastName : "",
      program: data ? data?.program.id : "",
      season: data ? data?.season?.id : "",
      qtyPurchased: formData.qtyPurchased ? formData.qtyPurchased : "",
      rate: formData.rate ? formData.rate : "",
      totalAmount: formData.totalAmount ? formData.totalAmount : "",
      totalCottonArea: data ? data?.farmer?.cotton_total_area : "",
      estimatedCottonArea: data ? data?.farmer?.total_estimated_cotton : "",
      availableCotton: data
        ? Number(data?.total_estimated_cotton) - Number(data?.cotton_transacted)
        : "",
      programName: data ? data?.program.program_name : "",
    }));
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

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSelectedOption(value);
    setFormData((prevData: any) => ({
      ...prevData,
      paymentMethod: value,
    }));
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;
    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        stateId: "",
        districtId: "",
        blockId: "",
        villageId: "",
      }))
    }
    if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
        villageId: "",
      }))
    }
    if (name === "districtId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        villageId: "",
      }))
    }
    if (name === "blockId") {
      setFormData((prevData: any) => ({
        ...prevData,
        villageId: "",
      }))
    }
    if (name === "villageId") {
      setFormData((prevData: any) => ({
        ...prevData,
        farmerId: "",
      }))
      setSelectedValue([]);
    }
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const requiredFields = [
    "countryId",
    "stateId",
    "districtId",
    "blockId",
    "villageId",
    "farmerId",
    "farmId",
    "grade",
    "program",
    "ginner",
    "qtyPurchased",
    "rate",
  ];

  const validateField = (name: string, value: any) => {
    const availData =
      farmerData &&
      Number(farmerData?.total_estimated_cotton) -
      Number(farmerData?.cotton_transacted);

    if (requiredFields.includes(name)) {
      switch (name) {
        case "countryId":
          return value === "" ? "Country is required" : "";
        case "stateId":
          return value === "" ? "State is required" : "";
        case "districtId":
          return value === "" ? "District is required" : "";
        case "blockId":
          return value === "" ? "Taluk/Block is required" : "";
        case "villageId":
          return value === "" ? "Village is required" : "";
        case "farmerId":
          return value == "" || null || undefined
            ? "Farmer Name is required"
            : "";
        case "farmId":
          return value == null || value == undefined || value == ""
            ? "Season Name is required"
            : "";
        case "grade":
          return value === "" ? "Crop Grade is required" : "";
        case "qtyPurchased":
          return value === ""
            ? "Qty. Purchased is required"
            : Number(value) > availData
              ? "Quantity should be less than or equal to Available Cotton and Should be more than 0"
              : Number(value) > 10000 ? "Quantity should be less than 10,000" : "";
        case "rate":
          return value === ""
            ? "Rate is required"
            : errors.rate !== ""
              ? errors.rate
              : "";
        case "ginner":
          return value === "" ? "Ginner is required" : "";
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
        const response = await API.put("procurement/update-transaction", {
          id: Number(id),
          date: formData.date,
          season: Number(formData.season),
          farmerId: Number(formData.farmerId),
          farmId: Number(formData.farmId),
          brandId: Number(formData.brandId),
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
          ginner: Number(formData.ginner),
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
        Number(farmerData?.total_estimated_cotton) -
        Number(farmerData?.cotton_transacted);
      if (Number(value) > availData) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Quantity should be less than or equal to Available Cotton and Should be more than 0",
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
                <li>Edit Transactions</li>
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
                      onChange={() => {

                      }}
                      showYearDropdown
                      disabled
                      maxDate={new Date()}
                      placeholderText={translations.common.from + "*"}
                      className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Select Country *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="countryId"
                      onChange={handleChange}
                      value={formData.countryId}
                    >
                      <option value="">Select a Country</option>
                      {countries?.map((countries: any) => (
                        <option key={countries.id} value={countries.id}>
                          {countries.county_name}
                        </option>
                      ))}
                    </Form.Select>
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
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="stateId"
                      onChange={handleChange}
                      value={formData.stateId}
                    >
                      <option value="">Select a State</option>
                      {states?.map((states: any) => (
                        <option key={states.id} value={states.id}>
                          {states.state_name}
                        </option>
                      ))}
                    </Form.Select>
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
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="districtId"
                      onChange={handleChange}
                      value={formData.districtId}
                    >
                      <option value="">Select a District</option>
                      {districts?.map((districts: any) => (
                        <option key={districts.id} value={districts.id}>
                          {districts.district_name}
                        </option>
                      ))}
                    </Form.Select>
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
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="blockId"
                      onChange={handleChange}
                      value={formData.blockId}
                    >
                      <option value="">Select a Block</option>
                      {blocks?.map((blocks: any) => (
                        <option key={blocks.id} value={blocks.id}>
                          {blocks.block_name}
                        </option>
                      ))}
                    </Form.Select>
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
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="villageId"
                      onChange={handleChange}
                      value={formData.villageId}
                    >
                      <option value="">Select a Village</option>
                      {villages?.map((villages: any) => (
                        <option key={villages.id} value={villages.id}>
                          {villages.village_name}
                        </option>
                      ))}
                    </Form.Select>
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
                          season: '',
                          brandId: '',
                          ginner: '',
                          farmId: '',
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
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="farmId"
                      value={formData.farmId || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select a Season</option>
                      {season?.map((season: any) => (
                        <option key={season.id} value={season.id}>
                          {season?.season?.name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.farmId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.farmId}
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
                      Cotton Area
                    </label>

                    <input
                      placeholder="Cotton Area"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="totalCottonArea"
                      value={formData?.totalCottonArea}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Estimated Cotton Area (Kg)
                    </label>

                    <input
                      placeholder="Estimated Cotton Area (Kg)"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="estimatedCottonArea"
                      value={formData?.estimatedCottonArea}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Available Cotton (Kg)
                    </label>

                    <input
                      placeholder="Available Cotton (Kg)"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="availableCotton"
                      value={formData?.availableCotton}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="grade"
                      value={formData.grade || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select a Grade *</option>
                      {grade?.map((grade: any) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.cropGrade}
                        </option>
                      ))}
                    </Form.Select>
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
                      Ginner *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="ginner"
                      value={formData.ginner || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Ginner</option>
                      {ginner?.map((ginner: any) => (
                        <option key={ginner.id} value={ginner.id}>
                          {ginner.name}
                        </option>
                      ))}
                    </Form.Select>
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
                      onChange={handleChange}
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
                            value="cash"
                            checked={formData.paymentMethod === "cash" || selectedOption === "cash"}
                            onChange={handleRadioChange}
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
                            value="cheque"
                            checked={formData.paymentMethod === "cheque" || selectedOption === "cheque"}
                            onChange={handleRadioChange}
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
                            value="bank_credit"
                            checked={formData.paymentMethod === "bank_credit" || selectedOption === "bank_credit"}
                            onChange={handleRadioChange}
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
