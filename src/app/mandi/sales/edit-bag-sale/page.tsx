"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import { useRouter, } from "@lib/router-events";
import { toasterSuccess } from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

export default function page() {
    const { translations, loading } = useTranslations();
    const [roleLoading, hasAccess] = useRole();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();
    useTitle("Edit Sale");
    const [Access, setAccess] = useState<any>({});
    const [isSelected, setIsSelected] = useState<any>(true);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [from, setFrom] = useState<Date | null>(new Date());
    const [data, setData] = useState<any>({
        season: "",
        program: "",
        lot_no: "",
        shipping_address: "",
        total_qty: "",
        candy_rate: "",
        despatch_from: "",
        vehicle_no: "",
        buyerName: "",
    });

    const [errors, setErrors] = useState<any>({});

    const [fileName, setFileName] = useState({
        contractFiles: "",
        deliveryNotes: "",
        invoiceFile: [],
        lossData: "",
        uploadTC: "",
    });

    const [formData, setFormData] = useState<any>({
        date: new Date(),
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


    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
            const access = checkAccess("Mandi Sale");
            if (access) setAccess(access);
        }
    }, [roleLoading]);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await API.get(
                `mandi-process/sales/get-mandi-sale?id=${id}`
            );
            if (response.success) {
                setData(response.data?.mandi);
                setFrom(new Date(response?.data?.mandi?.date));
                setFormData({
                    weightLoss: response?.data?.mandi?.weight_loss,
                    date: new Date(response?.data?.mandi?.date),
                    saleValue: response?.data?.mandi?.sale_value,
                    invoiceNo: response?.data?.mandi?.invoice_no,
                    uploadTC: response?.data?.mandi?.tc_file,
                    contractFiles: response?.data?.mandi?.contract_file,
                    invoiceFile: response?.data?.mandi?.invoice_file,
                    deliveryNotes: response?.data?.mandi?.delivery_notes,
                    transporterName: response?.data?.mandi?.transporter_name,
                    vehicleNo: response?.data?.mandi?.vehicle_no,
                    lrblNo: response?.data?.mandi?.lrbl_no,
                })
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                const fileNames = response?.data?.mandi?.invoice_file.map((url: any) => {
                    const parts = url.split('/');
                    return parts[parts.length - 1];
                });
                setFileName({
                    contractFiles: getFileId(response?.data?.mandi?.contract_file),
                    deliveryNotes: getFileId(response?.data?.mandi?.delivery_notes),
                    invoiceFile: fileNames,
                    lossData: "",
                    uploadTC: getFileId(response?.data?.mandi?.tc_file),
                })
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const handleFrom = (date: any) => {
        let d = date ? new Date(date) : null;

        if (d) {
            d.setHours(d.getHours() + 5);
            d.setMinutes(d.getMinutes() + 30);
        }

        const newDate: any = d ? d.toISOString() : null;

        setFrom(d);
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            date: newDate,
        }));
    };
    const handleChange = (event: any) => {
        const { name, value, type } = event.target;
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
        }));
        setErrors((prevFormData: any) => ({
            ...prevFormData,
            [name]: "",
        }));

    };

    const onBlur = (e: any, type: string) => {
        const { name, value } = e.target;
        const regexAlphaNumeric = /^[().,\-/_a-zA-Z0-9 ]*$/;
        const regexAlphaNum = /^[()\-_a-zA-Z0-9 ]*$/;

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
        const regexAlphaNum = /^[()\-_a-zA-Z0-9 ]*$/;
        const newErrors = {} as Partial<any>;


        if (formData.date == null || formData.date == "" || formData.date == undefined) {
            newErrors.date = "Date is Required.";
        }
        if (!formData.invoiceNo) {
            newErrors.invoiceNo = "Invoice Number  is required.";
        } else {
            newErrors.invoiceNo = "";
        }

        if (!formData.vehicleNo) {
            newErrors.vehicleNo = "Vehicle Number is required.";
        } else {
            newErrors.vehicleNo = "";
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

        if (formData.vehicleNo) {
            const valid = regexAlphaNum.test(formData.vehicleNo);
            if (!valid) {
                newErrors.vehicleNo = "Accepts only AlphaNumeric";
            }
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validateForm();
        setErrors(newErrors);
        const hasErrors = Object.values(newErrors).some((error) => !!error);
        if (!hasErrors) {
            setIsLoading(true);
            const url = "mandi-process/sales/update";
            const mainFormData = {
                id: id,
                date: formData.date,
                invoiceNo: formData.invoiceNo,
                vehicleNo: formData.vehicleNo,
            };
            try {
                setIsSelected(false);
                const mainResponse = await API.put(url, mainFormData);
                if (mainResponse.success) {
                    toasterSuccess("Record updated successfully");
                    router.push(`/mandi/sales`);
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

    if (loading || roleLoading || isLoading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (!roleLoading && !Access?.edit) {
        return (
            <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
                <h3>You doesn't have Access of this Page.</h3>
            </div>
        );
    }

    if (!roleLoading && Access?.edit) {
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
                                        <NavLink href="/mandi/sales">Sale</NavLink>
                                    </li>
                                    <li>Edit Sale</li>
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
                                            value={data.season?.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-sm-12 col-md-4 col-lg-4  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            selected={from}
                                            maxDate={new Date()}
                                            dateFormat={"dd-MM-yyyy"}
                                            onChange={handleFrom}
                                            showYearDropdown
                                            placeholderText="Date"
                                            className="w-100 shadow-none h-11 rounded-md my-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                        />
                                        {errors.date && (
                                            <p className="text-red-500  text-sm mt-1">
                                                {errors.date}
                                            </p>
                                        )}
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
                                            Sale Value
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="number"
                                            name="saleValue"
                                            value={formData.saleValue}
                                            onBlur={(e) => onBlur(e, "numeric")}
                                            onChange={handleChange}
                                            placeholder="Sale Value"
                                            readOnly
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
                                            Upload TC's
                                        </label>
                                        <div className="inputFile">
                                            <label>
                                                Choose File <GrAttachment />
                                                <input
                                                    type="file"
                                                    accept=".jpg, .jpeg, .pdf, .zip"
                                                    name="uploadTC"
                                                    onChange={handleChange}
                                                    placeholder=" Upload TC's"
                                                    disabled
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
                                                    onChange={handleChange}
                                                    disabled
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
                                            Invoice Files
                                        </label>
                                        <div className="inputFile">
                                            <label>
                                                Choose File <GrAttachment />
                                                <input
                                                    name="invoiceFile"
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.zip, image/jpg, image/jpeg"
                                                    onChange={(event) => handleChange(event)}
                                                    disabled
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
                                            fileName.invoiceFile.map((item: any, index: any) => (
                                                <div className="flex text-sm mt-1" key={index}>
                                                    <GrAttachment />
                                                    <p className="mx-1">{item}</p>
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
                                                    onChange={handleChange}
                                                    disabled
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
                                            Transporter Name
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            name="transporterName"
                                            value={formData.transporterName}
                                            onBlur={(e) => onBlur(e, "alphabets")}
                                            onChange={handleChange}
                                            placeholder="Transporter Name "
                                            disabled
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
                                            LR/BL No
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            name="lrblNo"
                                            value={formData.lrblNo}
                                            onBlur={(e) => onBlur(e, "alphaNumeric")}
                                            onChange={handleChange}
                                            placeholder=" LR/BL No "
                                            disabled
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
                                onClick={handleSubmit}
                                style={
                                    !isSelected
                                        ? { cursor: "not-allowed", opacity: 0.8 }
                                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                                }
                                disabled={!isSelected}
                            >
                                SUBMIT
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
                </div>
            </>
        );
    }
}
