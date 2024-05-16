"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import API from "@lib/Api";
import User from "@lib/User";
import { useRouter } from "next/navigation";
import moment from "moment";

export default function Page() {
  const [roleLoading] = useRole();
  useTitle("Ticketing View");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<any>("");

  const [formData, setFormData] = useState<any>({
    id: "",
    status: "",
    comment: "",
  });
  const brandId = User.brandId;

  useEffect(() => {
    if (id) fetchData();
  }, [id, brandId]);

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
        setStatus(ticketData[0]?.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (row: any, action: string) => {
    setStatus(action);
    setShowEditPopup(true);
    const status =
      action === "Rejected"
        ? "Rejected"
        : action === "In Progress"
          ? "In Progress"
          : "Approved";
    setFormData({
      id: row.id,
      comment: row.comment,
      status: status,
      userId: User?.id?.toString(),
    });
  };

  if (!roleLoading) {
    return (
      <>
        {showEditPopup && (
          <TicketingPopUp
            title={
              status === "Pending" || status === "Rejected"
                ? "Reject With Comment"
                : status === "In Progress"
                  ? "Revert With Comment"
                  : "Approve"
            }
            onClose={() => setShowEditPopup(false)}
            formData={formData}
          />
        )}
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href={brandId ? "/brand/dashboard" : "/dashboard"}>
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Escalation Matrix</li>
                <li>
                  <Link href={brandId ? "/escalation-matrix/ticketing-list" : "/escalation-matrix/escalation-matrix"}>
                    Ticketing List
                  </Link>

                </li>
                <li>View Ticketing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="flex place-content-center">
                <div className="w-auto">
                  <div className="panel-gray h-100">
                    <div className="w-full flex flex-wrap gap-3 text-center">
                      {/* <button
                        className="btn-purple mr-2"
                        onClick={() => handleEdit(formData, "Reply")}
                      >
                        Reply
                      </button> */}

                      <button
                        role="button"
                        className="p-2 rounded bg-[#f39c12]  hover:bg-[#e68e0a]  text-white"
                        disabled={data.some((item) =>
                          ["Rejected", "Resolved"].includes(
                            item?.ticket?.status
                          )
                        )}
                        style={
                          data.some((item) =>
                            ["Rejected", "Resolved"].includes(
                              item?.ticket?.status
                            )
                          )
                            ? { cursor: "not-allowed", opacity: 0.8 }
                            : {
                              cursor: "pointer",
                              backgroundColor: "#f39c12",
                            }
                        }
                        onClick={() => handleEdit(formData, "Rejected")}
                      >
                        Reject With Comment
                      </button>

                      <button
                        className="p-2 rounded bg-[#f39c12] text-white hover:bg-[#e68e0a] "
                        disabled={data.some((item) =>
                          ["Rejected", "Resolved"].includes(
                            item?.ticket?.status
                          )
                        )}
                        style={
                          data.some((item) =>
                            ["Rejected", "Resolved"].includes(
                              item?.ticket?.status
                            )
                          )
                            ? { cursor: "not-allowed", opacity: 0.8 }
                            : {
                              cursor: "pointer",
                              backgroundColor: "#f39c12",
                            }
                        }
                        onClick={() => handleEdit(formData, "In Progress")}
                      >
                        Revert With Comment
                      </button>

                      {!data.some((item) =>
                        ["Rejected"].includes(item?.ticket?.status)
                      ) && (
                          <button
                            className="p-2 rounded bg-[#D15E9C] text-white hover:bg-[#D15E9C] "
                            style={
                              data.some((item) =>
                                ["Approved", "Resolved"].includes(
                                  item?.ticket?.status
                                )
                              )
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : {
                                  cursor: "pointer",
                                  backgroundColor: "#D15E9C",
                                }
                            }
                            disabled={data.some((item) =>
                              ["Approved", "Resolved"].includes(
                                item?.ticket?.status
                              )
                            )}
                            onClick={() => handleEdit(formData, "Approved")}
                          >
                            {data.some(
                              (item) => item?.ticket?.status === "Resolved"
                            )
                              ? "Ticket Closed"
                              : "Approve"}
                          </button>
                        )}

                      <button
                        className="p-2 rounded border-1 text-[#D15E9C] border-[#D15E9C]"
                        onClick={() =>
                          router.push(
                            brandId
                              ? "/escalation-matrix/ticketing-list"
                              : "/escalation-matrix/escalation-matrix"
                          )
                        }
                      >
                        Back
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
                                    {moment(dataItem?.ticket?.date).format(
                                      "MMMM Do YYYY h:mm A"
                                    )}
                                  </p>
                                </div>
                                <div className="border border-gray-300 w-1/2 p-2">
                                  <div className="flex flex-col">
                                    <p className="font-semibold text-md ">
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
  const router = useRouter();

  const [data, setData] = useState({
    id: "",
    comment: "",
    status: "",
    userId: "",
  });
  const [disabled, setDisabled] = useState(false)
  const [commentError, setCommentError] = useState<any>([])
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
      console.error(err);
      setDisabled(false)
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
                    Comments
                  </label>
                  <textarea
                    className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    placeholder="Enter your comments here"
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
                style={
                  disabled
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
  
                }
            disabled={disabled}
            onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn-outline-purple" onClick={onClose}>
              Close
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
