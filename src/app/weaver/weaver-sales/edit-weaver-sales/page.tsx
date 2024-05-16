"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select from "react-select";
import useTranslations from "@hooks/useTranslation";
import { useSearchParams } from "next/navigation";

export default function page() {
    const { translations } = useTranslations();

    useTitle("Edit Sales");
    const searchParams = useSearchParams()
    const id: any = searchParams.get("id")
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [Access, setAccess] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<any>([])
    const [from, setFrom] = useState<Date | null>(new Date());
    const [formData, setFormData] = useState<any>({
        date: new Date(),
        invoiceNo: "",
        vehicleNo: "",
    });

    const [errors, setErrors] = useState<any>({});

    const weaverId = User.LabId;
    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
            const access = checkAccess("Weaver Sale");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);


    useEffect(() => {
        if (weaverId) {
            fetchProcess()
        }
    }, [weaverId])


    const fetchProcess = async () => {
        try {
            const response = await API.get(
                `weaver-process/get-sale?salesId=${id}`
            );
            if (response.success) {
                const { fabricType, total_fabric_length, date, invoice_file, contract_file, delivery_notes, tc_file, batch_lot_no, vehicle_no, invoice_no, ...restData } = response.data

                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setFrom(new Date(response?.data?.date));

                setFormData({
                    invoiceNo: invoice_no,
                    date: date,
                    vehicleNo: vehicle_no,
                    batchLotNo: batch_lot_no,

                })
                setData({
                    ...restData,
                    contract_file: getFileId(contract_file),
                    delivery_notes: getFileId(delivery_notes),
                    invoice_file: invoice_file.map((url: any) => url.split('/').pop()),
                    tc_file: getFileId(tc_file),
                    date: date,
                    total_fabric_length: total_fabric_length,
                    fabricType: fabricType?.map((item: any) =>
                        item?.fabricType_name?.toString())
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
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
        setErrors((prev: any) => ({
            ...prev,
            date: "",
        }));
    };

    const handleChange = (name?: any, value?: any, event?: any) => {

        setFormData((prevData: any) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prev: any) => ({
            ...prev,
            [name]: "",
        }));
    };

    const onBlur = (e: any, type: any) => {
        const { name, value } = e.target;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;


        if (type === "alphaNumeric") {
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
        }

        if (type === "billNumbers") {
            const valid = regexBillNumbers.test(value);
            if (!valid) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]:
                        "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()",
                }));
            } else {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "",
                }));
            }
        }
    };

    const requiredWeaverFields = [
        "date",
        "invoiceNo",
        "vehicleNo",
    ];

    const validateField = (
        name: string,
        value: any,
        dataName: string,
        index: number = 0
    ) => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
        const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

        if (requiredWeaverFields.includes(name)) {
            switch (name) {
                case "date":
                    return value == "" || value == null || value == undefined
                        ? "Date is required" : ""

                case "invoiceNo":
                    return value.trim() === ""
                        ? "Invoice No is required"
                        : regexBillNumbers.test(value) === false
                            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                            : "";

                case "vehicleNo":
                    return value.trim() === ""
                        ? "Vehicle No is required"
                        : regexAlphaNumeric.test(value) === false
                            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                            : "";


                default:
                    return "";
            }
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const newWeaverErrors: any = {};

        Object.keys(formData).forEach((fieldName: string) => {
            newWeaverErrors[fieldName] = validateField(
                fieldName,
                formData[fieldName as keyof any],
                "weaver"
            );
        });

        const hasWeaversErrors = Object.values(newWeaverErrors).some(
            (error) => !!error
        );

        if (hasWeaversErrors) {
            setErrors(newWeaverErrors);
        }


        if (!hasWeaversErrors) {
            try {
                setIsSubmitting(true);
                const response = await API.put("weaver-process", {
                    date: formData.date,
                    invoiceNo: formData.invoiceNo,
                    vehicleNo: formData.vehicleNo,
                    id: id

                });
                if (response.success) {
                    toasterSuccess("Sales Edited Successfully", 3000, id);
                    router.push("/weaver/weaver-sales")

                } else {
                    setIsSubmitting(false);
                }
            } catch (error) {
                toasterError("An Error occurred.");
                setIsSubmitting(false);
            }
        } else {
            return;
        }
    };

    if (roleLoading || isSubmitting) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (!roleLoading && !Access?.create) {
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
                                <li>
                                    <Link href="/weaver/dashboard" className="active">
                                        <span className="icon-home"></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/weaver/weaver-sales" className="active">
                                        Sale
                                    </Link>
                                </li>
                                <li>Edit Sale</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md p-4">
                    <div className="w-100 mt-4">
                        <div className="customFormSet">
                            <div className="w-100">
                                <div className="row">
                                    <div className="col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Season
                                        </label>
                                        <Select
                                            name="seasonId"
                                            value={data.season?.name ? { label: data.season?.name, value: data.season?.name } : null}
                                            menuShouldScrollIntoView={false}
                                            isClearable
                                            isDisabled
                                            placeholder="Select Season"
                                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                        />

                                    </div>
                                    <div className=" col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            {translations?.transactions?.date} <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            selected={from ? from : null}
                                            dateFormat={"dd-MM-yyyy"}
                                            onChange={handleFrom}
                                            maxDate={new Date()}
                                            showYearDropdown
                                            className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                        />
                                        {errors.date && (
                                            <p className="text-red-500  text-sm mt-1">
                                                {errors.date}
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Program
                                        </label>
                                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                            <label
                                                className="mt-1 d-flex mr-4 align-items-center"
                                            >
                                                <section>
                                                    <input
                                                        disabled
                                                        type="radio"
                                                        checked={data?.program?.program_name || ""}
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                {data?.program?.program_name}

                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Quantity in Mts
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            value={`${data.total_fabric_length} Mts` || `0 Mts`}
                                            onChange={(event) => handleChange(event)}
                                            type="text"
                                            disabled
                                        />
                                    </div>

                                    <div className=" col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Garment Order Reference No
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            disabled
                                            value={data?.garment_order_ref || ""}
                                        />

                                    </div>
                                    <div className=" col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Brand Order Reference No
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            disabled
                                            value={data.brand_order_ref || ""}
                                        />

                                    </div>

                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Fabric Type Name
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            disabled
                                            value={data?.fabricType || ""}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            {translations?.knitterInterface?.ChooseBuyer}
                                        </label>
                                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        readOnly
                                                        value="Garment"
                                                        checked={data.buyer_type === "Garment"}
                                                    />
                                                    <span></span>
                                                </section>
                                                {translations?.knitterInterface?.Garment}
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        readOnly
                                                        checked={data.buyer_type === "Dyeing"}
                                                        value="Dyeing"
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                {translations?.knitterInterface?.Dying}
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        checked={data.buyer_type === "Washing"}
                                                        value="Washing"
                                                        readOnly
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                {translations?.knitterInterface?.Washing}
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        value="New Buyer"
                                                        checked={data.buyer_type === "New Buyer"}
                                                        readOnly
                                                    />
                                                    <span></span>
                                                </section>
                                                {translations?.knitterInterface?.newbuyer}
                                            </label>
                                        </div>

                                    </div>
                                    {data.buyer_type === "Garment" ? (
                                        <>
                                            <div className=" col-12 col-sm-6 mt-4 ">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.SelectGarment}{" "}
                                                </label>
                                                <Select
                                                    isDisabled
                                                    value={data.buyer?.name ? { label: data.buyer?.name, value: data.buyer?.name } : null}
                                                    menuShouldScrollIntoView={false}
                                                    isClearable
                                                    placeholder={translations?.common?.SelectGarment}
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                />
                                            </div>
                                        </>
                                    ) : data.buyer_type === "New Buyer" ? (
                                        <>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.ProcessorName}
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={data.processor_name || ""}
                                                    placeholder={translations?.common?.ProcessorName}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.address}{" "}
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={data.processor_address || ""}
                                                    placeholder={translations?.common?.address}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                        </>
                                    ) : data.buyer_type === "Dyeing" ? (
                                        <>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.Dying}
                                                </label>
                                                <Select
                                                    isDisabled
                                                    value={data.dyingwashing?.name ? { label: data.dyingwashing?.name, value: data.dyingwashing?.name } : null}
                                                    menuShouldScrollIntoView={false}
                                                    isClearable
                                                    placeholder={translations?.common?.SelectDying}
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                />
                                            </div>
                                        </>
                                    ) : data.buyer_type === "Washing" ? (
                                        <>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.Washing}
                                                </label>
                                                <Select
                                                    isDisabled
                                                    value={data.dyingwashing?.name ? { label: data.dyingwashing?.name, value: data.dyingwashing?.name } : null}
                                                    menuShouldScrollIntoView={false}
                                                    isClearable
                                                    placeholder={translations?.common?.SelectWashing}
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}

                                    <div className="col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            {translations?.common?.transactionViatrader}{" "}
                                        </label>
                                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        disabled
                                                        checked={data.transaction_via_trader === true}
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
                                                        disabled
                                                        checked={data.transaction_via_trader === false}
                                                        className="form-radio"
                                                    />
                                                    <span></span>
                                                </section>
                                                No
                                            </label>
                                        </div>
                                    </div>
                                    {data.transaction_via_trader === true && (
                                        <div className="col-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.agentDetails}{" "}
                                            </label>
                                            <textarea
                                                value={data.transaction_agent || ""}
                                                disabled
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                placeholder={translations?.common?.agentDetails}
                                                rows={3}
                                            />

                                        </div>
                                    )}

                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Finished Batch/Lot No
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            disabled
                                            value={formData.batchLotNo || ""}
                                        />

                                    </div>
                                </div>
                                <hr className="mt-4" />
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold">OTHER INFORMATION:</h4>
                                    <div className="row">
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Invoice No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="invoiceNo"
                                                value={formData.invoiceNo || ""}
                                                onChange={(event) => handleChange("invoiceNo", event.target.value)}
                                                onBlur={(e) => onBlur(e, "billNumbers")}
                                                type="text"
                                                placeholder="Invoice No *"
                                            />
                                            {errors.invoiceNo && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.invoiceNo}
                                                </p>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                LR/BL No
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                value={data.bill_of_ladding || ""}
                                                disabled
                                            />

                                        </div>
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Transporter Name
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                value={data.transporter_name || ""}
                                                type="text"
                                                disabled
                                            />

                                        </div>
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Vehicle No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="vehicleNo"
                                                value={formData.vehicleNo || ""}
                                                onChange={(event) => handleChange("vehicleNo", event.target.value)}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                type="text"
                                                placeholder="Vehicle No"
                                            />
                                            {errors.vehicleNo && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.vehicleNo}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <hr className="mt-4" />
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold">OTHER DOCUMENTS:</h4>
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.uploadtc}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}{" "}
                                                    <GrAttachment />
                                                    <input
                                                        type="file"
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>
                                            {data.tc_file && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{data.tc_file}</p>
                                                </div>
                                            )}

                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.ContractFiles}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}
                                                    <GrAttachment />
                                                    <input
                                                        type="file"
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>
                                            {data.contract_file && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{data.contract_file}</p>
                                                </div>
                                            )}

                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.invoice}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}
                                                    <GrAttachment />
                                                    <input
                                                        type="file"
                                                        multiple
                                                        disabled
                                                        accept=".pdf,.zip, image/jpg, image/jpeg"
                                                        onChange={(e) => handleChange("invoiceFile", e?.target?.files)}
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>

                                            {data.invoice_file &&
                                                data.invoice_file.map((item: any, index: any) => (
                                                    <div className="flex text-sm mt-1" key={index}>
                                                        <GrAttachment />
                                                        <p className="mx-1">{item}</p>

                                                    </div>
                                                ))}
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.DeliveryNotes}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}{" "}
                                                    <GrAttachment />
                                                    <input
                                                        type="file"
                                                        disabled

                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>
                                            {data.delivery_notes && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{data.delivery_notes}</p>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>

                                <hr className="mt-4" />
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
                                            onClick={() => router.push("/weaver/weaver-sales")}
                                        >
                                            CANCEL
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
}
