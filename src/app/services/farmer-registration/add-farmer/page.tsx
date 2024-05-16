"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import { useSearchParams, useRouter } from "next/navigation";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import DatePicker from "react-datepicker";

import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import Loader from "@components/core/Loader";
import Select from "react-select";

import "react-datepicker/dist/react-datepicker.css";
import "react-tabs/style/react-tabs.css";

export default function page() {
  useTitle("Add Farmer");
  const [roleLoading] = useRole();
  const router = useRouter();
  const [programs, setProgram] = useState<any>();
  const [brands, setBrands] = useState<any>();
  const [farmGroups, setFarmGroups] = useState<any>();
  const [icsNames, setIcsNames] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [villages, setVillages] = useState<any>();
  const [riceVariety, setRiceVariety] = useState<any>();
  const [joiningDate, setJoiningDate] = useState<any>();
  const [selectedProgram, setSelectedProgram] = useState<any>("");
  const [season, setSeason] = useState<any>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedOption, setSelectedOption] = useState<string>("");

  const [formData, setFormData] = useState<any>({
    programId: "",
    brandId: "",
    farmGroupId: "",
    firstName: "",
    lastName: "",
    code: "",
    countryId: "",
    stateId: "",
    seasonId: undefined,
    riceVarietyId:"",
    districtId: "",
    blockId: "",
    villageId: "",
    joiningDate: undefined,
    icsId: undefined,
    tracenetId: "",
    certStatus: undefined,
    agriTotalArea: "",
    agriEstimatedYield: "",
    agriEstimatedProd: "",
    cottonTotalArea: "",
    totalEstimatedCotton: "",
  });

  const [errors, setErrors] = useState({
    programId: "",
    brandId: "",
    farmGroupId: "",
    firstName: "",
    lastName: "",
    code: "",
    countryId: "",
    riceVarietyId:"",
    stateId: "",
    districtId: "",
    blockId: "",
    villageId: "",
    joiningDate: "",
    icsId: "",
    tracenetId: "",
    certStatus: "",
    totalCottonArea: "",
    seasonId: "",
    agriTotalArea: "",
    agriEstimatedYield: "",
    cottonTotalArea: "",
  });

  useEffect(() => {
    getPrograms();
    getCountries();
    getSeasons();
    getRiceVariety()
  }, []);

  useEffect(() => {
    setFormData((prevData: any) => ({
      ...prevData,
      icsId: undefined,
      tracenetId: "",
      certStatus: undefined,
    }));
    setFarmGroups([]);
    setBrands([]);

    if (formData.programId) {
      getBrands();
    }
  }, [formData.programId]);

  useEffect(() => {
    setFarmGroups([]);
    if (formData.brandId) {
      getFarmGroups();
    }
  }, [formData.brandId]);

  useEffect(() => {
    setIcsNames([]);
    if (formData.farmGroupId) {
      getIcsName();
    }
  }, [formData.farmGroupId]);

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (formData.countryId !== undefined && formData.countryId !== null && formData.countryId !== "") {
      getStates();
    }
    else {
      setStates(null)
      setDistricts(null)
      setFormData((prevData: any) => ({
        ...prevData,
        stateId: null,
        districtId: null
      }));

    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.stateId !== undefined && formData.stateId !== null && formData.stateId !== "") {
      getDistricts();
    }
    else {
      setDistricts(null)
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: null
      }));
    }

  }, [formData.stateId]);

  useEffect(() => {
    if (formData.districtId !== undefined && formData.districtId !== null && formData.districtId !== "") {
      getBlocks();
    }
    else {
      setBlocks(null)
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: null,
      }));
    }

  }, [formData.districtId]);
  useEffect(() => {
    if (formData.blockId !== undefined && formData.blockId !== null && formData.blockId !== "") {
      getVillages();
    }
    else {
      setVillages(null)
      setFormData((prevData: any) => ({
        ...prevData,
        villageId: null,
      }));
    }
  }, [formData.blockId]);


  useEffect(() => {
    if (formData.agriTotalArea && formData.agriEstimatedYield) {
      setFormData((prevData: any) => ({
        ...prevData,
        agriEstimatedProd: (
          formData.agriTotalArea * formData.agriEstimatedYield
        )?.toFixed(2),
      }));
    }

    if (formData.cottonTotalArea * formData.agriEstimatedYield) {
      setFormData((prevData: any) => ({
        ...prevData,
        totalEstimatedCotton: (
          formData.cottonTotalArea * formData.agriEstimatedYield
        )?.toFixed(2),
      }));
    }
  }, [
    formData.agriTotalArea,
    formData.cottonTotalArea,
    formData.agriEstimatedYield,
  ]);
  useEffect(() => {
    if (formData.agriTotalArea && formData.agriEstimatedYield) {
      const newAgriEstimatedProd = (
        formData.agriTotalArea * formData.agriEstimatedYield
      )?.toFixed(2);
      if (newAgriEstimatedProd !== formData.agriEstimatedProd) {
        setFormData((prevData: any) => ({
          ...prevData,
          agriEstimatedProd: newAgriEstimatedProd,
        }));
      }
    }

    if (formData.cottonTotalArea && formData.agriEstimatedYield) {
      const newTotalEstimatedCotton = (
        formData.cottonTotalArea * formData.agriEstimatedYield
      )?.toFixed(2);
      if (newTotalEstimatedCotton !== formData.totalEstimatedCotton) {
        setFormData((prevData: any) => ({
          ...prevData,
          totalEstimatedCotton: newTotalEstimatedCotton,
        }));
      }
    }
  }, [
    formData.agriTotalArea,
    formData.cottonTotalArea,
    formData.agriEstimatedYield,
  ]);

  useEffect(() => {
    if (Number(formData.cottonTotalArea) > Number(formData.agriTotalArea)) {
      setErrors((prevError) => ({
        ...prevError,
        cottonTotalArea: "Value should be lesser than total agriculture area",
      }));
    } else {
      setErrors((prevError) => ({
        ...prevError,
        cottonTotalArea: "",
      }));
    }
  }, [formData.cottonTotalArea, formData.agriTotalArea]);

  const getSeasons = async () => {
    const url = "season?status=true";
    try {
      const response = await API.get(url);
      setSeason(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get("program?status=true");
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      if (formData.programId) {
        const res = await API.get(`brand?programId=${formData.programId}`);
        if (res.success) {
          setBrands(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFarmGroups = async () => {
    try {
      if (formData.brandId) {
        const res = await API.get(`farm-group?brandId=${formData.brandId}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getIcsName = async () => {
    try {
      if (formData.farmGroupId) {
        const res = await API.get(`ics?farmGroupId=${formData.farmGroupId}`);
        if (res.success) {
          setIcsNames(res.data);
        }
      }
    } catch (error) {
      console.log(error);
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
      if (formData.countryId !== undefined && formData.countryId !== null && formData.countryId !== "") {
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
  const getDistricts = async () => {
    try {
      if (formData.stateId !== undefined && formData.stateId !== null && formData.stateId !== "") {

        const res = await API.get(
          `location/get-districts?stateId=${formData.stateId}`
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
      if (formData.districtId !== undefined && formData.districtId !== null && formData.districtId !== "") {

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
      if (formData.blockId !== undefined && formData.blockId !== null && formData.blockId !== "") {

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

  const getRiceVariety = async () => {
    try {

        const res = await API.get(
          `rice-variety?status=true`
        );
        if (res.success) {
          setRiceVariety(res.data);
        }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    let isError = false;
    if (!formData.programId || formData.programId == "") {
      setErrors((prev) => ({
        ...prev,
        programId: "Program name is Required",
      }));
      isError = true;
    }
    if (!formData.brandId || formData.brandId == "") {
      setErrors((prev) => ({
        ...prev,
        brandId: "Brand name is Required",
      }));
      isError = true;
    }
    if (!formData.farmGroupId || formData.farmGroupId == "") {
      setErrors((prev) => ({
        ...prev,
        farmGroupId: "Farm Group name is Required",
      }));
      isError = true;
    }
    if (!formData.firstName || formData.firstName == "") {
      setErrors((prev) => ({
        ...prev,
        firstName: "First name is Required",
      }));
      isError = true;
    }
    if (!formData.code || formData.code == "") {
      setErrors((prev) => ({
        ...prev,
        code: "Farmer code is Required",
      }));
      isError = true;
    }
    if (!formData.countryId || formData.countryId == "") {
      setErrors((prev) => ({
        ...prev,
        countryId: "Country name is Required",
      }));
      isError = true;
    }
    if (!formData.stateId || formData.stateId == "") {
      setErrors((prev) => ({
        ...prev,
        stateId: "State name is Required",
      }));
      isError = true;
    }
    if (!formData.districtId || formData.districtId == "") {
      setErrors((prev) => ({
        ...prev,
        districtId: "District name is Required",
      }));
      isError = true;
    }
    if (!formData.blockId || formData.blockId == "") {
      setErrors((prev) => ({
        ...prev,
        blockId: "Block name is Required",
      }));
      isError = true;
    }
    if (!formData.riceVarietyId || formData.riceVarietyId == "") {
      setErrors((prev) => ({
        ...prev,
        riceVarietyId: "Rice Variety is Required",
      }));
      isError = true;
    }
    if (!formData.villageId || formData.villageId == "") {
      setErrors((prev) => ({
        ...prev,
        villageId: "Village name is Required",
      }));
      isError = true;
    }
    if (!formData.seasonId || formData.seasonId == "") {
      setErrors((prev) => ({
        ...prev,
        seasonId: "Season is Required",
      }));
      isError = true;
    }
    if (!formData.joiningDate || formData.joiningDate == "") {
      setErrors((prev) => ({
        ...prev,
        joiningDate: "Date of Joining is Required",
      }));
      isError = true;
    }
    if (
      selectedProgram === "Organic" &&
      (!formData.certStatus || formData.certStatus == "")
    ) {
      setErrors((prev) => ({
        ...prev,
        certStatus: "Selection of atleast one option is Required",
      }));
      isError = true;
    }
    if (!formData.agriTotalArea || formData.agriTotalArea == "") {
      setErrors((prev) => ({
        ...prev,
        agriTotalArea: "Total Agriculture Area is Required",
      }));
      isError = true;
    }
    if (!formData.agriEstimatedYield || formData.agriEstimatedYield == "") {
      setErrors((prev) => ({
        ...prev,
        agriEstimatedYield: "Estimated Yield is Required",
      }));
      isError = true;
    }
    if (!formData.cottonTotalArea || formData.cottonTotalArea == "") {
      setErrors((prev) => ({
        ...prev,
        cottonTotalArea: "Total Paddy Area is Required",
      }));
      isError = true;
    }

    if (!isError) {
      if (formData.tracenetId == "") {
        formData.tracenetId = undefined;
      }
      setIsSubmitting(true);
      try {
        const res = await API.post("farmer", formData);
        if (res.success) {
          toasterSuccess("Farmer created Successfully", 3000, formData.code);
          router.push("/services/farmer-registration");
          setIsSubmitting(false);
        } else {
          toasterError(res.error?.code, 3000, formData.code);
          setIsSubmitting(false);
        }
      } catch (error) {
        setIsSubmitting(false);
        console.log(error);
      }
    }
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "programId") {
      setSelectedProgram("");
      let isOrganic = programs.filter(
        (item: any) => item.program_name === "Organic" && item.id == value
      );
      if (isOrganic?.length > 0) {
        setSelectedProgram("Organic");
      }
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "programId") {
      setFormData((prevData: any) => ({
        ...prevData,
        brandId: "",
        farmGroupId: "",
        icsId: "",
      }));
    }

    if (name === "brandId") {
      setFormData((prevData: any) => ({
        ...prevData,
        farmGroupId: "",
        icsId: "",
      }));
    }

    if (name === "farmGroupId") {
      setFormData((prevData: any) => ({
        ...prevData,
        icsId: "",
      }));
    }

    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        stateId: "",
        blockId: "",
        districtId: "",
        villageId: "",
      }));
    }
    if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        districtId: "",
        villageId: "",
      }));
    }
    if (name === "districtId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        villageId: "",
      }));
    }
    if (name === "blockId") {
      setFormData((prevData: any) => ({
        ...prevData,
        villageId: "",
      }));
    }

    setErrors((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const hanleKeyDownForNumberInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleFrom = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setJoiningDate(date);

    setFormData((prevData: any) => ({
      ...prevData,
      joiningDate: newDate,
    }));

    setErrors((prevData: any) => ({
      ...prevData,
      joiningDate: "",
    }));
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSelectedOption(value);
    setFormData((prevData: any) => ({
      ...prevData,
      certStatus: value,
    }));
    setErrors((prevData: any) => ({
      ...prevData,
      certStatus: "",
    }));
  };

  const onBlur = (e: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    if (name == "firstName") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        if (formData.firstName != "") {
          setErrors((prev) => ({
            ...prev,
            firstName:
              "Accepts only Alphabets and special characters like _,-,()",
          }));
        }
      }
    }
    if (name == "lastName") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        if (formData.lastName != "") {
          setErrors((prev) => ({
            ...prev,
            lastName:
              "Accepts only Alphabets and special characters like _,-,()",
          }));
        }
      }
    }
    if (name == "code") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        if (formData.code != "") {
          setErrors((prev) => ({
            ...prev,
            code: "Accepts only AlphaNumeric values and special characters like _,-,()",
          }));
        }
      }
    }
    if (name == "tracenetId") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        if (formData.tracenetId != "") {
          setErrors((prev) => ({
            ...prev,
            tracenetId:
              "Accepts only AlphaNumeric values and special characters like _,-,()",
          }));
        }
      }
    }
  };

  const onSaveNext = () => {
    let isError = false;

    if (!formData.programId || formData.programId == "" || formData.programId == null || formData.programId == undefined) {
      setErrors((prev) => ({
        ...prev,
        programId: "Program name is Required",
      }));
      isError = true;
    }
    if (!formData.brandId || formData.brandId == "") {
      setErrors((prev) => ({
        ...prev,
        brandId: "Brand name is Required",
      }));
      isError = true;
    }
    if (!formData.farmGroupId || formData.farmGroupId == "") {
      setErrors((prev) => ({
        ...prev,
        farmGroupId: "Farm Group name is Required",
      }));
      isError = true;
    }
    if (!formData.firstName || formData.firstName == "") {
      setErrors((prev) => ({
        ...prev,
        firstName: "First name is Required",
      }));
      isError = true;
    }

    if (!formData.code || formData.code == "") {
      setErrors((prev) => ({
        ...prev,
        code: "Farmer code is Required",
      }));
      isError = true;
    }
    if (!formData.countryId || formData.countryId == "") {
      setErrors((prev) => ({
        ...prev,
        countryId: "Country name is Required",
      }));
      isError = true;
    }
    if (!formData.stateId || formData.stateId == "") {
      setErrors((prev) => ({
        ...prev,
        stateId: "State name is Required",
      }));
      isError = true;
    }
    if (!formData.districtId || formData.districtId == "") {
      setErrors((prev) => ({
        ...prev,
        districtId: "District name is Required",
      }));
      isError = true;
    }
    if (!formData.blockId || formData.blockId == "") {
      setErrors((prev) => ({
        ...prev,
        blockId: "Block name is Required",
      }));
      isError = true;
    }
    if (!formData.riceVarietyId || formData.riceVarietyId == "") {
      setErrors((prev) => ({
        ...prev,
        riceVarietyId: "Rice Variety is Required",
      }));
      isError = true;
    }
    if (!formData.villageId || formData.villageId == "") {
      setErrors((prev) => ({
        ...prev,
        villageId: "Village name is Required",
      }));
      isError = true;
    }

    if (!formData.joiningDate || formData.joiningDate == "") {
      setErrors((prev) => ({
        ...prev,
        joiningDate: "Date of Joining is Required",
      }));
      isError = true;
    }
    if (
      selectedProgram === "Organic" &&
      (!formData.certStatus || formData.certStatus == "")
    ) {
      setErrors((prev) => ({
        ...prev,
        certStatus: "Selection of atleast one option is Required",
      }));
      isError = true;
    }

    if (
      !isError &&
      !errors.code &&
      !errors.firstName &&
      !errors.lastName &&
      !errors.tracenetId
    ) {
      setTabIndex(1);
      setIsSaved(true);
    }
  };

  const { translations, loading } = useTranslations();
  if (roleLoading || loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }
  return (
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
              <li>Services</li>
              <li>
                <Link href="/services/farmer-registration">
                  Farmer Registration
                </Link>
              </li>
              <li>Add Farmer</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <Tabs
          className="cutsomTabDesigns"
          selectedIndex={tabIndex}
          onSelect={(index) => setTabIndex(index)}
        >
          <TabList>
            <Tab>
              <span className={`${isSaved ? "doneAlready" : ""}`}>1</span>Farmer
              Details<div></div>
            </Tab>
            <Tab>
              <span>2</span>Farm Details<div></div>
            </Tab>
          </TabList>

          <TabPanel>
            <div className="w-100">
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Programme *
                      </label>
                      <Select
                        name="programId"
                        value={formData.programId ? { label: programs?.find((program: any) => program.id == formData.programId)?.program_name, value: formData.programId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select a Program"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(programs || []).map(({ id, program_name }: any) => ({
                          label: program_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("programId", item?.value);
                        }}
                      />
                      {errors.programId && (
                        <p className="text-red-500  text-sm  mt-1">{errors.programId}</p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Brand *
                      </label>

                      <Select
                        name="brandId"
                        value={formData.brandId ? { label: brands?.find((brand: any) => brand.id == formData.brandId)?.brand_name, value: formData.brandId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select a Brand"
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
                      {errors.brandId && (
                        <p className="text-red-500  text-sm  mt-1">{errors.brandId}</p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Farm Group *
                      </label>
                      <Select
                        name="farmGroupId"
                        value={formData.farmGroupId ? { label: farmGroups?.find((farmGroup: any) => farmGroup.id == formData.farmGroupId)?.name, value: formData.farmGroupId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select a Form Group"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(farmGroups || []).map(({ id, name }: any) => ({
                          label: name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("farmGroupId", item?.value);
                        }}
                      />
                      {errors.farmGroupId && (
                        <p className="text-red-500 text-sm  mt-1">
                          {errors.farmGroupId}
                        </p>
                      )}
                    </div>
                    {selectedProgram === "Organic" && (
                      <>
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            ICS Name
                          </label>
                          <Select
                            name="icsId"
                            value={formData.icsId ? { label: icsNames?.find((icsName: any) => icsName.id == formData.icsId)?.ics_name, value: formData.icsId } : null}
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder="Select a Ics Name"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={(icsNames || []).map(({ id, ics_name }: any) => ({
                              label: ics_name,
                              value: id,
                              key: id
                            }))}
                            onChange={(item: any) => {
                              handleChange("icsId", item?.value);
                            }}
                          />

                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Tracenet ID *
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            type="text"
                            name="tracenetId"
                            // onBlur={onBlur}
                            value={formData.tracenetId}
                            placeholder="TraceNet Name"
                            onChange={(e) => handleChange("tracenetId", e.target.value)}
                          />
                          {errors.tracenetId && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.tracenetId}
                            </p>
                          )}
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Certification Status *
                          </label>
                          <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="1"
                                  type="radio"
                                  name="certStatus"
                                  value="IC1"
                                  checked={selectedOption === "IC1"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC1
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="2"
                                  type="radio"
                                  name="certStatus"
                                  value="IC2"
                                  checked={selectedOption === "IC2"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC2
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="3"
                                  type="radio"
                                  name="certStatus"
                                  value="IC3"
                                  checked={selectedOption === "IC3"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC3
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="4"
                                  type="radio"
                                  name="certStatus"
                                  value="Organic"
                                  checked={selectedOption === "Organic"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC4
                            </label>
                          </div>
                          {errors.certStatus && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.certStatus}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-100 mt-4">
              <h2 className="text-xl font-semibold">PERSONAL INFORMATION</h2>
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Date of Joining *
                      </label>
                      <DatePicker
                        selected={joiningDate}
                        onChange={handleFrom}
                        maxDate={new Date()}
                        showYearDropdown
                        placeholderText={translations.common.from + "*"}
                        className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.joiningDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.joiningDate}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        First Name *
                      </label>
                      <input
                        placeholder="Farmer First Name"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        // onBlur={onBlur}
                        autoComplete="off"
                        value={formData.firstName}
                        name="firstName"
                        onChange={(e) => handleChange("firstName", e.target.value)}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Last Name 
                      </label>
                      <input
                        placeholder="Farmer Last Name"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        autoComplete="off"
                        // onBlur={onBlur}
                        value={formData.lastName}
                        name="lastName"
                        onChange={(e) => handleChange("lastName", e.target.value)}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Farmers Code *
                      </label>
                      <input
                        placeholder="Enter Farmer Code"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        // onBlur={onBlur}
                        value={formData.code}
                        name="code"
                        onChange={(e) => handleChange("code", e.target.value)}
                      />
                      {errors.code && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.code}
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
                        <p className="text-red-500 ml-4 text-sm mt-1">
                          {errors.villageId}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Rice Variety *
                      </label>
                      <Select
                        name="riceVarietyId"
                        value={formData.riceVarietyId ? { label: riceVariety?.find((variety: any) => variety.id === formData.riceVarietyId)?.variety_name, value: formData.riceVarietyId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select Rice Variety"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={riceVariety.map(({ id, variety_name }: any) => ({
                          label: variety_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("riceVarietyId", item?.value);
                        }}
                      />
                      {errors?.riceVarietyId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors?.riceVarietyId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button className="btn-purple mr-2" onClick={onSaveNext}>
                      SAVE & NEXT
                    </button>
                  </section>
                  <section>
                    <button
                      className="btn-outline-purple"
                      onClick={() =>
                        router.push("/services/farmer-registration")
                      }
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="w-100 mt-4">
              <h2 className="text-xl font-semibold">FARM DETAILS</h2>
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Season *
                      </label>
                      <Select
                        name="seasonId"
                        value={formData.seasonId ? { label: season?.find((seasonId: any) => seasonId.id === formData.seasonId)?.name, value: formData.seasonId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select Season"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(season || []).map(({ id, name }: any) => ({
                          label: name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("seasonId", item?.value);
                        }}
                      />
                      {errors.seasonId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.seasonId}
                        </p>
                      )}
                    </div>
        
                  </div>
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Agriculture Area *
                      </label>
                      <input
                        placeholder="Enter Total Agriculture Area"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="agriTotalArea"
                        onKeyDown={hanleKeyDownForNumberInput}
                        value={formData.agriTotalArea}
                        onChange={(e) => handleChange("agriTotalArea", e.target.value)}
                      />
                      {errors.agriTotalArea && (
                        <p className="text-red-500 w-full text-sm mt-1">
                          {errors.agriTotalArea}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Estimated Yield (Kg/Ac) *
                      </label>
                      <input
                        placeholder="Enter Estimated Yield (Kg/Ac)"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="agriEstimatedYield"
                        onKeyDown={hanleKeyDownForNumberInput}
                        value={formData.agriEstimatedYield}
                        onChange={(e) => handleChange("agriEstimatedYield", e.target.value)}
                      />
                      {errors.agriEstimatedYield && (
                        <p className="text-red-500 w-full text-sm mt-1">
                          {errors.agriEstimatedYield}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Estimated Production *
                      </label>
                      <input
                        placeholder="Enter Total Estimated Production"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="agriEstimatedProd"
                        disabled
                        value={(
                          formData.agriTotalArea * formData.agriEstimatedYield
                        )?.toFixed(2)}
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Paddy Area *
                      </label>
                      <input
                        placeholder="Enter Total Paddy Area"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="cottonTotalArea"
                        onKeyDown={hanleKeyDownForNumberInput}
                        value={formData.cottonTotalArea}
                        onChange={(e) => handleChange("cottonTotalArea", e.target.value)}
                      />
                      <p className="text-red-500 w-full h-5 text-sm mt-1">
                        {errors.cottonTotalArea && errors.cottonTotalArea}
                      </p>
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Estimated Paddy *
                      </label>
                      <input
                        placeholder="Enter Total Estimated Paddy"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        disabled
                        name="totalEstimatedCotton"
                        // onChange={handleChange}
                        value={(
                          formData.cottonTotalArea * formData.agriEstimatedYield
                        )?.toFixed(2)}
                      />
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
                    <button
                      className="btn-outline-purple"
                      onClick={() => setTabIndex(0)}
                    >
                      BACK
                    </button>
                  </section>
                  <section>
                    <button
                      className="btn-outline-purple"
                      onClick={() =>
                        router.push("/services/farmer-registration")
                      }
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
// }
