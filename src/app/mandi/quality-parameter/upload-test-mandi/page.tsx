"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect, forwardRef } from "react";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import DataTable from "react-data-table-component";
import { BsPlusCircleFill } from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { Form } from "react-bootstrap";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import Loader from "@components/core/Loader";

let intializeData: any = {
  mandiId: "",
  processId: "",
  soldId: "",
  ginLotNo: "",
  reelLotNo: "",
  testReport: "",
  labName: "",
  sci: "",
  moisture: "",
  mic: "",
  mat: "",
  uhml: "",
  ui: "",
  sf: "",
  str: "",
  elg: "",
  rd: "",
  plusb: "",
  document: [],
};

export default function Page() {
  useTitle("Upload Test Report");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const mandiId = User.MandiId;

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([
    {
      mandiId: "",
      processId: "",
      soldId: "",
      ginLotNo: "",
      reelLotNo: "",
      testReport: "",
      labName: "",
      sci: "",
      moisture: "",
      mic: "",
      mat: "",
      uhml: "",
      ui: "",
      sf: "",
      str: "",
      elg: "",
      rd: "",
      plusb: "",
      document: [],
    },
    {
      mandiId: "",
      processId: "",
      soldId: "",
      ginLotNo: "",
      reelLotNo: "",
      testReport: "",
      labName: "",
      sci: "",
      moisture: "",
      mic: "",
      mat: "",
      uhml: "",
      ui: "",
      sf: "",
      str: "",
      elg: "",
      rd: "",
      plusb: "",
      document: [],
    },
    {
      mandiId: "",
      processId: "",
      soldId: "",
      ginLotNo: "",
      reelLotNo: "",
      testReport: "",
      labName: "",
      sci: "",
      moisture: "",
      mic: "",
      mat: "",
      uhml: "",
      ui: "",
      sf: "",
      str: "",
      elg: "",
      rd: "",
      plusb: "",
      document: [],
    },
  ]);

  console.log(data,"data")

  const [selectedOption, setSelectedOption] =
    useState<string>("Current Report");
  const [ginnerProcess, setGinnerProcess] = useState<any>();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [fileNameShow, setFileNameShow] = useState<any>();

  const [formData, setFormData] = useState({
    reportType: "Current Report",
  });

  const [errors, setErrors] = useState(Array(data.length).fill({}));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (mandiId) {
      getGinnerProcess();
    }
  }, [mandiId]);

  const getGinnerProcess = async () => {
    try {
      const res = await API.get(`mandi-process?mandiId=${mandiId}`);
      if (res.success) {
        setGinnerProcess(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddMore = () => {
    setData([...data, { ...intializeData }]);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setSelectedOption(value);
    setFormData((prevData) => ({
      ...prevData,
      reportType: value,
    }));
  };

  const { translations, loading } = useTranslations();

  const customStyles = {
    header: {
      style: {
        minHeight: "56px",
      },
    },
    headCells: {
      style: {
        "&:not(:last-of-type)": {
          borderRightStyle: "solid",
          borderRightWidth: "1px",
        },
      },
    },
    cells: {
      style: {
        "&:not(:last-of-type)": {
          borderRightStyle: "solid",
          borderRightWidth: "1px",
        },
      },
    },
  };

  const dataUpload = async (id: any, name: any, e: any) => {
    const updatedData = [...data];
    updatedData[id].document = [];
    const updatedErrors = [...errors];
    const url = "file/upload";

    const allowedFormats = [
      "application/pdf",
      "application/zip",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
    ];

    const dataVideo = new FormData();
    if (name === "document") {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (!file) {
          updatedErrors[id].document = "No File Selected"
          return;
        } else {
          if (!allowedFormats.includes(file.type)) {
            updatedErrors[id].document = "Invalid file format. Upload a valid format"
            e.target.value = "";
            return;
          }
        }
        dataVideo.set("file", file);
        try {
          const response = await API.postFile(url, dataVideo);
          if (response.success) {
            updatedData[id].document.push(response.data);
            updatedErrors[id].document = ""
          }
        } catch (error) {
          console.log(error, "error");
          updatedErrors[id].document = "Error uploading file. Please try again later."
        }
      }
      if (updatedData[id].document.length === 1) {
        setFileNameShow(e.target.files[0]?.name);
      }
      setData(updatedData);
    }
  };

  const handleChange = (id: number, fieldName: string, fieldValue: any) => {
    let newErrors = [...errors];

    if (fieldName === "document") {
      dataUpload(id, fieldName, fieldValue);
    } else if (fieldName === "testReport") {
      const dateValue: any = !fieldValue ? "" : new Date(fieldValue);

      // Check if fieldValue is a valid date before updating
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        const updatedData = data.map((item: any, index: any) =>
          index === id ? { ...item, testReport: dateValue } : item
        );
        newErrors[id] = { ...newErrors[id], testReport: "" }; // Reset error for testReport
        setData(updatedData);
      } else {
        const updatedData = data.map((item: any, index: any) =>
          index === id ? { ...item, testReport: "" } : item
        );
        setData(updatedData);
      }
    } else {
      const updatedData = data.map((item: any, index: any) => {
        if (index === id) {
          let updatedItem = { ...item, [fieldName]: fieldValue };

          const matchingItem = ginnerProcess.find(
            (item: any) => item.lot_no === fieldValue
          );
          if (matchingItem && fieldName === "ginLotNo") {
            updatedItem.reelLotNo = matchingItem.reel_lot_no;
            updatedItem.processId = matchingItem.id;
            updatedItem.mandiId = matchingItem.mandi_id;
          } else if (!matchingItem && fieldName === "ginLotNo") {
            updatedItem = {
              mandiId: "",
              processId: "",
              soldId: "",
              ginLotNo: "",
              reelLotNo: "",
              testReport: "",
              labName: "",
              sci: "",
              moisture: "",
              mic: "",
              mat: "",
              uhml: "",
              ui: "",
              sf: "",
              str: "",
              elg: "",
              rd: "",
              plusb: "",
              document: [],
            };
            newErrors[id] = {}; // Reset errors when ginLotNo is empty
          }
          return updatedItem;
        } else {
          return item;
        }
      });
      setData(updatedData);
    }

    setErrors(newErrors);
  };

  const handleBlur = (id: number, fieldName: string, fieldValue?: any) => {
    const newErrors = [...errors];
    // Check if the first column (ginLotNo) is filled in the corresponding row
    if (data[id].ginLotNo.trim() !== "" || id === 0) {
      const fieldError = validateField(fieldName, fieldValue, id);

      if (fieldName === "testReport") {
        const dateValue: any = !fieldValue ? "" : new Date(fieldValue);

        if (
          dateValue !== "" &&
          dateValue instanceof Date &&
          !isNaN(dateValue.getTime())
        ) {
          newErrors[id] = {
            ...newErrors[id],
            testReport: "",
          };
        } else if (
          typeof data[id].testReport === "string" &&
          data[id].testReport.trim() === ""
        ) {
          newErrors[id] = {
            ...newErrors[id],
            testReport: "This field is required",
          };
        }
      } else {
        if (fieldError) {
          newErrors[id] = { ...newErrors[id], [fieldName]: fieldError };
        } else {
          newErrors[id] = { ...newErrors[id], [fieldName]: null };
        }
      }
    }
    setErrors(newErrors);
  };

  const requiredFields = [
    "ginLotNo",
    // "reelLotNo",
    "labName",
    "sci",
    "testReport",
    "moisture",
    "mic",
    "mat",
    "uhml",
    "ui",
    "sf",
    "str",
    "elg",
    "rd",
    "plusb",
    "document",
  ];

  const validateField = (name: string, value: any, index: number = 0) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const valid = regexAlphaNumeric.test(value);
    if (requiredFields.includes(name)) {
      switch (name) {
        case "ginLotNo":
          return value.trim() === "" ? "This field is required" : "";
        // case "reelLotNo":
        //   return value.trim() === "" ? "This field is required" : "";
        case "labName":
          return value.trim() === ""
            ? "This field is required"
            : !valid
              ? "Only accepts 0-9, A-Z, a-z and , . _ - ()"
              : "";
        case "sci":
          return value.trim() === ""
            ? "This field is required"
            : value < 100 || value > 260
              ? "value should be between 100 and 260"
              : "";
        case "testReport":
          return value == "" || value.length == 0
            ? "This field is required"
            : "";
        case "moisture":
          return value.trim() === ""
            ? "This field is required"
            : value < 4.5 || value > 10
              ? "value should be between 4.5 and 10"
              : "";
        case "mic":
          return value.trim() === ""
            ? "This field is required"
            : value < 2.5 || value > 6
              ? "value should be between 2.5 and 6"
              : "";
        case "mat":
          return value.trim() === ""
            ? "This field is required"
            : value < 0.5 || value > 1
              ? "value should be between 0.5 and 1"
              : "";
        case "uhml":
          return value.trim() === ""
            ? "This field is required"
            : value < 27 || value > 38
              ? "value should be between 27 and 38"
              : "";
        case "ui":
          return value.trim() === ""
            ? "This field is required"
            : value < 70 || value > 92
              ? "value should be between 70 and 92"
              : "";
        case "sf":
          return value.trim() === ""
            ? "This field is required"
            : value < 4 || value > 13
              ? "value should be between 4 and 13"
              : "";
        case "str":
          return value.trim() === ""
            ? "This field is required"
            : value < 18 || value > 48
              ? "value should be between 18 and 48"
              : "";
        case "elg":
          return value.trim() === ""
            ? "This field is required"
            : value < 4 || value > 15
              ? "value should be between 4 and 15"
              : "";
        case "rd":
          return value.trim() === ""
            ? "This field is required"
            : value < 55 || value > 85
              ? "value should be between 55 and 85"
              : "";
        case "plusb":
          return value.trim() === ""
            ? "This field is required"
            : value < 5 || value > 12
              ? "value should be between 5 and 12"
              : "";
        case "document":
          return value?.length === 0 || value === null
            ? "Select atleast one file"
            : "";
        default:
          return "";
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: any = [...errors];

    data.map((error: any, index: number) => {
      const userErrors: any = {};
      if (error.ginLotNo.trim() !== "" || index === 0) {
        Object.keys(error).forEach((fieldName: string) => {
          const fieldError = validateField(
            fieldName,
            error[fieldName as keyof any],
            index
          );
          if (fieldError) {
            userErrors[fieldName] = fieldError;
          }
        });
        newErrors[index] = userErrors;
      }
    });
    const hasErrors = newErrors.some((errors: any) =>
      Object.values(errors).some((error) => !!error)
    );
    if (hasErrors) {
      setErrors(newErrors);
    }
    if (!hasErrors) {
      const filteredData = data.filter(
        (row: any, index: number) => row.ginLotNo.trim() !== "" || index === 0
      );
      filteredData.forEach((item: any) => {
        item.testReport ? (item.testReport = item?.testReport) : "";
      });
      try {
        setIsSelected(true);
        const res = await API.post(`quality-parameter`, {
          testReport: filteredData,
        });
        if (res.success) {
          router.push("/mandi/quality-parameter/paddy-quality-parameter");
          toasterSuccess("Test Report uploaded", 3000, 1);
        } else {
          setIsSelected(false);
        }
      } catch (error) {
        console.log(error);
        setIsSelected(false);
      }
    } else {
      return;
    }
  };

  const CustomInput = forwardRef(({ onBlur, index, ...props }: any, ref) => (
    <input
      {...props}
      ref={ref}
      onBlur={(e) => {
        handleBlur(index, "testReport", e);
      }}
    />
  ));

  const columns = [
    {
      name: translations?.common?.srNo,
      center: true,
      sortable: false,
      width: "80px",
      cell: (row: any, index: any) => index + 1,
    },
    {
      name: translations?.mandiInterface?.ginlotNo,
      sortable: false,
      width: "160px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <Form.Select
            className="min-w-[140px] h-8 dropDownFixes rounded-md px-2 text-sm "
            value={row.ginLotNo || ""}
            name="ginLotNo"
            onChange={(e) => handleChange(index, "ginLotNo", e.target.value)}
            onBlur={(e) => handleBlur(index, "ginLotNo", e.target.value)}
          >
            <option value="">Select</option>
            {ginnerProcess?.map((ginnerProcess: any) => (
              <option key={ginnerProcess?.id} value={ginnerProcess?.lot_no}>
                {ginnerProcess?.lot_no}
              </option>
            ))}
          </Form.Select>
          {errors[index]?.ginLotNo !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.ginLotNo}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.mandiInterface?.reelLotNo,
      sortable: false,
      width: "220px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="text"
            disabled
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            // className="border h-8 bg-white w-auto"
            value={row.reelLotNo || ""}
            onChange={(e) => handleChange(index, "reelLotNo", e.target.value)}
          />
          {errors[index]?.reelLotNo !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.reelLotNo}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.labName,
      sortable: false,
      width: "140px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="text"
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.labName || ""}
            onChange={(e) => handleChange(index, "labName", e.target.value)}
            onBlur={(e) => handleBlur(index, "labName", e.target.value)}
          />
          {errors[index]?.labName !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.labName}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.dateReport,
      sortable: false,
      width: "150px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <DatePicker
            portalId="root-portal"
            selected={row.testReport || ""}
            dateFormat={"dd-MM-yyyy"}
            onChange={(e) => handleChange(index, "testReport", e)}
            customInput={<CustomInput index={index} />}
            showYearDropdown
            placeholderText={"dd-MM-yyyy"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
          />
          {errors[index]?.testReport !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.testReport}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.sci,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.sci || ""}
            onChange={(e) => handleChange(index, "sci", e.target.value)}
            onBlur={(e) => handleBlur(index, "sci", e.target.value)}
          />
          {errors[index]?.sci !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.sci}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.moisture,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.moisture || ""}
            onChange={(e) => handleChange(index, "moisture", e.target.value)}
            onBlur={(e) => handleBlur(index, "moisture", e.target.value)}
          />
          {errors[index]?.moisture !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.moisture}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.mic,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.mic || ""}
            onChange={(e) => handleChange(index, "mic", e.target.value)}
            onBlur={(e) => handleBlur(index, "mic", e.target.value)}
          />
          {errors[index]?.mic !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.mic}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.mat,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.mat || ""}
            onChange={(e) => handleChange(index, "mat", e.target.value)}
            onBlur={(e) => handleBlur(index, "mat", e.target.value)}
          />
          {errors[index]?.mat !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.mat}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.uhml,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.uhml || ""}
            onChange={(e) => handleChange(index, "uhml", e.target.value)}
            onBlur={(e) => handleBlur(index, "uhml", e.target.value)}
          />
          {errors[index]?.uhml !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.uhml}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.ui,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.ui || ""}
            onChange={(e) => handleChange(index, "ui", e.target.value)}
            onBlur={(e) => handleBlur(index, "ui", e.target.value)}
          />
          {errors[index]?.ui !== "" && (
            <div className="text-sm pt-1 text-red-500">{errors[index]?.ui}</div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.sf,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.sf || ""}
            onChange={(e) => handleChange(index, "sf", e.target.value)}
            onBlur={(e) => handleBlur(index, "sf", e.target.value)}
          />
          {errors[index]?.sf !== "" && (
            <div className="text-sm pt-1 text-red-500">{errors[index]?.sf}</div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.str,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.str || ""}
            onChange={(e) => handleChange(index, "str", e.target.value)}
            onBlur={(e) => handleBlur(index, "str", e.target.value)}
          />
          {errors[index]?.str !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.str}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.elg,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.elg || ""}
            onChange={(e) => handleChange(index, "elg", e.target.value)}
            onBlur={(e) => handleBlur(index, "elg", e.target.value)}
          />
          {errors[index]?.elg !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.elg}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.rd,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-full shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.rd || ""}
            onChange={(e) => handleChange(index, "rd", e.target.value)}
            onBlur={(e) => handleBlur(index, "rd", e.target.value)}
          />
          {errors[index]?.rd !== "" && (
            <div className="text-sm pt-1 text-red-500">{errors[index]?.rd}</div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.b,
      sortable: false,
      width: "120px",
      center: true,
      cell: (row: any, index: any) => (
        <div className="py-2">
          <input
            type="number"
            min={"100"}
            max={"260"}
            className="w-100 shadow-none h-8 rounded-md mt-1 form-control gray-placeholder bg-white text-sm borderCustom"
            value={row.plusb || ""}
            onChange={(e) => handleChange(index, "plusb", e.target.value)}
            onBlur={(e) => handleBlur(index, "plusb", e.target.value)}
          />
          {errors[index]?.plusb !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.plusb}
            </div>
          )}
        </div>
      ),
    },
    {
      name: translations?.qualityParameter?.document,
      sortable: false,
      width: "180px",
      center: true,
      cell: (row: any, index: any) => (
        <div>
          <div className="inputFile mt-1">
            <label>
              Choose File <GrAttachment />
              <input
                type="file"
                name="document"
                multiple
                accept=".pdf,.zip,.xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf,.csv"
                onChange={(e) => handleChange(index, "document", e)}
                onClick={(e: any) => {
                  e.target.value = null;
                }}
              />
            </label>
          </div>
          {data[index]?.document.length > 0 ?
            data[index]?.document.length === 1 ? <div>{fileNameShow}</div>
              :
              <div>{data[index]?.document.length} Files Selected</div>
            : null
          }
          {errors[index]?.document !== "" && (
            <div className="text-sm pt-1 text-red-500">
              {errors[index]?.document}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading || roleLoading || isSelected) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !hasAccess?.processor.includes("Mandi")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor.includes("Mandi")) {
    return (
      <div className="">
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <NavLink href="/mandi/dashboard" className="active">
                        <span className="icon-home"></span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink href="/mandi/mandi-process">Process</NavLink>
                    </li>
                    <li>
                      <NavLink href="/mandi/mandi-process/add-mandi-process">
                        {" "}
                        New Process
                      </NavLink>
                    </li>
                    <li>Upload Test Report</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form ">
                  <div className="w-100 chooseOption d-flex flex-wrap my-2">
                    <label className="mt-1 d-flex mr-4 align-items-center">
                      <section>
                        <input
                          id="1"
                          type="radio"
                          name="reportType"
                          value="Current Report"
                          checked={selectedOption === "Current Report"}
                          onChange={handleRadioChange}
                        />
                        <span></span>
                      </section>{" "}
                      Current Report
                    </label>

                    <label className="mt-1 d-flex mr-4 align-items-center">
                      <section>
                        <input
                          id="2"
                          type="radio"
                          name="reportType"
                          value="Old Report"
                          checked={selectedOption === "Old Report"}
                          onChange={handleRadioChange}
                        />
                        <span></span>
                      </section>{" "}
                      Old Report
                    </label>
                  </div>

                  <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                    {/* search */}
                    <DataTable
                      persistTableHead
                      striped={true}
                      fixedHeader={true}
                      noDataComponent={
                        <p className="py-3 font-bold text-lg">
                          No data available in table
                        </p>
                      }
                      fixedHeaderScrollHeight="auto"
                      columns={columns}
                      customStyles={customStyles}
                      data={data}
                    />

                    <button
                      className="flex gap-2 px-2 py-1.5 m-2 bg-red-600 text-white rounded text-sm my-2"
                      onClick={handleAddMore}
                    >
                      <BsPlusCircleFill color="white" size={18} />
                      Add More
                    </button>
                  </div>

                  <div className="pt-12 w-100 d-flex justify-end customButtonGroup">
                    <section>
                      <button
                        className="btn-purple mr-2"
                        style={
                          isSelected
                            ? { cursor: "not-allowed", opacity: 0.8 }
                            : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        disabled={isSelected}
                        onClick={handleSubmit}
                      >
                        SUBMIT
                      </button>
                      <button
                        className="btn-outline-purple"
                        onClick={() => router.push("/mandi/mandi-process")}
                      >
                        CANCEL
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}
