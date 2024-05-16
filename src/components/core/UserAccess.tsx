"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "./MultiSelectDropDown";
import API from "@lib/Api";

export default function UserAccess({
  type,
  users,
  setUsers,
  onChange,
  onBlur,
  intializeData,
  selectedCountries,
  handleSelectionChange,
  role,
  userErrors,
}: any) {
  const handleAddMore = () => {
    setUsers([...users, { ...intializeData }]);
  };

  const handleDeleteRow = (index: any) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);
    setUsers(newUsers);
  };

  const [countries, setCountries] = useState<any>([]);

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCountries();
  }, []);

  const PreData = (user: any) => {
    const userId = user?.map((obj: any) => Number(obj));
    let matchNames = countries
      .filter((country: any) => userId?.includes(country.id))
      .map((country: any) => country.county_name);
    return matchNames;
  };

  return (
    <>
      <div>
        <h4 className="text-sm font-semibold mt-4 ml-6">User Access </h4>

        {users.map((user: any, index: number) => (

          <div key={index} className=" items-center">
            <div className="w-full flex justify-end mt-3 mr-5">
              {index !== 0 && (
                <button
                  className="ml-2 text-white rounded-full bg-red-600 p-1 w-6 h-6 flex items-center justify-center"
                  onClick={() => handleDeleteRow(index)}
                >
                  X
                </button>
              )}
            </div>
            {index > 0 && (
              <h4 className="my-3 text-sm font-semibold">User {index + 1}</h4>
            )}

            <div className="bg-white rounded-md p-4">
              <div className="w-100 ">
                <div className="customFormSet">
                  <div className="row">


                    <div className="col-12 col-sm-6 ">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        id={`name_${index}`}
                        autoComplete="off"
                        onBlur={(e) => onBlur(e, "alphabets", index)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.firstname}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Name"
                      />
                      {userErrors[index]?.firstname !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.firstname}
                        </div>
                      )}
                    </div>


                    <div className="col-12 col-sm-6 ">
                      <label className="text-gray-500 text-[12px] font-medium">Position</label>
                      <input
                        type="text"
                        name="position"
                        id={`position_${index}`}
                        autoComplete="off"
                        onBlur={(e) => onBlur(e, "alphabets", index)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.position || ""}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Position in Company"
                      />
                      {userErrors[index]?.position !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.position}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 my-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="email"
                        autoComplete="off"
                        id={`email_${index}`}
                        onBlur={(e) => onBlur(e, "email", index)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.email}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Email"
                      />
                      {userErrors[index]?.email !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.email}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 my-2">

                      <label className="text-gray-500 text-[12px] font-medium">
                        Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="mobile"
                        autoComplete="off"
                        id={`mobile_${index}`}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.mobile}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Mobile"
                      />
                      {userErrors[index]?.mobile !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.mobile}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 my-2">

                      <label className="text-gray-500 text-[12px] font-medium">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        onBlur={(e) => onBlur(e, "string", index)}
                        autoComplete="off"
                        id={`username_${index}`}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.username}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Username"
                      />
                      {userErrors[index]?.username !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.username}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 my-2">

                      <label className="text-gray-500 text-[12px] font-medium">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id={`password_${index}`}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.password}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Password"
                      />
                      {userErrors[index]?.password !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.password}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 my-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Re-enter Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="reenterpassword"
                        id={`reenterpassword_${index}`}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        value={user?.reenterpassword}
                        onChange={(e) => onChange(e, index)}
                        placeholder="Re-enter Password"
                      />
                      {userErrors[index]?.reenterpassword !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.reenterpassword}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 my-6">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Status <span className="text-red-500">*</span>
                      </label>

                      <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>                          <input
                            type="radio"
                            name={`status-${index}`}
                            value="active"
                            checked={users[index].status === true}
                            className=" px-2 py-1 text-sm"
                            onChange={(e) => onChange(e, index)}
                          />{" "}
                            <span></span>
                          </section>
                          Active
                        </label>

                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name={`status-${index}`}
                              value="inactive"
                              checked={users[index].status === false}
                              className=" px-2 py-1 text-sm"
                              onChange={(e) => onChange(e, index)}
                            />{" "}

                            <span></span>
                          </section>
                          Inactive
                        </label>
                      
                      </div>
                      {userErrors[index]?.status !== "" && (
                          <div className="text-sm pt-1 text-red-500">
                            {userErrors[index]?.status}
                          </div>
                        )}
                    </div>

                    <div className="col-12 col-sm-6 my-2">

                      <label className="text-gray-500 text-[12px] font-medium">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        placeholder="Select Role"
                        value={user?.role || ""}
                        onChange={(e) => onChange(e, index)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      >
                        <option value="">Select Role</option>
                        {role?.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.user_role}
                          </option>
                        ))}
                      </select>
                      {userErrors[index]?.role !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {userErrors[index]?.role}
                        </div>
                      )}
                    </div>

                    {type && type === "brand" && (
                      <>
                        <div className="col-12 col-sm-6 my-2">

                          <label className="text-gray-500 text-[12px] font-medium">
                            Ticket Approve Access{" "}
                            <span className="text-red-500">*</span>
                          </label>


                          <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  name={`ticketApproveAccess-${index}`}
                                  value="yes"
                                  checked={users[index].ticketApproveAccess === true}
                                  className=" px-2 py-1 text-sm"
                                  onChange={(e) => onChange(e, index)}
                                />
                                <span></span>
                              </section>
                              Yes
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  name={`ticketApproveAccess-${index}`}
                                  value="no"
                                  checked={users[index].ticketApproveAccess === false}
                                  className=" px-2 py-1 text-sm"
                                  onChange={(e) => onChange(e, index)}
                                />
                                <span></span>
                              </section>
                              No
                            </label>
                           
                          </div>
                          {userErrors[index]?.ticketApproveAccess !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.ticketApproveAccess}
                              </div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 my-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Ticket Country Access{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <MultiSelectDropdown
                            name="ticketCountryAccess"
                            initiallySelected={
                              user.ticketCountryAccess
                                ? PreData(user?.ticketCountryAccess)
                                : ""
                            }
                            options={selectedCountries?.map((item: any) => {
                              return item;
                            })}
                            onChange={(e) =>
                              handleSelectionChange(
                                e,
                                "ticketCountryAccess",
                                index
                              )
                            }
                          />
                          {userErrors[index]?.ticketCountryAccess !== "" && (
                            <div className="text-sm pt-1 text-red-500">
                              {userErrors[index]?.ticketCountryAccess}
                            </div>
                          )}
                        </div>



                        <div className="col-12 col-sm-6 my-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Ticket Approve Access Only{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  name={`ticketAccessOnly-${index}`}
                                  value="yes"
                                  checked={user?.ticketAccessOnly === true}
                                  className=" px-2 py-1 text-sm"
                                  onChange={(e) => onChange(e, index)}
                                />{" "}
                                <span></span>
                              </section>
                              Yes

                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  name={`ticketAccessOnly-${index}`}
                                  value="no"
                                  checked={user?.ticketAccessOnly === false}
                                  className=" px-2 py-1 text-sm"
                                  onChange={(e) => onChange(e, index)}
                                />{" "}
                                <span></span>
                              </section>
                              No
                            </label>
                          
                          </div>
                          {userErrors[index]?.ticketAccessOnly !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.ticketAccessOnly}
                              </div>
                            )}
                        </div>
                      </>
                    )}

                    <div className="flex justify-end mr-5 mb-5 mt-2">
                      <button
                        onClick={handleAddMore}
                        className="bg-orange-400 rounded text-white px-2 py-2 text-sm  "
                      >
                        Add More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}
