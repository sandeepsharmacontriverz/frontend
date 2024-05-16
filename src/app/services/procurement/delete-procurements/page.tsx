"use client";
import useTranslations from "@hooks/useTranslation";
import React, { useEffect, useState } from "react";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import Link from "@components/core/nav-link";

export default function page() {
  useTitle("Delete Procurements");
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  const [formData, setFormData] = useState<any>({
    fromId: "",
    toId: "",
  });

  const [errors, setErrors] = useState<any>({});

  const requiredFields = ["fromId", "toId"];

  useEffect(() => {
    if (formData.fromId && formData.toId) {
      if (Number(formData.fromId) > Number(formData.toId)) {
        setErrors((prev: any) => ({
          ...prev,
          toId: "To Id should be greater than From Id",
        }));
      }
      else {
        setErrors((prev: any) => ({
          ...prev,
          toId: "",
        }));
      }
    }
  }, [formData.fromId, formData.toId])


  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      switch (name) {
        case "fromId":
          return value.trim() === "" ? "This field is required" : "";
        case "toId":
          return value.trim() === "" ? "This field is required" : errors.toId !== "" ? errors.toId : '';
        default:
          return "";
      }
    }
  };

  //delete bulk transactions
  const handleDelete = async () => {
    const newErrors: any = {};

    //Check Validation Errors
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(fieldName, formData[fieldName]);
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (!hasErrors) {
      const res = await API.delete(
        "procurement/delete-bulk-transactions",
        formData
      );
      if (res.success) {
        setFormData({
          fromId: "",
          toId: "",
        });
        if (res.data.pass.length > 0) {
          toasterSuccess(`${res.data.pass.length} No. of transactions deleted successfully`);
        }
        if (res.data.fail.length > 0) {
          toasterError(`${res.data.fail.length} No. of transactions has been failed to delete.`);
        }
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  if (roleLoading || loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <Link href="/dashboard">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Services</li>
              <li>Procurement</li>
              <li>Delete Procurements</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <div className="col-12 col-sm-6 col-md-4 mt-4">
          <label className="text-gray-500 text-[12px] font-medium">
            Transaction ID from
          </label>
          <input
            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
            id="transactionsFrom"
            type="number"
            name="fromId"
            placeholder="From"
            value={formData.fromId}
            onChange={handleInputChange}
          />
          {errors?.fromId !== "" && (
            <div className="text-sm text-red-500">{errors.fromId}</div>
          )}
        </div>


        <div className="col-12 col-sm-6 col-md-4 mt-4">
          <label className="text-gray-500 text-[12px] font-medium">
            Transaction ID To
          </label>
          <input
            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
            id="transactionsTo"
            type="number"
            name="toId"
            placeholder="To"
            value={formData.toId}
            onChange={handleInputChange}
          />
          {errors?.toId !== "" && (
            <div className="text-sm text-red-500">{errors.toId}</div>
          )}
        </div>

        <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
          <section>
            <button className="btn-purple mr-2"
              // disabled={isSubmitting}
              onClick={handleDelete}>
              {translations.menuEntitlement.delete}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
