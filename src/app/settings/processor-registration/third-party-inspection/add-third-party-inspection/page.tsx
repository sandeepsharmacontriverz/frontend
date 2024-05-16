"use client";
import React, { useState, useEffect } from "react";
import ProcessorRegistration from "@components/core/ProcessorRegistration";
import UserAccess from "@components/core/UserAccess";
import Link from "@components/core/nav-link";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";

export default function page() {
  useTitle("Add Knitter");
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  // const [loomType, setLoomType] = useState([]);
  const [fabricType, setFabricType] = useState([]);
  const [productionCap, setProductionCap] = useState([]);
  const [unitCert, setUnitCert] = useState([]);
  const [brands, setBrands] = useState([]);

  const [role, setRole] = useState<any>([]);
  const [processorFormData, setProcessorFormData] = useState<any>({
    name: "",
    address: "",
    countryId: "",
    stateId: "",
    programIds: [],
    latitude: "",
    longitude: "",
    website: "",
    contactPerson: "",
    noOfMachines: "",
    fabricType: [],
    prodCap: [],
    lossFrom: "",
    lossTo: "",
    unitCert: [],
    companyInfo: "",
    logo: "",
    photo: "",
    certs: "",
    brand: [],
    mobile: "",
    landline: "",
    email: "",
    // loomType: []
  });

  const [userErrors, setUserErrors] = useState<any>([]);
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    countryId: "",
    stateId: "",
    programIds: "",
    contactPerson: "",
    lossFrom: "",
    lossTo: "",
    brand: ""
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

  const requiredKnitterFields = [
    "name",
    "address",
    "contactPerson",
    "programIds",
    "countryId",
    "stateId",
    "brand",
    "lossFrom",
    "lossTo"
  ];

  const dataUpload = async (e: any) => {
    const url = "file/upload";

    const dataImage = new FormData();
    dataImage.append("file", e.target.files[0]);

    try {
      const response = await API.postFile(url, dataImage);
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
    else if (dataName === 'knitter') {
      if (requiredKnitterFields.includes(name)) {
        switch (name) {
          case "name":
            return value.trim() === "" ? "Knitter Name is required" : errors.name !== "" ? errors.name : "";
          case "address":
            return value.trim() === "" ? "Address is required" : "";
          case "contactPerson":
            return value.trim() === "" ? "Contact Person is required" : "";
          case "lossFrom":
            return value.trim() === "" ? "This Field is required" : "";
          case "lossTo":
            return value.trim() === "" ? "This Field is required" : "";
          case "programIds":
            return value?.length === 0 || value === null
              ? "Program is required"
              : "";
          case "brand":
            return value?.length === 0 || value === null
              ? "Brand Mapped is required"
              : "";
          case "countryId":
            return value.trim() === "" || value === null
              ? "Country is required"
              : "";
          case "stateId":
            return value.trim() === "" || value === null
              ? "State is required"
              : "";
          default:
            return "";
        }
      }
    };
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newUserErrors: any = [];
    const newKnitterErrors: any = {};

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

    Object.keys(processorFormData).forEach((fieldName: string) => {
      newKnitterErrors[fieldName] = validateField(
        fieldName,
        processorFormData[fieldName as keyof any],
        "knitter"
      );
    });

    const hasGinnerErrors = Object.values(newKnitterErrors).some((error) => !!error);
    const hasUserErrors = newUserErrors.some((errors: any) =>
      Object.values(errors).some((error) => !!error)
    );

    if (hasGinnerErrors) {
      setErrors(newKnitterErrors)
    }

    if (hasUserErrors) {
      setUserErrors(newUserErrors);
    }

    if (!hasGinnerErrors && !hasUserErrors) {
      try {
        const response = await API.post("knitter", {
          ...processorFormData,
          countryId: Number(processorFormData.countryId),
          userData: users
        });
        if (response.success) {
          toasterSuccess("Knitter Successfully Created");
          // router.push("/settings/processor-registration/weaving");
          router.back()
        }
      } catch (error) {
        console.log(error);
        toasterError('An Error occurred.')
      }
    } else {
      return
    }
  };


  let intializeData: any = {
    firstname: "",
    position: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    reenterpassword: "",
    status: "",
    role: "",
  };

  const [users, setUsers] = useState<any>([
    {
      firstname: "",
      position: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      reenterpassword: "",
      status: null,
      role: null,
    },
  ]);

  const getPrograms = async () => {
    const res = await API.get("program?status=true");
    if (res.success) {
      setPrograms(res.data);
    }
  };



  const getFabricTypes = async () => {
    try {
      const res = await API.get("fabric-type?status=true");
      if (res.success) {
        setFabricType(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getProdCap = async () => {
    try {
      const res = await API.get("production-capacity");
      if (res.success) {
        setProductionCap(res.data);
      }
    } catch (error) {
      console.log(error);
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
        (item: any) => item.user_role === "Knitter"
      );
      setRole(roles);
    }
  };
  useEffect(() => {
    getUserRoles();
    getPrograms();
    getFabricTypes();
    getProdCap();
    getUnitCertification();
    getBrands();
  }, []);

  const alreadyExistsCheck = async (name: string, value: string, index: number) => {
    const res = await API.post("brand/user", {
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

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("knitter/check-knitter", {
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
      alreadyExistName(name, value, index)
    }
    else if (value != "") {
      alreadyExistsCheck(name, value, index);
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

    if (name === "fabricType") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = fabricType.find((option: any) => {
            return option.fabricType_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setProcessorFormData((prevData: any) => ({
        ...prevData,
        fabricType: result,
      }));
    }

    if (name === "prodCap") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = productionCap.find((option: any) => {
            return option.name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setProcessorFormData((prevData: any) => ({
        ...prevData,
        prodCap: result,
      }));
    }
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
                <li>Knitter</li>
                <li>Add Knitter</li>
              </ul>
            </div>
          </div>
        </div>

        <ProcessorRegistration
          type="Knitter"
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
          onBlur={onBlurCheck}
          users={users}
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
            onClick={() => router.push('/settings/processor-registration/knitter')}
          >
            Cancel
          </button>
        </div>
        <hr className="mt-5 mb-5" />
      </div>
    </>
  );
}

