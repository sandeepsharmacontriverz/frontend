"use client";
import React, { useState, useEffect } from "react";
import ProcessorRegistration from "@components/core/ProcessorRegistration";
import UserAccess from "@components/core/UserAccess";
import Link from "@components/core/nav-link";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";

export default function page() {
    useTitle("Edit Trader");

    const searchParams = useSearchParams();
    const selectedId: any = searchParams.get('id')

    const router = useRouter();
    const [programs, setPrograms] = useState([]);
    const [unitCert, setUnitCert] = useState([]);
    const [brands, setBrands] = useState([]);
    const [role, setRole] = useState<any>([]);
    const [userErrors, setUserErrors] = useState<any>([]);

    const [processorFormData, setProcessorFormData] = useState<any>({
        id: null,
        name: "",
        address: "",
        countryId: "",
        stateId: "",
        programIds: [],
        latitude: "",
        longitude: "",
        website: "",
        contactPerson: "",
        unitCert: [],
        companyInfo: "",
        logo: "",
        photo: "",
        certs: "",
        brand: [],
        mobile: "",
        landline: "",
        email: "",
        materialTrading: []
    });


    const [errors, setErrors] = useState({
        name: "",
        address: "",
        countryId: "",
        stateId: "",
        programIds: "",
        contactPerson: "",
        brand: "",
        materialTrading: ""
    });

    const requiredUserFields = [
        "firstname",
        "email",
        "mobile",
        "username",
        "password",
        "reenterpassword",
        "status",
        "role"
    ];

    const getPrevData = async () => {
        const url = `trader/get-trader?id=${selectedId}`
        try {
            const response = await API.get(url)
            const prevData = response.data;
            setProcessorFormData(
                {
                    id: prevData.id,
                    name: prevData.name,
                    address: prevData.address,
                    countryId: prevData.country_id,
                    stateId: prevData.state_id,
                    programIds: prevData.program_id,
                    latitude: prevData.latitude,
                    longitude: prevData.longitude,
                    website: prevData.website,
                    contactPerson: prevData.contact_person,
                    unitCert: prevData.unit_cert,
                    companyInfo: prevData.company_info,
                    logo: prevData.org_logo,
                    photo: prevData.org_photo,
                    certs: prevData.certs,
                    brand: prevData.brand,
                    mobile: prevData.mobile,
                    landline: prevData.landline,
                    email: prevData.email,
                    materialTrading: prevData.material_trading
                }
            );
            const updatedUsers = prevData.userData.map((item: any) => {
                return {
                    id: item.id,
                    firstname: item.firstname,
                    position: item.position,
                    username: item.username,
                    email: item.email,
                    mobile: item.mobile,
                    password: "",
                    reenterpassword: "",
                    status: item.status,
                    role: item.role
                };
            });
            setUsers(updatedUsers);
        }
        catch (error) {
            console.log(error, "error")

        }
    };

    const dataUpload = async (e: any) => {
        const url = "file/upload";
        const dataVideo = new FormData();
        dataVideo.append("file", e.target.files[0]);

        try {
            const response = await API.postFile(url, dataVideo);
            if (response.success) {
                setProcessorFormData((prevFormData: any) => ({
                    ...prevFormData,
                    [e.target.name]: response.data,
                }));
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const handleChange = (
        event:
            | React.ChangeEvent<HTMLSelectElement>
            | React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;
        if (name === "logo" || name === "photo" || name === "certs") {
            dataUpload(event);
        } else {
            setProcessorFormData((prevData: any) => ({
                ...prevData,
                [name]: value,
            }));
        }
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };


    const validateField = (name: string, value: any, dataName: string, index: number = 0) => {
        if (dataName === 'user') {
            if (requiredUserFields.includes(name)) {
                switch (name) {
                    case "username":
                        return userErrors[index]?.username !== "" ? userErrors[index]?.username : value.trim() === "" ? "Username is required" : "";
                    case "firstname":
                        return value.trim() === "" ? "Name is required" : "";
                    case "password":
                        return value.trim() === "" ? "Password is required" : "";
                    case "reenterpassword":
                        return users && users[index].password !== value.trim()
                            ? "Passwords not matched"
                            : value.trim() === ""
                                ? "Re-enter Password is required"
                                : "";
                    case "mobile":
                        return value.trim() === "" ? "Mobile No is required" : "";
                    case "email":
                        return userErrors[index]?.email !== "" ? userErrors[index]?.email : value.trim() === ""
                            ? "Email is required"
                            : /\S+@\S+\.\S+/.test(value)
                                ? ""
                                : "Invalid email format";
                    case "ticketCountryAccess":
                        return value?.length === 0 || value === null
                            ? "Select at least one option"
                            : "";
                    case "role":
                        return value?.length === 0 || value === null
                            ? "Field is required"
                            : "";
                    case "status":
                        return typeof value !== "boolean" ? "Select at least one option" : "";
                    default:
                        return "";
                }
            }
        }
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const newUserErrors: any = [];

        users.map((user: any, index: number) => {
            const userErrors: any = {};
            Object.keys(user).forEach((fieldName: string) => {
                const fieldError = validateField(
                    fieldName,
                    user[fieldName as keyof any],
                    "user",
                    index,
                );
                if (fieldError) {
                    userErrors[fieldName] = fieldError;
                }
            });
            newUserErrors[index] = userErrors;
        }
        )

        const hasUserErrors = newUserErrors.some((errors: any) => Object.values(errors).some((error) => !!error));

        if (hasUserErrors) {
            setUserErrors(newUserErrors)
        }

        if (
            processorFormData.name &&
            processorFormData.address &&
            processorFormData.countryId &&
            processorFormData.stateId &&
            processorFormData.programIds &&
            processorFormData.contactPerson &&
            processorFormData.brand &&
            processorFormData.materialTrading
            && !hasUserErrors && !errors.name
        ) {
            try {
                const response = await API.put("trader", {
                    ...processorFormData,
                    id: selectedId,
                    userData: users
                });
                if (response.success) {
                    toasterSuccess("Trader updated Successfully");
                    router.push("/settings/processor-registration/trader");
                }
            } catch (error) {
                toasterError("An Error occurred.");
            }
        } else {
            if (processorFormData.name === "") {
                setErrors((pre) => ({
                    ...pre,
                    name: "Weaving Unit Name is required"
                }))
            }
            if (processorFormData.address === "") {
                setErrors((pre) => ({
                    ...pre,
                    address: "Address is required"
                }))
            }
            if (processorFormData.countryId === "") {
                setErrors((pre) => ({
                    ...pre,
                    countryId: "Country is required"
                }))
            }
            if (processorFormData.stateId === "") {
                setErrors((pre) => ({
                    ...pre,
                    stateId: "State is required"
                }))
            }
            if (processorFormData.programIds.length === 0 || null) {
                setErrors((pre) => ({
                    ...pre,
                    programIds: "Program is required"
                }))
            }

            if (processorFormData.materialTrading.length === 0 || null) {
                setErrors((pre) => ({
                    ...pre,
                    materialTrading: "This field is required"
                }))
            }
            if (processorFormData.contactPerson === "") {
                setErrors((pre) => ({
                    ...pre,
                    contactPerson: "Contact Person Name is required"
                }))
            }
            if (processorFormData.brand.length === 0 || null) {
                setErrors((pre) => ({
                    ...pre,
                    brand: "Brand Mapped is required"
                }))
            }
        }
    };



    let intializeData: any = {
        id: null,
        firstname: "",
        position: "",
        username: "",
        email: "",
        mobile: "",
        password: "",
        reenterpassword: "",
        status: "",
        role: ""
    };

    const [users, setUsers] = useState<any>([
        {
            id: null,
            firstname: "",
            position: "",
            username: "",
            email: "",
            mobile: "",
            password: "",
            reenterpassword: "",
            status: null,
            role: null
        },
    ]);

    const getPrograms = async () => {
        const res = await API.get("program?status=true");
        if (res.success) {
            setPrograms(res.data);
        }
    };


    const getUnitCertification = async () => {
        try {
            const res = await API.get("unit/unit-certification");
            if (res.success) {
                setUnitCert(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getBrands = async () => {
        try {
            const res = await API.get("brand");
            if (res.success) {
                setBrands(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUserRoles = async () => {
        const res = await API.get("user/get-user-roles");
        if (res.success) {
            const roles = res.data?.filter(
                (item: any) => item.user_role === "Trader"
            );
            setRole(roles);
        }
    };
    useEffect(() => {
        getUserRoles();
        getPrograms();
        getUnitCertification();
        getBrands();
    }, []);

    useEffect(() => {
        getPrevData()
    }, [])
    const alreadyExistsCheck = async (name: string, value: string, index: number, id: number) => {
        const res = await API.post("brand/user", {
            id: id,
            [name]: value
        });

        const newErrors = [...userErrors];

        if (res?.data?.user === true) {
            newErrors[index] = {
                ...newErrors[index],
                [name]: "Already Exists"
            };
        } else {
            newErrors[index] = {
                ...newErrors[index],
                [name]: ""
            };
        }

        setUserErrors(newErrors);
    };

    const alreadyExistName = async (name: string, value: string, id: number) => {
        const res = await API.post("ginner/check-ginner", {
            id: id,
            [name]: value
        });

        if (res?.data?.exist === true) {
            setErrors((prev: any) => ({
                ...prev,
                [name]: "Name Already Exists. Please Try Another",
            }));
        }
        else {
            setErrors((prev: any) => ({
                ...prev,
                [name]: "",
            }));
        }
    }


    const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        if (name === "name" && value !== "") {
            alreadyExistName(name, value, processorFormData.id)
        }
        else if (value != "") {
            alreadyExistsCheck(name, value, index, users[index].id)
        }

    }


    const onUserAccessChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const { name, value, type } = e.target;
        const newUsers = [...users];
        if (type === 'radio') {
            if (name === `status-${index}`) {
                newUsers[index]['status'] = value === 'active' ? true : false;
            }
        } else {
            newUsers[index][name] = value;
        }

        setUsers(newUsers);
    };

    const handleSelectionChange = (
        selectedOptions: string[],
        name: string,
        index: number = 0
    ) => {

        if (name === "unitCert") {
            const result = selectedOptions
                .map((item: string) => {
                    const find: any = unitCert.find((option: any) => {
                        return option.certification_name === item;
                    });
                    return find ? find.id : null;
                })
                .filter((id) => id !== null);

            setProcessorFormData((prevData: any) => ({
                ...prevData,
                unitCert: result,
            }));
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
        if (name === "brand") {
            const result = selectedOptions
                .map((item: string) => {
                    const find: any = brands.find((option: any) => {
                        return option.brand_name === item;
                    });
                    return find ? find.id : null;
                })
                .filter((id) => id !== null);

            setProcessorFormData((prevData: any) => ({
                ...prevData,
                brand: result,
            }));
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (name === "programIds") {
            const result = selectedOptions
                .map((item: string) => {
                    const find: any = programs.find((option: any) => {
                        return option.program_name === item;
                    });
                    return find ? find.id : null;
                })
                .filter((id) => id !== null);

            setProcessorFormData((prevData: any) => ({
                ...prevData,
                programIds: result,
            }));
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (name === "materialTrading") {
            const result = selectedOptions
            setProcessorFormData((prevData: any) => ({
                ...prevData,
                materialTrading: result,
            }));
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };




    return (
        <>
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
                                <li>Processor Registration</li>
                                <li>Trader</li>
                                <li>Edit Trader</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <ProcessorRegistration
                    IsEdit
                    type="Trader"
                    errors={errors}
                    onBlur={onBlurCheck}
                    processorFormData={processorFormData}
                    onProcessorChangeData={handleChange}
                    handleMultiSelect={handleSelectionChange}
                />
            </div>
            <div>
                <hr className="mt-5 mb-5" />
                <UserAccess
                    intializeData={intializeData}
                    userErrors={userErrors}
                    role={role}
                    users={users}
                    onBlur={onBlurCheck}
                    setUsers={setUsers}
                    onChange={onUserAccessChange}
                    handleSelectionChange={handleSelectionChange}
                />
                <hr className="mt-5 mb-5" />
                <div className="justify-between mt-4 px-2 space-x-3 ">
                    <button
                        className="bg-green-500 rounded text-white px-2 py-2 text-sm"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                    <button
                        className="bg-gray-300 rounded text-black px-2 py-2 text-sm"
                        onClick={() => router.push('/settings/processor-registration')}
                    >
                        Cancel
                    </button>
                </div>
                <hr className="mt-5 mb-5" />
            </div>
        </>
    );
}
