"use client";

import useTranslations from "@hooks/useTranslation";
import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { handleDownload, FileDownloadProps } from "@components/core/Download";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import * as XLSX from "xlsx";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { GrAttachment } from "react-icons/gr";
import Loader from "@components/core/Loader";

export default function page() {
  useTitle("Upload Linen");
  const [roleLoading] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [jsonStructure, setJsonStructure] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [isSelected, setIsSelected] = useState<any>(false);

  const [errors, setErrors] = useState<any>({
    upload: "",
  });

  const uploadData = async (url: any, data: any) => {
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
        router.push(`/services/upload-linen/upload-status`);
      } else {
        setIsSelected(false);
      }
    } catch (error) {
      console.log(error);
      setIsSelected(false);
    }
  };

  const handleSubmit = () => {
    if (jsonStructure?.length > 0) {
      const jsonData = {
        linen: jsonStructure,
      };
      uploadData("linen/upload-bulk-linens", jsonData);
    }
  };

  const fileProps: FileDownloadProps = {
    fileLink: "/files/Linen-upload-format.xlsx",
    fileName: "Linen Format",
    fileType: "xlsx",
  };
  const handleFile = () => {
    handleDownload(fileProps.fileLink, fileProps.fileName, fileProps.fileType);
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

  const validateHeaders = (excelHeaders: any, expectedKeys: any) => {
    return excelHeaders.every((header: any) => expectedKeys.includes(header));
  };

  const excelToJson = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name) {
        setFileName(file.name);
      }

      const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData: any = XLSX.utils.sheet_to_json(sheet);
      const excelHeaders =
        jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

      const convertedData = jsonData.map((item: any) => ({
        season: item["Harvest"],
        farmerNo: item["Farmer No"],
        farmerName: item["Farmer Name"],
        country: item["Country"],
        town: item["Town"],
        farmerDepartment: item["Farmer Department"],
        area: item["Area"],
        linenVariety: item["Linen Variety"],
        cooperativeName: item["Name of Cooperative"],
        noOfBales: item["Number of raw bales"],
        farmLotNo: item["Farm Lot Number"],
        totalWeight: item["Total weight (raw)"],
        scutchDate: item["Date of scutching"],
        scutchingLotNo: item["Scutching Lot No"],
        balesAfterScutching: item["No of Bags (After scutching)"],
        weightAfterScutching: item["Total weight(After Scutching)"],
        shipmentDate: item["Date of shipment"],
        shipmentDetails: item["Shipment Details BL/ Invoice/ Receipt No/"],
        shipedTo: item["Shipped to"],
      }));

      convertedData.forEach((data: any) => {
        if (data.scutchDate) {
          data.scutchDate = convertNumericToDate(data.scutchDate);
        }
        if (data.shipmentDate) {
          data.shipmentDate = convertNumericToDate(data.shipmentDate);
        }
      });

      const expectedHeaders = [
        "Harvest",
        "Farmer No",
        "Farmer Name",
        "Country",
        "Town",
        "Farmer Department",
        "Area",
        "Linen Variety",
        "Name of Cooperative",
        "Number of raw bales",
        "Farm Lot Number",
        "Total weight (raw)",
        "Date of scutching",
        "Scutching Lot No",
        "No of Bags (After scutching)",
        "Total weight(After Scutching)",
        "Date of shipment",
        "Shipment Details BL/ Invoice/ Receipt No/",
        "Shipped to",
      ];

      if (!validateHeaders(excelHeaders, expectedHeaders)) {
        setErrors((prevError: any) => ({
          ...prevError,
          upload: "Invalid Format.",
        }));
      } else {
        setJsonStructure(convertedData);
        if (convertedData.length == 0) {
          setErrors((prevError: any) => ({
            ...prevError,
            upload: "The file you selected is empty",
          }));
          return;
        } else {
          setErrors((prevError: any) => ({
            ...prevError,
            upload: "",
          }));
        }
      }
    }
  };
  if (loading) {
    return <div> <Loader /></div>;
  }
  if (!roleLoading) {
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
                <li>Upload Linen</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-md p-4">
          <div className="w-100">
            <div className="py-3">
              <p className="text-sm font-semibold mb-2 flex justify-end">
                Download these valid format excel sheets to use in upload
              </p>
              <div className="flex justify-end items-center">
                <button
                  type="button"
                  onClick={handleFile}
                  className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                >
                  <FaDownload className="mr-2" />
                  Linen Format
                </button>
              </div>
            </div>
            <hr className="my-4" />
            <div className="customFormSet mt-3">
              <div className="w-100">
                <div className="row mt-5">
                  <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Upload Excel *
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          name="upload"
                          id="upload"
                          onChange={excelToJson}
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.upload}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
    );
  }
}
