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
import Form from "react-bootstrap/Form";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select from "react-select";
import { useSearchParams } from "next/navigation";

export default function page() {
    useTitle("Edit Process");
    const searchParams = useSearchParams()
    const id: any = searchParams.get("id")
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [from, setFrom] = useState<Date | null>(new Date());
    const [Access, setAccess] = useState<any>({});
    const [data, setData] = useState<any>([])

    const [cottonMix, setCottonMix] = useState<any>([]);

    const [fabric, setFabric] = useState<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<any>({
        date: new Date(),
        garment_order_ref: "",
        brand_order_ref: "",
        fabricType: [],
        fabricLength: [],
        fabricGsm: [],
        batch_lot_no: "",
        total_fabric_length: 0,
        fabric_gsm: ""
    });

    const [errors, setErrors] = useState<any>({});
    const weaverId = User.LabId;

    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
            const access = checkAccess("Weaver Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);

    useEffect(() => {
        if (weaverId) {
            fetchProcess();
            getFabricType()
            getCottonMix()
        }
    }, [weaverId]);


    const fetchProcess = async () => {
        try {
            const response = await API.get(
                `weaver-process/process/get-process?id=${id}`
            );
            if (response.success) {
                const { fabric_gsm, fabrics, total_fabric_length, total_yarn_qty, garment_order_ref, batch_lot_no, brand_order_ref, date, blend_invoice, blend_document, ...restData } = response.data
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setFrom(new Date(response?.data?.date));
                setData({
                    ...restData,
                    date: date,
                    blend_document: blend_document.map((url: any) => url.split('/').pop()),
                    blend_invoice: getFileId(blend_invoice),
                    garment_order_ref: garment_order_ref,
                    brand_order_ref: brand_order_ref,
                    batch_lot_no: batch_lot_no,
                    total_yarn_qty: total_yarn_qty,
                    fabrics: fabrics,
                    total_fabric_length: total_fabric_length,
                    fabric_gsm: fabric_gsm,

                });
                setFormData({
                    ...restData,
                    date: date,
                    blend_document: blend_document.map((url: any) => url.split('/').pop()),
                    blend_invoice: getFileId(blend_invoice),
                    garment_order_ref: garment_order_ref,
                    brand_order_ref: brand_order_ref,
                    batch_lot_no: batch_lot_no,
                    total_yarn_qty: total_yarn_qty,
                    fabrics: fabrics,
                    total_fabric_length: total_fabric_length,
                    fabric_gsm: fabric_gsm,

                });
            }

        } catch (error) {
            console.error(error);
        }
    };

    const getFabricType = async () => {
        try {
            const res = await API.get(`fabric-type`);
            if (res.success) {
                setFabric(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const Total = data?.cottonmix_qty?.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0) || 0;


    const getCottonMix = async () => {
        try {
            const res = await API.get(`cottonmix`);
            if (res.success) {
                setCottonMix(res.data);
            }
        } catch (error) {
            console.log(error);
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
    const handleGsmChange = (index: any, e?: any) => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9,.\s]*$/;

        const updatedFabrics = [...formData.fabrics];
        const updateddata = [...formData.fabric_gsm];
        updatedFabrics[index].fabric_gsm = e.target.value;
        updateddata[index] = e.target.value;

        setFormData((prevData: any) => ({
            ...prevData,
            fabrics: updatedFabrics,
            fabric_gsm: updateddata
        }));
        const isValid = regexAlphaNumeric.test(e.target.value);

        setErrors((prevErrors: any) => ({
            ...prevErrors,
            [`fabric_gsm-${index}`]: !isValid ?
                "Accepts only AlphaNumeric values and special characters like comma(,),., _,-, ()"
                : e.target.value.trim() === "" ? "Fabric Gsm Is Required" : undefined,
        }));
    }

    const handleChange = (name?: any, value?: any, event?: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData: any) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prev: any) => ({
            ...prev,
            [name]: ""
        }));
    };

    const onBlur = (e: any, type: any) => {
        const { name, value } = e.target;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
        const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

        if (value != "" && type === "alphabets") {
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

        if (value != "" && type === "alphaNumeric") {
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

        if (value != "" && type == "numbers") {
            if (Number(value) <= 0) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "Value Should be more than 0",
                }));
            } else {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "",
                }));
            }
            return;
        }

        if (value != "" && type == "percentage") {
            if (Number(value) < 0 || Number(value) > 100) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "Percentage value should be in between 0 and 100",
                }));
            } else {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "",
                }));
            }
            return;
        }

        if (value != "" && type === "billNumbers") {
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

        if (value != "" && type == "numbers") {
            if (Number(value) <= 0) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "Value Should be more than 0",
                }));
            } else {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "",
                }));
            }
            return;
        }

        if (value != "" && type == "float") {
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
    };

    const requiredSpinnerFields = [
        "date",
        "garment_order_ref",
        "brand_order_ref",
        "batch_lot_no",
        "invoiceNo",
        "billOfLadding",
        "vehicleNo",
        "fabric_gsm"
    ];
    const validateField = (name: string, value: any) => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
        if (requiredSpinnerFields.includes(name)) {

            switch (name) {
                case "date":
                    return value === 0 || value === null || formData.date === undefined
                        ? "Date is Required"
                        : "";

                case "garment_order_ref":
                case "brand_order_ref":
                    return value.trim() === "" && !value
                        ? "This Field is Required"
                        : regexAlphaNumeric.test(value) === false
                            ? `Accepts only AlphaNumeric values and special characters like _,-,()`
                            : value.length > 50
                                ? "Value should not exceed 50 characters"
                                : "";

                case "batch_lot_no":
                    return value.trim() === ""
                        ? "Batch/Lot No is required"
                        : value.length > 20
                            ? "Value should not exceed 20 characters"
                            : regexBillNumbers.test(value) === false
                                ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                                : "";

                case "fabric_gsm":
                    return value.trim() === "" && !value
                        ? "Fabric Gsm is Required"
                        : regexAlphaNumeric.test(value) === false
                            ? `Accepts only AlphaNumeric values and special characters like _,-,()` : ""

                default:
                    return "";
            }
        }
    };

    const handleSubmit = async (event: any) => {
        const newWeaverErrors: any = { ...errors };
        const validationErrorGarmentOrderRef = validateField("garment_order_ref", formData?.garment_order_ref);
        const validationErrorBatchLotNo = validateField("batch_lot_no", formData?.batch_lot_no);
        const validationErrorBrandOrderRef = validateField("brand_order_ref", formData?.brand_order_ref);
        const validationErrorDate = validateField("date", formData?.date);

        const validationErrorFabricGsm: any[] = [];

        formData.fabrics.forEach((fabric: any, index: number) => {
            const fabricGsmError = validateField("fabric_gsm", fabric?.fabric_gsm);

            if (fabricGsmError) {
                validationErrorFabricGsm[index] = fabricGsmError;
                newWeaverErrors[`fabric_gsm-${index}`] = fabricGsmError;
                newWeaverErrors["garment_order_ref"] = validationErrorGarmentOrderRef
                newWeaverErrors["batch_lot_no"] = validationErrorBatchLotNo
                newWeaverErrors["date"] = validationErrorDate
                newWeaverErrors["brand_order_ref"] = validationErrorBrandOrderRef
            }
        });
        setErrors(newWeaverErrors);
        if (
            validationErrorGarmentOrderRef === "" &&
            validationErrorBatchLotNo === "" &&
            validationErrorBrandOrderRef === "" &&
            validationErrorDate === "" &&
            validationErrorFabricGsm.every((error) => error === "")
        ) {
            try {
                setIsSubmitting(true);
                const response = await API.put("weaver-process/process", {
                    garmentOrderRef: formData?.garment_order_ref,
                    brandOrderRef: formData?.brand_order_ref,
                    fabricGsm: formData.fabric_gsm,
                    id: id,
                    batchLotNo: formData?.batch_lot_no,
                    fabrics: formData.fabrics
                });

                if (response.success) {
                    toasterSuccess("Process Edited Successfully", 3000, id)
                    router.push("/weaver/weaver-process");
                } else {
                    setIsSubmitting(false);
                }
            } catch (error) {
                toasterError("An Error occurred.");
                setIsSubmitting(false);
            }
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
            <>
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
                                        <Link href="/weaver/weaver-process" className="active">
                                            Process
                                        </Link>
                                    </li>

                                    <li>Edit Process</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md p-4">
                        <div className="w-100 mt-4">
                            <div className="customFormSet">
                                <div className="w-100">
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-2">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Season
                                            </label>
                                            <Select
                                                name="seasonId"
                                                value={{ label: data.season?.name, value: data.season?.name }}
                                                menuShouldScrollIntoView={false}
                                                isClearable
                                                isDisabled
                                                placeholder="Select Season"
                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                            />

                                        </div>
                                        <div className="col-12 col-sm-6 mt-2" >
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Date  <span className="text-red-500">*</span>
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
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Garment Order Reference No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="garment_order_ref"
                                                value={formData?.garment_order_ref || ""}
                                                onChange={(e) => handleChange("garment_order_ref", e.target.value)}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                placeholder="Garment Order Reference No"
                                            />
                                            {errors.garment_order_ref && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.garment_order_ref}
                                                </p>
                                            )}
                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Brand Order Reference No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="brand_order_ref"
                                                value={formData.brand_order_ref || ""}
                                                onChange={(e) => handleChange("brand_order_ref", e.target.value)}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                placeholder="Brand Order Reference No"
                                            />
                                            {errors.brand_order_ref && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.brand_order_ref}
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
                                                Quantity in kgs
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="yarnQty"
                                                value={`${data.yarn_qty} Kgs` || `0 kgs`}
                                                type="text"
                                                disabled
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Additional Yarn Quantity(in kgs)
                                            </label>
                                            <input
                                                type="text"
                                                name="additionalYarnQty"
                                                placeholder="Weft Yarn Qty"
                                                disabled
                                                value={`${data.additional_yarn_qty} Kgs` || `0 kgs`}
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Do you want to blend?{" "}
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="blendChoosen"
                                                            checked={data.other_mix === true}
                                                            value="Yes"
                                                            disabled
                                                        />
                                                        <span></span>
                                                    </section>{" "}
                                                    Yes
                                                </label>
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="blendChoosen"
                                                            checked={data.other_mix === false}
                                                            disabled
                                                            value="No"
                                                        />
                                                        <span></span>
                                                    </section>{" "}
                                                    No
                                                </label>
                                            </div>

                                        </div>

                                        {data.other_mix === true && (
                                            <>
                                                <hr className="mt-4" />

                                                <div className="col-12 col-sm-12 mt-4 py-2 ">
                                                    <h5 className="font-semibold">Blending</h5>
                                                    <div className="row">
                                                        <div className="col-12 col-sm-3 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Blend Type
                                                            </label>
                                                        </div>

                                                        <div className="col-12 col-sm-3 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Blend Quantity
                                                            </label>
                                                        </div>

                                                    </div>

                                                    {data?.cottonmix_type?.length > 0 &&
                                                        data?.cottonmix_type.map(
                                                            (item: any, index: number) => {
                                                                const selectedCottonMix = cottonMix?.find(
                                                                    (mix: any) => mix.id === item
                                                                );
                                                                return (
                                                                    <div className="row py-2" key={selectedCottonMix?.id}>
                                                                        <div className="col-12 col-sm-3 ">
                                                                            <input
                                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                                type="text"
                                                                                value={selectedCottonMix?.cottonMix_name || "N/A"}
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div className="col-12 col-sm-3 ">
                                                                            <input
                                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                                type="text"
                                                                                value={data?.cottonmix_qty[index] || ""}
                                                                                disabled
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    <div className="flex gap-3 mt-2 px-2 py-1">
                                                        <div className="flex w-1/2">
                                                            <div className="w-1/2 text-sm">Total:</div>
                                                            <div className="w-1/2 text-sm">{Total}</div>
                                                        </div>
                                                    </div>
                                                    <hr className="mt-4" />
                                                </div>

                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium ">
                                                        Name of the Blending Material
                                                    </label>
                                                    <input
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        type="text"
                                                        onBlur={(e) => onBlur(e, "alphabets")}
                                                        placeholder="Name of the Blending Material"
                                                        name="blendMaterial"
                                                        value={data.blend_material || ""}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Blending Material Vendor Details
                                                    </label>
                                                    <textarea
                                                        className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        rows={3}
                                                        placeholder="Blending Material Vendor Details"
                                                        name="blendVendor"
                                                        value={data.blend_vendor || ""}
                                                        disabled
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                TTotal Yarn and Blend material Utilized (Kgs)
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                placeholder="Total Yarn and Blend material Utilized (Kgs)"
                                                name="total_yarn_qty"
                                                value={data.total_yarn_qty || ""}
                                            />
                                        </div>

                                        <hr className="mt-5" />
                                        <div className="row py-4">
                                            <div className="col-12 col-sm-3 mt-4 ">
                                                <label className="text-gray-500 text-[12px] font-medium ml-1">
                                                    Weaver Fabric Type
                                                </label>
                                            </div>

                                            <div className="col-12 col-sm-3 mt-4 ">
                                                <label className="text-gray-500 text-[12px] font-medium ">
                                                    Finished Fabric Length in Mts
                                                </label>
                                            </div>
                                            <div className="col-12 col-sm-3 mt-4 ml-2">
                                                <label className="text-gray-500 text-[12px] font-medium " >
                                                    Finished Fabric (GSM)    <span className="text-red-500">*</span>
                                                </label>
                                            </div>

                                            {data.fabric_type?.length > 0 &&
                                                data.fabric_type?.map((item: any, index: number) => {
                                                    return (
                                                        <div className="row py-2" key={index}>
                                                            <div className="col-12 col-sm-3 ">
                                                                <input
                                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                    type="text"
                                                                    value={fabric && fabric?.find((fab: any) => fab.id === item)?.fabricType_name || ''}
                                                                    disabled
                                                                />
                                                            </div>
                                                            <div className="col-12 col-sm-3">
                                                                <input
                                                                    className="ml-3 w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                    type="text"
                                                                    value={data?.fabric_length[index] || ""}
                                                                    disabled
                                                                />
                                                            </div>
                                                            <div className="col-12 col-sm-3">
                                                                <input
                                                                    className=" ml-3 w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                    type="text"
                                                                    name="fabric_gsm-${index}"
                                                                    value={formData?.fabrics[index]?.fabric_gsm || ""}
                                                                    onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                                    placeholder="Fabric Gsm"
                                                                    onChange={(event: any) => handleGsmChange(index, event)}
                                                                />
                                                                {errors?.[`fabric_gsm-${index}`] && (
                                                                    <p className="text-red-500 text-sm mt-1 ml-2">
                                                                        {errors[`fabric_gsm-${index}`]}
                                                                    </p>
                                                                )}
                                                            </div>

                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        <hr className="mt-4" />

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Total Finished Fabric Length(in Mts)
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="number"
                                                disabled
                                                placeholder="Total Finished Fabric Length"
                                                value={data.total_fabric_length || ""}
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Finished Batch/Lot No{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                placeholder="Batch/Lot No"
                                                name="batch_lot_no"
                                                onBlur={(e) => onBlur(e, "billNumbers")}
                                                value={formData.batch_lot_no || ""}
                                                onChange={(e) => handleChange("batch_lot_no", e.target.value)}
                                            />
                                            {errors.batch_lot_no && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.batch_lot_no}
                                                </p>
                                            )}
                                        </div>
                                        {data.program?.program_name?.toLowerCase() === "reel" &&
                                            <div className="col-12 col-sm-6  mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Fabric Reel Lot No
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="text"
                                                    placeholder="Fabric Reel Lot No"
                                                    disabled
                                                    value={data.reel_lot_no || ""}
                                                />

                                            </div>
                                        }
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Job details from garment
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                placeholder="Job details for Garment"
                                                disabled
                                                value={data.job_details_garment || ""}
                                            />

                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                No.of Rolls
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="number"
                                                placeholder="No.of Rolls"
                                                disabled
                                                value={data.no_of_rolls || ""}
                                            />

                                        </div>
                                    </div>
                                </div>

                                <hr className="mt-4" />
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold">DOCUMENTS:</h4>
                                    <div className="row">
                                        {data.other_mix && (
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Upload Blending Invoice
                                                </label>
                                                <div className="inputFile">
                                                    <label>
                                                        Choose File <GrAttachment />
                                                        <input
                                                            name="blend_invoice"
                                                            type="file"
                                                            accept=".pdf,.zip, image/jpg, image/jpeg"
                                                            disabled
                                                        />
                                                    </label>
                                                </div>
                                                <p className="py-2 text-sm">
                                                    (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                </p>
                                                {data.blend_invoice && (
                                                    <div className="flex text-sm mt-1">
                                                        <GrAttachment />
                                                        <p className="mx-1">{data.blend_invoice}</p>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Blending material other documents
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    Choose File <GrAttachment />
                                                    <input
                                                        name="blendDocuments"
                                                        type="file"
                                                        multiple
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>

                                            {data.blend_document &&
                                                data.blend_document.map((item: any, index: any) => (
                                                    <div className="flex text-sm mt-1" key={index}>
                                                        <GrAttachment />
                                                        <p className="mx-1">{item}</p>

                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                <hr className="mt-4" />
                                <div className="row">
                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Dyeing/Other Process Required?{" "}
                                        </label>
                                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        value="yes"
                                                        checked={data.dyeing_required === true}
                                                        disabled
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                Yes
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        value="no"
                                                        checked={data.dyeing_required === false}
                                                        disabled
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                No
                                            </label>
                                        </div>

                                    </div>

                                    {data.dyeing_required == true && (
                                        <>
                                            <hr className="mt-4" />
                                            <div className="mt-4">
                                                <h4 className="text-md font-semibold">
                                                    Dyeing/Other Process:
                                                </h4>
                                                <div className="row">
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Name of The Processor
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            disabled
                                                            name="processorName"
                                                            placeholder="Processor Name"
                                                            value={data.dyeing?.processor_name || ""}
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Address
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            placeholder="Address"
                                                            disabled
                                                            value={data.dyeing?.dyeing_address || ""}
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Name Process
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            name="processName"
                                                            disabled
                                                            placeholder="Process Name"
                                                            value={data.dyeing?.process_name || ""}
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Qty of Yarn Delivered
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            name="yarnDelivered"
                                                            value={data.dyeing?.yarn_delivered || 0}
                                                            type="text"
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Process Loss (%) If Any?
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="number"
                                                            name="processLoss"
                                                            disabled
                                                            placeholder="Process Loss (%) If Any?"
                                                            value={data.dyeing?.process_loss || ""}
                                                        />

                                                    </div>

                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Net Yarn Qty
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            disabled
                                                            value={data.dyeing?.net_yarn || 0}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                                            onClick={() => {
                                                router.push("/weaver/weaver-process");
                                            }}
                                        >
                                            CANCEL
                                        </button>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}