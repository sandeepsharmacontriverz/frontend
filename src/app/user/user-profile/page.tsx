"use client";
import PageHeader from "@components/core/PageHeader";
import { toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import React, { useEffect, useState } from "react";

interface FormData {
  oldPassword: string;
  newPassword: string;
  retypePassword: string;
}
export default function Page() {
  useTitle("Edit Profile");

  const [userDetails, setUserDetails] = useState<any>({
    id: "",
    username: "",
    email: ""
  })
  const [formData, setFormData] = useState<FormData>({
    oldPassword: "",
    newPassword: "",
    retypePassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getUserDetails();
  }, [])

  const getUserDetails = async () => {
    let res = await API.get(["user", "my-details"]);
    if (res.success) {
      setUserDetails({
        id: res.data.user.id,
        username: res.data.user.username,
        email: res.data.user.email
      })
    }

  }
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const strongPasswordRegex =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
    let passwordError = "Password should include special characters, numbers, capital letters and it should be a minimum of 8 characters.";
    const newErrors: Record<string, string> = {};
    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "Old Password is required";
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New Password is required";
    }
    else if (!strongPasswordRegex.test(formData.newPassword)) {
      newErrors.newPassword = passwordError
    }

    if (!formData.retypePassword.trim()) {
      newErrors.retypePassword = "Retype Password is required";
    }
    else if (!strongPasswordRegex.test(formData.retypePassword)) {
      newErrors.retypePassword = passwordError
    }
    if (formData.newPassword !== formData.retypePassword) {
      newErrors.retypePassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await API.post("auth/update-password", {
          id: userDetails.id,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        });
        if (res.success) {
          toasterSuccess(res.message);
          setFormData({
            oldPassword: "",
            newPassword: "",
            retypePassword: "",
          });
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  const handleReset = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      retypePassword: "",
    });
    setErrors({});
  };
  return (
    <div className="p-5">
      <PageHeader
        currentPageName={"Edit Profile"}
        currentPageRoute={["Profile", "Edit Profile"]}
      />

      <div className="mt-8 w-1/2">
        <div className="flex py-2">
          <div className="w-1/2">
            <label className="text-md">User Name </label>
          </div>
          <div className="w-1/2">
            <span className="text-md font-bold">{userDetails?.username}</span>
          </div>
        </div>
        <div className="flex py-2">
          <div className="w-1/2">
            <label className="text-md">Email </label>
          </div>
          <div className="w-1/2">
            <span className="text-md font-bold">{userDetails?.email}</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mt-5 font-bold">Change Password</h3>
        <hr className="mt-3" />
      </div>
      <div className="w-1/2">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-8 my-5">
            <div className="w-1/2 pt-2 flex justify-end">
              <label className="text-md" htmlFor="oldPassword">
                Old Password<span className="text-red-500">*</span>
              </label>
            </div>
            <div className="w-1/2">
              <input
                type="password"
                name="oldPassword"
                id="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="border border-gray-400 rounded-md px-3 py-2 w-64 text-sm"
                placeholder="Old Password"
              />
              {errors.oldPassword && (
                <p className="text-red-500 text-sm">{errors.oldPassword}</p>
              )}
            </div>
          </div>
          <div className="flex gap-8 my-5">
            <div className="w-1/2 pt-2 flex justify-end">
              <label className="text-md" htmlFor="newPassword">
                New Password<span className="text-red-500">*</span>
              </label>
            </div>
            <div className="w-1/2">
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="border border-gray-400 rounded-md px-3 py-2 w-64 text-sm"
                placeholder="New Password"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>
          </div>
          <div className="flex gap-8 my-5">
            <div className="w-1/2 pt-2 flex justify-end">
              <label className="text-md" htmlFor="retypePassword">
                Retype Password<span className="text-red-500">*</span>
              </label>
            </div>
            <div className="w-1/2">
              <input
                type="password"
                name="retypePassword"
                id="retypePassword"
                value={formData.retypePassword}
                onChange={handleChange}
                className="border border-gray-400 rounded-md px-3 py-2 w-64 text-sm"
                placeholder="Retype Password"
              />
              {errors.retypePassword && (
                <p className="text-red-500 text-sm">{errors.retypePassword}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-4 ">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
