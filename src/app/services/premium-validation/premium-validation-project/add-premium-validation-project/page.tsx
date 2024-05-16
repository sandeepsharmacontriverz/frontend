"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import NavLink from "@components/core/nav-link";
import { useRouter } from "next/navigation";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import Select, { GroupBase } from "react-select";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("Add Validation Ginner/Project");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const [fieldCount, setFieldCount] = useState(1);
  const [validationData, setValidationData] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [premiumData, setPremiumData] = useState({
    premiumTransfered: [""],
    premiumTransferCost: [""],
    premiumTransferedName: [""],
  });
  const [formData, setFormData] = useState<any>({
    date: new Date(),
    seasonId: "",
    brand: "",
    farmgroup: "",
    farmer: "",
    totalcotton: "",
    lintcotton: "",
    premiumRecieved: "",
    avgPurchasePrice: "",
    avgMarketPrice: "",
    priceVariance: "",
    calculatedAvgVariance: "",
    premiumTransferClaim: "",
    claimVariance: "",
    averagePurchasePrice: "",
    averageMarketPrice: "",
  });

  const [errors, setErrors] = useState<any>({
    seasonId: "",
    brand: "",
    farmgroup: "",
    farmer: "",
    totalcotton: "",
    lintcotton: "",
    premiumRecieved: "",
    premiumTransfered: [],
    avgPurchasePrice: "",
    avgMarketPrice: "",
    calculatedAvgVariance: "",
    premiumTransferCost: [],
    premiumTransferedName: [],
    premiumTransferClaim: "",
  });
  const [startDate, setStartDate] = useState(new Date());
  const [seasons, setSeasons] = useState<any>([]);
  const [brands, setBrands] = useState<any>([]);
  const [farmgroup, setFarmGroup] = useState<any>([]);

  const handleStartDate = (date: any) => {
    const formattedDate = date?.toLocaleDateString("en-CA");
    setStartDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: formattedDate,
    }));
  };

  const handleCancel = () => {
    router.push("/services/premium-validation?activeTab=Ginner");
  };
  useEffect(() => {
    getSeason();
  }, []);

  useEffect(() => {
    getBrand();
  }, []);

  useEffect(() => {
    if (formData.brand !== "" && formData.brand !== undefined) {
      getFarmerGroup();
    } else {
      setFarmGroup([]);
      setFormData({ ...formData, farmgroup: "" });
    }
  }, [formData.brand]);

  useEffect(() => {
    if (
      formData.brand !== "" &&
      formData.seasonId !== "" &&
      formData.farmgroup !== ""
    ) {
      getValidationData();
    } else {
      setValidationData({});
      // setFormData({ ...formData, farmgroup: "" });
    }
  }, [formData.brand && formData.seasonId && formData.farmgroup]);

  useEffect(() => {
    const calculatePriceVariance = () => {
      const avgPurchasePrice = parseFloat(formData.avgPurchasePrice);
      const avgMarketPrice = parseFloat(formData.avgMarketPrice);

      if (
        !isNaN(avgPurchasePrice) &&
        !isNaN(avgMarketPrice) &&
        avgMarketPrice !== 0
      ) {
        const priceDifference = avgPurchasePrice - avgMarketPrice;
        const priceVariance: any = (priceDifference / avgMarketPrice) * 100;

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          priceVariance: Math.floor(priceVariance.toFixed(2)).toString(),
        }));
      }
    };

    calculatePriceVariance();
  }, [formData.avgPurchasePrice, formData.avgMarketPrice]);

  useEffect(() => {
    const calculateClaimVariance = () => {
      const premiumTransferClaim = parseFloat(formData.premiumTransferClaim);
      const calculatedAvgVariance = parseInt(formData.calculatedAvgVariance);

      if (
        !isNaN(premiumTransferClaim) &&
        !isNaN(calculatedAvgVariance) &&
        calculatedAvgVariance !== 0
      ) {
        const claimVariance: any =
          (premiumTransferClaim / calculatedAvgVariance) * 100;

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          claimVariance: Math.floor(claimVariance.toFixed(2)).toString(),
        }));
      }
    };

    calculateClaimVariance();
  }, [formData.premiumTransferClaim, formData.calculatedAvgVariance]);

  const getSeason = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getValidationData = async () => {
    try {
      if (
        formData.brand !== "" &&
        formData.seasonId !== "" &&
        formData.farmgroup !== ""
      ) {
        const res = await API.get(
          `premium-validation/project/get-procured-data?brandId=${formData.brand}&seasonId=${formData.seasonId}&farmGroupId=${formData.farmgroup}`
        );
        if (res.success) {
          setValidationData(res.data);
        }
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
  const getFarmerGroup = async () => {
    try {
      if (formData.brand !== "") {
        const res = await API.get(`farm-group?brandId=${formData.brand}`);
        if (res.success) {
          setFarmGroup(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "avgMarketPrice" && !formData.avgPurchasePrice) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        avgPurchasePrice: " Enter First Average Purchase Price ",
      }));
    } else if (
      name === "premiumTransferClaim" &&
      !formData.calculatedAvgVariance
    ) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        calculatedAvgVariance: " Enter First Average Variance",
      }));
    }
    if (name === "file") {
      const file = event.target.files[0];
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: file,
      }));
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };
  // const handlePremiumTransferChange = (e: any, index: any) => {
  const handlePremiumTransferChange = (name?: any, index?: any, value?: any) => {

    // const { name, value } = e.target;
    const updatedPremiumTransfered: any = [...premiumData.premiumTransfered];
    const updatedPremiumTransferedName: any = [
      ...premiumData.premiumTransferedName,
    ];
    const updatedPremiumTransferCost: any = [
      ...premiumData.premiumTransferCost,
    ];
    const updateErrors = { ...errors };

    if (name === "premiumTransfered") {
      updatedPremiumTransfered[index] = value?.label;
      updateErrors[`premiumTransfered${index}`] = "";

      if (value !== "Others") {
        updatedPremiumTransferedName[index] = "";
        updateErrors[`premiumTransfered`] = "";
      }
    } else if (name === "premiumTransferCost") {
      updatedPremiumTransferCost[index] = value;
      updateErrors[`premiumTransferCost${index}`] = "";
    } else if (name === "premiumTransferedName") {
      if (updatedPremiumTransfered[index] !== "Others") {
        updatedPremiumTransferedName[index] = "";
        updateErrors[`premiumTransfered`] = "";
      } else {
        updatedPremiumTransferedName[index] = value;

        updateErrors[`premiumTransfered`] = "";
      }
    }

    // Update the state with the errors object
    setErrors(updateErrors);

    // Update the formData
    setPremiumData((prevFormData) => ({
      ...prevFormData,
      premiumTransfered: updatedPremiumTransfered,
      premiumTransferedName: updatedPremiumTransferedName,
      premiumTransferCost: updatedPremiumTransferCost,
    }));
  };

  const handleAddMore = (prevCount: any) => {
    premiumData.premiumTransfered.push(""),
      premiumData.premiumTransferCost.push(""),
      premiumData.premiumTransferedName.push(""),
      setFieldCount((prevCount) => prevCount + 1);
  };
  const handleSubmit = async () => {
    let formIsValid = true;
    try {
      setErrors({
        date: "",
        seasonId: "",
        brand: "",
        farmgroup: "",
        farmer: "",
        totalcotton: "",
        lintcotton: "",
        premiumRecieved: "",
        premiumTransfered: [],
        avgPurchasePrice: "",
        avgMarketPrice: "",
        calculatedAvgVariance: "",
        premiumTransferClaim: "",
        premiumTransferedName: [],
        premiumTransferCost: [],
      });

      if (!startDate) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          date: "Date is Required",
        }));
        formIsValid = false;
      }
      if (!formData.seasonId) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          seasonId: "Season is Required",
        }));
        formIsValid = false;
      }
      if (!formData.brand) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          brand: "Brand is Required",
        }));
        formIsValid = false;
      }
      if (!formData.farmgroup) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          farmgroup: "Farm Group is Required",
        }));
        formIsValid = false;
      }
      if (!formData.premiumRecieved) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          premiumRecieved: "Premium Recieved is Required",
        }));
        formIsValid = false;
      }
      if (!formData.avgPurchasePrice) {
        if (!formData.avgMarketPrice) {
          setErrors((prevErrors: any) => ({
            ...prevErrors,
            avgPurchasePrice: "Average Purchase is Required",
          }));
        } else {
          setErrors((prevErrors: any) => ({
            ...prevErrors,
            avgPurchasePrice: " Enter First Average Purchase Price ",
          }));
        }
        formIsValid = false;
      }
      if (!formData.avgMarketPrice) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          avgMarketPrice: "Average Market Price is Required",
        }));
        formIsValid = false;
      }
      if (!formData.calculatedAvgVariance) {
        if (!formData.premiumTransferClaim) {
          setErrors((prevErrors: any) => ({
            ...prevErrors,
            calculatedAvgVariance: "Calculated Average Variance is Required",
          }));
        } else {
          setErrors((prevErrors: any) => ({
            ...prevErrors,
            calculatedAvgVariance: " Enter First Average Variance",
          }));
        }
        formIsValid = false;
      }
      if (!formData.premiumTransferClaim) {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          premiumTransferClaim: "Premium Transfer Claim is Required",
        }));
        formIsValid = false;
      }

      premiumData.premiumTransfered.forEach((item, index) => {
        if (!item || item === "") {
          setErrors((prevErrors: any) => ({
            ...prevErrors,
            [`premiumTransfered${index}`]: "Premium Transfered is Required",
          }));
          formIsValid = false;
        }
      });

      premiumData.premiumTransferedName.forEach((item, index) => {
        if (premiumData.premiumTransfered[index] === "Others") {
          if (!item || item === "") {
            setErrors((prevErrors: any) => ({
              ...prevErrors,
              [`premiumTransferedName${index}`]:
                "Premium Transfered Name is Required",
            }));
            formIsValid = false;
          }
        }
      });

      premiumData.premiumTransferCost.forEach((item, index) => {
        if (!item || item === "") {
          setErrors((prevErrors: any) => ({
            ...prevErrors,
            [`premiumTransferCost${index}`]:
              "Premium Transfered Cost is Required",
          }));
          formIsValid = false;
        }
      });

      if (formIsValid) {
        setIsSubmitting(true);
        const url = "premium-validation/project";
        const mainFormData = {
          date: formData.date,
          seasonId: Number(formData.seasonId),
          brandId: Number(formData.brand),
          farmGroupId: Number(formData.farmgroup),
          premiumRecieved: Number(formData.premiumRecieved),
          premiumTransfered: premiumData.premiumTransfered,
          premiumTransferedName: premiumData.premiumTransferedName,
          premiumTransferedCost: premiumData.premiumTransferCost,
          avgPurchasePrice: Number(formData.avgPurchasePrice),
          avgMarketPrice: Number(formData.avgMarketPrice),
          priceVariance: Number(formData.priceVariance),
          calculatedAvgVariance: Number(formData.calculatedAvgVariance),
          premiumTransferClaim: Number(formData.premiumTransferClaim),
          claimVariance: Number(formData.claimVariance),
          noOfFarmers: validationData?.noOfFarmers?.total_farmers,
          cottonPurchased: validationData?.lintSold?.total_qty_lint_sold,
          qtyOfLintSold: validationData?.procuredQty?.procurement_seed_cotton,
        };

        const mainResponse = await API.post(url, mainFormData);
        if (mainResponse.success) {
          toasterSuccess("Ginner/Project added successfully");
          router.push("/services/premium-validation?activeTab=Ginner");
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
    }
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Services</li>
                <li>
                  <NavLink href="/services/premium-validation?activeTab=Ginner">
                    Premium Validation - Project/Ginner
                  </NavLink >
                </li>
                <li>Add Validation Project/Ginner</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <div className="row">
              <div className="col-12 col-sm-6 col-md-6">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.transactions?.date} *
                </label>
                <DatePicker
                  showIcon
                  selected={startDate}
                  onChange={handleStartDate}
                  showYearDropdown
                  placeholderText="Date"
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                />
                {errors?.date !== "" && (
                  <div className="text-sm text-red-500 ">{errors.date}</div>
                )}
              </div>
              <div className="col-12 col-sm-6 ">
                <label className="text-gray-500 text-[12px] font-medium">
                  Season <span className="text-red-500">*</span>
                </label>
                <Select
                  name="seasonId"
                  value={formData.seasonId ? { label: seasons?.find((seasonId: any) => seasonId.id === formData.seasonId)?.name, value: formData.seasonId } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Season"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(seasons || []).map(({ id, name }: any) => ({
                    label: name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("seasonId", item?.value);
                  }}
                />
                {errors?.seasonId !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.seasonId}
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.brand} *
                </label>
                <Select
                  name="brand"
                  value={formData.brand ? { label: brands?.find((brand: any) => brand.id === formData.brand)?.brand_name, value: formData.brand } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Brand"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(brands || []).map(({ id, brand_name }: any) => ({
                    label: brand_name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("brand", item?.value);
                  }}
                />
                {errors?.brand !== "" && (
                  <div className="text-sm text-red-500 ">{errors.brand}</div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.farmGroup} *
                </label>
                <Select
                  name="farmgroup"
                  value={formData.farmgroup ? { label: farmgroup?.find((farmgroup: any) => farmgroup.id === formData.farmgroup)?.name, value: formData.farmgroup } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Farm Group"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(farmgroup || []).map(({ id, name }: any) => ({
                    label: name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("farmgroup", item?.value);
                  }}
                />
                {errors?.farmgroup !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.farmgroup}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 mt-4 ">Validation</h2>
              <div className="row">
                <div className="col-12 col-sm-6 col-md-4 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Total Number of Farmers*
                  </label>
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="text"
                    name="totalcotton"
                    value={validationData?.noOfFarmers?.total_farmers || 0}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Total cotton purchased in MT*
                  </label>
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="text"
                    name="farmer"
                    value={
                      validationData?.procuredQty?.procurement_seed_cotton /
                      1000 || 0
                    }
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Total quantity of lint cotton sold to spinner in MT*
                  </label>
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="text"
                    name="lintcotton"
                    value={
                      validationData?.lintSold?.total_qty_lint_sold / 1000 || 0
                    }
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-sm-6 col-md-4 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Premium received in INR*
                  </label>
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="number"
                    name="premiumRecieved"
                    value={formData.premiumRecieved}
                    onChange={(e) => handleChange("premiumRecieved", e.target.value)}
                    placeholder="Premium received in INR"
                  />
                  {errors.premiumRecieved && (
                    <p className="text-red-500 text-sm  mt-1">
                      {errors.premiumRecieved}
                    </p>
                  )}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Premium transferred to farmers:*
                  </label>
                  {[...Array(fieldCount)].map((_, index) => (
                    <div key={index + 1}>
                      {/* <select
                        className={`${index > 0 ? "mt-3" : "mt-1"
                          } w-100 shadow-none h-11 rounded-md form-control gray-placeholder text-gray-500 text-sm borderCustom`}
                        name="premiumTransfered"
                        value={premiumData.premiumTransfered[index]}
                        onChange={(e) => handlePremiumTransferChange(e, index)}
                      >
                        <option value="">Select Premium Transferred</option>
                        <option value="Cash">Cash</option>
                        <option value="Inputs">Inputs</option>
                        <option value="Equipments">Equipments</option>
                        <option value="Certification">Certification</option>
                        <option value="Project Management">
                          Project Management
                        </option>
                        <option value="Training">Training</option>
                        <option value="Storage">
                          Storage, handling and transport of raw cotton
                        </option>
                        <option value="others">Others</option>
                      </select> */}
                      <Select
                        name="premiumTransfered"
                        value={premiumData.premiumTransfered[index] ? { label: premiumData.premiumTransfered[index], value: premiumData.premiumTransfered[index] } : null}
                        onChange={(selectedOption) => handlePremiumTransferChange("premiumTransfered", index, selectedOption)}
                        options={[
                          { value: 'Cash', label: 'Cash' },
                          { value: 'Inputs', label: 'Inputs' },
                          { value: 'Equipments', label: 'Equipments' },
                          { value: 'Certification', label: 'Certification' },
                          { value: 'Project Management', label: 'Project Management' },
                          { value: 'Training', label: 'Training' },
                          { value: 'Storage', label: 'Storage, handling and transport of raw cotton' },
                          { value: 'others', label: 'Others' },
                        ]}
                        isClearable
                        placeholder="Select Premium Transferred"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      />
                      {errors[`premiumTransfered${index}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`premiumTransfered${index}`]}
                        </p>
                      )}
                      <div className="row">
                        {premiumData.premiumTransfered[index] === "Others" && (
                          <div className="col-12 col-sm-6 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Other Name*
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              name={`premiumTransferedName`}
                              value={premiumData.premiumTransferedName[index]}
                              onChange={(e) =>
                                handlePremiumTransferChange("premiumTransferedName", index, e.target.value)
                              }
                              placeholder="Enter Other Name"
                            />
                            {errors[`premiumTransferedName${index}`] && (
                              <p className="text-red-500 text-sm mt-1 ">
                                {errors[`premiumTransferedName${index}`]}
                              </p>
                            )}
                          </div>
                        )}
                        {[
                          "Others",
                          "Cash",
                          "Inputs",
                          "Equipments",
                          "Certification",
                          "Project Management",
                          "Training",
                          "Storage, handling and transport of raw cotton",
                        ].includes(premiumData.premiumTransfered[index]) && (
                            <div
                              className={`${premiumData.premiumTransfered[index] === "Others"
                                ? "col-md-6"
                                : "col-md-12"
                                } col-12 col-sm-6 mt-2`}
                            >
                              <label className="text-gray-500 text-[12px] font-medium">
                                Cost*
                              </label>
                              <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                type="number"
                                name={`premiumTransferCost`}
                                value={premiumData.premiumTransferCost[index]}
                                onChange={(e) =>
                                  handlePremiumTransferChange("premiumTransferCost", index, e.target.value)
                                }
                                placeholder="Enter Cost Here"
                              />
                              {errors[`premiumTransferCost${index}`] && (
                                <p className="text-red-500 text-sm mt-1 ">
                                  {errors[`premiumTransferCost${index}`]}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2">
                  <div className="mt-8">
                    <button
                      className="btn btn-all btn-purple"
                      onClick={handleAddMore}
                    >
                      Add More
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <h2 className="text-lg font-semibold mb-2 mt-2 ml-3">
                Price Comparison
              </h2>
              <div className="col-12 col-sm-6 col-md-4 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Average Purchase Price (INR/Per Kg)*
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  name="avgPurchasePrice"
                  value={formData.avgPurchasePrice}
                  onChange={(e) => handleChange("avgPurchasePrice", e.target.value)}
                  placeholder="Average Purchase Price"
                />
                {errors.avgPurchasePrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.avgPurchasePrice}
                  </p>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-4 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Average Market Price (INR/Per Kg)*
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  name="avgMarketPrice"
                  value={formData.avgMarketPrice}
                  onChange={(e) => handleChange("avgMarketPrice", e.target.value)}
                  placeholder="Average Market Price"
                />
                {errors.avgMarketPrice && (
                  <p className="text-red-500 text-sm  mt-1">
                    {errors.avgMarketPrice}
                  </p>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-4 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Price % Variance*
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  name="priceVariance"
                  value={formData.priceVariance}
                  readOnly
                />
              </div>
              <div className="col-12 col-sm-6 col-md-4 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Calculated Average Variance Verified by CottonConnect
                  (INR/Kg)*
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  name="calculatedAvgVariance"
                  value={formData.calculatedAvgVariance}
                  onChange={(e) => handleChange("calculatedAvgVariance", e.target.value)}
                  placeholder="Average Variance Verified"
                />
                {errors.calculatedAvgVariance && (
                  <p className="text-red-500 text-sm  mt-1">
                    {errors.calculatedAvgVariance}
                  </p>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-4 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Claim by ginner of premium Transfer in Cash (INR/Kg)*
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  name="premiumTransferClaim"
                  value={formData.premiumTransferClaim}
                  onChange={(e) => handleChange("premiumTransferClaim", e.target.value)}
                  placeholder="Premium Transfer in Cash"
                />
                {errors.premiumTransferClaim && (
                  <p className="text-red-500 text-sm  mt-1">
                    {errors.premiumTransferClaim}
                  </p>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-4 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Claim % Variance*
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  name="claimVariance"
                  value={formData.claimVariance}
                  readOnly
                />
              </div>
            </div>
            <hr className="mb-3 mt-3" />
            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
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
                {translations?.common?.submit}
              </button>
              <button className="btn-outline-purple" onClick={handleCancel}>
                {translations?.common?.cancel}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
