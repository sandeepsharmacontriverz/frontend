"use client";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "@lib/router-events";
import "react-datepicker/dist/react-datepicker.css";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import Select, { GroupBase } from "react-select";
import NavLink from "@components/core/nav-link";

export default function page() {
  const [roleLoading] = useRole();
  useTitle(" Add Validation Farmer");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const [seasons, setSeasons] = useState<any>([]);
  const [brands, setBrands] = useState<any>([]);
  const [farmgroup, setFarmGroup] = useState<any>([]);
  const [icsName, setIcsName] = useState<any>([]);
  const [farmers, setFarmers] = useState<any>([]);
  const [farmerTable, setFarmerTable] = useState<any>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [fieldCount, setFieldCount] = useState(1);
  const [programId, setProgramId] = useState<any>(Number);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState({
    farmerImage: "",
    identityImage: "",
    proofdocument: "",
  });

  const [premiumData, setPremiumData] = useState({
    ginnersupoortedDetails: [""],
    modeofsupport: [""],
    ginnerspportOther: [""],
  });

  const [formData, setFormData] = useState<any>({
    date: new Date(),
    seasonId: "",
    brand: "",
    farmer: "",
    farmerImage: "",
    farmGroup: "",
    icsName: "",
    identityValidation: "",
    identityId: "",
    identityImage: "",
    identityOther: "",
    cotton: "",
    rate: "",
    paymentmode: "",
    proofpayment: null,
    proofname: "",
    proofdocument: "",
    ginnersupported: null,
    modeofsupport: "",
    verifierInteferrence: "",
    partially_verified: "",
    uploadDocuments: null,
  });
  const [imageErrors, setImageErrors] = useState<any>({});
  const [errors, setErrors] = useState({
    date: "",
    seasonId: "",
    brand: "",
    icsName: "",
    farmGroup: "",
    farmer: "",
    farmerImage: "",
    identityValidation: "",
    identityId: "",
    identityOther: "",
    identityImage: "",
    cotton: "",
    ginnersupported: "",
    rate: "",
    paymentmode: "",
    proofpayment: "",
    proofname: "",
    proofdocument: "",
    verifierInteferrence: "",
    partially_verified: "",
    modeofsupport: "",
  });

  useEffect(() => {
    getProgram();
    getSeason();
  }, []);

  useEffect(() => {
    if (programId) {
      getBrand();
    }
  }, [programId]);

  useEffect(() => {
    if (formData.brand !== "" && formData.brand !== undefined) {
      getFarmerGroup();
    } else {
      setFarmGroup([]);
      setFormData({ ...formData, farmGroup: "", icsName: "", farmer: "" });
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.farmGroup !== "" && formData.farmGroup !== undefined) {
      getIcsname();
    } else {
      setIcsName([]);
      setFormData({ ...formData, icsName: "", farmer: "" });
    }
  }, [formData.farmGroup]);

  useEffect(() => {
    if (formData.icsName !== "" && formData.icsName !== undefined) {
      getFarmer();
    } else {
      setFarmers([]);
      setFormData({ ...formData, farmer: "" });
    }
  }, [formData.icsName]);
  useEffect(() => {
    if (formData.seasonId !== "" && formData.seasonId !== undefined && formData.farmer !== "" && formData.farmer !== undefined) {
      getFarmerTable();
    } else {
      setFarmerTable([]);
    }
  }, [formData.seasonId, formData.farmer]);

  const getProgram = async () => {
    try {
      const res = await API.get("program?status=true");
      if (res.success) {
        let isOrganic = res.data.find(
          (item: any) => item.program_name.toLowerCase() === "organic"
        );
        setProgramId(isOrganic.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
  const getBrand = async () => {
    try {
      if (programId) {
        const res = await API.get(`brand?programId=${programId}`);
        if (res.success) {
          setBrands(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFarmerGroup = async () => {
    try {
      if (formData.brand !== "" && formData.brand !== undefined) {
        const res = await API.get(`farm-group?brandId=${formData.brand}`);
        if (res.success) {
          setFarmGroup(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getIcsname = async () => {
    try {
      if (formData.farmGroup !== "" && formData.farmGroup !== undefined) {
        const res = await API.get(`ics?farmGroupId=${formData.farmGroup}`);
        if (res.success) {
          setIcsName(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFarmer = async () => {
    try {
      if (formData.icsName !== "" && formData.icsName !== undefined) {
        const res = await API.get(`farmer?icsId=${formData.icsName}`);
        if (res.success) {
          setFarmers(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFarmerTable = async () => {
    try {
      if (formData.seasonId !== "" && formData.seasonId !== undefined && formData.farmer !== "" && formData.farmer !== undefined) {
        const res = await API.get(
          `premium-validation/get-premium-farmer?seasonId=${formData.seasonId}&farmerId=${formData.farmer}`
        );
        if (res.success) {
          setFarmerTable(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dataUpload = async (e: any, name: any) => {
    const url = "file/upload";
    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const dataVideo = new FormData();
    if (!e) {
      return setErrors((prevError: any) => ({
        ...prevError,
        [name]: "No File Selected",
      }));
    } else {
      if (!allowedFormats.includes(e?.type)) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "Invalid file format.Upload a valid Format",
        }));

        e = "";
        return;
      }

      const maxFileSize = 5 * 1024 * 1024;

      if (e.size > maxFileSize) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: `File size exceeds the maximum limit (5MB).`,
        }));

        e = "";
        return;
      }
    }

    dataVideo.append("file", e);

    try {
      const response = await API.postFile(url, dataVideo);
      if (response.success) {
        setFileName((prevFile: any) => ({
          ...prevFile,
          [name]: e.name,
        }));

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: response.data,
        }));

        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }

  };
  const handlePremiumTransferChange = (name?: any, value?: any, type?: any, index = 0) => {
    const updateErrors: any = { ...errors };

    if (name === `ginnersupoortedDetails-${index}`) {
      premiumData.ginnersupoortedDetails[index] = value;
      updateErrors[`ginnersupoortedDetails-${index}`] = "";
    }

    if (
      premiumData.ginnersupoortedDetails[index] === "Others" &&
      name === `ginnerspportOther-${index}`
    ) {
      premiumData.ginnerspportOther[index] = value;
      updateErrors[`ginnerspportOther-${index}`] = "";
    }

    if (type === "radio" && name === `modeofsupport-${index}`) {
      premiumData.modeofsupport[index] = value;
      updateErrors[`modeofsupport-${index}`] = "";
    }

    setErrors(updateErrors);
    setPremiumData((prevFormData) => ({ ...prevFormData }));
  };

  const handleChange = (name?: any, value?: any, index?: any) => {
    try {
      if (name === "proofpayment" || name === "ginnersupported") {
        const boolValue = value === "yes";
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: boolValue,
        }));
      } else if (name === `ginnerspportOther-${index}`) {
        setPremiumData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
        }));
      } else if (name === "farmerImage" || name === "identityImage" || name === "proofdocument") {
        dataUpload(value, name);
        return;
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
    } catch (error) {
      console.log("Error handling form change:", error);
    }
  };

  const handleStartDate = (date: any) => {
    setStartDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: date,
    }));
  };

  const handleAdd = () => {
    if (validateGinnersupported()) {
      premiumData.ginnersupoortedDetails.push(""),
        premiumData.modeofsupport.push(""),
        premiumData.ginnerspportOther.push(""),
        setFieldCount((prevCount) => prevCount + 1);
    }
  };

  const validateField = (field: any, value: any, errorMessage: any) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: errorMessage,
      }));
      return false;
    }
    return true;
  };

  const validateProofPayment = () => {
    if (formData.proofpayment === true) {
      validateField("proofname", formData.proofname, "Proof Name is Required");
      validateField(
        "proofdocument",
        formData.proofdocument,
        "Proof Document is Required"
      );
    }
    return true;
  };

  const validateGinnersupported = () => {
    if (formData.ginnersupported === true) {
      const supportedDetailsValid = premiumData.ginnersupoortedDetails.every(
        (item, index) =>
          validateField(
            `ginnersupoortedDetails-${index}`,
            item,
            "Ginner Supoorted Details is Required"
          )
      );

      const modeOfSupportValid = premiumData.modeofsupport.every(
        (item, index) =>
          validateField(
            `modeofsupport-${index}`,
            item,
            "Mode of Support is Required"
          )
      );

      const supportOtherValid = premiumData.ginnerspportOther.every(
        (item, index) => {
          if (premiumData.ginnersupoortedDetails[index] === "Others") {
            return validateField(
              `ginnerspportOther-${index}`,
              item,
              "Enter Details is Required"
            );
          }
          return true; // No validation needed if not 'others'
        }
      );

      return supportedDetailsValid && modeOfSupportValid && supportOtherValid;
    } else {
      return validateField(
        "modeofsupport",
        formData.modeofsupport,
        "Mode of Support is Required"
      );
    }
  };

  const validateForm = () => {
    setErrors({
      date: "",
      seasonId: "",
      brand: "",
      icsName: "",
      farmGroup: "",
      farmer: "",
      farmerImage: "",
      identityValidation: "",
      identityId: "",
      identityOther: "",
      identityImage: "",
      cotton: "",
      rate: "",
      ginnersupported: "",
      paymentmode: "",
      proofpayment: "",
      proofname: "",
      proofdocument: "",
      verifierInteferrence: "",
      partially_verified: "",
      modeofsupport: "",
    });

    let formIsValid = true;

    const validateAndSetField = (field: any, value: any, errorMessage: any) => {
      formIsValid = validateField(field, value, errorMessage) && formIsValid;
    };

    validateAndSetField("date", startDate, "Date is Required");
    validateAndSetField("seasonId", formData.seasonId, "Season is Required");
    validateAndSetField("brand", formData.brand, "Brand is Required");
    validateAndSetField("icsName", formData.icsName, "Ics Name is Required");
    validateAndSetField(
      "farmGroup",
      formData.farmGroup,
      "Farm Group is Required"
    );
    validateAndSetField("farmer", formData.farmer, "Farmer is Required");
    validateAndSetField(
      "farmerImage",
      formData.farmerImage,
      "Farmer Image is Required"
    );
    validateAndSetField(
      "identityValidation",
      formData.identityValidation,
      "Identity Validation is Required"
    );
    validateAndSetField(
      "identityId",
      formData.identityId,
      "Identity Id is Required"
    );

    if (formData.identityValidation === "Others") {
      validateAndSetField(
        "identityOther",
        formData.identityOther,
        "Identity Other is Required"
      );
    }

    validateAndSetField(
      "identityImage",
      formData.identityImage,
      "Identity Image is Required"
    );
    validateAndSetField("cotton", formData.cotton, "Select One is Required");
    validateAndSetField("rate", formData.rate, "Field is Required");
    validateAndSetField(
      "paymentmode",
      formData.paymentmode,
      "Payment Mode is Required"
    );
    validateAndSetField(
      "proofpayment",
      typeof formData.proofpayment === "boolean",
      "Payment Proof is Required"
    );

    validateProofPayment();

    validateAndSetField(
      "verifierInteferrence",
      formData.verifierInteferrence,
      "Verifier Inference is Required"
    );

    if (
      formData.verifierInteferrence === "partially_verified" ||
      formData.verifierInteferrence === "not_verified"
    ) {
      validateAndSetField(
        "partially_verified",
        formData.partially_verified,
        "Partially Verified is Required"
      );
    }
    validateAndSetField(
      "ginnersupported",
      typeof formData.ginnersupported === "boolean",
      "Ginner Supported is Required"
    );
    validateGinnersupported();
    return formIsValid;
  };

  const handleSubmit = async () => {
    const isFormValid =
      validateForm() && validateProofPayment() && validateGinnersupported();
    try {
      if (isFormValid) {
        setIsSubmitting(true);
        const url = "premium-validation/farmer";
        const mainFormData = {
          date: formData.date,
          seasonId: Number(formData.seasonId),
          brandId: Number(formData.brand),
          farmGroupId: Number(formData.farmGroup),
          icsId: Number(formData.icsName),
          farmerId: Number(formData.farmer),
          farmerImage: formData.farmerImage,
          validIdentity: formData.identityValidation,
          identityId: formData.identityId,
          identityOther: formData.identityOther,
          identityImage: formData.identityImage,
          cottonPurchaser: formData.cotton,
          marketRate: formData.rate,
          paymentMode: formData.paymentmode,
          paymentProof: formData.proofpayment,
          proofName: formData.proofname,
          proofDocument: formData.proofdocument,
          isGinnerSupported: formData.ginnersupported,
          ginnerSupportedDetails: premiumData.ginnersupoortedDetails,
          ginnerSupportedOthers: premiumData.ginnerspportOther,
          supportMode: formData.ginnersupported
            ? premiumData.modeofsupport
            : [formData.modeofsupport],
          verifierInference: formData.verifierInteferrence,
          partially_verified: formData.partially_verified,
        };
        const mainResponse = await API.post(url, mainFormData);
        if (mainResponse.success) {
          toasterSuccess("Farmer added successfully");
          router.push("/services/premium-validation");
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log("Error submitting form:", error);
    }
  };

  if (loading) {
    return <div> <Loader /> </div>;
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
                  <NavLink href="/services/premium-validation">
                    Premuim Validation - Farmer
                  </NavLink>
                </li>
                <li>Add Validation Farmer</li>
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
                  placeholderText={"Date"}
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
                  {translations?.common?.brand}  <span className="text-red-500">*</span>
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
                  {translations?.farmGroup} <span className="text-red-500">*</span>
                </label>
                <Select
                  name="farmGroup"
                  value={formData.farmGroup ? { label: farmgroup?.find((farmGroup: any) => farmGroup.id === formData.farmGroup)?.name, value: formData.farmGroup } : null}
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
                    handleChange("farmGroup", item?.value);
                  }}
                />
                {errors?.farmGroup !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.farmGroup}
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.icsName}  <span className="text-red-500">*</span>
                </label>
                <Select
                  name="icsName"
                  value={formData.icsName ? { label: icsName?.find((icsName: any) => icsName.id === formData.icsName)?.ics_name, value: formData.icsName } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select ICS Name"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(icsName || []).map(({ id, ics_name }: any) => ({
                    label: ics_name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("icsName", item?.value);
                  }}
                />
                {errors?.icsName !== "" && (
                  <div className="text-sm text-red-500">{errors.icsName}</div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Farmer <span className="text-red-500">*</span>
                </label>
                <Select
                  name="farmer"
                  value={formData.farmer ? { label: farmers?.find((farmer: any) => farmer.farmer_id === formData.farmer)?.farmer?.firstName, value: formData.farmer } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Farmer"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(farmers || []).map((farmer: any) => ({
                    label: farmer?.farmer?.firstName,
                    value: farmer?.farmer_id,
                    key: farmer?.farmer_id
                  }))}
                  onChange={(item: any) => {
                    handleChange("farmer", item?.value);
                  }}
                />
                {errors?.farmer !== "" && (
                  <div className="text-sm text-red-500 ">{errors.farmer}</div>
                )}
              </div>
            </div>
            {farmerTable.length > 0 && (
              <>
                <hr className="mt-6 mb-3" />
                <div
                  className="flex"
                  style={{ padding: "20px", overflowX: "auto" }}
                >
                  <table
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            fontSize: 14,
                          }}
                        >
                          S.No
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            fontSize: 14,
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            fontSize: 14,
                          }}
                        >
                          Ginner
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            fontSize: 14,
                          }}
                        >
                          Procured Quantity
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            fontSize: 14,
                          }}
                        >
                          Price / Kg
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerTable?.map((item: any, Index: any) => (
                        <tr key={Index}>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              fontSize: 12,
                            }}
                          >
                            {Index + 1}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              fontSize: 12,
                            }}
                          >
                            {item.date?.substring(0, 10)}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              fontSize: 12,
                            }}
                          >
                            {item.ginner_name || "----"}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              fontSize: 12,
                            }}
                          >
                            {item.qty_purchased}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              fontSize: 12,
                            }}
                          >
                            {item.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr className="mt-3" />
              </>
            )}
            <div className="row">
              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Farmer Image  <span className="text-red-500">*</span>
                </label>
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      name="farmerImage"
                      type="file"
                      accept="image/png, image/jpg, image/jpeg"
                      onChange={(e) => handleChange("farmerImage", e?.target?.files?.[0])}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 ">
                  (Max: 500KB) (Format: jpg/jpeg/png)
                </p>
                {imageErrors?.farmerImage ? (
                  <div className="text-sm text-red-500  ">
                    {imageErrors.farmerImage}
                  </div>
                ) : (
                  errors?.farmerImage !== "" && (
                    <div className="text-sm text-red-500  ">
                      {errors.farmerImage}
                    </div>
                  )
                )}
                {fileName.farmerImage && (
                  <div className="flex text-sm mt-1">
                    <GrAttachment />
                    <p className="mx-1">{fileName.farmerImage}</p>
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Identity Validation  <span className="text-red-500">*</span>
                </label>
                {/* <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  value={formData.identityValidation}
                  onChange={(e) => handleChange("identityValidation", e.target.value)}
                  name="identityValidation"
                >
                  <option value="">Select Identity Validation</option>
                  <option
                    value="Aadhar Card"
                    className="hover:bg-[#0a0e17] hover:text-white"
                  >
                    Aadhar Card
                  </option>
                  <option
                    value="Driving Licence"
                    className="hover:bg-[#0F265C] hover:text-white"
                  >
                    Driving Licence
                  </option>
                  <option
                    value="others"
                    className="hover:bg-[#0F265C] hover:text-white"
                  >
                    Others
                  </option>
                  <option
                    value="Election Voter ID"
                    className="hover:bg-[#0F265C] hover:text-white"
                  >
                    Election Voter ID
                  </option>
                  <option
                    value="BPL Card"
                    className="hover:bg-[#0F265C] hover:text-white"
                  >
                    BPL Card
                  </option>
                </select> */}
                <Select
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  value={
                    formData.identityValidation
                      ? { label: formData.identityValidation, value: formData.identityValidation }
                      : null
                  }
                  options={[
                    { value: 'Aadhar Card', label: 'Aadhar Card' },
                    { value: 'Driving Licence', label: 'Driving Licence' },
                    { value: 'Others', label: 'Others' },
                    { value: 'Election Voter ID', label: 'Election Voter ID' },
                    { value: 'BPL Card', label: 'BPL Card' },
                  ]}
                  isClearable
                  placeholder="Select Identity Validation"
                  onChange={(selectedOption) => handleChange("identityValidation", selectedOption?.value)}
                />
                {errors?.identityValidation !== "" && (
                  <div className="text-sm text-red-500  ">
                    {errors.identityValidation}
                  </div>
                )}
              </div>
              {formData.identityValidation === "Others" && (
                <div className="col-12 col-sm-6 col-md-6 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Other Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="text"
                    placeholder="Enter Other Name"
                    name="identityOther"
                    onChange={(e) => handleChange("identityOther", e.target.value)}
                  />
                  {errors?.identityOther !== "" && (
                    <div className="text-sm text-red-500">
                      {errors.identityOther}
                    </div>
                  )}
                </div>
              )}
              {[
                "Aadhar Card",
                "Driving Licence",
                "Election Voter ID",
                "BPL Card",
                "Others",
              ].includes(formData.identityValidation) && (
                  <>
                    <div className="col-12 col-sm-6 col-md-6 mt-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Enter Id  <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        placeholder="Enter ID"
                        name="identityId"
                        onChange={(e) => handleChange("identityId", e.target.value)}
                      />
                      {errors?.identityId !== "" && (
                        <div className="text-sm text-red-500 ">
                          {errors.identityId}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload validation Image  <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="identityImage"
                            type="file"
                            accept="image/png, image/jpg, image/jpeg"
                            onChange={(e) => handleChange("identityImage", e?.target?.files?.[0])}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 ">
                        (Max: 500KB) (Format: jpg/jpeg/png)
                      </p>
                      {imageErrors?.identityImage ? (
                        <div className="text-sm text-red-500  ">
                          {imageErrors.identityImage}
                        </div>
                      ) : (
                        errors?.identityImage !== "" && (
                          <div className="text-sm text-red-500  ">
                            {errors.identityImage}
                          </div>
                        )
                      )}
                      {fileName.identityImage && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.identityImage}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Purchase of cotton  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="cotton"
                        value="market"
                        onChange={(e) => handleChange("cotton", e.target.value)}
                        checked={formData.cotton === "market"}
                        className="form-radio"
                      />
                      <span></span>
                    </section>
                    Market
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="cotton"
                        value="farmgroup"
                        onChange={(e) => handleChange("cotton", e.target.value)}
                        checked={formData.cotton === "farmgroup"}
                        className="form-radio"
                      />
                      <span></span>
                    </section>
                    Farm Group/Agent
                  </label>
                </div>
                {errors?.cotton !== "" && (
                  <div className="text-sm text-red-500 ">{errors.cotton}</div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Market rate at the day of sale (In INR)  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  onChange={(e) => handleChange("rate", e.target.value)}
                  name="rate"
                  placeholder="Sale Market Rate"
                />
                {errors?.rate !== "" && (
                  <div className="text-sm text-red-500 mt-1">{errors.rate}</div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Mode of Payment <span className="text-red-500">*</span>
                </label>
                <Select
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  value={
                    formData.paymentmode
                      ? { label: formData.paymentmode, value: formData.paymentmode }
                      : null
                  }
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'cheque', label: 'Cheque or Bank Transfer' },
                    { value: 'both', label: 'Both' },
                  ]}
                  placeholder="Select Mode of Payment"
                  onChange={(selectedOption) => handleChange("paymentmode", selectedOption?.label)}
                />
                {errors?.paymentmode !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.paymentmode}
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Proof of Payment  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="proofpayment"
                        value="yes"
                        checked={formData.proofpayment === true}
                        onChange={(e) => handleChange("proofpayment", e.target.value)}
                        className="form-radio"
                      />
                      <span></span>
                    </section>
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="proofpayment"
                        value="no"
                        checked={formData.proofpayment === false}
                        onChange={(e) => handleChange("proofpayment", e.target.value)}
                        className="form-radio"
                      />
                      <span></span>
                    </section>
                    No
                  </label>
                </div>
                {errors?.proofpayment !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.proofpayment}
                  </div>
                )}
              </div>
              {formData.proofpayment === true && (
                <>
                  <div className="col-12">
                    <div className="row">
                      <div className="col-12 col-sm-6 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Proof Document Name *
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          name="proofname"
                          onChange={(e) => handleChange("proofname", e.target.value)}
                          placeholder="Proof Document Name"
                        />
                        {errors?.proofname !== "" && (
                          <div className="text-sm text-red-500 ">
                            {errors.proofname}
                          </div>
                        )}
                      </div>
                      <div className="col-12 col-sm-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Upload Proof Document  <span className="text-red-500">*</span>
                        </label>
                        <div className="inputFile">
                          <label>
                            Choose File <GrAttachment />
                            <input
                              name="proofdocument"
                              type="file"
                              accept="image/png, image/jpg, image/jpeg, application/pdf"
                              onChange={(e) => handleChange("proofdocument", e?.target?.files?.[0])}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 ">
                          (Max: 500KB) (Format: jpg/jpeg/png/pdf)
                        </p>
                        {imageErrors?.proofdocument ? (
                          <div className="text-sm text-red-500  ">
                            {imageErrors.proofdocument}
                          </div>
                        ) : (
                          errors?.proofdocument !== "" && (
                            <div className="text-sm text-red-500  ">
                              {errors.proofdocument}
                            </div>
                          )
                        )}
                        {fileName.proofdocument && (
                          <div className="flex text-sm mt-1">
                            <GrAttachment />
                            <p className="mx-1">{fileName.proofdocument}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className={`col-12 mt-4 col-sm-6 col-md-6`}>
                <label className="text-gray-500 text-[12px] font-medium">
                  Whether beginner supported by any other means  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="ginnersupported"
                        value="yes"
                        onChange={(e) => handleChange("ginnersupported", e.target.value)}
                        checked={formData.ginnersupported === true}
                        className="form-radio"
                      />
                      <span></span>
                    </section>
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="ginnersupported"
                        value="no"
                        onChange={(e) => handleChange("ginnersupported", e.target.value)}
                        checked={formData.ginnersupported === false}
                        className="form-radio"
                      />
                      <span></span>
                    </section>
                    No
                  </label>
                </div>
                {errors?.ginnersupported !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.ginnersupported}
                  </div>
                )}
              </div>
              {formData.ginnersupported === true ? (
                <>
                  {[...Array(fieldCount)].map((_, index) => (
                    <div key={index} className="row">
                      <div className="col-12 col-sm-3 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Ginner Support Details *
                        </label>
                        <Select
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          value={
                            premiumData.ginnersupoortedDetails[index]
                              ? { label: premiumData.ginnersupoortedDetails[index], value: premiumData.ginnersupoortedDetails[index] }
                              : null
                          }
                          onChange={(selectedOption: any) => handlePremiumTransferChange(`ginnersupoortedDetails-${index}`, selectedOption.label, "abc", index)}
                          options={[
                            { value: 'seed', label: 'Seed' },
                            { value: 'organic inputs', label: 'Organic Inputs' },
                            { value: 'Others', label: 'Others' },
                          ]}
                          name={`ginnersupoortedDetails-${index}`}
                        />
                        {errors[
                          `ginnersupoortedDetails-${index}` as keyof typeof errors
                        ] && (
                            <div className="text-sm text-red-500">
                              {
                                errors[
                                `ginnersupoortedDetails-${index}` as keyof typeof errors
                                ]
                              }
                            </div>
                          )}

                        {premiumData.ginnersupoortedDetails[index] ===
                          "Others" && (
                            <div key={index}>
                              <label className="text-gray-500 text-[12px] font-medium">
                                Enter Details *
                              </label>
                              <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                type="text"
                                name={`ginnerspportOther-${index}`}
                                onChange={(e: any) => handlePremiumTransferChange(`ginnerspportOther-${index}`, e.target.value, "abc", index)}
                                placeholder="Enter Details"
                              />
                              {errors[
                                `ginnerspportOther-${index}` as keyof typeof errors
                              ] && (
                                  <div className="text-sm text-red-500">
                                    {
                                      errors[
                                      `ginnerspportOther-${index}` as keyof typeof errors
                                      ]
                                    }
                                  </div>
                                )}
                            </div>
                          )}
                      </div>
                      <div className="col-12 col-sm-3 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Mode of Support  <span className="text-red-500">*</span>
                        </label>
                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name={`modeofsupport-${index}`}
                                value="paid"
                                onChange={(e: any) => handlePremiumTransferChange(`modeofsupport-${index}`, e.target.value, "radio", index)}
                                className="form-radio"
                              />
                              <span></span>
                            </section>
                            Paid
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name={`modeofsupport-${index}`}
                                value="partiallypaid"
                                onChange={(e: any) => handlePremiumTransferChange(`modeofsupport-${index}`, e.target.value, "radio", index)}
                                className="form-radio"
                              />
                              <span></span>
                            </section>
                            Partially Paid
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name={`modeofsupport-${index}`}
                                value="free"
                                onChange={(e: any) => handlePremiumTransferChange(`modeofsupport-${index}`, e.target.value, "radio", index)}
                                className="form-radio"
                              />
                              <span></span>
                            </section>
                            Free
                          </label>
                        </div>
                        {errors[
                          `modeofsupport-${index}` as keyof typeof errors
                        ] && (
                            <div className="text-sm text-red-500">
                              {
                                errors[
                                `modeofsupport-${index}` as keyof typeof errors
                                ]
                              }
                            </div>
                          )}
                      </div>
                      <div className="col-12 col-sm-3 mt-4">
                        <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                          {length === index ? (
                            <button
                              onClick={handleAdd}
                              className="btn-purple mr-2"
                            >
                              Add
                            </button>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Mode of Support  <span className="text-red-500">*</span>
                  </label>
                  <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                    <label className="mt-1 d-flex mr-4 align-items-center">
                      <section>
                        <input
                          type="radio"
                          name="modeofsupport"
                          value="paid"
                          onChange={(e) => handleChange("modeofsupport", e.target.value)}
                          className="form-radio"
                        />
                        <span></span>
                      </section>
                      Paid
                    </label>
                    <label className="mt-1 d-flex mr-4 align-items-center">
                      <section>
                        <input
                          type="radio"
                          name="modeofsupport"
                          value="partiallypaid"
                          onChange={(e) => handleChange("modeofsupport", e.target.value)}
                          className="form-radio"
                        />
                        <span></span>
                      </section>
                      Partially Paid
                    </label>
                    <label className="mt-1 d-flex mr-4 align-items-center">
                      <section>
                        <input
                          type="radio"
                          name="modeofsupport"
                          value="free"
                          onChange={(e) => handleChange("modeofsupport", e.target.value)}
                          className="form-radio"
                        />
                        <span></span>
                      </section>
                      Free
                    </label>
                  </div>
                  {errors?.modeofsupport && (
                    <div className="text-sm text-red-500 ">
                      {errors?.modeofsupport}
                    </div>
                  )}
                </div>
              )}
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Validation Inference  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="verifierInteferrence"
                        value="verified"
                        className="form-radio"
                        onChange={(e) => handleChange("verifierInteferrence", e.target.value)}
                        checked={formData.verifierInteferrence === "verified"}
                      />
                      <span></span>
                    </section>
                    Validation verified
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="verifierInteferrence"
                        value="not_verified"
                        onChange={(e) => handleChange("verifierInteferrence", e.target.value)}
                        className="form-radio"
                        checked={
                          formData.verifierInteferrence === "not_verified"
                        }
                      />
                      <span></span>
                    </section>
                    Not verified
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="verifierInteferrence"
                        value="partially_verified"
                        className="form-radio"
                        onChange={(e) => handleChange("verifierInteferrence", e.target.value)}
                        checked={
                          formData.verifierInteferrence === "partially_verified"
                        }
                      />
                      <span></span>
                    </section>
                    Partially verified
                  </label>
                </div>
                {errors?.verifierInteferrence !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.verifierInteferrence}
                  </div>
                )}
              </div>
              {formData.verifierInteferrence === "partially_verified" ||
                formData.verifierInteferrence === "not_verified" ? (
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Partially Verified Details  <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    onChange={(e) => handleChange("partially_verified", e.target.value)}
                    name="partially_verified"
                    placeholder="Partially Verified"
                  />
                  {errors?.partially_verified !== "" && (
                    <div className="text-sm text-red-500 mt-1">
                      {errors.partially_verified}
                    </div>
                  )}
                </div>
              ) : null}
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
                Submit
              </button>
              <button
                className="btn-outline-purple"
                onClick={() => router.push("/services/premium-validation")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
