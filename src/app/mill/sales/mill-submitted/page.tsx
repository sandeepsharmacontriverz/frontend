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

  const [isSelected, setIsSelected] = useState<any>(true);
  const [isLoading, setIsLoading] = useState<any>(false);


  const [showPreview, setShowPreview] = useState<any>(false);
  const [errors, setErrors] = useState<any>({});
  const [jsonStructure, setJsonStructure] = useState<any>(null);

  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);




  const fetchData = async () => {
    try {
      const response = await API.get(
        `mill-process/sales/get-sale?id=${id}`
      );
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [fileName, setFileName] = useState({
    analysisReport: "",
    contractBasisEmployee: "",
    dailyPackingReport: "",
    dryerOutput: "",
    employeeOnPayroll: "",
    entryQualityAnalysis: "",
    grn: "",
    hodiKatai: "",
    inProcess: "",
    invoiceForPo: "",
    labourBill: "",
    leasePremisesExpenses: "",
    plantAnalysisReport: "",
    productionSchedule: "",
    purchaseOrder: "",
    salariedEmployeeExpensesFrl: "",
    truckInwardDetails: ""
  });

  const [formData, setFormData] = useState<any>({
    analysisReport: null,
    contractBasisEmployee: null,
    dailyPackingReport: null,
    dryerOutput: null,
    employeeOnPayroll: null,
    entryQualityAnalysis: null,
    grn: null,
    hodiKatai: null,
    inProcess: null,
    invoiceForPo: null,
    labourBill: null,
    leasePremisesExpenses: null,
    plantAnalysisReport: null,
    productionSchedule: null,
    purchaseOrder: null,
    salariedEmployeeExpensesFrl: null,
    truckInwardDetails: null,
  });


  const handleChange = async(event: any) => {
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
        if (!allowedFormats.includes(files[0]?.type)) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: "Invalid file format.Upload a valid Format",
          }));

          files[0].value = "";
          return;
        }

        const maxFileSize = 5 * 1024 * 1024;

        if (files[0].size > maxFileSize) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: `File size exceeds the maximum limit (5MB).`,
          }));

          files[0].value = "";
          return;
        }

        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
      
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

  const validateForm = () => {
    const newErrors = {} as Partial<any>;

    if (!formData.analysisReport) {
      newErrors.analysisReport = "Analysis Report is required.";
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
      const url = "mill-process/sales";
 console.log(formData)
      try {
        setIsSelected(false);
        const mainResponse = await API.put(url, {
          ...formData,
          id: Number(id) 
      });
        if (mainResponse.success) {
          toasterSuccess("Record updated successfully");
          router.push(`/mill/sales`);
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
                    <NavLink href="/mill/dashboard">
                      <span className="icon-home"></span>
                    </NavLink>
                  </li>
                  <li>
                    {" "}
                    <NavLink href="/mill/sales">Sale</NavLink>
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
                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.season?.name || ''}
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
                      value={data.containermanagement?.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    No of Containers
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.no_of_containers}
                      onChange={handleChange}
                    />
                  </div>

                  
                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                   Container Name
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.container_name}
                      onChange={handleChange}
                    />
                  </div>

                  
                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Container No
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.container_no}
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
                      placeholder="total qty"
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Lot No
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data?.batch_lot_no}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Reel Lot No
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data?.reel_lot_no}
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
                      value={data.invoice_no}
                      name="invoiceNo"
                      disabled
                      onChange={handleChange}
                      placeholder=" Invoice Number "
                    />
                
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Transporter Name
                    </label>
                    <textarea
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      value={data.transporter_name}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Price/Kg
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Dispatch Date
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      value={data.dispatch_date?.substring(0, 10)}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="vehicleNo"
                      disabled
                      value={data.vehicle_no}
                      onChange={handleChange}
                      placeholder=" Vehicle Number "
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      LR/BL No <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="lrblNo"
                      disabled
                      value={data.bill_of_ladding}
                      onChange={handleChange}
                      placeholder=" LR/BL No "
                    />
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Analysis Report <span className="text-red-500">*</span>
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="analysisReport"
                          onChange={handleChange}
                          placeholder="Analysis Report"
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.analysisReport && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.analysisReport}</p>
                      </div>
                    )}
                    {errors.analysisReport && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.analysisReport}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Contract Basis Employees FRL
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="contractBasisEmployee"
                          placeholder="Contract Basis Employee"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.contractBasisEmployee && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.contractBasisEmployee}</p>
                      </div>
                    )}
                    {errors.contractBasisEmployee && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.contractBasisEmployee}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Daily Packing Report
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="dailyPackingReport"
                          placeholder=" Daily Packing Report"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.dailyPackingReport && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.dailyPackingReport}</p>
                      </div>
                    )}
                    {errors.dailyPackingReport && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.dailyPackingReport}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Dryer Output
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="dryerOutput"
                          placeholder="Dryer Output"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.dryerOutput && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.dryerOutput}</p>
                      </div>
                    )}
                    {errors.dryerOutput && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.dryerOutput}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Employee On Pay-Roll
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="employeeOnPayroll"
                          placeholder="employeeOnPayroll"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.employeeOnPayroll && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.employeeOnPayroll}</p>
                      </div>
                    )}
                    {errors.employeeOnPayroll && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.employeeOnPayroll}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Entry Quality Analysis
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="entryQualityAnalysis"
                          placeholder="Entry Quality Analysis"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.entryQualityAnalysis && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.entryQualityAnalysis}</p>
                      </div>
                    )}
                    {errors.entryQualityAnalysis && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.entryQualityAnalysis}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    GRN
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="grn"
                          placeholder="grn"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.grn && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.grn}</p>
                      </div>
                    )}
                    {errors.grn && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.grn}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Hodi Katai
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="hodiKatai"
                          placeholder="Hodi Katai"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.hodiKatai && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.hodiKatai}</p>
                      </div>
                    )}
                    {errors.hodiKatai && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.hodiKatai}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    In Process
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="inProcess"
                          placeholder="In Process"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.inProcess && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.inProcess}</p>
                      </div>
                    )}
                    {errors.inProcess && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.inProcess}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Invoice For PO
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="invoiceForPo"
                          placeholder="Invoice For PO"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.invoiceForPo && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.invoiceForPo}</p>
                      </div>
                    )}
                    {errors.invoiceForPo && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.invoiceForPo}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Labour Bill
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="labourBill"
                          placeholder="Labour Bill"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.labourBill && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.labourBill}</p>
                      </div>
                    )}
                    {errors.labourBill && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.labourBill}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Lease Premises Expenses
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="leasePremisesExpenses"
                          placeholder="Lease Premises Expenses"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.leasePremisesExpenses && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.leasePremisesExpenses}</p>
                      </div>
                    )}
                    {errors.leasePremisesExpenses && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.leasePremisesExpenses}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Plant Analysis Report
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="plantAnalysisReport"
                          placeholder="Plant Analysis Report"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.plantAnalysisReport && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.plantAnalysisReport}</p>
                      </div>
                    )}
                    {errors.plantAnalysisReport && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.plantAnalysisReport}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Production Schedule
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="productionSchedule"
                          placeholder="Production Schedule"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.productionSchedule && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.productionSchedule}</p>
                      </div>
                    )}
                    {errors.productionSchedule && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.productionSchedule}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Purchase Order (Software Version)
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="purchaseOrder"
                          placeholder="Purchase Order (Software Version)"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.purchaseOrder && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.purchaseOrder}</p>
                      </div>
                    )}
                    {errors.purchaseOrder && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.purchaseOrder}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Salaried Employee Expenses FRL
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="salariedEmployeeExpensesFrl"
                          placeholder="Salaried Employee Expenses FRL"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.salariedEmployeeExpensesFrl && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.salariedEmployeeExpensesFrl}</p>
                      </div>
                    )}
                    {errors.salariedEmployeeExpensesFrl && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.salariedEmployeeExpensesFrl}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                    Truck Inward Details
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .zip"
                          name="truckInwardDetails"
                          placeholder="Truck Inward Details"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm">
                      (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                    </p>
                    {fileName.truckInwardDetails && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName.truckInwardDetails}</p>
                      </div>
                    )}
                    {errors.truckInwardDetails && (
                      <div className="text-red-500 text-sm mt-1 ">
                        {errors.truckInwardDetails}
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
                onClick={() => router.push("/mill/sales")}
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
              data4={data.containermanagement?.name}
              data8_label={"Total Quantity(Kg/MT) : "}
              data8={data.total_qty}
              data9_file_label={"Lot No  :"}
              data9={data?.batch_lot_no}
              data1_file_OR_txt_label={"Analysis Report : "}
                      data1_single_file={
                        formData?.analysisReport ? [formData?.analysisReport] : null
                      }
              data2_file_OR_txt_label={"Contract Basis Employee : "}
              data2_single_file={
                formData?.contractBasisEmployee ? [formData?.contractBasisEmployee] : null
              }
              data3_file_OR_txt_label={"Daily Packing Report : "}
              data3_single_file={
                formData?.dailyPackingReport ? [formData?.dailyPackingReport] : null
              }
              data4_file_OR_txt_label={"Dryer Output: "}
              data4_single_file={
                formData?.dryerOutput ? [formData?.dryerOutput] : null
              }
              array_img_label={"Employee On Payroll : "}
              array_img={
                formData?.employeeOnPayroll
                  ? [formData?.employeeOnPayroll]
                  : null
              }
              array2_img_label={"Entry Quality Analysis: "}
              array2_img={
                formData?.entryQualityAnalysis
                  ? [formData?.entryQualityAnalysis]
                  : null
              }
              
              array3_img_label={"GRN: "}
              array3_img={
                formData?.grn
                  ? [formData?.grn]
                  : null
              }
              array4_img_label={"Hodi Katai: "}
              array4_img={
                formData?.hodiKatai
                  ? [formData?.hodiKatai]
                  : null
              }
              array5_img_label={"In Process: "}
              array5_img={
                formData?.inProcess
                  ? [formData?.inProcess]
                  : null
              }
              array6_img_label={"Invoice For PO: "}
              array6_img={
                formData?.invoiceForPo
                  ? [formData?.invoiceForPo]
                  : null
              }
              array7_img_label={"Labour Bill: "}
              array7_img={
                formData?.labourBill
                  ? [formData?.labourBill]
                  : null
              }
              array8_img_label={"Lease Premises Expenses: "}
              array8_img={
                formData?.leasePremisesExpenses
                  ? [formData?.leasePremisesExpenses]
                  : null
              }
              array9_img_label={"Plant Analysis Report: "}
              array9_img={
                formData?.plantAnalysisReport
                  ? [formData?.plantAnalysisReport]
                  : null
              }
              array10_img_label={"Production Schedule: "}
              array10_img={
                formData?.productionSchedule
                  ? [formData?.productionSchedule]
                  : null
              }
              array11_img_label={"Purchase Order: "}
              array11_img={
                formData?.purchaseOrder
                  ? [formData?.purchaseOrder]
                  : null
              }
              array12_img_label={"Salaried Employee ExpensesFrl: "}
              array12_img={
                formData?.salariedEmployeeExpensesFrl
                  ? [formData?.salariedEmployeeExpensesFrl]
                  : null
              }
              array13_img_label={"Truck Inward Details: "}
              array13_img={
                formData?.truckInwardDetails
                  ? [formData?.truckInwardDetails]
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
