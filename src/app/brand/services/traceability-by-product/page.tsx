"use client";
import Loader from "@components/core/Loader";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import User from "@lib/User";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

export default function page() {
  useTitle("Traceability by Product");
  const [roleLoading] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [styleMark, setStyleMark] = useState([]);

  const [choosedStyleMark, setChoosedStyleMark] = useState("");

  const brandId = User.brandId;
  useEffect(() => {
    if (brandId) {
      getStyleMark();
    }
  }, [brandId]);

  const getStyleMark = async () => {
    try {
      const response = await API.get(
        `brand-interface/style-mark?brandId=${brandId}`
      );
      if (response.success) {
        const dataOrg = response.data?.style
          .map((item: any) => item.style_mark_no)
          .filter(
            (styleMarkNo: any) => styleMarkNo !== null && styleMarkNo !== ""
          );
        setStyleMark(dataOrg);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getTracebaleData = () => {
    setData({
      no_of_bales: "abcdef",
    });
  };

  const handleChange = (event: any) => {
    const { value, name } = event.target;
    setChoosedStyleMark(value);
  };

  const clearFilter = () => {
    setChoosedStyleMark("");
    setData([]);
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/brand/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Services</li>
                <li>Traceability by Product</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth w-100">
                <div className="row my-4">
                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Select Style/Mark No
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                      value={choosedStyleMark || ""}
                      name="type"
                      onChange={handleChange}
                    >
                      <option value="">Select Style/Mark No</option>
                      {styleMark?.map((style: any) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12  customButtonGroup buttotn560Fix ">
                    <label className="text-gray-500 text-[12px] font-medium"></label>
                    <section className="my-1">
                      <button
                        className="btn-purple mr-2"
                        onClick={() => {
                          getTracebaleData();
                        }}
                      >
                        APPLY FILTER
                      </button>
                      <button
                        className="btn-outline-purple"
                        onClick={clearFilter}
                      >
                        CLEAR
                      </button>
                    </section>
                  </div>
                </div>
              </div>
              <hr className="my-6" />
              <div className="flagTimeline pt-5">
                <div className="sectionTime">
                  <section>
                    <h6>Farm Group</h6>
                    <ul>
                      <li>
                        Farm Group <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Programme <span>{data?.no_of_bales}</span>
                      </li>
                    </ul>
                  </section>
                </div>
                <div className="sectionTime">
                  <section>
                    <h6>Processor - Ginner</h6>
                    <ul>
                      <li>
                        No.bales <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Total Weight(Kgs) <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Lint Integrity Score <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Residual Integrity Score{" "}
                        <span>{data?.no_of_bales}</span>
                      </li>
                    </ul>
                  </section>
                </div>
                <div className="sectionTime">
                  <section>
                    <h6>Processor - Spinner</h6>
                    <ul>
                      <li>
                        Yarn Type <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Yarn Count <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Yarn Quantity(Kgs) <span>{data?.no_of_bales}</span>
                      </li>
                    </ul>
                  </section>
                </div>
                <div className="sectionTime">
                  <section>
                    <h6>Processor - Fabric</h6>
                    <ul>
                      <li>
                        Fabric Type <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        GSM <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Length/Quantity (Mts/Kgs){" "}
                        <span>{data?.no_of_bales}</span>
                      </li>
                    </ul>
                  </section>
                </div>
                <div className="sectionTime">
                  <section>
                    <h6>Processor - Product Manufacturer</h6>
                    <ul>
                      <li>
                        Color <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        No of pieces <span>{data?.no_of_bales}</span>
                      </li>
                      <li>
                        Type <span>{data?.no_of_bales}</span>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
