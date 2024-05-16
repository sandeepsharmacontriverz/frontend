"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import DashboardButtons from "../components/core/DashboardButtons";
import Link from "@components/core/nav-link";
import Chart from "@components/charts/Chart";
import useTranslations from "@hooks/useTranslation";

import API from "@lib/Api";
export default function Page() {
  useTitle("Dashboard");
  const [roleLoading] = useRole();
  const [seasons, setSeasons] = useState([]);
  const [value, setValue] = useState<string>("2020 - 21");


  const ApiGet = async () => {
    const url = "season?limit=10&page=1&pagination=true&search=&sort=desc";
    try {
      const result = await API.get(url);
      setSeasons(result.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    ApiGet();
  }, []);

  const handleYearSelect = (year: string) => {
    setValue(year);
  };
  const { translations, loading } = useTranslations();

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Brand</li>
                <li> DashBoard</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <DashboardButtons />
        </div>
        <div>
        </div>

        <div className="mt-5">
          <div className="select-season-box">
            <div className="select-wrapper">
              <div className="custom-select2">
                <select
                  className="jsSeasonSelect"
                  value={value}
                  onChange={(e) => handleYearSelect(e.target.value)}
                  data-type="city"
                >
                  <option value="">Select a year</option>
                  {seasons?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="season-slider-wrapper">
          <div className="seaason-slider-inner custom-dots jsSeasonSlider">
            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Farmers</h6>
                  <p className="season-count">338,174</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img1.png" alt="" />
                </div>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Estimated Cotton</h6>
                  <p className="season-count">1,053,930</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img2.png" alt="" />
                </div>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Lint</h6>
                  <p className="season-count">278,429</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img3.png" alt="" />
                </div>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Yarn</h6>
                  <p className="season-count">452,852,121</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img4.png" alt="" />
                </div>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Knitted Fabric</h6>
                  <p className="season-count">1,053,930</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img2.png" alt="" />
                </div>
              </div>
            </div>
            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Woven Fabric</h6>
                  <p className="season-count">1,053,930</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img2.png" alt="" />
                </div>
              </div>
            </div>

            <div className="slider-row">
              <div className="slider-col">
                <div className="slider-left">
                  <h6 className="season-heading">Woven Fabric</h6>
                  <p className="season-count">1,053,930</p>
                </div>
                <div className="slider-right">
                  <img src="/images/slider-img2.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>



        <Chart titleChart={translations.dashboard.farmerInformation} />

      </>
    );
  }
}
