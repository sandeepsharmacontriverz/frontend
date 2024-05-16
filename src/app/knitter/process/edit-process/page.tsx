"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "@components/core/Loader";
import Link from "@components/core/nav-link";
import { GrAttachment } from "react-icons/gr";
import { toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import checkAccess from "@lib/CheckAccess";
import Select from "react-select";
import { useSearchParams } from "next/navigation";


export default function page() {
    const { translations, loading } = useTranslations();
    useTitle("Edit Process");
    const searchParams = useSearchParams()
    const id: any = searchParams.get("id")
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [Access, setAccess] = useState<any>({});
    const [data, setData] = useState<any>([])

    const [from, setFrom] = useState<Date | null>(new Date());
    const [cotton, setCotton] = useState<any>();
    const [fabric, setFabric] = useState<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const [formData, setFormData] = useState<any>({
        date: new Date(),
        brand_order_ref: "",
        garment_order_ref: "",
        fabric_type: [],
        knitWeight: [],
        fabricGsm: [],
        fabricWeight: [],
        batch_lot_no: "",
        fabrics: []
    });

    const knitterId = User.ThirdPartyInspectionId;

    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
            const access = checkAccess("Knitter Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);

    useEffect(() => {
        if (knitterId) {
            fetchSales()
            getKnitFabric()
            getCottonMix()
        }
    }, [knitterId])
    const getCottonMix = async () => {
        try {
            const res = await API.get("cottonmix");
            if (res.success) {
                setCotton(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getKnitFabric = async () => {
        try {
            const res = await API.get("fabric-type");
            if (res.success) {
                setFabric(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSales = async () => {
        try {
            const response = await API.get(
                `knitter-process/process/get-process?id=${id}`
            );

            if (response.success) {
                const { totalYarnQty, fabric_weight, fabric_type, date, batch_lot_no, blend_invoice, blend_document, garment_order_ref, brand_order_ref, fabric_gsm, fabrics, ...restData } = response.data
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setFrom(new Date(response?.data?.date));
                setData({
                    ...restData,
                    date: date,
                    garment_order_ref: garment_order_ref,
                    brand_order_ref: brand_order_ref,
                    fabric_gsm: fabric_gsm,
                    fabric_type: fabric_type,
                    fabric_weight: fabric_weight,
                    blend_document: blend_document?.map((url: any) => url.split('/').pop()),
                    blend_invoice: getFileId(blend_invoice),
                    fabrics: fabrics,
                    batch_lot_no: batch_lot_no,
                    totalYarnQty: totalYarnQty
                });
                setFormData({
                    ...restData,
                    date: date,
                    garment_order_ref: garment_order_ref,
                    brand_order_ref: brand_order_ref,
                    blend_document: blend_document?.map((url: any) => url.split('/').pop()),
                    blend_invoice: getFileId(blend_invoice),
                    fabric_gsm: fabric_gsm,
                    fabric_type: fabric_type,
                    fabrics: fabrics,
                    fabric_weight: fabric_weight,
                    batch_lot_no: batch_lot_no,
                    totalYarnQty: totalYarnQty
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
    const onBlur = (e: any, type: string) => {
        const { name, value } = e.target;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const errors = {};

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

    const validateForm = () => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const newErrors = {} as Partial<any>;

        if (!formData.garment_order_ref) {
            newErrors.garment_order_ref = "Garment Order Reference No is Required";
        }
        if (formData.date === "" || formData.date === null || formData.date === undefined) {
            newErrors.date = "Date is Required";
        }
        if (formData.garment_order_ref) {
            if (regexAlphaNumeric.test(formData.garment_order_ref) === false) {
                newErrors.garment_order_ref =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.garment_order_ref && errors.garment_order_ref) {
                newErrors.garment_order_ref = errors.garment_order_ref;
            }
        }

        if (formData.garment_order_ref && formData.garment_order_ref.length > 50) {
            newErrors.garment_order_ref = " Value should not exceed 50 characters";
        }
        if (!formData.brand_order_ref) {
            newErrors.brand_order_ref = "Brand Order Reference No is Required";
        }
        if (formData.brand_order_ref) {
            if (regexAlphaNumeric.test(formData.brand_order_ref) === false) {
                newErrors.brand_order_ref =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.brand_order_ref && errors.brand_order_ref) {
                newErrors.brand_order_ref = errors.brand_order_ref;
            }
        }
        if (formData.brand_order_ref && formData.brand_order_ref.length > 50) {
            newErrors.brand_order_ref = " Value should not exceed 50 characters";
        }

        if (!formData.batch_lot_no) {
            newErrors.batch_lot_no = "Batch Lot No is Required";
        }
        if (formData.batch_lot_no) {
            if (regexAlphaNumeric.test(formData.batch_lot_no) === false) {
                newErrors.batch_lot_no =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.batch_lot_no && errors.batch_lot_no) {
                newErrors.batch_lot_no = errors.batch_lot_no;
            }
        }

        formData.fabrics.forEach((fabric: any, index: any) => {
            if (fabric?.fabric_gsm.trim() === "") {
                newErrors[`fabric_gsm-${index}`] = "Fabric Gsm Is Required";
            }
            else if (!regexAlphaNumeric.test(fabric?.fabric_gsm)) {
                newErrors[`fabric_gsm-${index}`] = "Accepts only AlphaNumeric values and special characters like comma(,),., _,-, ()";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            const url = "knitter-process/process";
            const mainFormData = {
                id: id,
                date: formData?.date,
                garmentOrderRef: formData.garment_order_ref,
                brandOrderRef: formData.brand_order_ref,
                fabricGsm: formData.fabric_gsm,
                batchLotNo: formData.batch_lot_no,
                fabrics: formData.fabrics
            };
            const mainResponse = await API.put(url, mainFormData);
            if (mainResponse.success) {
                toasterSuccess(
                    "Process Updated Successfully",
                    3000,
                    mainFormData.id
                );
                setIsSubmitting(false);
                router.push("/knitter/process");
            }
        } else {
            setIsSubmitting(false);
        }
    };

    const Total = data?.cottonmix_qty?.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0) || 0;

    if (loading || roleLoading || isSubmitting) {
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
                                    <li>
                                        <Link href="/knitter/dashboard" className="active">
                                            <span className="icon-home"></span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/knitter/process">
                                            {translations?.knitterInterface?.Process}
                                        </Link>
                                    </li>
                                    <li>
                                        Edit Process
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md p-4">
                        <div className="w-100">
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
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.GarmentOrderReference} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="garment_order_ref"
                                                value={formData?.garment_order_ref || ""}
                                                onChange={(e) => handleChange("garment_order_ref", e.target.value)}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                placeholder={
                                                    translations?.knitterInterface?.GarmentOrderReference
                                                }
                                            />
                                            {errors.garment_order_ref && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.garment_order_ref}
                                                </p>
                                            )}
                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.BrandOrderReference} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="brand_order_ref"
                                                value={formData.brand_order_ref || ""}
                                                onChange={(e) => handleChange("brand_order_ref", e.target.value)}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                placeholder={
                                                    translations?.knitterInterface?.BrandOrderReference
                                                }
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
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.Quantity}
                                            </label>
                                            <input
                                                name="quantChooseYarn"
                                                value={data?.yarn_qty + " Kgs" || ""}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                disabled

                                            />
                                        </div>


                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.AdditionalYarn}
                                            </label>
                                            <input
                                                value={data?.additional_yarn_qty + " Kgs" || ""}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.wantblend}{" "}
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="blend"
                                                            disabled
                                                            checked={data.other_mix === true}
                                                            value="Yes"
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
                                                            name="blend"
                                                            disabled
                                                            checked={data.other_mix === false}
                                                            value="No"
                                                            className="form-radio"
                                                        />
                                                        <span></span>
                                                    </section>
                                                    No
                                                </label>
                                            </div>

                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.TotalUtil}
                                            </label>
                                            <input
                                                name="totalQty"
                                                value={data?.total_yarn_qty + " Kgs" || ""}
                                                type="text"
                                                placeholder="totalQty"
                                                readOnly
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>
                                    </div>

                                    {data.other_mix === true && (
                                        <>
                                            <hr className="mt-4" />

                                            <div className="col-12 col-sm-12 mt-4 py-2 ">
                                                <h5 className="font-semibold">
                                                    {translations?.knitterInterface?.Blending}
                                                </h5>
                                                <div className="row">
                                                    <div className="col-12 col-sm-3 mt-4 ml-2">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.cotton}{" "}
                                                        </label>
                                                    </div>

                                                    <div className="col-12 col-sm-3 mt-4 ml-2">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.quantity}{" "}
                                                        </label>
                                                    </div>

                                                    {data?.cottonmix_type?.length > 0 &&
                                                        data?.cottonmix_type?.map(
                                                            (item: any, index: number) => {
                                                                const selectedCottonMix = cotton?.find(
                                                                    (mix: any) => mix.id === item
                                                                );
                                                                return (
                                                                    <div className="row py-2" key={index}>
                                                                        <div className="col-12 col-sm-3 ml-1">
                                                                            <input
                                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                                type="text"
                                                                                value={selectedCottonMix?.cottonMix_name || "N/A"}
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div className="col-12 col-sm-3 ml-1">
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
                                                            <div className="w-1/2 text-sm ml-2">
                                                                {translations?.knitterInterface?.total}:
                                                            </div>
                                                            <div className="w-1/2 ml-2">{Total}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr className="mt-4" />
                                            </div>
                                        </>
                                    )}
                                    {data.other_mix === true && (
                                        <>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.blendmaterial}{" "}
                                                    </label>
                                                    <input
                                                        name="blendMaterial"
                                                        value={data.blend_material || ""}
                                                        type="text"
                                                        readOnly
                                                        placeholder={
                                                            translations?.knitterInterface?.blendmaterial
                                                        }
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />

                                                </div>
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.vendor}{" "}
                                                    </label>
                                                    <textarea
                                                        name="vendorDetails"
                                                        value={data.blend_vendor || ""}
                                                        readOnly
                                                        placeholder={translations?.knitterInterface?.vendor}
                                                        rows={3}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />
                                                </div>
                                            </div>
                                            <hr className="mt-5" />
                                        </>
                                    )}

                                    <div className="row">
                                        <div className="col-12 col-sm-3 mt-4 ">
                                            <label className="text-gray-500 text-[12px] font-medium ml-1">
                                                Knit Fabric Type
                                            </label>
                                        </div>

                                        <div className="col-12 col-sm-3 mt-4 ">
                                            <label className="text-gray-500 text-[12px] font-medium ml-4">
                                                Finished Fabric Net Weight
                                            </label>
                                        </div>
                                        <div className="col-12 col-sm-3 mt-4 ml-2">
                                            <label className="text-gray-500 text-[12px] font-medium ">
                                                Finished Fabric Gsm  <span className="text-red-500">*</span></label>
                                        </div>
                                        {data?.fabric_type?.length > 0 &&
                                            data?.fabric_type?.map((item: any, index: number) => {
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
                                                                value={data?.fabric_weight[index]}
                                                                disabled
                                                            />
                                                        </div>
                                                        <div className="col-12 col-sm-3">

                                                            <input
                                                                className=" ml-3 w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                type="text"
                                                                name="fabric_gsm"
                                                                value={formData?.fabrics[index]?.fabric_gsm || ""}
                                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                                placeholder="Fabric Gsm"
                                                                onChange={(event: any) => handleGsmChange(index, event)}
                                                            />
                                                            {errors?.[`fabric_gsm-${index}`] && errors?.[`fabric_gsm-${index}`] !== "" && (
                                                                <p className="text-red-500 text-sm mt-1 ml-2">
                                                                    {errors[`fabric_gsm-${index}`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.TotalFab}
                                            </label>
                                            <input
                                                name="totalfabric"
                                                value={data?.total_fabric_weight ? data?.total_fabric_weight + " Kgs" : 0 + " Kgs" || ""}
                                                type="text"
                                                readOnly
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.FinishedBatch}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="batch_lot_no"
                                                value={formData.batch_lot_no || ""}
                                                onBlur={(e) => onBlur(e, "bill")}
                                                onChange={(e) => handleChange("batch_lot_no", e.target.value)}
                                                type="text"
                                                placeholder={translations?.knitterInterface?.FinishedBatch}
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                            {errors.batch_lot_no && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.batch_lot_no}
                                                </p>
                                            )}
                                        </div>
                                        {data.program?.program_name?.toLowerCase() === 'reel' &&
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.FabricReelLotNo}
                                                </label>
                                                <input
                                                    name="reelLotNo"
                                                    value={data.reel_lot_no || ""}
                                                    type="text"
                                                    readOnly
                                                    placeholder={translations?.knitterInterface?.FabricReelLotNo}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                        }

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.JobDetailsfromgarments}
                                            </label>
                                            <input
                                                value={data.job_details_garment || ""}
                                                type="text"
                                                disabled
                                                placeholder={
                                                    translations?.knitterInterface?.JobDetailsfromgarments
                                                }
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />

                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.rolls}{" "}
                                            </label>
                                            <input
                                                value={data.no_of_rolls || ""}
                                                disabled
                                                type="number"
                                                placeholder={translations?.knitterInterface?.rolls}
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />

                                        </div>
                                    </div>
                                    <hr className="mt-4" />
                                    <p className="font-bold py-2 mt-4">DOCUMENTS:</p>
                                    <div className="row">
                                        {data.other_mix === true && (
                                            <>
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.uploadblend}
                                                    </label>
                                                    <div className="inputFile">
                                                        <label>
                                                            {translations?.knitterInterface?.ChooseFile}{" "}
                                                            <GrAttachment />
                                                            <input
                                                                name="blendInvoice"
                                                                type="file"
                                                                disabled
                                                                accept=".pdf,.zip, image/jpg, image/jpeg"
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

                                            </>
                                        )}
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.blendother}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}
                                                    <GrAttachment />
                                                    <input
                                                        name="blendDocuments"
                                                        type="file"
                                                        multiple
                                                        disabled
                                                        accept=".pdf,.zip, image/jpg, image/jpeg"
                                                        onChange={(e) => handleChange("blendDocuments", e?.target?.files)}
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>

                                            {data.blend_document &&
                                                data.blend_document?.map((item: any, index: any) => (
                                                    <div className="flex text-sm mt-1" key={index}>
                                                        <GrAttachment />
                                                        <p className="mx-1">{item}</p>
                                                        <div className="w-1/3">

                                                        </div>
                                                    </div>
                                                ))}

                                        </div>
                                        <hr className="mt-4" />
                                        <div className="row">
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.DyeingOther}{" "}
                                                </label>
                                                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                    <label className="mt-1 d-flex mr-4 align-items-center">
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                disabled
                                                                checked={data.dyeing_required === true}
                                                                value="Yes"
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
                                                                checked={data.dyeing_required === false}
                                                                value="No"
                                                            />
                                                            <span></span>
                                                        </section>
                                                        No
                                                    </label>
                                                </div>
                                            </div>

                                            {data.dyeing_required === true && (
                                                <>
                                                    <hr className="mt-4" />
                                                    <div className="row mt-2">
                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.knitterInterface?.nameProcess}{" "}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                disabled
                                                                name="processorName"
                                                                value={data.dyeing?.processor_name || ""}
                                                                placeholder={
                                                                    translations?.knitterInterface?.nameProcess
                                                                }
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.common?.address}{" "}
                                                            </label>

                                                            <input
                                                                type="text"
                                                                name="address"
                                                                disabled
                                                                value={data.dyeing?.dyeing_address || ""}
                                                                placeholder={translations?.common?.address}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.knitterInterface?.dyeingName}{" "}
                                                            </label>

                                                            <input
                                                                type="text"
                                                                name="nameProcess"
                                                                disabled
                                                                value={data.dyeing?.process_name || ""}
                                                                placeholder={
                                                                    translations?.knitterInterface?.dyeingName
                                                                }
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-sm font-medium text-gray-700"></label>
                                                            <input
                                                                type="text"
                                                                name="yarnDelivery1"
                                                                disabled
                                                                value={data.total_fabric_weight || 0}
                                                                onChange={(e) => handleChange("yarnDelivery1", e.target.value)}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                readOnly
                                                            />
                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.knitterInterface?.processloss}{" "}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="processLoss"
                                                                disabled
                                                                value={data.dyeing?.process_loss || ""}
                                                                placeholder={
                                                                    translations?.knitterInterface?.processloss
                                                                }
                                                                onChange={(e) => handleChange("processLoss", e.target.value)}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4 mb-5">
                                                            <label className="text-sm font-medium text-gray-700"></label>
                                                            <input
                                                                type="text"
                                                                name="yarnDeliveryFinal"
                                                                value={data?.dyeing?.net_yarn || ""}
                                                                onChange={(e) => handleChange("yarnDeliveryFinal", e.target.value)}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <hr className="mt-5 mb-5" />
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
                                        {translations?.common?.submit}
                                    </button>
                                    <button
                                        className="btn-outline-purple"
                                        onClick={() => { router.push("/knitter/process") }}
                                    >
                                        {translations?.common?.cancel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
