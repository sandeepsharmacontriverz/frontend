"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import NavLink from "@components/core/nav-link";
import Head from "next/head";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";

import Chart from "@components/charts/Chart";
import API from "@lib/Api";
import Select, { GroupBase } from "react-select";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loader from "@components/core/Loader";

export default function dashboard() {
  useTitle("Dashboard");

  const [roleLoading, hasAccess] = useRole();
  const [value, setValue] = useState<any>("");
  const [data, setData] = useState<any>([]);
  const [graphData, setGraphData] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>([]);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    getSeasons();
  }, []);

  useEffect(() => {
    getDashboardData();
  }, [value]);

  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          autoplay: true,
          autoplaySpeed: 4000,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          autoplay: true,
          autoplaySpeed: 4000,
        },
      },
    ],
  };
  const getSeasons = async () => {
    const url = "season?limit=10&page=1&pagination=true&search=&sort=desc";
    try {
      const result = await API.get(url);
      setSeasons(result.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getDashboardData = async () => {
    const url = value !== undefined ? `farmer/dashboard?seasonId=${value}` : 'farmer/dashboard?seasonId=';
    try {
      const result = await API.get(url);
      if (result.success) {
        setIsProcessed(true);
        setData(result.data);
        setGraphData(result.data?.graph);
      } else {
        setIsProcessed(true);
      }
    } catch (error) {
      setIsProcessed(true);
      console.log(error, "error");
    }
  };

  const series = graphData
    ?.map((item: any) => {
      return {
        type: "column",
        name: item.season.name,
        data: [
          parseFloat(item.total_farmers),
          parseFloat(item.total_area),
          parseFloat(item.total_expected_yield) / 1000,
        ],
      };
    })
    .sort((a: any, b: any) => {
      return a.name.localeCompare(b.name);
    });

  const handleYearSelect = (name?: any, value?: any, event?: any) => {
    setValue(value);
  };

  const { translations, loading } = useTranslations();

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && hasAccess?.role?.userCategory?.category_name?.toLowerCase() !== "superadmin" && hasAccess?.role?.userCategory?.category_name?.toLowerCase() !== "admin") {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.role?.userCategory?.category_name?.toLowerCase() === "superadmin" || hasAccess?.role?.userCategory?.category_name?.toLowerCase() === "admin") {
    return (
      <>
        <Head>
        <title>Rice Traceability | Dashboard</title>
        <meta name="description" content="sffdfsf" />
        <meta property="og:title" content="tracebale" />
        <meta property="og:description" content="I'm superman" />
        <meta property="og:url" content="https://frontend-eta-ebon-62.vercel.app/dashboard" />
        <meta property="og:image" content="https://frontend-eta-ebon-62.vercel.app/images/cottonconnect.png" />
        <meta name="twitter:title" content="tracebale" />
        <meta name="twitter:description" content="I'm superman" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@lighter_app" />
        <meta name="twitter:image" content="https://frontend-eta-ebon-62.vercel.app/images/cottonconnect.png" />
        <meta name="twitter:creator" content="@lighter_app" />
      </Head>
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <NavLink href="dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <div className="select-season-box">
            <div className="select-wrapper">
              <div className="custom-select2">
                {/* <Form.Select
                  aria-label="Default select example"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                  name="seasonId"
                  value={value}
                  onChange={handleYearSelect}
                >
                  <option value="">Select a Year</option>
                  {seasons?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Select> */
                }
                <Select
                  aria-label="Default select example"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  name="seasonId"
                  value={value ? { label: seasons?.find((seasonId: any) => seasonId.id == value)?.name, value: value } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select a Year"
                  options={(seasons || []).map(({ id, name }: any) => ({
                    label: name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleYearSelect("seasonId", item?.value);
                  }}
                />

              </div>
            </div>
          </div>
        </div>

        {isProcessed ? (
          <div className="season-slider-wrapper">
            <Slider className="customCarousel" {...settings}>
              <div className="slider-row w-100">
                <div className="slider-col">
                  <div className="slider-left">
                    <h6 className="season-heading">Farmers</h6>
                    <p className="season-count">
                      {data.total_farmers
                        ? data?.total_farmers + " " + "Farmer"
                        : "0 Farmer"}
                    </p>
                  </div>
                  <div className="slider-right">
                    <img src="/images/slider-img1.png" alt="" />
                  </div>
                </div>
              </div>
              <div className="slider-row w-100">
                <div className="slider-col">
                  <div className="slider-left">
                    <h6 className="season-heading">Area</h6>
                    <p className="season-count">
                      {data.total_area
                        ? Math.round(data?.total_area) + " " + "Acres"
                        : "0 Acres"}{" "}
                    </p>
                  </div>
                  <div className="slider-right">
                    <img src="/images/slider-img2.png" alt="" />
                  </div>
                </div>
              </div>
              <div className="slider-row w-100">
                <div className="slider-col">
                  <div className="slider-left">
                    <h6 className="season-heading">Expected Paddy</h6>
                    <p className="season-count">
                      {data.total_expected_yield
                        ? Math.round(data?.total_expected_yield / 1000) +
                        " " +
                        "MT"
                        : "0 MT"}
                    </p>
                  </div>
                  <div className="slider-right">
                    <img src="/images/slider-img3.png" alt="" />
                  </div>
                </div>
              </div>
              <div className="slider-row w-100">
                <div className="slider-col">
                  <div className="slider-left">
                    <h6 className="season-heading">Procured Quantity</h6>
                    <p className="season-count">
                      {data?.total_procured
                        ? Math.round(data?.total_procured) + " " + "Kgs"
                        : 0 + " " + "Kgs"}
                    </p>
                  </div>
                  <div className="slider-right">
                    <img src="/images/slider-img4.png" alt="" />
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        ) : (
          ""
        )}

        <Chart
          titleChart={translations.dashboard.farmerInformation}
          series={series}
        />
      </div>
      </>
    );
  }
}
