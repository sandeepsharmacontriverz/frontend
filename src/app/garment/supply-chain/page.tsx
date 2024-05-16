"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rating } from "react-simple-star-rating";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { AiFillMinusCircle } from "react-icons/ai";
import DataTable from "react-data-table-component";
import { Form } from "react-bootstrap";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import NavLink from "@components/core/nav-link";
import checkAccess from "@lib/CheckAccess";

export default function page() {
  const [roleLoading, hasAccesss] = useRole();

  const { translations } = useTranslations();
  useTitle(translations?.supplyChain?.supplychain);

  const [processorData, setProcessorData] = useState<any>([]);
  const [transactions, setTransactions] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>(processorData);
  const [selectedOption, setSelectedOption] = useState<string>("Knitter/Weaver");
  const [showSubmitPopup, setShowSubmitPopup] = useState<any>(false);
  const [brands, setBrands] = useState<any>([]);
  const [Access, setAccess] = useState<any>({});

  const [formData, setFormData] = useState({
    id: undefined,
    userId: null,
    userType: "",
    description: "",
    ratedByType: "Garment",
    processOrSales: "process",
    rating: 0,
  });
  const garmentId = User.garmentId;

  const [errors, setErrors] = useState<any>({
    rating: "",
    reason: "",
  });

  useEffect(() => {
    if (garmentId) {
      fetchBrandIds();
    }
  }, [garmentId])

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Supply Chain");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    if (selectedOption && garmentId) {
      fetchProcessor();
    }
  }, [selectedOption, garmentId, brands]);

  useEffect(() => {
    if (garmentId && processorData.length > 0) {
      setSelectedData(processorData[0]);
      if (processorData[0]) {
        selectedOption === "Knitter/Weaver"
          ? fetchTransactions(processorData[0].processId, processorData[0].type)
          : fetchTransactions(processorData[0].processId, "brand");
      }
    }
  }, [garmentId, processorData, selectedOption]);

  const fetchBrandIds = async () => {
    try {
      const response = await API.get(`garment-sales/get-brand?garmentId=${garmentId}`);
      if (response.success) {
        setTransactions(response.data);
        if (response.data.length) {
          let abc = response.data.map((item: any) => item.id)
          setBrands(abc);
        }
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  const fetchProcessor = async () => {
    try {
      if (selectedOption === "Knitter/Weaver") {
        if (brands.length > 0) {
          const [weaver, knitter] = await Promise.all([
            API.get(`weaver?brandId=${brands}`),
            API.get(`knitter?brandId=${brands}`),
          ]);
          if (weaver.success && knitter.success) {
            const finalData = [
              weaver.data.map((obj: any) => {
                return { ...obj, type: "weaver" };
              }),
              knitter.data.map((obj: any) => {
                return { ...obj, type: "knitter" };
              }),
            ].flat();
            let abc = finalData.map((obj) => {
              return { ...obj, processId: obj.id, id: undefined };
            });
            setProcessorData(abc);
          }
        }
      } else {
        const response = await API.get(`garment-sales/get-brand?garmentId=${garmentId}`);
        if (response.success) {
          setTransactions(response.data);
          if (response.data.length) {
            let abc = response.data.map((obj: any) => {
              return { ...obj, processId: obj.id, id: undefined };
            });
            setProcessorData(abc);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchTransactions = async (id: number, type: string) => {
    try {
      setFormData((prev: any) => ({
        ...prev,
        rating: 0,
      }));
      if (selectedOption == "Knitter/Weaver" && id) {
        const response = await API.get(
          type == "weaver"
            ? `garment-sales/dashboard?limit=10&page=1&garmentId=${garmentId}&weaverId=${id}`
            : `garment-sales/dashboard?limit=10&page=1&garmentId=${garmentId}&knitterId=${id}`
        );
        if (response.success) {
          setTransactions(response.data);
          if (response.data?.length) {
            getRating(id, type);
          }
          else {
            setFormData((prev: any) => ({
              ...prev,
              rating: null,
              description: "",
            }));
          }
        }
      } else if (selectedOption === "Brand" && id) {
        const response = await API.get(
          `garment-sales?garmentId=${garmentId}&brandId=${id}`
        );
        if (response.success) {
          setTransactions(response.data);
          if (response.data.length) {
            getRating(id, type);
          }
          else {
            setFormData((prev: any) => ({
              ...prev,
              rating: null,
              description: "",
            }));
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getRating = async (id: number, type: string) => {

    try {
      if (id && type) {
        const response = await API.post(`supply-chain/get-rating`, {
          ratedBy: garmentId,
          ratedByType: "Garment",
          userId: id,
          userType: type,
        });
        if (response.success) {
          if (response.data) {
            setFormData((prev: any) => ({
              ...prev,
              userId: response.data?.user_id,
              description: response.data?.description,
              userType: response?.data?.user_type,
              rating: response.data?.rating,
              id: response.data?.id,
            }));
          } else {
            setFormData((prev: any) => ({
              ...prev,
              id: undefined,
              userId: null,
              userType: type,
              description: "",
              ratedByType: "Garment",
              processOrSales: "process",
              rating: 0,
            }));
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleReset = () => {
    setFormData((prev: any) => ({
      ...prev,
      rating: 0,
    }));
  };
  const handleChange = (event: any) => {
    const { value, name } = event.target;
    if (name == "description") {
      setErrors((prev: any) => ({
        ...prev,
        description: "",
      }));
      setFormData((prev: any) => ({
        ...prev,
        description: value,
      }));
    }
    else {
      setSelectedOption(value);
    }
  };
  const handleRating = (rate: number) => {
    setErrors((prev: any) => ({
      ...prev,
      rating: "",
    }));
    if (formData.rating === 0 || rate > 2) {
      setFormData((prev: any) => ({
        ...prev,
        description: "",
      }));
    }
    setFormData((prev: any) => ({
      ...prev,
      rating: rate,
    }));
  };

  const handleSubmitRating = async () => {
    if (formData.rating === 0) {
      setErrors((prev: any) => ({
        ...prev,
        rating: "Select rating",

      }));
      return;
    }

    if (
      formData.rating > 0 &&
      formData.rating <= 2 &&
      formData.description === ""
    ) {
      setErrors((prev: any) => ({
        ...prev,
        reason: "Enter the reason",
      }));
      return;
    }
    const createRating = {
      ...formData,
      ratedBy: garmentId,
      userId: selectedData?.processId,
    };
    if (formData.id && selectedData?.processId) {
      try {
        const response = await API.put(`supply-chain/rating`, createRating);

        if (response.success) {
          let ratingId = createRating?.userId || 0;
          getRating(ratingId, createRating.userType);
          setShowSubmitPopup(true);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const response = await API.post(`supply-chain/rating`, createRating);

        if (response.success) {
          getRating(response.data.user_id, createRating.userType);
          setShowSubmitPopup(true);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCompanyClick = (id: any, type: string) => {
    if (selectedOption === "Knitter/Weaver") {
      const selectedCompany = processorData.find(
        (data: any) => data.processId === id && data.type === type
      );
      if (selectedCompany) {
        setSelectedData(selectedCompany);
        fetchTransactions(id, type);
      }
    } else {
      const selectedCompany = processorData.find((data: any) => data.processId === id);
      if (selectedCompany) {
        setSelectedData(selectedCompany);
        fetchTransactions(id, "brand");
      }
    }
  };

  const PopupSubmit = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <p className="d-flex justify-content-center">
                  <MdOutlineCheckCircleOutline
                    color="green"
                    size={40}
                    className="flex justify-self-center"
                  />
                </p>
                <div className="pt-6 w-auto text-center">
                  <p className="text-lg font-medium"> {translations?.supplyChain?.RatingSub}</p>
                </div>

                <div className="pt-6 w-100 d-flex justify-content-center customButtonGroup buttotn560Fix">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      onClick={() => {
                        setShowSubmitPopup(false);
                      }}
                    >
                      {translations?.supplyChain?.ok}
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.supplyChain?.compname}</p>,
      cell: (row: any, id: any) => (
        <a
          className="cursor-pointer hover:text-blue-500"
          rel="noopener noreferrer"
          onClick={() =>
            selectedOption == "Knitter/Weaver"
              ? handleCompanyClick(row.processId, row.type)
              : handleCompanyClick(row.processId, "brand")
          }
        >
          {selectedOption == "Knitter/Weaver" ? row.name : row.brand_name}
        </a>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.address}</p>,
      sortable: false,
      cell: (row: any) => row.address,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.supplyChain?.personName}</p>,
      cell: (row: any) => row.contact_person,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.supplyChain?.mailId}</p>,
      cell: (row: any) => row.email,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.supplyChain?.number}</p>,
      cell: (row: any) => row.mobile,
    },
  ];

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.view) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/garment/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>{translations?.supplyChain?.supplychain}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="farm-details">
              <div className="farm-detail-left">
                <div className="panel-gray h-100">
                  <p className="heading16 font-medium">{translations?.supplyChain?.details}</p>
                  <div className="user-profile mg-t-44">
                    <div className="details-list-group mg-t-44">
                      <ul className="detail-list">
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.compname}:</span>
                          <span className="val">
                            {selectedOption == "Knitter/Weaver"
                              ? selectedData?.name
                              : selectedData.brand_name}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.category}:</span>
                          <span className="val">
                            {selectedOption == "Knitter/Weaver"
                              ? selectedData?.type
                              : "brand"}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.common?.address}:</span>
                          <span className="val break-words">{selectedData?.address}</span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.personName}:</span>
                          <span className="val break-words">
                            {selectedData?.contact_person}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.mailId}:</span>
                          <span className="val break-words" style={{ width: "60%" }}>
                            {selectedData?.email}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.number}:</span>
                          <span className="val">{selectedData?.mobile}</span>
                        </li>
                        <li className="item">
                          <span className="label">
                            {translations?.supplyChain?.profileAbout}:
                          </span>
                          <span className="val">{selectedData?.profile}</span>
                        </li>
                        {Access.edit && transactions.length > 0 && (
                          <>
                            <li className="item">
                              <span className="label">{translations?.supplyChain?.Ranking}:</span>
                              <div>
                                <span className="flex">
                                  <button onClick={handleReset}>
                                    <AiFillMinusCircle color="gray" size={14} />
                                  </button>
                                  <Rating
                                    onClick={handleRating}
                                    SVGstyle={{ display: "inline" }}
                                    initialValue={formData.rating}
                                    allowFraction={true}
                                    size={24}
                                  />
                                </span>
                                {errors?.rating !== "" && (
                                  <p className="text-sm text-red-500">
                                    {errors.rating}
                                  </p>
                                )}
                              </div>
                            </li>

                            {(formData.rating > 0 && formData.rating <= 2) && (
                              <>
                                <li className="item">
                                  <span className="label">
                                    {translations?.supplyChain?.poorRating}
                                  </span>
                                </li>
                                <li className="item">
                                  <div className="w-full">
                                    <textarea
                                      className="text-sm w-full border p-1 rounded"
                                      rows={2}
                                      name="description"
                                      value={formData.description}
                                      onChange={handleChange}
                                    />
                                    {errors?.reason !== "" && (
                                      <p className="text-sm text-red-500">
                                        {errors.reason}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              </>
                            )}

                            <div className="w-full customButtonGroup text-center">
                              <button
                                className="btn-purple mr-2"
                                onClick={handleSubmitRating}
                              >
                                {translations?.common?.submit}
                              </button>
                            </div>
                          </>
                        )}

                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="farm-detail-right">
                <div className="panel-gray">
                  <div className="col-4  my-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      {translations?.supplyChain?.SelectCat}
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="processorType"
                      value={selectedOption}
                      onChange={handleChange}
                    >
                      <option value="Knitter/Weaver">Knitter/Weaver</option>
                      <option value="Brand">Brand</option>
                    </Form.Select>
                  </div>
                  <DataTable
                    columns={columns}
                    data={processorData}
                    persistTableHead
                    fixedHeader={true}
                    noDataComponent={
                      <p className="py-3 font-bold text-lg">
                        {transactions?.common?.Nodata}
                      </p>
                    }
                    fixedHeaderScrollHeight="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 relative">
          <div className="filterGroupFix">
            <PopupSubmit
              openFilter={showSubmitPopup}
              onClose={!showSubmitPopup}
            />
          </div>
        </div>
      </>
    );
  }
}
