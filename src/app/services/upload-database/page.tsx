"use client";

import React, { useState, useEffect } from "react";
import useTranslations from "@hooks/useTranslation";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import * as XLSX from "xlsx";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import { IoWarning } from "react-icons/io5";
import { GrAttachment } from "react-icons/gr";
import Select from "react-select";

export default function page() {
  useTitle("Upload Database");

  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [isSelected, setIsSelected] = useState<any>(false);
  const [selectedFileFormat, setSelectedFileFormat] = useState("");
  const [country, setCountry] = useState<any>();
  const [state, setState] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [jsonStructure, setJsonStructure] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [fileName, setFileName] = useState("");
  const [areaTypes, setAreaTypes] = useState({
    area: "Acre",
    weight: "Kgs",
    yield: "Per Acre",
  });
  const [villageFormat, setVillageFormat] = useState({
    country: "",
    state: "",
    district: "",
    taluk: "",
  });
  const [errors, setErrors] = useState<any>({
    uploadType: "",
    upload: "",
    country: null,
    state: null,
    district: null,
    taluk: null,
  });

  const fileFormats = [
    {
      name: "farmers",
      fileLink: "/files/Farmer_format.xlsx",
      fileName: "Farmer Format",
      fileType: "xlsx",
    },
    // {
    //   name: "organic_farmer",
    //   fileLink: "/files/organic_farmer.xlsx",
    //   fileName: "Organic Farmer Format",
    //   fileType: "xlsx",
    // },
    {
      name: "procurement",
      fileLink: "/files/Procurement_upload_format.xlsx",
      fileName: "Procurement Format",
      fileType: "xlsx",
    },
    // {
    //   name: "villageData",
    //   fileLink: "/files/Village-upload-format.csv",
    //   fileName: "Village Format",
    //   fileType: "csv",
    // },
    // {
    //   name: "garmentType",
    //   fileLink: "/files/garment_type.csv",
    //   fileName: "Garment Type Format",
    //   fileType: "csv",
    // },
    // {
    //   name: "styleMark",
    //   fileLink: "/files/style_mark_number.csv",
    //   fileName: "Style/Mark No Format",
    //   fileType: "csv",
    // },
    // {
    //   name: "processor",
    //   fileLink: "/files/processor_list.csv",
    //   fileName: "Processor List Format",
    //   fileType: "csv",
    // },
    // {
    //   name: "procurement_price",
    //   fileLink: "/files/procurement_price_update_format.xlsx",
    //   fileName: "Procurement Price Update Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "ginnerExpectedSeed",
    //   fileLink: "/files/ginner_expected_cotton_data.xlsx",
    //   fileName: "Ginner Expected Cotton Data",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "ginnerOrder",
    //   fileLink: "/files/ginner_order_in_hand.xlsx",
    //   fileName: "Ginner Order in Hand",
    //   fileType: "xlsx",
    // },
    // {
    //   name: 'impactData',
    //   fileLink: '/files/Impact_data.xlsx',
    //   fileName: 'Impact Data Format',
    //   fileType: 'xlsx',
    // },
    // {
    //   name: "farm_group_evaluation_data",
    //   fileLink: "/files/farm_group_evaluation_data.xlsx",
    //   fileName: "Farm Group Evaluation Data Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "ics_quantity_estimation",
    //   fileLink: "/files/ics_quantity_estimation.xlsx",
    //   fileName: "ICS Quantity Estimation Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "seed_testing_linkage",
    //   fileLink: "/files/seed_testing_linkage.xlsx",
    //   fileName: "Seed Testing and Linkage Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "seed_demand",
    //   fileLink: "/files/seed_demand.xlsx",
    //   fileName: "Seed Demand Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "seed_availability",
    //   fileLink: "/files/seed_availability.xlsx",
    //   fileName: "Seed Availability Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "ics_name",
    //   fileLink: "/files/ics_name.xlsx",
    //   fileName: "ICS Name Format",
    //   fileType: "xlsx",
    // },
    // {
    //   name: "integrity_test",
    //   fileLink: "/files/integrity_test.xlsx",
    //   fileName: "Integrity Test Format",
    //   fileType: "xlsx",
    // },
  ];

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (villageFormat.country !== undefined && villageFormat.country !== null) {
      getState();
    }
    else {
      setState(null)
      setDistricts(null)
      setVillageFormat((prevData: any) => ({
        ...prevData,
        state: null,
        district: null
      }));

    }
  }, [villageFormat.country]);

  useEffect(() => {
    if (villageFormat.state !== undefined && villageFormat.state !== null) {
      getDistrict();
    }
    else {
      setDistricts(null)
      setVillageFormat((prevData: any) => ({
        ...prevData,
        district: null,
      }));
    }

  }, [villageFormat.state]);

  useEffect(() => {
    if (villageFormat.district !== undefined && villageFormat.district !== null) {
      getBlocks();
    }
    else {
      setBlocks(null)
      setVillageFormat((prevData: any) => ({
        ...prevData,
        taluk: null,
      }));
    }

  }, [villageFormat.district]);

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountry(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getState = async () => {
    try {
      if (villageFormat.country !== "" && villageFormat.country !== undefined && villageFormat.country !== null) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${villageFormat.country}`
        );
        if (res.success) {
          setState(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistrict = async () => {
    try {
      if (villageFormat.state !== undefined && villageFormat.state !== null) {
        const res = await API.get(
          `location/get-districts?stateId=${villageFormat.state}`
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
      if (villageFormat.district !== undefined && villageFormat.district !== null) {
        const res = await API.get(
          `location/get-blocks?districtId=${villageFormat.district}`
        );
        if (res.success) {
          setBlocks(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadData = async (url: any, data: any) => {
    setShow(true);
    setIsSelected(true);
    try {
      const res = await API.post(url, data);
      if (res.success) {
        localStorage.setItem("pass", res.data?.pass?.length);
        if (res.data?.fail?.length > 0) {
          const currentChunk = res.data?.fail?.slice(0, 20000);
          localStorage.setItem("fail", JSON.stringify(currentChunk));
          localStorage.setItem(
            "failCount",
            JSON.stringify(res.data?.fail?.length)
          );
        } else {
          localStorage.setItem("fail", JSON.stringify([]));
        }
        localStorage.setItem("name", selectedFileFormat);
        router.push(`/services/upload-database/upload-status`);
        setShow(false);
      } else {
        setIsSelected(false);
        setShow(false);
      }
    } catch (error) {
      setShow(false);
      setIsSelected(false);
    }
  };

  const handleSubmit = () => {
    let hasErrors = false;
    if (!selectedFileFormat) {
      setErrors((prevError: any) => ({
        ...prevError,
        uploadType: "This field is Required",
      }));
      return;
    }

    if (jsonStructure.length === 0) {
      setErrors((prevError: any) => ({
        ...prevError,
        upload: "This field  is Required",
      }));
      hasErrors = true;
    }

    // if (!villageFormat.country) {
    //   setErrors((prevError: any) => ({
    //     ...prevError,
    //     country: "This field  is Required",
    //   }));
    //   hasErrors = true;
    // }

    // if (!villageFormat.state) {
    //   setErrors((prevError: any) => ({
    //     ...prevError,
    //     state: "This field  is Required",
    //   }));
    //   hasErrors = true;
    // }

    // if (!villageFormat.district) {
    //   setErrors((prevError: any) => ({
    //     ...prevError,
    //     district: "This field  is Required",
    //   }));
    //   hasErrors = true;
    // }

    // if (!villageFormat.taluk) {
    //   setErrors((prevError: any) => ({
    //     ...prevError,
    //     taluk: "This field  is Required",
    //   }));
    //   hasErrors = true;
    // }

    // if (
    //   !hasErrors &&
    //   selectedFileFormat === "villageData" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = {
    //     villageData: jsonStructure,
    //     blockId: villageFormat.taluk,
    //   };
    //   uploadData("upload-database/village", jsonData);
    // }

    // if (
    //   selectedFileFormat === "garmentType" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { garmentType: jsonStructure };
    //   uploadData("upload-database/garment-type", jsonData);
    // }

    // if (
    //   selectedFileFormat === "styleMark" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { styleMark: jsonStructure };
    //   uploadData("upload-database/style-mark", jsonData);
    // }

    // if (
    //   selectedFileFormat === "ginnerOrder" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { ginnerOrder: jsonStructure };
    //   uploadData("upload-database/ginner-order", jsonData);
    // }

    // if (
    //   selectedFileFormat === "ginnerExpectedSeed" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { ginnerExpectedSeed: jsonStructure };
    //   uploadData("upload-database/ginner-expected", jsonData);
    // }

    // if (
    //   selectedFileFormat === "processor" &&
    //   jsonStructure?.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { processorData: jsonStructure };
    //   uploadData("upload-database/processor-list", jsonData);
    // }

    // if (
    //   selectedFileFormat === "procurement_price" &&
    //   jsonStructure?.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { procurementPriceData: jsonStructure };
    //   uploadData("upload-database/procurement-price", jsonData);
    // }

    if (
      selectedFileFormat === "farmers" &&
      jsonStructure.farmers?.length > 0 &&
      !errors.upload
    ) {
      jsonStructure?.farmers?.forEach((farmer: any) => {
        if (farmer.agriTotalArea) {
          farmer.agriTotalArea = convertArea(
            farmer.agriTotalArea,
            areaTypes.area
          );
        }
        if (farmer.cottonTotalArea) {
          farmer.cottonTotalArea = convertArea(
            farmer.cottonTotalArea,
            areaTypes.area
          );
        }
        if (farmer.agriEstimatedYield) {
          farmer.agriEstimatedYield = convertYield(
            farmer.agriEstimatedYield,
            areaTypes.yield
          );
        }
        if (farmer.agriEstimatedProd) {
          farmer.agriEstimatedProd = convertWeight(
            farmer.agriEstimatedProd,
            areaTypes.weight
          );
        }
        if (farmer.totalEstimatedCotton) {
          farmer.totalEstimatedCotton = convertWeight(
            farmer.totalEstimatedCotton,
            areaTypes.weight
          );
        }
      });

      uploadData("upload-database/farmer", jsonStructure);
    }
    if (
      selectedFileFormat === "procurement" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {

      jsonStructure?.forEach((qtyPurchased: any) => {
        if (qtyPurchased.qtyPurchased) {
          qtyPurchased.qtyPurchased = convertWeight(
            qtyPurchased.qtyPurchased,
            areaTypes.weight
          );
        }
        qtyPurchased.farmerCode = qtyPurchased?.farmerCode?.toString();
        qtyPurchased.grade = qtyPurchased?.grade?.toString();
        qtyPurchased.qtyPurchased = qtyPurchased?.qtyPurchased?.toString();
        qtyPurchased.rate = qtyPurchased?.rate?.toString();
        qtyPurchased.totalAmount = qtyPurchased?.totalAmount?.toString();
      });

      const jsonData = { transaction: jsonStructure };
      uploadData("procurement/upload-transactions", jsonData);
    }

    // if (
    //   selectedFileFormat === "impactData" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { impactData: jsonStructure };
    //   uploadData("upload-database/impact/data", jsonData);
    // }

    // if (
    //   selectedFileFormat === "organic_farmer" &&
    //   jsonStructure?.organicFarmers?.length > 0 &&
    //   !errors.upload
    // ) {
    //   jsonStructure?.organicFarmers?.forEach((organicFarmer: any) => {
    //     if (organicFarmer.agriTotalArea) {
    //       organicFarmer.agriTotalArea = convertArea(
    //         organicFarmer.agriTotalArea,
    //         areaTypes.area
    //       );
    //     }
    //     if (organicFarmer.cottonTotalArea) {
    //       organicFarmer.cottonTotalArea = convertArea(
    //         organicFarmer.cottonTotalArea,
    //         areaTypes.area
    //       );
    //     }
    //     if (organicFarmer.agriEstimatedYield) {
    //       organicFarmer.agriEstimatedYield = convertYield(
    //         organicFarmer.agriEstimatedYield,
    //         areaTypes.yield
    //       );
    //     }
    //     if (organicFarmer.agriEstimatedProd) {
    //       organicFarmer.agriEstimatedProd = convertWeight(
    //         organicFarmer.agriEstimatedProd,
    //         areaTypes.weight
    //       );
    //     }
    //     if (organicFarmer.totalEstimatedCotton) {
    //       organicFarmer.totalEstimatedCotton = convertWeight(
    //         organicFarmer.totalEstimatedCotton,
    //         areaTypes.weight
    //       );
    //     }
    //   });

    //   uploadData("upload-database/organic-farmer", jsonStructure);
    // }

    // if (
    //   selectedFileFormat === "farm_group_evaluation_data" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { farmGroupEvaluationData: jsonStructure };
    //   uploadData("upload-database/farm-group-evaluation-data", jsonData);
    // }

    // if (
    //   selectedFileFormat === "ics_quantity_estimation" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { icsQuantityEstimations: jsonStructure };
    //   uploadData("upload-database/ics-quantity-estimation", jsonData);
    // }

    // if (
    //   selectedFileFormat === "seed_testing_linkage" &&
    //   jsonStructure.length > 0 &&
    //   !errors.upload
    // ) {
    //   const jsonData = { seedTestingAndLinkages: jsonStructure };
    //   uploadData("upload-database/seed-testing-linkage", jsonData);
    // }

  //   if (
  //     selectedFileFormat === "seed_demand" &&
  //     jsonStructure.season && jsonStructure?.seedDemands?.length > 0 &&
  //     !errors.upload
  //   ) {
  //     uploadData("upload-database/seed-demand", jsonStructure);
  //   }

  //   if (
  //     selectedFileFormat === "seed_availability" &&
  //     jsonStructure.season && jsonStructure?.seedAvailabilities?.length > 0 &&
  //     !errors.upload
  //   ) {
  //     uploadData("upload-database/seed-availability", jsonStructure);
  //   }

  //   if (
  //     selectedFileFormat === "ics_name" &&
  //     jsonStructure.length > 0 &&
  //     !errors.upload
  //   ) {
  //     const jsonData = { icsNames: jsonStructure };
  //     uploadData("upload-database/ics-name", jsonData);
  //   }

  //   if (
  //     selectedFileFormat === "integrity_test" &&
  //     jsonStructure.length > 0 &&
  //     !errors.upload
  //   ) {
  //     const jsonData = { integrityTests: jsonStructure };
  //     uploadData("upload-database/integrity-test", jsonData);
  //   }
  };

  const convertArea = (value: any, unit: any) => {
    if (unit === "mu") {
      const res = value * 0.16;
      return res.toFixed(2);
    } else if (unit === "hectare") {
      const res = value * 2.47;
      return res.toFixed(2);
    } else {
      return value;
    }
  };

  const convertWeight = (value: any, unit: any) => {
    if (unit === "tons") {
      const res = value * 1000;
      return res.toFixed(2);
    } else {
      return value;
    }
  };

  const convertYield = (value: any, unit: any) => {
    if (unit === "hectare") {
      const res = value / 2.47;
      return res.toFixed(2);
    } else if (unit === "mu") {
      const res = value / 0.16;
      return res.toFixed(2);
    } else {
      return value;
    }
  };

  const handleFile = (buttonName: string) => {
    const selectedFormat = fileFormats.find(
      (format) => format.name === buttonName
    );
    if (selectedFormat) {
      handleDownload(
        selectedFormat.fileLink,
        selectedFormat.fileName,
        selectedFormat.fileType
      );
    } else {
      console.error("File format not found");
    }
  };

  const handleChange = (name?: any, value?: any) => {
    if (name === "country" || name === "state" || name === "district" || name === "taluk") {
      setVillageFormat((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));

      setErrors((prevError: any) => ({
        ...prevError,
        [name]: "",
      }));
    } else {
      setAreaTypes((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const convertNumericToDate = (numericValue: any) => {
    let date;
    if (typeof numericValue === "number") {
      date = new Date((numericValue - 25569) * 86400 * 1000);
    } else {
      date = numericValue;
      if (date.includes("/")) {
        if (date.includes("-")) {
          date = null;
        } else {
          const dateComponents = date.split("/");

          if (dateComponents.length !== 3) {
            date = null;
          }

          const firstComponent = parseInt(dateComponents[0], 10);
          const secondComponent = parseInt(dateComponents[1], 10);
          const year = parseInt(dateComponents[2], 10);

          if (isNaN(firstComponent) || isNaN(secondComponent) || isNaN(year)) {
            date = null;
          }

          if (firstComponent > 12) {
            if (firstComponent > 12 && firstComponent < 31) {
              date = new Date(year, secondComponent - 1, firstComponent);
            }
            else if (secondComponent > 12) {
              date = new Date(firstComponent, year - 1, secondComponent);
            }
            else {
              date = new Date(firstComponent, secondComponent - 1, year);
            }
          } else if (secondComponent > 12) {
            date = new Date(year, firstComponent - 1, secondComponent);
          } else {
            date = new Date(year, firstComponent - 1, secondComponent);
          }
        }
      } else if (date.includes("-")) {
        const dateComponents = date.split("-");

        if (dateComponents.length !== 3) {
          date = null;
        }

        const firstComponent = parseInt(dateComponents[0], 10);
        const secondComponent = parseInt(dateComponents[1], 10);
        const year = parseInt(dateComponents[2], 10);

        if (isNaN(firstComponent) || isNaN(secondComponent) || isNaN(year)) {
          date = null;
        }

        if (firstComponent > 12) {
          if (firstComponent > 12 && firstComponent < 31) {
            date = new Date(year, secondComponent - 1, firstComponent);
          }
          else if (secondComponent > 12) {
            date = new Date(firstComponent, year - 1, secondComponent);
          }
          else {
            date = new Date(firstComponent, secondComponent - 1, year);
          }
        } else if (secondComponent > 12) {
          date = new Date(year, firstComponent - 1, secondComponent);
        } else {
          date = new Date(year, firstComponent - 1, secondComponent);
        }
      }
    }
    return date;
  };

  const headerMapping: any = {
    "Program:": "program",
    "Brand:": "brand",
    "Farm Group:": "farmGroup",
    "Season:": "season",
    "Season": "season",
  };

  const preprocessHeader = (header: string) => {
    return header
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
  };

  // Function to validate the Excel headers against JSON keys
  const validateHeaders = (excelHeaders: any, expectedKeys: any) => {
    return excelHeaders.every((header: any) => expectedKeys.includes(header));
  };

  const excelToJson = async (event: any) => {
    const file = event.target?.files[0];

    if (!selectedFileFormat) {
      setErrors((prevError: any) => ({
        ...prevError,
        uploadType: "Select this field first",
      }));
      return false;
    }

    if (file) {
      const allowedFormats = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!allowedFormats.includes(file?.type)) {
        setErrors((prevError: any) => ({
          ...prevError,
          upload: `Invalid file format. Please upload a xlsx, csv or xls file.`,
        }));
        return false;
      }

      if (file.name) {
        setFileName(file.name);
      }

      if (selectedFileFormat === "farmers") {
        setIsSelected(true);
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const sheet: any = workbook.Sheets[sheetName];

          const headers: any = {};
          XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            range: 1,
          }).forEach((row: any) => {
            row.forEach((value: any, index: any) => {
              const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
              const mergedCell = sheet[cellAddress];
              if (!mergedCell || !mergedCell.m) {
                headers[cellAddress] = value;
              }
            });
          });

          const json: any = {};
          for (let row = 1; row <= 4; row++) {
            const headerCell = sheet["A" + row];
            const valueCell = sheet["B" + row];

            if (headerCell && valueCell) {
              const header = headerCell.v; // Remove extra spaces
              const value = valueCell.v;

              const key = headerMapping[header] || header;
              json[key] = value;
            }
          }

          const convertHeaderName = (header: string) => {
            const headerMappingsComplex: { [key: string]: string; } = {
              date_of_joining: "dateOfJoining",
              first_name: "firstName",
              last_name: "lastName",
              farmer_code: "farmerCode",
              riceVarierty: "riceVarierty",
              country: "country",
              state: "state",
              district: "district",
              talukblocktehsil: "block",
              certification_status: "certStatus",
              estimated_yield_kgac: "agriEstimatedYield",
              ics_name: "icsName",
              total_agriculture_area: "agriTotalArea",
              total_paddy_area: "paddyTotalArea",
              total_estimated_paddy: "totalEstimatedPaddy",
              total_estimated_production: "agriEstimatedProd",
              tracenet_id: "tracenetId",
              village: "village",
            };

            const preprocessedHeader =
              typeof header === "string" ? preprocessHeader(header) : ""; // Preprocess the header name

            return (headerMappingsComplex[preprocessedHeader] || preprocessedHeader);
          };

          const range = XLSX.utils.decode_range(sheet["!ref"]);
          const headersComplex = [];
          const rows = [];

          for (let C = range.s.c; C <= range.e.c && C < 11; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 4, c: C });
            const header = convertHeaderName(sheet[cellAddress]?.v); // Preprocess the header
            headersComplex.push(header);
          }

          for (let C = 11; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 5, c: C });
            const header = convertHeaderName(sheet[cellAddress]?.v); // Preprocess the header
            headersComplex.push(header);
          }

          for (let R = range.s.r + 6; R <= range.e.r; ++R) {
            const row: any = {};
            for (let C = 0; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              row[headersComplex[C]] = sheet[cellAddress]?.v || "";
            }
            rows.push(row);
          }

          const farmersData = rows;
          farmersData.forEach((farmer: any) => {
            if (farmer.dateOfJoining) {
              farmer.dateOfJoining = convertNumericToDate(farmer?.dateOfJoining);
            }
            farmer.certStatus = farmer?.certStatus;
            farmer.agriTotalArea =
              farmer?.agriTotalArea === "" ? 0 : farmer?.agriTotalArea;
            farmer.agriEstimatedYield =
              farmer?.agriEstimatedYield === ""
                ? 0
                : farmer?.agriEstimatedYield;
            farmer.paddyTotalArea =
              farmer?.paddyTotalArea === "" ? 0 : farmer?.paddyTotalArea;
            farmer.totalEstimatedPaddy =
              farmer?.totalEstimatedPaddy === ""
                ? 0
                : farmer?.totalEstimatedPaddy;
            farmer.agriEstimatedProd =
              farmer?.agriEstimatedProd === "" ? 0 : farmer?.agriEstimatedProd;
            farmer.farmerCode = farmer?.farmerCode?.toString();
          });

          const jsonData = {
            ...json,
            farmers: farmersData,
          };

          const expectedHeaders = [
            "sno",
            "dateOfJoining",
            "firstName",
            "lastName",
            "farmerCode",
            "rice_variety",
            "country",
            "state",
            "district",
            "block",
            "village",
            "agriTotalArea",
            "agriEstimatedYield",
            "agriEstimatedProd",
            "paddyTotalArea",
            "totalEstimatedPaddy",
            "tracenetId",
            "icsName",
            "certStatus",
          ];
          
          if (!validateHeaders(headersComplex, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
            setIsSelected(false);
            return false;
          } else {
            setJsonStructure(jsonData);
            setIsSelected(false);
            if (jsonData.length === 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return false;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } 
      // else if (selectedFileFormat === "organic_farmer") {
      //   setIsSelected(true);
      //   const reader = new FileReader();
      //   reader.onload = async (e: any) => {
      //     const data = new Uint8Array(e.target.result);
      //     const workbook = XLSX.read(data, { type: "array" });

      //     const sheetName = workbook.SheetNames[0];
      //     const sheet: any = workbook.Sheets[sheetName];

      //     const json: any = {};
      //     for (let row = 1; row <= 4; row++) {
      //       const headerCell = sheet["A" + row];
      //       const valueCell = sheet["B" + row];

      //       if (headerCell && valueCell) {
      //         const header = headerCell.v; // Remove extra spaces
      //         const value = valueCell.v;

      //         const key = headerMapping[header] || header;
      //         json[key] = value;
      //       }
      //     }

      //     const convertHeaderName = (header: string) => {
      //       const headerMappingsComplex: { [key: string]: string; } = {
      //         date_of_joining: "dateOfJoining",
      //         first_name: "firstName",
      //         last_name: "lastName",
      //         farmer_code: "farmerCode",
      //         country: "country",
      //         state: "state",
      //         district: "district",
      //         talukblocktehsil: "block",
      //         village: "village",
      //         total_agriculture_area: "agriTotalArea",
      //         estimated_yield_kgac: "agriEstimatedYield",
      //         total_estimated_production: "agriEstimatedProd",
      //         total_cotton_area: "cottonTotalArea",
      //         total_estimated_cotton: "totalEstimatedCotton",
      //         tracenet_id: "tracenetId",
      //         ics_name: "icsName",
      //         certification_status: "certStatus",
      //         cluster: "cluster",
      //         seed_packet_quantity: "seedPacketQuantity",
      //         variety: "variety",
      //         lot_no: "lotNo",
      //         date_of_distibution: "dateOfDistibution",
      //         source_of_seed_seed_company_producerany_other_specify: "sourceOfSeedSeedCompanyProducerAnyOtherSpecify"
      //       };

      //       const preprocessedHeader =
      //         typeof header === "string" ? preprocessHeader(header) : ""; // Preprocess the header name

      //       return (headerMappingsComplex[preprocessedHeader] || preprocessedHeader);
      //     };

      //     const range = XLSX.utils.decode_range(sheet["!ref"]);
      //     const headersComplex = [];
      //     const rows = [];

      //     for (let C = range.s.c; C <= range.e.c && C < 10; ++C) {
      //       const cellAddress = XLSX.utils.encode_cell({ r: 4, c: C });
      //       const header = convertHeaderName(sheet[cellAddress]?.v); // Preprocess the header
      //       headersComplex.push(header);
      //     }

      //     for (let C = 10; C <= range.e.c; ++C) {
      //       const cellAddress = XLSX.utils.encode_cell({ r: 5, c: C });
      //       const header = convertHeaderName(sheet[cellAddress]?.v); // Preprocess the header
      //       headersComplex.push(header);
      //     }

      //     for (let R = range.s.r + 6; R <= range.e.r; ++R) {
      //       const row: any = {};
      //       for (let C = 0; C <= range.e.c; ++C) {
      //         const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      //         row[headersComplex[C]] = sheet[cellAddress]?.v || "";
      //       }
      //       rows.push(row);
      //     }

      //     const organicFarmersData = rows;
      //     organicFarmersData.forEach((organicFarmer: any) => {
      //       if (organicFarmer.dateOfJoining) {
      //         organicFarmer.dateOfJoining = convertNumericToDate(organicFarmer.dateOfJoining);
      //       }
      //       if (organicFarmer.dateOfDistibution) {
      //         organicFarmer.dateOfDistibution = convertNumericToDate(organicFarmer.dateOfDistibution);
      //       }
      //       organicFarmer.certStatus = organicFarmer.certStatus;
      //       organicFarmer.agriTotalArea = organicFarmer?.agriTotalArea === "" ? 0 : organicFarmer?.agriTotalArea;
      //       organicFarmer.agriEstimatedYield = organicFarmer?.agriEstimatedYield === "" ? 0 : organicFarmer?.agriEstimatedYield;
      //       organicFarmer.cottonTotalArea = organicFarmer?.cottonTotalArea === "" ? 0 : organicFarmer?.cottonTotalArea;
      //       organicFarmer.totalEstimatedCotton = organicFarmer?.totalEstimatedCotton === "" ? 0 : organicFarmer?.totalEstimatedCotton;
      //       organicFarmer.agriEstimatedProd = organicFarmer?.agriEstimatedProd === "" ? 0 : organicFarmer?.agriEstimatedProd;
      //       organicFarmer.farmerCode = organicFarmer?.farmerCode.toString();
      //     });

      //     const jsonData = {
      //       ...json,
      //       organicFarmers: organicFarmersData,
      //     };

      //     const expectedHeaders = [
      //       "sno",
      //       "dateOfJoining",
      //       "firstName",
      //       "lastName",
      //       "farmerCode",
      //       "country",
      //       "state",
      //       "district",
      //       "block",
      //       "village",
      //       "agriTotalArea",
      //       "agriEstimatedYield",
      //       "agriEstimatedProd",
      //       "cottonTotalArea",
      //       "totalEstimatedCotton",
      //       "tracenetId",
      //       "icsName",
      //       "certStatus",
      //       "cluster",
      //       "seedPacketQuantity",
      //       "variety",
      //       "lotNo",
      //       "dateOfDistibution",
      //       "sourceOfSeedSeedCompanyProducerAnyOtherSpecify"
      //     ];

      //     if (!validateHeaders(headersComplex, expectedHeaders)) {
      //       setErrors((prevError: any) => ({
      //         ...prevError,
      //         upload: "Wrong Format.",
      //       }));
      //       setIsSelected(false);
      //       return false;
      //     } else {
      //       setJsonStructure(jsonData);
      //       setIsSelected(false);
      //       if (jsonData.organicFarmers.length === 0) {
      //         setErrors((prevError: any) => ({
      //           ...prevError,
      //           upload: "The file you selected is empty",
      //         }));
      //         return false;
      //       } else {
      //         setErrors((prevError: any) => ({
      //           ...prevError,
      //           upload: "",
      //         }));
      //       }
      //     }
      //   }
      //   reader.readAsArrayBuffer(file);
      // } else if (selectedFileFormat === "seed_demand") {
      //   setIsSelected(true);
      //   const reader = new FileReader();
      //   reader.onload = async (e: any) => {
      //     const data = new Uint8Array(e.target.result);
      //     const workbook = XLSX.read(data, { type: "array" });

      //     const sheetName = workbook.SheetNames[0];
      //     const sheet: any = workbook.Sheets[sheetName];

      //     const json: any = {};
      //     for (let row = 1; row <= 1; row++) {
      //       const headerCell = sheet["A" + row];
      //       const valueCell = sheet["B" + row];

      //       if (headerCell && valueCell) {
      //         const header = headerCell.v;
      //         const value = valueCell.v;

      //         const key = headerMapping[header] || header;
      //         json[key] = value;
      //       }
      //     }

      //     const convertHeaderName = (header: string) => {
      //       const headerMappingsComplex: { [key: string]: string; } = {
      //         project_name: "projectName",
      //         seed_company_name: "seedCompanyName",
      //         seed_variety: "seedVariety",
      //         numbers_of_packets: "numbersOfPackets",
      //         projects_location: "projectsLocation",
      //         suggestion_remark: "suggestionRemark"
      //       };

      //       const preprocessedHeader = typeof header === "string" ? preprocessHeader(header) : "";
      //       return (headerMappingsComplex[preprocessedHeader] || preprocessedHeader);
      //     };

      //     const range = XLSX.utils.decode_range(sheet["!ref"]);
      //     const headersComplex = [];
      //     const rows = [];

      //     for (let C = range.s.c; C <= range.e.c; ++C) {
      //       const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
      //       const header = convertHeaderName(sheet[cellAddress]?.v);
      //       headersComplex.push(header);
      //     }

      //     for (let R = range.s.r + 2; R <= range.e.r; ++R) {
      //       const row: any = {};
      //       for (let C = 0; C <= range.e.c; ++C) {
      //         const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      //         row[headersComplex[C]] = sheet[cellAddress]?.v || "";
      //       }
      //       rows.push(row);
      //     }

      //     const jsonData = {
      //       ...json,
      //       seedDemands: rows,
      //     };

      //     const expectedHeaders = [
      //       "sr_no",
      //       "projectName",
      //       "seedCompanyName",
      //       "seedVariety",
      //       "numbersOfPackets",
      //       "projectsLocation",
      //       "suggestionRemark"
      //     ];

      //     if (!validateHeaders(headersComplex, expectedHeaders)) {
      //       setErrors((prevError: any) => ({
      //         ...prevError,
      //         upload: "Wrong Format.",
      //       }));
      //       setIsSelected(false);
      //       return false;
      //     } else {
      //       setJsonStructure(jsonData);
      //       setIsSelected(false);
      //       if (!jsonData.season || jsonData.seedDemands.length === 0) {
      //         setErrors((prevError: any) => ({
      //           ...prevError,
      //           upload: "The file you selected is empty or missing some values",
      //         }));
      //         return false;
      //       } else {
      //         setErrors((prevError: any) => ({
      //           ...prevError,
      //           upload: "",
      //         }));
      //       }
      //     }
      //   }
      //   reader.readAsArrayBuffer(file);
      // } else if (selectedFileFormat === "seed_availability") {
      //   setIsSelected(true);
      //   const reader = new FileReader();
      //   reader.onload = async (e: any) => {
      //     const data = new Uint8Array(e.target.result);
      //     const workbook = XLSX.read(data, { type: "array" });

      //     const sheetName = workbook.SheetNames[0];
      //     const sheet: any = workbook.Sheets[sheetName];

      //     const json: any = {};
      //     for (let row = 1; row <= 1; row++) {
      //       const headerCell = sheet["A" + row];
      //       const valueCell = sheet["B" + row];

      //       if (headerCell && valueCell) {
      //         const header = headerCell.v;
      //         const value = valueCell.v;

      //         const key = headerMapping[header] || header;
      //         json[key] = value;
      //       }
      //     }

      //     const convertHeaderName = (header: string) => {
      //       const headerMappingsComplex: { [key: string]: string; } = {
      //         seed_company_name: "seedCompanyName",
      //         lot_no: "lotNo",
      //         variety: "variety",
      //         pkt450gm: "pkt450gm",
      //         state: "state"
      //       };

      //       const preprocessedHeader = typeof header === "string" ? preprocessHeader(header) : "";
      //       return (headerMappingsComplex[preprocessedHeader] || preprocessedHeader);
      //     };

      //     const range = XLSX.utils.decode_range(sheet["!ref"]);
      //     const headersComplex = [];
      //     const rows = [];

      //     for (let C = range.s.c; C <= range.e.c; ++C) {
      //       const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
      //       const header = convertHeaderName(sheet[cellAddress]?.v);
      //       headersComplex.push(header);
      //     }

      //     for (let R = range.s.r + 2; R <= range.e.r; ++R) {
      //       const row: any = {};
      //       for (let C = 0; C <= range.e.c; ++C) {
      //         const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      //         row[headersComplex[C]] = sheet[cellAddress]?.v || "";
      //       }
      //       rows.push(row);
      //     }

      //     const jsonData = {
      //       ...json,
      //       seedAvailabilities: rows,
      //     };

      //     const expectedHeaders = [
      //       "_sr_no",
      //       "seedCompanyName",
      //       "lotNo",
      //       "variety",
      //       "pkt450gm",
      //       "state"
      //     ];

      //     if (!validateHeaders(headersComplex, expectedHeaders)) {
      //       setErrors((prevError: any) => ({
      //         ...prevError,
      //         upload: "Wrong Format.",
      //       }));
      //       setIsSelected(false);
      //       return false;
      //     } else {
      //       setJsonStructure(jsonData);
      //       setIsSelected(false);
      //       if (!jsonData.season || jsonData.seedAvailabilities.length === 0) {
      //         setErrors((prevError: any) => ({
      //           ...prevError,
      //           upload: "The file you selected is empty or missing some values",
      //         }));
      //         return false;
      //       } else {
      //         setErrors((prevError: any) => ({
      //           ...prevError,
      //           upload: "",
      //         }));
      //       }
      //     }
      //   }
      //   reader.readAsArrayBuffer(file);
      // } 
      else {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any = XLSX.utils.sheet_to_json(sheet);

        const excelHeaders = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

        // if (selectedFileFormat === "villageData") {
        //   const newJsonStructure: any = jsonData.map((item: any) => ({
        //     village: item["Village Name"],
        //   }));

        //   const expectedHeaders = ["Sno", "Village Name"];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(newJsonStructure);
        //     if (newJsonStructure.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "garmentType") {
        //   const newJsonStructure: any = jsonData.map((item: any) => ({
        //     name: String(item["name"]),
        //   }));

        //   const expectedHeaders = ["id", "name"];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(newJsonStructure);
        //     if (newJsonStructure.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "ginnerOrder") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     season: item["Season"],
        //     uploadDate: item["Upload Date"],
        //     ginningMill: item["Ginning Mill"],
        //     brand: item["Brand"],
        //     program: item["Program"],
        //     confirmedBales: item["Confirmed No of Bags Order in Hand"],
        //     confirmedLintOrder: item["Confirmed Lint Order in Hand MT"],
        //   }));

        //   convertedData.forEach((data: any) => {
        //     if (data.uploadDate) {
        //       data.uploadDate = convertNumericToDate(data.uploadDate);
        //     }
        //   });

        //   const expectedHeaders = [
        //     "Season",
        //     "Upload Date",
        //     "Ginning Mill",
        //     "Brand",
        //     "Program",
        //     "Confirmed No of Bags Order in Hand",
        //     "Confirmed Lint Order in Hand MT",
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "ginnerExpectedSeed") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     season: item["Season"],
        //     ginningMill: item["Ginning Mill"],
        //     brand: item["Brand"],
        //     program: item["Program"],
        //     expectedSeedCotton: item["Expected Seed Cotton (KG)"],
        //     expectedLint: item["Expected Lint in MT"],
        //   }));

        //   const expectedHeaders = [
        //     "Season",
        //     "Ginning Mill",
        //     "Brand",
        //     "Program",
        //     "Expected Seed Cotton (KG)",
        //     "Expected Lint in MT",
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "styleMark") {
        //   const newJsonStructure: any = jsonData.map((item: any) => ({
        //     style_mark_no: String(item["style_mark_no"]),
        //   }));

        //   const expectedHeaders = ["id", "style_mark_no"];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(newJsonStructure);
        //     if (newJsonStructure.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        if (selectedFileFormat === "procurement") {
          const convertedData = jsonData.map((item: any) => ({
            season: item["Season"],
            date: item["Date"],
            farmerName: item["Farmer Name"],
            farmerCode: item["Farmer Code/ Tracenet Id"],
            country: item["Country"],
            state: item["State"],
            district: item["District"],
            block: item["Taluk/Block/Tehsil"],
            village: item["Village"],
            qtyPurchased: item["Qty. Purchased (Kg)"],
            rate: item["Rate (INR/Kg)"],
            grade: item["Grade"],
            totalAmount: item["Total Amount"],
            mandi: item["Mandi"],
            vehicle: item["Transport Vehicle"],
            paymentMethod: item["Payment Method"],
            riceVariety: item["Rice Variety"],
          }));
          convertedData.forEach((data: any) => {
            if (data.date) {
              data.date = convertNumericToDate(data.date);
            }
          });

          const expectedHeaders = [
            "Season",
            "Date",
            "Country",
            "State",
            "District",
            "Taluk/Block/Tehsil",
            "Village",
            "Farmer Name",
            "Farmer Code/ Tracenet Id",
            "Qty. Purchased (Kg)",
            "Rate (INR/Kg)",
            "Grade",
            "Total Amount",
            "Mandi",
            "Transport Vehicle",
            "Payment Method",
            "Rice Variety",
          ];

          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
            return false;
          } else {
            setJsonStructure(convertedData);
            if (convertedData.length === 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return false;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }

        // if (selectedFileFormat === "processor") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     name: item["name"],
        //     address: item["address"],
        //   }));

        //   const expectedHeaders = ["id", "name", "address"];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "procurement_price") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     transactionId: item["Transaction ID"],
        //     oldPrice: item["Old Price"],
        //     newPrice: item["New Price"],
        //   }));

        //   const expectedHeaders = ["Transaction ID", "Old Price", "New Price"];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "impactData") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     sNo: item["S.No"],
        //     village: item["Village"],
        //     reducedChemicalPesticide: item["Reduced chemical pesticide use by (%)"],
        //     reducedChemicalFertilizer: item["Reduced chemical fertilizer use by (%)"],
        //     reducedWater: item["Reduced water use by (%)"],
        //     increasedYield: item["Increased yield by (%)"],
        //     increasedInputCost: item["Reduced input costs by (%)"],
        //     increasedProfit: item["Increased profit by (%)"]
        //   }));

        //   const expectedHeaders = [
        //     "S.No",
        //     "Village",
        //     "Reduced chemical pesticide use by (%)",
        //     "Reduced chemical fertilizer use by (%)",
        //     "Reduced water use by (%)",
        //     "Increased yield by (%)",
        //     "Reduced input costs by (%)",
        //     "Increased profit by (%)"
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "farm_group_evaluation_data") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     sNo: item["S.No"],
        //     season: item["Season"],
        //     agronomist_name: item["Name of the Agronomist"],
        //     visit_from: item["Visit From"],
        //     visit_to: item["Visit To"],
        //     address: item["Address"],
        //     registration_details: item["Registration Details"],
        //     company_type: item["Type of Company"],
        //     parent_company_name: item["Name of parent company"],
        //     owner_name: item["Name of Owner/Directors/Trustees of Company"],
        //     establishment_year: item["Establishment year of organization"],
        //     district_project_presence: item["Districts where project has its presence"],
        //     program_type_by_organization: item["Type of programs undertaken by organization"],
        //     total_beneficiaries: item["Total beneficiaries with the programs"],
        //     brand: item["Brand"],
        //     farm_group_type: item["Farm group type(New/Existing)"],
        //     farm_group: item["Farm Group"],
        //     sustainable_cotton_program_type: item["Type of sustainable cotton programs undertaken"],
        //     total_no_farmers_in_organic_cotton: item["Total number of farmers in organic cotton programs"],
        //     program_wise_no_farmers_in_other_sustain_cotton_program: item["Program wise number of farmers in other sustainable cotton programs"],
        //     total_number_of_current_ics: item["Total number of current ICS"],
        //     cotton_variety_grown_in_program_areas: item["Cotton variety grown in program areas"],
        //     state: item["State"],
        //     district: item["District"],
        //     block: item["Taluka/ Block"],
        //     village: item["Village Name"],
        //     no_of_farmers_met: item["Number of farmers met"],
        //     scope_certificate_of_last_year_based_on_ics_score: (item["Scope certificates of last year based on the ICSs - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     scope_certificate_of_last_year_based_on_ics_action: item["Scope certificates of last year based on the ICSs - action"],
        //     farmer_field_dairy_score: (item["Farmer Field Diary or Organic Survey tools - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     farmer_field_dairy_action: item["Farmer Field Diary or Organic Survey tools - action"],
        //     farmer_training_attendence_register_score: (item["Farmer Training/Attendance Register - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     farmer_training_attendence_register_action: item["Farmer Training/Attendance Register - action"],
        //     demonstration_register_score: (item["Demonstration Register (optional) - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     demonstration_register_action: item["Demonstration Register (optional) - action"],
        //     farmers_are_aware_of_organization_score: (item["Farmers are aware of the organization - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     farmers_are_aware_of_organization_remarks: item["Farmers are aware of the organization - remark"],
        //     farmers_getting_support_of_any_kind_score: (item["Farmers getting support of any kind (trainings, inputs etc.) - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     farmers_getting_support_of_any_kind_remarks: item["Farmers getting support of any kind (trainings, inputs etc.) - remark"],
        //     frequency_of_selling_your_cotton_to_the_organization_score: (item["Frequency of selling your cotton to the organization - score"] || "").toLowerCase() === "always" ? 2 : (item["Frequency of selling your cotton to the organization - score"] || "").toLowerCase() === "sometimes" ? 1 : 0,
        //     frequency_of_selling_your_cotton_to_the_organization_remarks: item["Frequency of selling your cotton to the organization - remark"],
        //     farmers_associated_organic_program_score: (item["Are the farmers associated with Organic program - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     farmers_associated_organic_program_remarks: item["Are the farmers associated with Organic program - remark"],
        //     field_executive_support_by_imparing_knowledge_score: (item["Do the field executive support by imparting knowledge or providing suggestions to the farmers - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     field_executive_support_by_imparing_knowledge_remarks: item["Do the field executive support by imparting knowledge or providing suggestions to the farmers - remark"],
        //     farmers_knows_the_name_of_field_executive_score: (item["Do the farmers knows the name of the Field Executive of the ICS - score"] || "").toLowerCase() === "available" ? 1 : 0,
        //     farmers_knows_the_name_of_field_executive_remarks: item["Do the farmers knows the name of the Field Executive of the ICS - remark"],
        //     awareness_of_the_farmers_organic_practices_score: (item["Awareness of the farmers in organic practices - score"] || "").toLowerCase() === "high" ? 2 : (item["Awareness of the farmers in organic practices - score"] || "").toLowerCase() === "intermediate" ? 1 : 0,
        //     awareness_of_the_farmers_organic_practices_remarks: item["Awareness of the farmers in organic practices - remark"],
        //     awareness_of_the_farmers_regarding_organic_certification_score: (item["Awareness of the farmers regarding organic certification - score"] || "").toLowerCase() === "high" ? 2 : (item["Awareness of the farmers regarding organic certification - score"] || "").toLowerCase() === "intermediate" ? 1 : 0,
        //     awareness_of_the_farmers_regarding_organic_certification_remarks: item["Awareness of the farmers regarding organic certification -remark"]
        //   }));
        //   convertedData.forEach((data: any) => {
        //     if (data.visit_from) {
        //       data.visit_from = convertNumericToDate(data.visit_from);
        //     }
        //     if (data.visit_to) {
        //       data.visit_to = convertNumericToDate(data.visit_to);
        //     }
        //   });

        //   const expectedHeaders = [
        //     "S.No",
        //     "Season",
        //     "Name of the Agronomist",
        //     "Visit From",
        //     "Visit To",
        //     "Address",
        //     "Registration Details",
        //     "Type of Company",
        //     "Name of parent company",
        //     "Name of Owner/Directors/Trustees of Company",
        //     "Establishment year of organization",
        //     "Districts where project has its presence",
        //     "Type of programs undertaken by organization",
        //     "Total beneficiaries with the programs",
        //     "Brand",
        //     "Farm group type(New/Existing)",
        //     "Farm Group",
        //     "Type of sustainable cotton programs undertaken",
        //     "Total number of farmers in organic cotton programs",
        //     "Program wise number of farmers in other sustainable cotton programs",
        //     "Total number of current ICS",
        //     "Cotton variety grown in program areas",
        //     "State",
        //     "District",
        //     "Taluka/ Block",
        //     "Village Name",
        //     "Number of farmers met",
        //     "Scope certificates of last year based on the ICSs - score",
        //     "Scope certificates of last year based on the ICSs - action",
        //     "Farmer Field Diary or Organic Survey tools - score",
        //     "Farmer Field Diary or Organic Survey tools - action",
        //     "Farmer Training/Attendance Register - score",
        //     "Farmer Training/Attendance Register - action",
        //     "Demonstration Register (optional) - score",
        //     "Demonstration Register (optional) - action",
        //     "Farmers are aware of the organization - score",
        //     "Farmers are aware of the organization - remark",
        //     "Farmers getting support of any kind (trainings, inputs etc.) - score",
        //     "Farmers getting support of any kind (trainings, inputs etc.) - remark",
        //     "Frequency of selling your cotton to the organization - score",
        //     "Frequency of selling your cotton to the organization - remark",
        //     "Are the farmers associated with Organic program - score",
        //     "Are the farmers associated with Organic program - remark",
        //     "Do the field executive support by imparting knowledge or providing suggestions to the farmers - score",
        //     "Do the field executive support by imparting knowledge or providing suggestions to the farmers - remark",
        //     "Do the farmers knows the name of the Field Executive of the ICS - score",
        //     "Do the farmers knows the name of the Field Executive of the ICS - remark",
        //     "Awareness of the farmers in organic practices - score",
        //     "Awareness of the farmers in organic practices - remark",
        //     "Awareness of the farmers regarding organic certification - score",
        //     "Awareness of the farmers regarding organic certification -remark"
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "ics_quantity_estimation") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     sNo: item["S.No"],
        //     season: item["Season"],
        //     farm_group: item["Farm Group"],
        //     ics_name: item["ICS Name"],
        //     no_of_farmer: item["No.of farmers"],
        //     total_area: item["Total Area (Ha)"],
        //     est_cotton_area: item["Est. Cotton Area (Ha)"],
        //     estimated_lint: item["Estimated Lint (MT)"],
        //     verified_row_cotton: item["Verified volume by CB as per TC (RAW COTTON)"],
        //     verified_ginner: item["Verified volume by CB as per TC (GINNER)"],
        //     crop_current_season: item["Status for current season Crop (Organic/ NPOP/ IC2) - Add this in master"],
        //     organic_standard: item["Organic standard NPOP/NOP"],
        //     certification_body: item["Certification body"],
        //     scope_issued_date: item["Scope Issued Date"],
        //     scope_certification_validity: item["Scope certificate Validity / Lint avaibility in month"],
        //     scope_certification_no: item["Scope Certificate No."],
        //     nop_scope_certification_no: item["NOP Scope Certificate No."],
        //     district: item["Dist."],
        //     state: item["State"],
        //     remark: item["Remark "]
        //   }));
        //   convertedData.forEach((data: any) => {
        //     if (data.scope_issued_date) {
        //       data.scope_issued_date = convertNumericToDate(data.scope_issued_date);
        //     }
        //   });

        //   const expectedHeaders = [
        //     "S.No",
        //     "Season",
        //     "Farm Group",
        //     "ICS Name",
        //     "No.of farmers",
        //     "Total Area (Ha)",
        //     "Est. Cotton Area (Ha)",
        //     "Estimated Lint (MT)",
        //     "Verified volume by CB as per TC (RAW COTTON)",
        //     "Verified volume by CB as per TC (GINNER)",
        //     "Status for current season Crop (Organic/ NPOP/ IC2) - Add this in master",
        //     "Organic standard NPOP/NOP",
        //     "Certification body",
        //     "Scope Issued Date",
        //     "Scope certificate Validity / Lint avaibility in month",
        //     "Scope Certificate No.",
        //     "NOP Scope Certificate No.",
        //     "Dist.",
        //     "State",
        //     "Remark "
        //   ];

        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "seed_testing_linkage") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     sNo: item["Sr No. "],
        //     season: item["SEASON"],
        //     seed_company_name: item["Seed Company Name - Add in master"],
        //     lotno: item["Lot No."],
        //     variety: item["Variety"],
        //     packets: item["Available packets  (450 gm)"],
        //     district: item["Location Dist."],
        //     state: item["State"],
        //     testing_code: item["Testing Code"],
        //     seal_no: item["Seal No."],
        //     date_sending_sample: item["Date of Sending Sample to LAB"],
        //     date_of_report: item["Date Of  The Report "],
        //     report_no: item["Test Report No."],
        //     nos: item["NOS"],
        //     thirtyfives: item["35 S"],
        //     result_of_lab: item["Result of External Lab  (GMO)"],
        //     lab_master_name: item["Name of  lab - Master"]
        //   }));
        //   convertedData.forEach((data: any) => {
        //     if (data.date_sending_sample) {
        //       data.date_sending_sample = convertNumericToDate(data.date_sending_sample);
        //     }
        //     if (data.date_of_report) {
        //       data.date_of_report = convertNumericToDate(data.date_of_report);
        //     }
        //   });

        //   const expectedHeaders = [
        //     "Sr No. ",
        //     "SEASON",
        //     "Seed Company Name - Add in master",
        //     "Lot No.",
        //     "Variety",
        //     "Available packets  (450 gm)",
        //     "Location Dist.",
        //     "State",
        //     "Testing Code",
        //     "Seal No.",
        //     "Date of Sending Sample to LAB",
        //     "Date Of  The Report ",
        //     "Test Report No.",
        //     "NOS",
        //     "35 S",
        //     "Result of External Lab  (GMO)",
        //     "Name of  lab - Master"
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "ics_name") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     sNo: item["S.No"],
        //     farm_group: item["Farm Group"],
        //     ics_name: item["ICS Name"],
        //     latitude: item["Latitude"],
        //     longitude: item["Longitude"]
        //   }));

        //   const expectedHeaders = [
        //     "S.No",
        //     "Farm Group",
        //     "ICS Name",
        //     "Latitude",
        //     "Longitude"
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }

        // if (selectedFileFormat === "integrity_test") {
        //   const convertedData = jsonData.map((item: any) => ({
        //     sNo: item["Sr No"],
        //     season: item["Season"],
        //     date: item["Date"],
        //     brand: item["Brand"],
        //     stageOfTesting: item["Stage of Testing"],
        //     typeOfTest: item["Type of Test"],
        //     farmGroup: item["Farm Group"],
        //     icsName: item["ICS Name"],
        //     farmer: item["Farmer"],
        //     sealNo: item["Seal No"],
        //     tracenetId: item["Tracenet ID"],
        //     sampleCodeNo: item["Sample Code No "],
        //     seedLotNo: item["Seed Lot No "],
        //     integrityScore: item["Integrity Score"]
        //   }));
        //   convertedData.forEach((data: any) => {
        //     if (data.date) {
        //       data.date = convertNumericToDate(data.date);
        //     }
        //   });

        //   const expectedHeaders = [
        //     "Sr No",
        //     "Season",
        //     "Date",
        //     "Brand",
        //     "Stage of Testing",
        //     "Type of Test",
        //     "Farm Group",
        //     "ICS Name",
        //     "Farmer",
        //     "Seal No",
        //     "Tracenet ID",
        //     "Sample Code No ",
        //     "Seed Lot No ",
        //     "Integrity Score"
        //   ];
        //   if (!validateHeaders(excelHeaders, expectedHeaders)) {
        //     setErrors((prevError: any) => ({
        //       ...prevError,
        //       upload: "Wrong Format.",
        //     }));
        //     return false;
        //   } else {
        //     setJsonStructure(convertedData);
        //     if (convertedData.length === 0) {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "The file you selected is empty",
        //       }));
        //       return false;
        //     } else {
        //       setErrors((prevError: any) => ({
        //         ...prevError,
        //         upload: "",
        //       }));
        //     }
        //   }
        // }
      }
    }
  };

  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <NavLink href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>Services</li>
              <li>Upload Database</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-md p-4">
        <div className="w-100">
          <p className="text-sm font-semibold">
            Download these valid format excel sheets to use in upload
          </p>
          <div className="customFormSet mt-3">
            <div className="w-100">
              <div className="row">
                <div className="py-3 flex justify-left gap-6 flex-wrap">
                  <div className="flex items-center">
                    <button
                      name="farmers"
                      type="button"
                      onClick={() => handleFile("farmers")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Farmer Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      name="procurement"
                      type="button"
                      onClick={() => handleFile("procurement")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Procurement Format
                    </button>
                  </div>
                </div>
              </div>
              <div className=" text-sm flex items-center">
                <IoWarning size={18} />
                <p className="text-sm m-1">
                  Do not use cell formatting or formulas
                </p>
              </div>
              <hr className="my-4" />
              <div className="row mt-5">
                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Upload Type *
                  </label>
                  <Select
                    name="uploadType"
                    value={selectedFileFormat ? {
                      label: fileFormats?.find((file: any) => file.name === selectedFileFormat)?.fileName,
                      value: selectedFileFormat
                    } : null}
                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder="Select Upload Type"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={(fileFormats || []).map(({ id, fileName, name }: any) => ({
                      label: fileName,
                      value: name,
                      key: id
                    }))}
                    onChange={(item: any, e: any) => {
                      setSelectedFileFormat(item?.value || "");
                      setJsonStructure([]);
                      setVillageFormat({
                        country: "",
                        state: "",
                        district: "",
                        taluk: "",
                      });
                      setAreaTypes({
                        area: "Acre",
                        weight: "Kgs",
                        yield: "Per Acre",
                      });
                      setErrors({
                        uploadType: "",
                        upload: "",
                        country: "",
                        state: "",
                        district: "",
                        taluk: "",
                      });
                      setFileName("");
                    }}
                  />
                  {errors.uploadType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.uploadType}
                    </p>
                  )}
                </div>
              </div>

              {(
                selectedFileFormat === "" ||
                selectedFileFormat === "farmers" ||
                // selectedFileFormat === "organic_farmer" ||
                selectedFileFormat === "procurement" 
                // selectedFileFormat === "garmentType" ||
                // selectedFileFormat === "styleMark" ||
                // selectedFileFormat === "processor" ||
                // selectedFileFormat === "ginnerExpectedSeed" ||
                // selectedFileFormat === "ginnerOrder"
              ) && (
                  <>
                    {
                      selectedFileFormat !== "procurement" && (
                      // selectedFileFormat !== "ginnerExpectedSeed" && (
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Area Measured in *
                            </label>
                            {/* <Form.Select
                              aria-label="Country"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                              name="area"
                              value={ areaTypes.area || "" }
                              onChange={ (event) => handleChange(event) }
                            >
                              <option value="acre">Acre</option>
                              <option value="hectare">Hectare</option>
                              <option value="mu">Mu</option>
                            </Form.Select> */}
                            <Select
                              name="area"
                              value={areaTypes.area ? { label: areaTypes.area, value: areaTypes.area } : null}
                              menuShouldScrollIntoView={false}
                              placeholder="Select Area"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={[
                                { label: "Acre", value: "acre" },
                                { label: "Hectare", value: "hectare" },
                                { label: "Mu", value: "mu" }
                              ]}
                              onChange={(item: any) => {
                                handleChange("area", item?.label);
                              }}
                            />
                          </div>
                        </div>
                      )
                    }

                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Weight Measured in *
                        </label>
                        {/* <Form.Select
                              aria-label="Weight"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                              name="weight"
                              value={areaTypes.weight || ""}
                              onChange={(event) => handleChange(event)}
                            >
                              <option value="kgs">Kgs</option>
                              <option value="tons">Tons</option>
                            </Form.Select> */}
                        <Select
                          name="weight"
                          value={areaTypes.weight ? { label: areaTypes.weight, value: areaTypes.weight } : null}
                          menuShouldScrollIntoView={false}
                          placeholder="Select Weight"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={[
                            { label: "Kgs", value: "kgs" },
                            { label: "Tons", value: "tons" }
                          ]}
                          onChange={(item: any) => {
                            handleChange("weight", item?.label);
                          }}
                        />

                      </div>
                    </div>

                    {
                      (selectedFileFormat !== "procurement") && (
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Yield Estimated for
                            </label>
                            {/* <Form.Select
                            aria-label="Yield"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                            name="yield"
                            value={ areaTypes.yield || "" }
                            onChange={ (event) => handleChange(event) }
                          >
                            <option value="acre">Per Acre</option>
                            <option value="hectare">Per Hectare</option>
                            <option value="mu">Per Mu</option>
                          </Form.Select> */}
                            <Select
                              name="yield"
                              value={areaTypes.yield ? { label: areaTypes.yield, value: areaTypes.yield } : null}
                              menuShouldScrollIntoView={false}
                              placeholder="Select Yield"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={[
                                { label: "Per Acre", value: "acre" },
                                { label: "Per Hectare", value: "hectare" },
                                { label: "Per Mu", value: "mu" }
                              ]}
                              onChange={(item: any) => {
                                handleChange("yield", item?.label);
                              }}
                            />

                          </div>
                        </div>
                      )
                    }
                  </>
                )
              }

              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Upload Excel
                  </label>
                  <div className="inputFile">
                    <label>
                      Choose File <GrAttachment />
                      <input
                        type="file"
                        accept=".xlsx, .csv, .xls"
                        name="upload"
                        id="upload"
                        onChange={excelToJson}
                        onClick={(event: any) => {
                          event.currentTarget.value = null;
                        }}
                      />
                    </label>
                  </div>
                  {fileName && (
                    <div className="flex text-sm mt-1">
                      <GrAttachment />
                      <p className="mx-1">{fileName}</p>
                    </div>
                  )}
                  {errors.upload && (
                    <p className="text-red-500 text-sm mt-1">{errors.upload}</p>
                  )}
                </div>
              </div>
              {show && (
                <div className="flex justify-center items-center mt-5">
                  <p className="text-green-600 ">
                    Uploading Database, Please wait....
                  </p>
                </div>
              )}
              <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                <section>
                  <button
                    className="btn-purple mr-2"
                    disabled={isSelected}
                    style={
                      isSelected
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    onClick={handleSubmit}
                  >
                    {translations.common.submit}
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
