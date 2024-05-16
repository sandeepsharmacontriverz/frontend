"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

type LotData = {
  batch_lot_no: string;
};

export default function Page() {
  useTitle("Ticketing List");
  const [roleLoading, hasAccess] = useRole();
  const [Access, setAccess] = useState<any>({});

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<any>({
    dataCorrectionType: "",
    ticketType: "",
    comment: "",
    lotNo: "",
    upload: "",
    others: "",
  });
  const [errors, setErrors] = useState({
    dataCorrectionType: "",
    ticketType: "",
    comment: "",
    lotNo: "",
    upload: "",
    others: "",
  });
  const [fileName, setFileName] = useState({
    upload: "",
  });
  const [salesLot, setSalesLot] = useState<LotData[]>([]);
  const [processlot, setProcessLot] = useState<LotData[]>([]);
  const [ticketingType, setTicketingType] = useState([]);
  const spinnerId = User.MillId;
  const name = User?.username;
  const type = User?.type;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Spinner")) {
      const access = checkAccess("Ticketing");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (spinnerId && formData.dataCorrectionType === "Sale") {
      fetchSales();
      fetchTicketType("sales");
    } else if (spinnerId && formData.dataCorrectionType === "Process") {
      fetchProcesses();
      fetchTicketType("process");
    }
  }, [spinnerId, formData.dataCorrectionType]);

  const fetchProcesses = async () => {
    try {
      const res = await API.get(`mill-process?spinnerId=${spinnerId}`);
      if (res.success) {
        setProcessLot(res.data || []);
      }
    } catch (error) {
      console.error("API request failed:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `mill-process/sales?spinnerId=${spinnerId}`
      );
      if (response.success) {
        setSalesLot(response.data || []);
      }
    } catch (error) {
      console.error("API request failed:", error);
    }
  };

  const fetchTicketType = async (type: any) => {
    try {
      const response = await API.get(
        `ticketing/escalation-type?processorType=spinner&correctionType=${type}`
      );
      if (response.success) {
        setTicketingType(response.data);
      }
    } catch (error) {
      console.error("API request failed:", error);
    }
  };

  const handleChange = (event?: any, name?: any, value?: any) => {
    if (name === "file") {
      const file = event.target.files[0];
      if (file != "") {
        handleFileChange(file);
        event.target.value = "";
      }
      else {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          upload: "Please select a file to upload",
        }));
      }
    }
    else if (name == "dataCorrectionType") {
      setProcessLot([]);
      setSalesLot([]);
      setTicketingType([]);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
        ticketType: null,
        lotNo: "",
      }));
    }
    else if (name == "ticketType" || name == "lotNo") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,

      }));
    }
    else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: event.target?.value,
      }));
    }
    setErrors((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };
  const handleFileChange = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    const url = "file/upload";
    try {
      const response = await API.postFile(url, formData);
      setFileName((prevFile: any) => ({
        ...prevFile,
        upload: file?.name,
      }));
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        upload: response.data,
      }));
    } catch (error) {
      console.log("Error uploading file:", error);
    }
  };
  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;

    if (value != "" && type == "alphaNumeric") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }
  };

  const requiredFields = [
    "dataCorrectionType",
    "ticketType",
    "comment",
    "lotNo",
    "upload",
    "others",
  ];

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const valid = regexAlphaNumeric.test(formData.comment);

    if (requiredFields.includes(name)) {
      switch (name) {
        case "dataCorrectionType":
          return value === "" || value === undefined ? "Data Correction Type is required" : "";
        case "ticketType":
          return value === "" || value === null
            ? "Ticket Type is required"
            : "";
        case "comment":
          return value === ""
            ? "Comment is required"
            : !valid
              ? "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()"
              : "";
        case "lotNo":
          return value === "" || value === null || value === undefined
            ? "Lot No is required"
            : "";
        case "others":
          return formData.ticketType === "Other if any" && value === ""
            ? "Ticket Type Others is required"
            : "";
        case "upload":
          return formData.upload === "" ? "Upload is required" : "";
        default:
          return "";
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!hasErrors) {
      const url = "ticketing";
      const mainFormData = {
        processorName: name,
        processorType: "Spinner",
        styleMarkNo: formData.lotNo,
        ticketType: formData.ticketType,
        processOrSales: formData.dataCorrectionType,
        comments: formData.comment,
        documents: formData.upload,
        processorId: spinnerId,
      };
      const mainResponse = await API.post(url, mainFormData);

      if (mainResponse.success) {
        toasterSuccess("Record added successfully");
        router.push("/mill/ticketing");
      }
      else {
        toasterError(mainResponse.error.code, 5000, spinnerId)
      }
    } else {
      return;
    }
  };

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  if (!roleLoading && Access?.create) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/mill/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/mill/ticketing">Ticketing</Link>
                </li>
                <li>Create Ticketing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="w-100">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-sm-12 col-lg-6 col-md-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Data correction Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="dataCorrectionType"
                      value={formData.dataCorrectionType ? { label: formData.dataCorrectionType, value: formData.dataCorrectionType } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Correction Type"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={[
                        { label: "Process", value: "Process" },
                        { label: "Sale", value: "Sale" }
                      ]}
                      onChange={(item: any) => {
                        handleChange("e", "dataCorrectionType", item?.value);
                      }}
                    />
                    {errors.dataCorrectionType && (
                      <div className="text-red-500 text-sm">
                        {errors.dataCorrectionType}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-lg-6 col-md-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Ticket Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="ticketType"
                      value={formData.ticketType ? { label: formData.ticketType, value: formData.ticketType } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Ticket Type"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(ticketingType || []).map(({ id, name }: any) => ({
                        label: name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("e", "ticketType", item?.label);
                      }}
                    />

                    {errors.ticketType && (
                      <div className="text-red-500 text-sm">
                        {errors.ticketType}
                      </div>
                    )}
                  </div>
                  {formData.ticketType === "Other if any" ? (
                    <div className="col-sm-12 col-lg-6 col-md-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Ticket Type Others <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-100 shadow-none  rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="others"
                        rows={3}
                        value={formData.others}
                        onChange={(e) => handleChange(e, "others")}
                      />
                      {errors.others && (
                        <div className="text-red-500 text-sm ">
                          {errors.others}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="col-sm-12 col-lg-6 col-md-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Finished Batch/Lot No <span className="text-red-500">*</span>
                    </label>

                    <Select
                      name="lotNo"
                      value={formData.lotNo ? { label: formData.lotNo, value: formData.lotNo } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(formData.dataCorrectionType === "Process" ? processlot : salesLot || []).map(({ id, batch_lot_no }: any) => ({
                        label: batch_lot_no,
                        value: id,
                        key: id
                      }))}
                      onChange={(item) => handleChange("e", "lotNo", item?.label)}
                    />
                    {errors.lotNo && (
                      <div className="text-red-500 text-sm ">
                        {errors.lotNo}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-lg-6 col-md-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-100 shadow-none  rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="comment"
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => handleChange(e, "comment")}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}

                    />
                    {errors.comment && (
                      <div className="text-red-500 text-sm ">
                        {errors.comment}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-lg-6 col-md-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Upload <span className="text-red-500">*</span>
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          ref={fileInputRef}
                          name="upload"
                          onChange={(e: any) => handleChange(e, "file")}
                        />
                      </label>
                    </div>
                    {fileName.upload && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.upload}</p>
                      </div>
                    )}
                    {errors.upload && (
                      <div className="text-red-500 text-sm ">
                        {errors.upload}
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
                className="btn-outline-purple mr-2"
                onClick={() => router.push("/mill/ticketing")}
              >
                CANCEL
              </button>
            </section>

            <section>
              <button className="btn-purple mr-2" onClick={handleSubmit}>
                SUBMIT
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }
}
