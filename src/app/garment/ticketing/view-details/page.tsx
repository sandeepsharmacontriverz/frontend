"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import { useSearchParams } from "next/navigation";
import API from "@lib/Api";
import User from "@lib/User";
import moment from "moment";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

export default function Page() {
  const [roleLoading, hasAccesss] = useRole();
  const { translations, loading } = useTranslations();
  useTitle(translations?.ticketing?.viewTicket);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [Access, setAccess] = useState<any>({});

  const [formData, setFormData] = useState<any>({
    id: "",
    status: "",
    comment: "",
  });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Ticketing");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);


  const fetchData = async () => {
    try {
      const response = await API.get(`ticketing/status?ticketId=${id}`);
      if (response.success) {
        const ticketData = response.data;
        setData(ticketData);
        setFormData({
          id: Number(id),
          status: ticketData[0]?.status,
          comment: ticketData[0]?.comment,
          userId: User?.id?.toString(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (row: any, action: string) => {
    setShowEditPopup(true);
    const status = "Reply";

    setFormData({
      id: row.id,
      comment: row.comment,
      status: status,
      userId: User?.id?.toString(),
    });
  };

  if (loading) {
    return <Loader />;
  }

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
        {showEditPopup && (
          <TicketingPopUp
            title={"Reply"}
            onClose={() => setShowEditPopup(false)}
            formData={formData}
          />
        )}
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/garment/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>

                <li><NavLink href="/garment/ticketing/">{translations?.ticketing?.ticketing}</NavLink></li>
                <li>{translations?.ticketing?.viewTicket}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="flex place-content-center">
                <div className="w-6/12">
                  <div className="panel-gray h-100">
                    <div className="w-full customButtonGroup text-center">
                      {Access.create &&
                        <button
                          className="btn-purple mr-2"
                          onClick={() => handleEdit(formData, "Reply")}
                        >
                          {translations?.ticketing?.reply}
                        </button>
                      }
                      <button
                        className="btn-outline-purple"
                        onClick={() => router.push("/garment/ticketing")}
                      >
                        {translations?.common?.back}
                      </button>
                    </div>

                    <div className="user-profile mg-t-44">
                      <div className="details-list-group mg-t-44">
                        <ul className="detail-list">
                          {data?.map((dataItem: any, index: any) => (
                            <li className="item" key={index}>
                              <div className="flex w-full">
                                <div className="border border-gray-300 w-1/2 p-2">
                                  <p className="text-md font-normal">
                                  {dataItem?.user?.username ?? dataItem?.ticket?.processor_name}
                                  </p>
                                  <p className="text-md font-normal">
                                    {moment(dataItem?.createdAt).format(
                                      "MMMM Do YYYY h:mm A"
                                    )}
                                  </p>
                                </div>
                                <div className="border border-gray-300 w-1/2 p-2">
                                  <div className="flex flex-col">
                                    <p className="font-semibold text-md">
                                      {dataItem?.status}
                                    </p>
                                    {dataItem?.status === "Pending" && (
                                      <p className="font-normal text-md">
                                        {dataItem?.ticket?.ticket_type}
                                      </p>
                                    )}
                                    {dataItem?.status === "Pending" && (
                                      <p className="font-normal text-md">
                                        {dataItem?.ticket?.style_mark_no}
                                      </p>
                                    )}
                                    <p className="font-normal text-md break-words" style={{ maxWidth: "260px" }}>
                                      {dataItem?.comment}
                                    </p>

                                    {dataItem?.ticket?.documents &&
                                      dataItem?.status === "Pending" && (
                                        <p className="font-normal text-md">
                                          <a
                                            href={dataItem?.ticket?.documents}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-blue-500 text-blue-400"
                                          >
                                            attachment
                                          </a>
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

interface TicketingPopUpProps {
  title: string;
  onClose: () => void;
  formData: { id: number; status: string; comment: string };
}

function TicketingPopUp({ title, onClose, formData }: TicketingPopUpProps) {
  const { translations, loading } = useTranslations();

  const router = useRouter();

  const [data, setData] = useState({
    id: "",
    comment: "",
    status: "",
    userId: "",
  });
  const [commentError, setCommentError] = useState<any>([])
  const [disabled, setDisabled] = useState(false)

  const validateComment = (comment: any, type: any) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9,.\s]*$/;

    if (comment !== "" && type === "alphaNumeric") {
      const valid = regexAlphaNumeric.test(comment);
      if (!valid) {
        return "Accepts only AlphaNumeric values and special characters like _.-,()";
      }
    }

    return "";
  };
  const onBlur = (e: any, type: any) => {
    const { value } = e.target;
    const commentError = validateComment(value, type);
    setCommentError(commentError);
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setCommentError([])

  };
  const handleSubmit = async () => {
    try {
      if (!data.comment.trim()) {
        setCommentError("Comment is Required");
        return;
      } else {
        setCommentError([]);
      }
      const commentValidation = validateComment(data.comment, "alphaNumeric");
      if (commentValidation) {
        setCommentError(commentValidation);
        return;
      }
      else {
        setCommentError([]);
      }

      setDisabled(true)
      const response = await API.put("ticketing", {
        id: Number(formData.id),
        status: formData.status,
        comment: data.comment,
        userId: User?.id?.toString(),
      });

      if (response.success) {
        onClose();
        router.back();
      }
    } catch (err) {
      setDisabled(false)
      console.error(err);
    }
  };

  return (
    <div className="fixPopupFilters fixWidth flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3">
      <div className="bg-white border w-auto p-4 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between align-items-center">
          <h3>{title}</h3>
          <span
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />
        <div className="w-100 mt-0">
          <div className="customFormSet">
            <div className="w-100">
              <div className="row">
                <div className="col-12 col-md-12 col-lg-12 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    {translations?.ticketing?.comments}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    placeholder={translations?.ticketing?.enterComment}
                    name="comment"
                    rows={4}
                    value={data.comment}
                    onChange={handleChange}
                    onBlur={(e) => onBlur(e, "alphaNumeric")}

                  />
                  {commentError && (
                    <div className="text-red-500 text-sm ">{commentError}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
          <section>
            <button className="btn-purple mr-2"
                 disabled={disabled}
                 style={
                   disabled
                     ? { cursor: "not-allowed", opacity: 0.8 }
                     : { cursor: "pointer", backgroundColor: "#D15E9C" }
   
                 }
            onClick={handleSubmit}>
              {translations?.common?.submit}

            </button>
            <button className="btn-outline-purple" onClick={onClose}>
              {translations?.ticketing?.close}

            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
