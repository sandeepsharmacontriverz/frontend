"use client";
import useTranslations from "@hooks/useTranslation";
import React, { useState, useEffect } from "react";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    toasterError,
    toasterSuccess,
} from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import Select from "react-select";
import { useSearchParams } from "next/navigation";

export default function page() {
    useTitle("Edit Process");
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const search = useSearchParams();
    const processId = search.get("id");

    const { loading } = useTranslations();
    const [Access, setAccess] = useState<any>({});

    const MandiId = User.MandiId;
    const [selectedProgram, setSelectedProgram] = useState("");

    const [season, setSeason] = useState<any>();
    const [program, setProgram] = useState<any>();
    const [from, setFrom] = useState<Date | null>(new Date());
    const [errors, setErrors] = useState<any>({});
    const [isSelected, setIsSelected] = useState<any>(true);
    const [isLoading, setIsLoading] = useState<any>(false);


    const riceQuality: any = [];

    for (let i = 1; i <= 14; i++) {
        riceQuality.push({
            id: i,
            riceQuality: 'Q' + i
        });
    }

    const [formData, setFormData] = useState<any>({
        programId: "",
        seasonId: null,
        date: new Date(),
        totalQty: null,
        noOfBales: null,
        got: null,
        riceQuality: "",
        lotNo: "",
        heapNumber: "",
        heapRegister: null,
        weighBridge: null,
        deliveryChallan: null,
        bagProcess: null,
        reelLotNno: "",
        pressNo: "",
    });

    const [fileName, setFileName] = useState({
        upload: "",
        heapRegister: "",
        weighBridge: "",
        deliveryChallan: "",
        bagProcess: "",
    });

    const requiredFields = ["seasonId", "date", "lotNo", "got", "upload",];
    useEffect(() => {
        if (MandiId) {
            fetchProcessesLength();
            getSeason();
            getProgram();
        }
    }, [MandiId]);

    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
            const access = checkAccess("Mandi Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);


    useEffect(() => {
        if (formData.programId) {
            const foundProgram = program?.find(
                (program: any) => program.id == formData.programId
            );
            if (foundProgram && foundProgram?.program_name?.toLowerCase() === "reel") {
                getReelLotNumber();
                setSelectedProgram("REEL");
            } else {
                setSelectedProgram("");
                setFormData((prev: any) => ({
                    ...prev,
                    reelLotNno: "",
                }));
            }
        }
    }, [program, formData.programId]);

    useEffect(() => {
        if (formData.totalQty) {
            setIsSelected(false);
        }
    }, [formData.totalQty]);

    const fetchProcessesLength = async () => {
        try {
            const res = await API.get(`mandi-process/get-mandi-process?id=${processId}`);
            if (res.success) {
                setFrom(new Date(res?.data?.date));
                setFormData({
                    programId: res?.data?.program_id,
                    seasonId: res?.data?.season_id,
                    date: new Date(res?.data?.date),
                    totalQty: res?.data?.total_qty,
                    noOfBales: res?.data?.no_of_bales,
                    got: res?.data?.gin_out_turn,
                    lotNo: res?.data?.lot_no,
                    heapNumber: res?.data?.heap_number,
                    heapRegister: res?.data?.heap_register,
                    weighBridge: res?.data?.weigh_bridge,
                    deliveryChallan: res?.data?.delivery_challan,
                    bagProcess: res?.data?.bag_process,
                    reelLotNno: res?.data?.reel_lot_no,
                    pressNo: res?.data?.press_no,
                    riceQuality: res?.data?.rice_quality

                })
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setFileName({
                    upload: "",
                    heapRegister: getFileId(res?.data?.heap_register),
                    weighBridge: getFileId(res?.data?.weigh_bridge),
                    deliveryChallan: getFileId(res?.data?.delivery_challan),
                    bagProcess: getFileId(res?.data?.bag_process),
                });

            }
        } catch (error) {
            console.log(error);
        }
    };

    const getReelLotNumber = async () => {
        const foundProgram = program?.find(
            (program: any) => program.id == formData.programId
        );
        if (foundProgram && foundProgram?.program_name?.toLowerCase() === "reel") {
            try {
                const res = await API.get(
                    `mandi-process/reel?mandiId=${MandiId}&programId=${formData.programId}`
                );
                if (res.success) {
                    setFormData((prev: any) => ({
                        ...prev,
                        reelLotNno: res.data?.id,
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const getSeason = async () => {
        try {
            const res = await API.get(`season?status=true`);
            if (res.success) {
                setSeason(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getProgram = async () => {
        try {
            const res = await API.get(
                `mandi-process/get-program?mandiId=${MandiId}`
            );
            if (res.success) {
                setProgram(res.data);
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
    };


    const handleChange = (name?: any, value?: any, event?: any) => {
        if (name === "programId" || name === "seasonId") {
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: Number(value),
            }));
        }
        else {
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: value,
            }));
        }
        setErrors((prevErrors: any) => ({
            ...prevErrors,
            [name]: "",
        }));
    };

    const onBlur = (e: any) => {
        const { name, value } = e.target;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;

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
    };

    const onCancel = () => {
        router.push("/mandi/mandi-process");
    };

    const validateField = (
        name: string,
        value: any,
        dataName: string,
        index: number = 0
    ) => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const valid = regexAlphaNumeric.test(formData.lotNo);

        if (dataName === "errors") {
            if (requiredFields.includes(name)) {
                switch (name) {
                    case "date":
                        return value === "" || value === null || value === undefined ? "Date is Required" : "";

                    case "lotNo":
                        return value === "" || value === null || value === undefined
                            ? "Lot No is Required"
                            : !valid
                                ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                                : "";
                    default:
                        return "";
                }
            }
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
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
            setIsSelected(true);
            setIsLoading(true)
            try {
                const response = await API.put("mandi-process", {
                    ...formData,
                    id: processId,
                    got: formData.got !== null && formData.got !== "" ? parseFloat(formData.got) : null,
                    MandiId: MandiId,
                });
                if (response.success) {
                    toasterSuccess("Process Edited Successfully ");
                    router.push("/mandi/mandi-process");
                } else {
                    setIsSelected(false);
                    setIsLoading(false)
                    toasterError(response.error.code, 3000, formData?.MandiId);
                }
            } catch (error) {
                setIsSelected(false);
                setIsLoading(false)
            }
        } else {
            return;
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
            <div>
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
                                <li>Edit Process</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-md p-4">
                        <div className="w-100 mt-4">
                            <div className="customFormSet">
                                <div className="w-100">
                                    <div className="row">
                                        <div className="borderFix pt-2 pb-2">
                                            <div className="row">
                                                <div className="col-12 col-sm-6  my-2">
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
                                                <div className="col-12 col-sm-6 my-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Season
                                                    </label>
                                                    <Select
                                                        name="seasonId"
                                                        value={formData.seasonId ? { label: season?.find((seasonId: any) => seasonId.id === formData.seasonId)?.name, value: formData.seasonId } : null}
                                                        menuShouldScrollIntoView={false}
                                                        isClearable
                                                        isDisabled
                                                        placeholder="Select Season"
                                                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                        options={(season || []).map(({ id, name }: any) => ({
                                                            label: name,
                                                            value: id,
                                                            key: id
                                                        }))}
                                                        onChange={(item: any) => {
                                                            handleChange("seasonId", item?.value);
                                                        }}
                                                    />
                                                    {errors?.seasonId !== "" && (
                                                        <div className="text-sm text-red-500">
                                                            {errors.seasonId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Program
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                {program?.map((program: any) => (
                                                    <label
                                                        className="mt-1 d-flex mr-4 align-items-center"
                                                        key={program.id}
                                                    >
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                name="programId"
                                                                disabled
                                                                checked={formData.programId === program.id}
                                                                value={program.id || ""}
                                                                onChange={() => handleChange("programId", program.id)}

                                                            />
                                                            <span></span>
                                                        </section>{" "}
                                                        {program.program_name}
                                                    </label>
                                                ))}
                                            </div>
                                            {errors?.programId !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.programId}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Total Quantity(Kg/MT)
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                readOnly
                                                name="totalQty"
                                                value={formData.totalQty || ""}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                No of Bags Produced
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                readOnly
                                                name="noOfBales"
                                                value={formData.noOfBales || ""}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Mandi Out Turn (MOT)
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                readOnly
                                                name="got"
                                                value={formData.got || ""}
                                                onChange={handleChange}
                                            />
                                            {errors?.got !== "" && (
                                                <div className="text-sm text-red-500">{errors.got}</div>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Lot No <span className="text-red-500">*</span>
                                            </label>

                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                placeholder="Lot No"
                                                onBlur={onBlur}
                                                name="lotNo"
                                                value={formData.lotNo || ""}
                                                onChange={(e) => handleChange("lotNo", e.target.value)}

                                            />
                                            {errors?.lotNo !== "" && (
                                                <div className="text-sm text-red-500">{errors.lotNo}</div>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Heap Number
                                            </label>

                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                placeholder="Heap Number"
                                                onBlur={onBlur}
                                                name="heapNumber"
                                                value={formData.heapNumber || ""}
                                                onChange={(e) => handleChange("heapNumber", e.target.value)}
                                                readOnly
                                            />
                                            {errors?.heapNumber !== "" && (
                                                <div className="text-sm text-red-500">{errors.heapNumber}</div>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Rice Quality <span className="text-red-500">*</span>
                                            </label>
                                         

                                            <Select
                                                name="riceQuality"
                                                isDisabled

                                                value={
                                                    formData.riceQuality
                                                        ? {
                                                            label: riceQuality?.find(
                                                                (riceQuality: any) =>
                                                                    riceQuality.riceQuality == formData.riceQuality
                                                            )?.riceQuality,
                                                            value: formData.riceQuality,
                                                        }
                                                        : null
                                                }
                                                menuShouldScrollIntoView={false}
                                                isClearable
                                                placeholder="Select Rice Quality"
                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                options={(riceQuality || []).map(({ id, name }: any) => ({
                                                    label: riceQuality,
                                                    value: riceQuality,
                                                    key: id
                                                }))}
                                                onChange={(item: any) => {
                                                    handleChange("riceQuality", item?.value);
                                                }}
                                            />

                                        </div>


                                        {selectedProgram == "REEL" && (
                                            <div className="col-sm-6  mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    REEL Lot No
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="text"
                                                    disabled
                                                    name="reelLotNno"
                                                    value={formData.reelLotNno}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        )}
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Upload Heap Register
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    Choose File <GrAttachment />
                                                    <input
                                                        type="file"
                                                        name="heapRegister"
                                                        accept="image/jpg, image/jpeg , image/png"
                                                        onChange={(e) => handleChange("heapRegister", e?.target?.files?.[0])}
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/png)
                                            </p>
                                            {fileName.heapRegister && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{fileName.heapRegister}</p>
                                                </div>
                                            )}
                                            {errors?.heapRegister !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.heapRegister}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Upload Weigh Bridge
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    Choose File <GrAttachment />
                                                    <input
                                                        name="weighBridge"
                                                        type="file"
                                                        accept="image/jpg, image/jpeg , image/png"
                                                        onChange={(e) => handleChange("weighBridge", e?.target?.files?.[0])}
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/png)
                                            </p>
                                            {fileName.weighBridge && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{fileName.weighBridge}</p>
                                                </div>
                                            )}
                                            {errors?.weighBridge !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.weighBridge}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Upload Delivery Challan
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    Choose File <GrAttachment />
                                                    <input
                                                        name="deliveryChallan"
                                                        type="file"
                                                        accept="image/jpg, image/jpeg , image/png"
                                                        onChange={(e) => handleChange("deliveryChallan", e?.target?.files?.[0])}
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/png)
                                            </p>
                                            {fileName.deliveryChallan && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{fileName.deliveryChallan}</p>
                                                </div>
                                            )}
                                            {errors?.deliveryChallan !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.deliveryChallan}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Upload Paddy Process
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    Choose File <GrAttachment />
                                                    <input
                                                        name="bagProcess"
                                                        type="file"
                                                        accept="image/jpg, image/jpeg , image/png"
                                                        onChange={(e) => handleChange("bagProcess", e?.target?.files?.[0])}
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/png)
                                            </p>
                                            {fileName.bagProcess && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{fileName.bagProcess}</p>
                                                </div>
                                            )}
                                            {errors?.bagProcess !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.bagProcess}
                                                </div>
                                            )}
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
                                            onClick={(e) => handleSubmit(e)}
                                        >
                                            SUBMIT
                                        </button>
                                        <button
                                            className="btn-outline-purple"
                                            onClick={() => onCancel()}
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
