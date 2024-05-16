"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import Accordian from "@components/core/Accordian";
import CommonDataTable from "@components/core/Table";
import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import { FaAngleDown, FaAngleRight, FaAngleUp } from "react-icons/fa";
import { useRouter } from "@lib/router-events";
import Link from '@components/core/nav-link';
import Accordion from "react-bootstrap/Accordion";
import { Scrollbars } from "react-custom-scrollbars";
import DataTable from "react-data-table-component";

export default function page() {
  useTitle("Farmer Details");
  const tabs = [{ name: "Farmer" }, { name: "Farm" }];
  const [roleLoading] = useRole();
  const searchParams = useSearchParams();
  const farmId: any = searchParams.get("id");
  const farmerId: any = searchParams.get("farmer");

  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [farmerDetails, setFarmerDetails] = useState<any>([]);
  const [farmID, setFarmID] = useState<any>("");
  const [farmDetails, setFarmDetails] = useState<any>([]);
  const [isFarmDetailShowing, setIsFarmDetailShowing] = useState<any>(false);
  const [isImageError, setIsImageError] = useState<boolean>(false);
  const { translations, loading } = useTranslations();

  useEffect(() => {
    getFarmData();
  }, [searchQuery, page, limit]);

  useEffect(() => {
    getFarmersDetails();
  }, [farmId]);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const getFarmData = async () => {
    const url = `farmer/farm?farmerId=${farmerId}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      } else {
        setData([]);
        setCount(0);
      }
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const getFarmersDetails = async () => {
    const url = `farmer/farm/get-farm?id=${farmId}`;
    try {
      const response = await API.get(url);
      setFarmerDetails(response.data.farmer);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getFarmDetails = async (farmId: any) => {
    setFarmID(farmId);
    const url = `farmer/farm/get-farm?id=${farmId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        setFarmDetails(response.data);
        setIsFarmDetailShowing(true);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  if (loading) {
    return <div> Loading...</div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      center: true,
    },
    {
      name: "Season",
      cell: (row: any) => (
        <div
          onClick={() => getFarmDetails(row.id)}
          className="text-blue-500 hover:text-blue-300 cursor-pointer"
        >
          {" "}
          {row.season.name}{" "}
        </div>
      ),
      center: true,
    },
    {
      name: "Agri Total Area",
      cell: (row: any) => row.agri_total_area,
      center: true,
    },
    {
      name: "Total Paddy Area",
      cell: (row: any) => row.paddy_total_area,
      center: true,
      wrap: true,
    },
  ];

  const columnsFarmer = [
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      cell: (row: any) => row?.program?.program_name,
      center: true,
    },
    {
      name: <p className="text-[13px] font-medium">Brand</p>,
      cell: (row: any) => row?.brand?.brand_name,
      center: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Farm Group </p>,
      cell: (row: any) => row?.farmGroup?.name,
      center: true,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date of Joining</p>,
      cell: (row: any) => row?.joining_date ? formatedDate(row?.joining_date) : '',
      center: true,
      wrap: true,
    },
    
    {
      name: <p className="text-[13px] font-medium">Rice Variety</p>,
      cell: (row: any) => row?.rice_variety?.variety_name,
      center: true,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Country</p>,
      cell: (row: any) => row?.country?.county_name,
      center: true,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> State </p>,
      cell: (row: any) => row?.state?.state_name,
      center: true,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> District </p>,
      cell: (row: any) => row?.district?.district_name,
      center: true,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Block </p>,
      cell: (row: any) => row?.block?.block_name,
      center: true,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Village </p>,
      cell: (row: any) => row?.village?.village_name,
      center: true,
      wrap: true,
    },
  ];

  const farmerInformation = () => {
    return (
      <div className="w-9/12">
        <div className="flex justify-between">
          <label>Program:</label>
          <p>{farmerDetails?.program?.program_name}</p>
        </div>
        <div className="flex justify-between">
          <label>Brand:</label> <p>{farmerDetails?.brand?.brand_name}</p>
        </div>
        <div className="flex justify-between">
          <label>Farm Group:</label> <p>{farmerDetails?.farmGroup?.name}</p>
        </div>
        <div className="flex justify-between">
          <label>Farmer Code:</label>
          <p>{farmerDetails?.code}</p>
        </div>
        <div className="flex justify-between">
          <label>First Name:</label> <p>{farmerDetails?.firstName}</p>
        </div>
        <div className="flex justify-between">
          <label>Last Name:</label> <p>{farmerDetails?.lastName}</p>
        </div>
      </div>
    );
  };

  const otherInfo = () => {
    return (
      <div className="w-9/12">
        <div className="flex justify-between">
          <label>Country:</label> <p>{farmerDetails?.country?.county_name}</p>
        </div>
        <div className="flex justify-between">
          <label>State:</label> <p>{farmerDetails?.state?.state_name}</p>
        </div>
        <div className="flex justify-between">
          <label>District:</label>{" "}
          <p>{farmerDetails?.district?.district_name}</p>
        </div>
        <div className="flex justify-between">
          <label>Taluk/Block:</label> <p>{farmerDetails?.block?.block_name}</p>
        </div>
        <div className="flex justify-between">
          <label>Village:</label> <p>{farmerDetails?.village?.village_name}</p>
        </div>
      </div>
    );
  };

  const handleImageError = () => {
    setIsImageError(true);
  };
  function renderView({ style, ...props }: any) {
    // const { top } = state;
    const viewStyle = {
      backgroundColor: `rgba(0,0,0,0.4)`,
    };
    return (
      <div className="box" style={{ ...style, ...viewStyle }} {...props} />
    );
  }
  const formatedDate = (isoDate: any) => {
    const date = new Date(isoDate);

    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Month is zero-based
    const year = date.getUTCFullYear();

    return (
      (day < 10 ? "0" : "") +
      day +
      "-" +
      (month < 10 ? "0" : "") +
      month +
      "-" +
      year
    );
  };

  if (!roleLoading) {
    return (
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
                <li>
                  <Link href="/services/farmer-registration">
                    Farmer Registration
                  </Link>
                </li>
                <li>Farmer Details</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="farm-details">
              <div className="farm-detail-left">
                <div className="panel-gray h-100">
                  <div className="w-full customButtonGroup text-center">
                    <button
                      className="btn-purple mr-2"
                      onClick={() =>
                        router.push(
                          `/services/farmer-registration/edit-farmer?id=${farmId}&farmer=${farmerId}`
                        )
                      }
                    >
                      EDIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => router.back()}
                    >
                      BACK
                    </button>
                  </div>
                  {!isImageError && farmerDetails.qrUrl ? (
                    <div className="user-profile mg-t-44">
                      <img
                        alt="QR Image"
                        src={
                          process.env.NEXT_PUBLIC_API_URL +
                          "file/" +
                          farmerDetails?.qrUrl
                        }
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="user-profile mg-t-44">
                      <h3 className="heading24">
                        {farmerDetails?.firstName} {farmerDetails?.lastName}
                      </h3>
                      <div className="farmar-code mg-t-44">
                        <p className="heading16">Farmar Code</p>
                        <p className="heading24">{farmerDetails?.code}</p>
                      </div>
                      <div className="details-list-group mg-t-44">
                        <ul className="detail-list">
                          <li className="item">
                            <span className="label">Programme:</span>
                            <span className="val">
                              {farmerDetails?.program?.program_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Brand:</span>
                            <span className="val">
                              {farmerDetails?.brand?.brand_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Farm Group:</span>
                            <span className="val">
                              {farmerDetails?.farmGroup?.name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Tracenet Id:</span>
                            <span className="val">
                              {farmerDetails?.tracenet_id}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">ICS Name:</span>
                            <span className="val">
                              {farmerDetails?.ics?.ics_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Certification Status</span>
                            <span className="val">
                              {farmerDetails?.cert_status}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Country:</span>
                            <span className="val">
                              {farmerDetails?.country?.county_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">State:</span>
                            <span className="val">
                              {farmerDetails?.state?.state_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">District:</span>
                            <span className="val">
                              {farmerDetails?.district?.district_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Taluk/Block:</span>
                            <span className="val">
                              {farmerDetails?.block?.block_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Village:</span>
                            <span className="val">
                              {farmerDetails?.village?.village_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Rice Variety:</span>
                            <span className="val">
                              {farmerDetails?.rice_variety?.variety_name}
                            </span>
                          </li>
                          <li className="item">
                            <span className="label">Date of Joining:</span>
                            <span className="val">
                              {farmerDetails?.joining_date ? formatedDate(farmerDetails?.joining_date) : ''}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="farm-detail-right">
                <div className="panel-gray mb-5">
                  <div className="widget-head mg-b-24">
                    <h3 className="heading18 heading_custom">Farmer Details</h3>
                  </div>
                  <div className="items-center rounded-lg overflow-hidden border border-grey-100">

                    <DataTable
                      fixedHeader={true}
                      noDataComponent={
                        <p className="py-3 font-bold text-lg">No data available in table</p>
                      }
                      columns={columnsFarmer}
                      data={[farmerDetails]}
                    />
                  </div>
                </div>

                {!isFarmDetailShowing ? (
                  <div className="panel-gray">
                    <div className="widget-head mg-b-24">
                      <h3 className="heading18 heading_custom">Farm Details</h3>
                      <div className="action-holder ms-auto">
                        <button
                          className="btn btn-purple"
                          onClick={() =>
                            router.push(
                              `/services/farmer-registration/add-farm?id=${farmerId}&farmId=${farmId}`
                            )
                          }
                        >
                          ADD FARM
                        </button>
                      </div>
                    </div>
                    <CommonDataTable
                      columns={columns}
                      count={count}
                      data={data}
                      updateData={updatePage}
                    />
                  </div>
                ) : (
                  <div className="panel-gray">
                    <div className="widget-head mg-b-24">
                      <h3 className="heading18 heading_custom">
                        OTHER DETAILS
                      </h3>
                      <div className="action-holder ms-auto">
                        <div className="w-full customButtonGroup text-center">
                          <button
                            className="btn-purple mr-2"
                            onClick={() =>
                              router.push(
                                `/services/farmer-registration/edit-farm?id=${farmID}&farmId=${farmId}`
                              )
                            }
                          >
                            EDIT FARM
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={() => {
                              setFarmDetails([]);
                              setFarmID("");
                              setIsFarmDetailShowing(false);
                            }}
                          >
                            BACK
                          </button>
                        </div>
                      </div>
                    </div>
                    <h2 className="heading32">{farmDetails?.season?.name}</h2>
                    <Scrollbars
                      renderThumbVertical={renderView}
                      autoHide
                      autoHideTimeout={5000}
                      autoHideDuration={500}
                      autoHeight
                      autoHeightMin={0}
                      autoHeightMax={250}
                      thumbMinSize={30}
                      universal={true}
                    >
                      <Accordion>
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>Agriculture Area</Accordion.Header>
                          <Accordion.Body>
                            <div>
                              <div className="row">
                                <ul className="detail-list-custom">
                                  <li>
                                    <span className="label">Total Area:</span>
                                    <span className="val">
                                      {farmDetails?.agri_total_area}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="label">
                                      Estimated Yield (Kg/Ac):
                                    </span>
                                    <span className="val">
                                      {farmDetails?.agri_estimated_yeld}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="label">
                                      Total Estimation Production:
                                    </span>
                                    <span className="val">
                                      {farmDetails?.agri_estimated_prod}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>Paddy Area</Accordion.Header>
                          <Accordion.Body>
                            <div>
                              <div className="row">
                                <ul className="detail-list-custom">
                                  <li>
                                    <span className="label">Total Area:</span>
                                    <span className="val">
                                      {farmDetails?.paddy_total_area}
                                    </span>
                                  </li>
                                  <li>
                                    <span className="label">
                                      Total Estimation Paddy:
                                    </span>
                                    <span className="val">
                                      {farmDetails?.total_estimated_paddy}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </Scrollbars>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* <div className="mt-5">
                    <div className="flex flex-wrap border-b-4 border-black ">
                        {tabs.map((tab, index) => (
                            <div
                                key={index}
                                className={`px-4 text-md py-2  cursor-pointer  ${index === activeTab ? 'border-t-2 border-black ' : ''}`}
                                onClick={() => setActiveTab(index)}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                    {activeTab === 0 ?
                        <div className="p-2">
                            <div className="flex justify-end p-1">
                                <div className="search-filter-right">
                                    <button className="btn btn-all btn-purple" onClick={() => router.push(`/services/farmer-registration/edit-farmer?id=${farmerId}`)
                                    }>Edit</button>
                                </div>
                                <div className="search-filter-right ml-3">
                                    <button className="btn btn-all border" onClick={() => router.back()
                                    }>Back</button>
                                </div>
                            </div>
                            <div className="flex justify-between gap-5 w-full">
                                <div className="w-1/2 ">
                                    <Accordian title={'Farmer Information'} content={farmerInformation()} firstSign={<FaAngleDown color='white' />} secondSign={<FaAngleRight color='white' />} />
                                </div>
                                <div className="w-1/2 ">
                                    <Accordian title={'Farmer Address'} content={otherInfo()} firstSign={<FaAngleDown color='white' />} secondSign={<FaAngleRight color='white' />} />
                                </div>
                            </div>
                        </div>
                        :
                        <div className="farm-group-box">
                            <div className="farm-group-inner">
                                <div className="table-form">
                                    <div className="table-minwidth w-100">

                                        <div className="search-filter-row">
                                            <div className="search-filter-left ">
                                                <div className="search-bars">
                                                    <form className="form-group mb-0 search-bar-inner">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-new jsSearchBar "
                                                            placeholder={translations.common.search}
                                                            value={searchQuery}
                                                            onChange={searchData}
                                                        />
                                                        <button type="submit" className="search-btn">
                                                            <span className="icon-search"></span>
                                                        </button>
                                                    </form>
                                                </div>

                                            </div>
                                            <div className="search-filter-right">
                                                <button className="btn btn-all btn-purple" onClick={() => router.push(`/services/farmer-registration/add-farm?id=${farmerId}`)
                                                }>Add Farm</button>
                                            </div>
                                        </div>
                                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                                    </div>
                                </div>
                            </div>
                        </div>

                    }
                </div> */}
      </div>
    );
  }
}
