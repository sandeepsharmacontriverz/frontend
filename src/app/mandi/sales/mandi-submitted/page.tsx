"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import { FaDownload } from "react-icons/fa6";
import { handleDownload } from "@components/core/Download";
import checkAccess from "@lib/CheckAccess";
import { PreView } from "@components/preview/PreView";
import ModalLoader from "@components/core/ModalLoader";

export default function page() {
  const { translations, loading } = useTranslations();
  const [roleLoading, hasAccess] = useRole();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  useTitle("New Sale");
  const [Access, setAccess] = useState<any>({});

  const [selectedTCFiles, setSelectedTCFiles] = useState<File[]>([]);
  const [selectedContractFiles, setSelectedContractFiles] = useState<File[]>(
    []
  );
  const [selectedInvoiceFiles, setSelectedInvoiceFiles] = useState<File[]>([]);
  const [isSelected, setIsSelected] = useState<any>(true);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [reelLotNoList, setReelLotNoList] = useState<any>("");
  const [bagData, setBagData] = useState<any>([]);
  const [selectedDeliveryNotesFiles, setSelectedDeliveryNotesFiles] = useState<
    File[]
  >([]);
  const [showPreview, setShowPreview] = useState<any>(false);
  const [errors, setErrors] = useState<any>({});
  const [jsonStructure, setJsonStructure] = useState<any>(null);

  const [data, setData] = useState<any>({
    date: "",
    season: "",
    no_of_bags:"",
    program: "",
    lot_no: "",
    shipping_address: "",
    total_qty: "",
    candy_rate: "",
    despatch_from: "",
    vehicle_no: "",
    buyerName: "",
  });

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
      const access = checkAccess("Mandi Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const checkMoisturePercentage = (existingWeight:any, newWeight:any) => {
    const lowerLimit = existingWeight * 0.95;
    const upperLimit = existingWeight * 1.05;

    if (newWeight >= lowerLimit && newWeight <= upperLimit) {
      return true;
    } else if (newWeight >= existingWeight * 1.01 && newWeight <= existingWeight * 1.05) {
      return true;
    } else {
      return `Incorrect Weight(${newWeight}) Moisture weight for loss or gain allowed upto 1 to 5% of the current weight(${existingWeight})`;
    }
  };

  useEffect(() => {
    if (jsonStructure) {
      const missingFields = jsonStructure.some((item:any) =>
        Object.values(item).some(value => value === undefined || value === null)
      );

      if (missingFields) {
       toasterError("Some fields are missing; please upload complete Excel", 3000, 1)
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          lossData: "",
        }));
        return;
      }

      const incorrectEntries:any = [];

      const updatedJsonStructureError = jsonStructure.filter((item:any) => {
        const reelLotNoArray = reelLotNoList?.split(", ");
        if (!reelLotNoArray?.includes(item.reelLotNo)) {
          incorrectEntries.push(`Reel lot nos: ${item.reelLotNo} can't be updated as they are not associated with this sale.`);
          return false;
        }
       
        const matchingBags = bagData.find((bag:any) => bag.bag_no == item.bagNo);
        if (!matchingBags) {
          incorrectEntries.push(`Bag No ${item.bagNo} does not exist`);
          return false;
        }
  
        const oldWeight = parseFloat(item.oldWeight);
        const newWeight = parseFloat(item.newWeight);
        
  
        if (oldWeight !== parseFloat(matchingBags.weight)) {
          incorrectEntries.push(`Old Weight ${item.oldWeight} does not match with Bag No ${item.bagNo}`);
          return false;
        }
  
        if (newWeight < 0 || isNaN(newWeight)) {
          incorrectEntries.push(`New Weight ${item.newWeight} is invalid for Bag No ${item.bagNo}`);
          return false;
        }
  
        const moistureCheckResult:any = checkMoisturePercentage(oldWeight, newWeight);
       
        if (moistureCheckResult !== true) {
          incorrectEntries.push(moistureCheckResult);
          return false;
        }

        return true;
      });

      if (incorrectEntries.length > 0) {
        toasterError(`${incorrectEntries.join(", ")}`);
        setJsonStructure(updatedJsonStructureError);
      }
    
}}, [jsonStructure, bagData]);

  const fetchData = async () => {
    try {
      const response = await API.get(
        `mandi-process/sales/get-mandi-sale?id=${id}`
      );
      if (response.success) {
        setData(response.data.mandi);
        setBagData(response.data.bag);
        setReelLotNoList(response.data.mandi.reel_lot_no);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [fileName, setFileName] = useState({
    contractFiles: "",
    deliveryNotes: "",
    invoiceFile: [],
    lossData: "",
    uploadTC: "",
  });

  const [formData, setFormData] = useState<any>({
    id: "",
    weightLoss: false,
    saleValue: "",
    invoiceNo: "",
    uploadTC: "",
    contractFiles: "",
    invoiceFile: [],
    deliveryNotes: "",
    transporterName: "",
    vehicleNo: "",
    lrblNo: "",
  });

  // Function to validate the Excel headers against JSON keys
  const validateHeaders = (excelHeaders: any, expectedKeys: any) => {
    return excelHeaders.every((header: any) => expectedKeys.includes(header));
  };

  const excelToJson = async (event: any) => {
    const file = event.target.files[0];

    const maxFileSize = 5 * 1024 * 1024;
    const expectedHeaders = [
      "Bag REEL LOT No",
      "Bag No",
      "Old weight",
      "New weight",
    ];

    const allowedFormats = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedFormats.includes(file?.type)) {
      setJsonStructure(null);
      setFileName((prevFile: any) => ({
        ...prevFile,
        lossData: "",
      }));
      setErrors((prevError: any) => ({
        ...prevError,
        lossData: `Invalid file format. Please upload Excel file.`,
      }));
      file.value = "";
      return null;
    }

    if (file?.size > maxFileSize) {
      setJsonStructure(null);
      setFileName((prevFile: any) => ({
        ...prevFile,
        lossData: "",
      }));
      setErrors((prevError: any) => ({
        ...prevError,
        lossData: `File size exceeds the maximum limit 5 MB).`,
      }));

      file.value = "";
      return;
    } else {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        lossData: "",
      }));
    }
    if (file) {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(sheet);
      const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

      if (headers.length === 0 || !validateHeaders(headers, expectedHeaders)) {
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          lossData: "",
        }));
        setErrors((prevError: any) => ({
          ...prevError,
          lossData: "Invalid or empty file",
        }));
        event.target.value = "";
        return;
      } else {
        const convertedData = jsonData.map((item: any) => ({
          reelLotNo: item["Bag REEL LOT No"],
          bagNo: item["Bag No"],
          oldWeight: item["Old weight"],
          newWeight: item["New weight"],
        }));

        setFileName((prevFile: any) => ({
          ...prevFile,
          lossData: file?.name,
        }));
        setJsonStructure(convertedData);
        event.target.value = "";
      }
    }
  };

  const removeImage = (index: any) => {
    let filename = fileName.invoiceFile;
    let fileNavLink = formData.invoiceFile;
    let arr1 = filename.filter((element: any, i: number) => index !== i);
    let arr2 = fileNavLink.filter((element: any, i: number) => index !== i);
    setFileName((prevData: any) => ({
      ...prevData,
      invoiceFile: arr1,
    }));
    setFormData((prevData: any) => ({
      ...prevData,
      invoiceFile: arr2,
    }));
  };

  const dataUpload = async (event:any) => {
    const { name, files } = event.target;
    const url = "file/upload";

    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];
    const dataVideo = new FormData();
    if (name === "invoiceFile") {
      let filesLink: any = [...formData.invoiceFile];
      let filesName: any = [...fileName.invoiceFile];

      for (let i = 0; i < files?.length; i++) {
        if (!files[i]) {
          return ;
        } else {
          if (!allowedFormats.includes(files[i]?.type)) {
            setErrors((prevError: any) => ({
              ...prevError,
              [name]: "Invalid file format.Upload a valid Format",
            }));

            event = "";
            return;
          }

          const maxFileSize = 5 * 1024 * 1024;

          if (files[i].size > maxFileSize) {
            setErrors((prevError: any) => ({
              ...prevError,
              [name]: `File size exceeds the maximum limit (5MB).`,
            }));

            event = "";
            return;
          }
        }
        dataVideo.set("file", files[i]);
        try {
          const response = await API.postFile(url, dataVideo);
          if (response.success) {
            filesLink.push(response.data);
            filesName.push(files[i].name);

            setErrors((prev: any) => ({
              ...prev,
              [name]: "",
            }));
          }
        } catch (error) {
          console.log(error, "error");
        }
      }
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: filesLink,
      }));
      setFileName((prevFile: any) => ({
        ...prevFile,
        [name]: filesName,
      }));
    } else {
      if (!files[0]) {
        return ;
      } else {
        if (!allowedFormats.includes(files[0]?.type)) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: "Invalid file format.Upload a valid Format",
          }));

          event = "";
          return;
        }

        const maxFileSize = 5 * 1024 * 1024;

        if (files[0].size > maxFileSize) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: `File size exceeds the maximum limit (5MB).`,
          }));

          files[0] = "";
          return;
        }

        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
      }
      dataVideo.append("file", files[0]);
      try {
        const response = await API.postFile(url, dataVideo);
        if (response.success) {
          setFileName((prevFile: any) => ({
            ...prevFile,
            [name]: files[0].name,
          }));
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: response.data,
          }));

          setErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleChange = (event: any) => {
    const { name, value, type } = event.target;

        if (name === "weightLoss") {
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: value === "Yes" ? true : false,
          }));
        } else {
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
          }));
        }

  };

  const handleFileChange = async (file: any, name: string) => {
    const formData = new FormData();

    formData.append("file", file);
    const url = "file/upload";

    try {
      const response = await API.postFile(url, formData);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[().,\-/_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    const regexAlphaNum = /^[()\-_a-zA-Z0-9 ]*$/;

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
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
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
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
            "Accepts only AlphaNumeric values and special characters like _,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }
    if (type === "vehicle") {
      if (value != "") {
        const valid = regexAlphaNum.test(value);
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
  };

  const validateForm = () => {
    const regexAlphaNumeric = /^[().,\-/_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    const regexAlphaNum = /^[()\-_a-zA-Z0-9 ]*$/;

    const newErrors = {} as Partial<any>;
    if (formData.weightLoss === true && !jsonStructure) {
      newErrors.lossData = "Upload Revised Csv is required.";
    } else {
      newErrors.lossData = "";
    }
    if (!formData.saleValue) {
      newErrors.saleValue = "Sale Value is required.";
    } else {
      newErrors.saleValue = "";
    }
    if (!formData.invoiceNo) {
      newErrors.invoiceNo = "Invoice Number  is required.";
    } else {
      newErrors.invoiceNo = "";
    }

    if (!formData.transporterName) {
      newErrors.transporterName = "Transporter Name  is required.";
    } else {
      newErrors.transporterName = "";
    }

    if (!formData.vehicleNo) {
      newErrors.vehicleNo = "Vehicle Number is required.";
    } else {
      newErrors.vehicleNo = "";
    }

    if (!formData.lrblNo) {
      newErrors.lrblNo = "LR/BL No.  is required.";
    } else {
      newErrors.lrblNo = "";
    }
    if (formData.saleValue) {
      if (Number(formData.saleValue) <= 0) {
        newErrors.saleValue = "Value Should be more than 0";
      }
    }

    if (formData.invoiceNo) {
      const valid = regexAlphaNumeric.test(formData.invoiceNo);
      if (!valid) {
        newErrors.invoiceNo =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
    }

    if (formData.lrblNo) {
      const valid = regexAlphaNumeric.test(formData.lrblNo);
      if (!valid) {
        newErrors.lrblNo =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
    }

    if (formData.vehicleNo) {
      const valid = regexAlphaNum.test(formData.vehicleNo);
      if (!valid) {
        newErrors.vehicleNo = "Accepts only AlphaNumeric";
      }
    }

    if (formData.transporterName) {
      const valid = regexAlphabets.test(formData.transporterName);
      if (!valid) {
        newErrors.transporterName =
          "Accepts only Alphabets and special characters like _,-,()";
      }
    }

    if (formData.invoiceFile.length === 0) {
      newErrors.invoiceFile = "Invoices File is required.";
    }

    return newErrors;
  };

  const handleErrorCheck = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (!hasErrors) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (!hasErrors) {
      setIsLoading(true);
      const url = "mandi-process/sales";
      const mainFormData = {
        id: id,
        date: data.date,
        weightLoss: formData.weightLoss,
        saleValue: Number(formData.saleValue),
        invoiceNo: formData.invoiceNo,
        noOfBags: Number(data.no_of_bags),
        program: data.program,
        invoiceFile: formData.invoiceFile,
        contractFile: formData.contractFiles,
        deliveryNotes: formData.deliveryNotes,
        tcFile: formData.uploadTC,
        transporterName: formData.transporterName,
        vehicleNo: formData.vehicleNo,
        lrblNo: formData.lrblNo,
        buyerName: data.buyerdata?.name,
        total_qty: Number(data.total_qty),
        lot_no: data.lot_no,
        press_no: data.press_no,
        lossData: jsonStructure,
      };
      try {
        setIsSelected(false);
        const mainResponse = await API.put(url, mainFormData);
        if (mainResponse.success) {
          toasterSuccess("Record updated successfully");
          router.push(`/mandi/sales/transaction-summary?id=${id}`);
        } else {
          setIsSelected(true);
          setIsLoading(false);
        }
      } catch (error) {
        setIsSelected(true);
        setIsLoading(false);
      }
    }
  };


  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li className="active">
                    <NavLink href="/mandi/dashboard">
                      <span className="icon-home"></span>
                    </NavLink>
                  </li>
                  <li>
                    {" "}
                    <NavLink href="/mandi/sales">Sale</NavLink>
                  </li>
                  <li>New Sale</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="w-100">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-lg-8 col-md-10 col-sm-12">
                    <div className="row items-center">
                      <p className="col-lg-5 col-md-8 col-sm-12 mb-2 text-sm">
                        Download valid excel format to use in Upload Revised Csv
                        Format:
                      </p>

                      <div className="col-lg-6 col-md-8 col-sm-12 mb-2">
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                            <button
                              name="ginner"
                              onClick={() =>
                                handleDownload(
                                  "/files/revise_csv_format.xlsx",
                                  "Revised_csv_format",
                                  "xlsx"
                                )
                              }
                              className="btn-purple flex p-2"
                            >
                              <FaDownload className="mr-2" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.season?.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.date?.substring(0, 10)}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Program
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.program?.program_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Buyer Name
                    </label>

                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.buyerdata?.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    No of Bags
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.no_of_bags}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choosen Bag Total Weight
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.chosen_bag}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Quantity(Kg/MT)
                    </label>
                    <input
                      type="number"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="totalQtotal_qtyuantity"
                      value={data.total_qty}
                      disabled
                      onChange={handleChange}
                      placeholder="total_qty"
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Sale Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="saleValue"
                      value={formData.saleValue}
                      onBlur={(e) => onBlur(e, "numeric")}
                      onChange={handleChange}
                      placeholder="Sale Value"
                    />
                    {errors.saleValue && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.saleValue}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Lot No
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data?.lot_no}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Invoice Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      value={formData.invoiceNo}
                      name="invoiceNo"
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      onChange={handleChange}
                      placeholder=" Invoice Number "
                    />
                    {errors.invoiceNo && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.invoiceNo}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Shipping Address
                    </label>
                    <textarea
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      value={data.shipping_address}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Moisture Weight Loss
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name={`weightLoss`}
                            value="Yes"
                            checked={formData.weightLoss === true}
                            onChange={(e) => handleChange(e)}
                          />
                          <span></span>
                        </section>{" "}
                        Yes
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name={`weightLoss`}
                            value="No"
                            checked={formData.weightLoss === false}
                            onChange={(e) => handleChange(e)}
                          />
                          <span></span>
                        </section>{" "}
                        No
                      </label>
                    </div>
                  </div>

                  {formData.weightLoss === true && (
                    <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Revised Csv Format{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            name="lossData"
                            onChange={excelToJson}
                            placeholder="Loss Data"
                          />
                        </label>
                      </div>
                      <p className="text-sm">(Max: 5MB) (Format: xlsx)</p>
                      {fileName.lossData && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.lossData}</p>
                        </div>
                      )}
                      {errors?.lossData !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.lossData}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Upload TC's
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="uploadTC"
                          onChange={dataUpload}
                          placeholder=" Upload TC's"
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.uploadTC && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.uploadTC}</p>
                      </div>
                    )}
                    {errors.uploadTC && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.uploadTC}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Contract Files
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="contractFiles"
                          placeholder="Contract Files"
                          onChange={dataUpload}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.contractFiles && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.contractFiles}</p>
                      </div>
                    )}
                    {errors.contractFiles && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.contractFiles}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Invoice Files <span className="text-red-500">*</span>
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          name="invoiceFile"
                          type="file"
                          multiple
                          accept=".pdf,.zip, image/jpg, image/jpeg"
                          onChange={(event) => dataUpload(event)}
                        />
                      </label>
                    </div>
                    <p className="py-2 text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {errors?.invoiceFile !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.invoiceFile}
                      </div>
                    )}
                    {fileName.invoiceFile &&
                      fileName.invoiceFile?.map((item: any, index: any) => (
                        <div className="flex text-sm mt-1" key={index}>
                          <GrAttachment />
                          <p className="mx-1">{item}</p>
                          <div className="w-1/3">
                            <button
                              name="handle"
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-sm rounded text-black px-2 font-semibold"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Delivery Notes
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="deliveryNotes"
                          placeholder=" Delivery Notes"
                          onChange={dataUpload}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.deliveryNotes && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.deliveryNotes}</p>
                      </div>
                    )}
                    {errors.deliveryNotes && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.deliveryNotes}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Candy Rate
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.candy_rate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Despatch From
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.despatch_from}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Transporter Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="transporterName"
                      value={formData.transporterName}
                      onBlur={(e) => onBlur(e, "alphabets")}
                      onChange={handleChange}
                      placeholder="Transporter Name "
                    />
                    {errors.transporterName && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.transporterName}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onBlur={(e) => onBlur(e, "vehicle")}
                      onChange={handleChange}
                      placeholder=" Vehicle Number "
                    />
                    {errors.vehicleNo && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.vehicleNo}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      LR/BL No <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="lrblNo"
                      value={formData.lrblNo}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      onChange={handleChange}
                      placeholder=" LR/BL No "
                    />
                    {errors.lrblNo && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.lrblNo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-10 w-100 d-flex justify-start customButtonGroup pb-5">
            <section>
              <button
                className="btn-purple mr-2"
                onClick={handleErrorCheck}
                style={
                  !isSelected
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                disabled={!isSelected}
              >
                PREVIEW & SUBMIT
              </button>
            </section>
            <section>
              <button
                className="btn-outline-purple"
                onClick={() => router.push("/mandi/sales")}
              >
                CANCEL
              </button>
            </section>
          </div>
          <div className="relative">
            <PreView
              isLoading={isLoading}
              openFilter={showPreview}
              onClose={!showPreview}
              setShowPreview={setShowPreview}
              showPreview={showPreview}
              data={formData}
              // fileName={fileName}
              onClick={handleSubmit}
              //
              data1_label={"Season : "}
              data1={data.season?.name}
              data2_label={"Date : "}
              data2={data.date?.substring(0, 10)}
              data3_label={"Program : "}
              data3={data.program?.program_name}
              data4_label={"Buyer Name : "}
              data4={data.buyerdata?.name}
              data5_label={"No of Bags : "}
              data5={data.no_of_bags}
              data6_label={"Choosen Bag Total Weight : "}
              data6={data.chosen_bag}
              data7_label={"Total Quantity(Kg/MT) : "}
              data7={data.total_qty}
              data8_label={"Sale Value :"}
              data8={formData.saleValue}
              data9_file_label={"Lot No  :"}
              data9={data?.lot_no}
              data1_file_OR_txt_label={"Invoice Number : "}
              data1_txt={formData.invoiceNo}
              data2_file_OR_txt_label={"Shipping Address : "}
              data2_txt={data.shipping_address}
              data3_file_OR_txt_label={"Moisture Weight Loss : "}
              data3_txt={formData.weightLoss ? "YES" : "NO"}
              array_img_label={"invoiceFile : "}
              array_img={formData?.invoiceFile}
              //
              array3_img_label={"Contract File: "}
              array3_img={
                formData?.contractFiles
                ? [formData?.contractFiles]
                : null
              }
              array4_img_label={"Delivery Notes: "}
              array4_img={
                formData?.deliveryNotes
                ? [formData?.deliveryNotes]
                : null
              }
              array5_img_label={"Upload Tc: "}
              array5_img={
                formData?.uploadTC
                  ? [formData?.uploadTC]
                  : null
              }
             
            />
          </div>
        </div>
        {isLoading ? <ModalLoader /> : null}
      </>
    );
  }
}
