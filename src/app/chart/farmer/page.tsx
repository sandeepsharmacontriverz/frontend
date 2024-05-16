"use client";
import React, { useEffect, useState } from "react";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';
import { BiFilterAlt } from "react-icons/bi";
import { RiMapPin2Line } from "react-icons/ri";
import "leaflet/dist/leaflet.css";
import Loader from "@components/core/Loader";
import { renderToString } from "react-dom/server";
import dynamic from 'next/dynamic';
import User from "@lib/User";

const L = typeof window !== 'undefined' ? require("leaflet") : null;

const MapIcon = typeof window !== 'undefined' ? L.icon({
  iconUrl: `data:image/svg+xml;base64,${ btoa(
    renderToString(<RiMapPin2Line />)
  ) }`,
  className: 'w-5 h-5'
}) : null;

const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), {
  ssr: false,
});

export default function dashboard() {
  useTitle("Dashboard");

  const [isLoading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [brands, setBrands] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villages, setVillages] = useState([]);
  const [overAllArea, setOverAllArea] = useState<any>();
  const [farmers, setFarmers] = useState<any>();
  const [farmerCount, setFarmerCount] = useState<any>();
  const [farmerArea, setFarmerArea] = useState<any>();
  const [productionEstimate, setProductionEstimate] = useState<any>();
  const [productionEstimateSeason, setProductionEstimateSeason] = useState<any>();
  const [farmerCountArea, setFarmerCountArea] = useState<any>();
  const [farmerDataAll, setFarmerDataAll] = useState<any>();
  const [farmerByCountry, setFarmerByCountry] = useState<any>();

  const [programId, setProgramId] = useState("");
  const [brandId, setBrandId] = useState<any>(User.brandId ? User.brandId : '');
  const [seasonId, setSeasonId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [curTab, setCurTab] = useState(1);


  const getQueryParams = (includeSeason = true) => {
    const params = new URLSearchParams();

    params.append("program", programId);
    params.append("brand", brandId);
    if (includeSeason)
      params.append("season", seasonId);
    params.append("country", countryId);
    params.append("state", stateId);
    params.append("district", districtId);
    params.append("block", blockId);
    params.append("village", villageId);

    return params.toString();
  };



  const fetchPrograms = async () => {
    try {
      const res = await API.get("program");
      if (res.success) {
        setPrograms(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBrand = async () => {
    try {
      if (programId) {
        const res = await API.get(`brand?programId=${ programId }`);
        if (res.success) {
          if (User.currentRole == 3
            && User.brandId) {
            setBrands(res.data.filter((brand: any) =>
              brand.id == User.brandId
            ));
          } else
            setBrands(res.data);

        }
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await API.get("season?sortName=name");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const fetchCountries = async () => {
    try {
      const res = await API.get("location/get-countries");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStates = async () => {
    try {
      if (countryId) {
        const res = await API.get(`location/get-states?countryId=${ countryId }`);
        if (res.success) {
          setStates(res.data);
        }
      } else {
        setStates([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDistricts = async () => {
    try {
      if (stateId) {
        const res = await API.get(`location/get-districts?stateId=${ stateId }`);
        if (res.success) {
          setDistricts(res.data);
        }
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBlocks = async () => {
    try {
      if (districtId) {
        const res = await API.get(`location/get-blocks?districtId=${ districtId }`);
        if (res.success) {
          setBlocks(res.data);
        }
      } else {
        setBlocks([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchVillages = async () => {
    try {
      if (blockId) {
        const res = await API.get(`location/get-villages?blockId=${ blockId }`);
        if (res.success) {
          setVillages(res.data);
        }
      } else {
        setVillages([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardOverAllArea = async () => {
    try {
      const res = await API.get("dashboard/farmer/area/overall?" + getQueryParams());
      if (res.success) {
        setOverAllArea(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardOverAll = async () => {
    try {
      const res = await API.get("dashboard/farmer/overall?" + getQueryParams());
      if (res.success) {
        setFarmers(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardFarmerCount = async () => {
    try {
      const res = await API.get("dashboard/farmer/count?" + getQueryParams());
      if (res.success) {
        setFarmerCount(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardFarmerAcre = async () => {
    try {
      const res = await API.get("dashboard/farmer/acre?" + getQueryParams());
      if (res.success) {
        setFarmerArea(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardEstimateAndProduction = async () => {
    try {
      const res = await API.get("dashboard/farmer/estimate/production/count?" + getQueryParams());
      if (res.success) {
        setProductionEstimate(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardEstimateAndProductionSeason = async () => {
    try {
      const res = await API.get("dashboard/farmer/estimate/production/count?" + getQueryParams(false) + "&type=2");
      if (res.success) {
        setProductionEstimateSeason(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardFarmerCountAndArea = async () => {
    try {
      const res = await API.get("dashboard/farmer/count/area?" + getQueryParams(false));
      if (res.success) {
        setFarmerCountArea(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardFarmerDataAll = async () => {
    try {
      const res = await API.get("dashboard/farmer/data/all?" + getQueryParams(false));
      if (res.success) {
        setFarmerDataAll(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFarmerByCountry = async () => {
    try {
      const res = await API.get("dashboard/farmer/by/country?" + getQueryParams());
      if (res.success) {
        setFarmerByCountry(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onApplyBtnClick = async () => {
    fetchDashboardOverAllArea();
    fetchDashboardOverAll();
    fetchDashboardFarmerCount();
    fetchDashboardFarmerAcre();
    fetchDashboardEstimateAndProduction();
    fetchDashboardEstimateAndProductionSeason();
    fetchDashboardFarmerCountAndArea();
    fetchDashboardFarmerDataAll();
    fetchFarmerByCountry();
  };

  const onCancelBtnClick = () => {
    setProgramId("");
    setBrandId("");
    setSeasonId("");
    setCountryId("");
    setStateId("");
    setDistrictId("");
    setBlockId("");
    setVillageId("");
    onApplyBtnClick();
  };


  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchSeasons(),
        fetchPrograms(),
        fetchDashboardOverAllArea(),
        fetchDashboardOverAll(),
        fetchDashboardFarmerCount(),
        fetchDashboardFarmerAcre(),
        fetchDashboardEstimateAndProduction(),
        fetchDashboardEstimateAndProductionSeason(),
        fetchDashboardFarmerCountAndArea(),
        fetchDashboardFarmerDataAll(),
        fetchFarmerByCountry(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setBrandId('');
    fetchBrand();
  }, [programId]);

  useEffect(() => {
    setStateId('');
    fetchStates();
  }, [countryId]);

  useEffect(() => {
    setDistrictId('');
    fetchDistricts();
  }, [stateId]);

  useEffect(() => {
    setBlockId('');
    fetchBlocks();
  }, [districtId]);

  useEffect(() => {
    setVillageId('');
    fetchVillages();
  }, [blockId]);

  const getOverAreaOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Overall Area',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: true
        }
      },
      legend: {
        useHTML: true,
        labelFormatter: function () {
          return `<div>${ this.name }</div><div>${ (this as any).custom ?? 0 }</div>`;
        },
      },
      series: [{
        type: 'pie',
        data: [{
          name: "Less than 1 acre",
          y: Number(overAllArea?.pLessThanOne) ?? 0,
          color: '#01e373',
          custom: overAllArea?.lessThanOne
        }, {
          name: "More than 2.5 acre",
          y: Number(overAllArea?.pMoreThanTwo) ?? 0,
          custom: overAllArea?.moreThanTwo,
          color: '#2caffe'
        }, {
          name: "Less than 1 to 2.5 acre",
          y: Number(overAllArea?.pMoreThanOne) ?? 0,
          custom: overAllArea?.moreThanOne,
          color: '#5651c7'
        }]
      }],
    };
  };

  const getFarmerCountOptions = (): HighCharts.Options => {
    return {
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      title: {
        text: 'Farmer Count',
        align: 'left'
      },
      xAxis: {
        categories: farmerCount ? farmerCount.season : [],
      },
      yAxis: {
        title: {
          text: 'Number of Farmers'
        }
      },
      accessibility: {
        enabled: false
      },
      series: [{
        type: 'column',
        showInLegend: false,
        data: farmerCount ? farmerCount.farmerCount : [],
        color: '#006600'
      }]
    };
  };

  const getTotalAreaOptions = (): HighCharts.Options => {
    return {
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      title: {
        text: 'Total Area(In Acre)',
        align: 'left'
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
        categories: farmerArea ? farmerArea.season : [],
      },
      yAxis: {
        title: {
          text: 'Areas in Acres'
        }
      },
      series: [{
        type: 'column',
        showInLegend: false,
        data: farmerArea ? farmerArea.acreCount : [],
        color: '#ff9900'
      }]
    };
  };

  const getEstimateAndProductionOptions = (): HighCharts.Options => {
    return {
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      title: {
        text: 'Estimated Seed Cotton vs Production',
        align: 'left'
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
        categories: productionEstimate ? productionEstimate.season : [],
      },
      yAxis: {
        title: {
          text: 'Farmer Quantity in Kgs'
        }
      },
      series: [{
        type: 'column',
        name: "Estimated Seed Cotton",
        color: '#ff3399',
        data: productionEstimate ? productionEstimate.estimate : []
      }, {
        type: 'column',
        name: "Production",
        color: '#000066',
        data: productionEstimate ? productionEstimate.production : []
      }]
    };
  };

  const getOverAllFarmersOptions = (): HighCharts.Options => {
    return {
      chart: {
        type: 'pie',
        spacingTop: 20,
        spacingBottom: 25
      },
      title: {
        text: 'Overall Farmers',
        align: 'left'
      },
      accessibility: {
        enabled: false
      },
      plotOptions: {
        pie: {
          shadow: false,
          dataLabels: {
            enabled: false
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'District',
        size: '100%',
        innerSize: '66%',
        data: farmers?.district?.map((district: any) => {
          return {
            name: district.name,
            y: district.count
          };
        }) ?? []
      }, {
        type: 'pie',
        name: 'State',
        size: '66%',
        innerSize: '33%',
        data: farmers?.state?.map((state: any) => {
          return {
            name: state.name,
            y: state.count
          };
        }) ?? []
      }, {
        type: 'pie',
        name: 'Country',
        data: farmers?.country?.map((country: any) => {
          return {
            name: country.name,
            y: country.count
          };
        }) ?? [],
        size: '33%',
        innerSize: '0%'
      }],
    };

  };

  const getFarmerCountAndAreaOptions = (): HighCharts.Options => {
    return {
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      title: {
        text: 'Farmer Count vs Total Area',
        align: 'left'
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
        categories: farmerCountArea ? farmerCountArea.season : [],
      },
      yAxis: {
        title: {
          text: 'Number of Farmers'
        }
      },
      series: [{
        type: 'column',
        name: "Farmer Count",
        data: farmerCountArea ? farmerCountArea.count : [],
        color: '#006600'
      }, {
        type: 'column',
        name: "Total Area",
        data: farmerCountArea ? farmerCountArea.acre : [],
        color: '#ff9900'
      }]
    };
  };

  const getEstimateVsProductionOptions = (): HighCharts.Options => {
    return {
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25,
      },
      title: {
        text: 'Total Estimated Production vs Total Cotton Procured',
        align: 'left'
      },
      legend: {
        useHTML: true,
        labelFormatter: function () {
          return `<div>${ this.name }</div>`;
        },
      },
      xAxis: {
        categories: productionEstimateSeason ? productionEstimateSeason.season.slice(-3) : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      accessibility: {
        enabled: false
      },
      series: [{
        type: 'column',
        name: "Estimate Production",
        data: productionEstimateSeason ? productionEstimateSeason.estimate.slice(-3) : [],
        color: '#000066'
      }, {
        type: 'column',
        name: "Cotton Procured",
        data: productionEstimateSeason ? productionEstimateSeason.production.slice(-3) : [],
        color: '#cc3300'
      }]
    };
  };

  const getCountVsAreaEstimateVsProductionOptions = (
    type: 'spline' | 'column'
  ): HighCharts.Options => {
    return {
      title: {
        text: 'Total Estimated production vs Total cotton procured vs Farmer count vs Total area',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
        categories: farmerDataAll ? farmerDataAll.season : [],
      },
      yAxis: {
        title: {
          text: ''
        }
      },
      series: [{
        type,
        showInLegend: true,
        name: "Total Area",
        data: farmerDataAll ? farmerDataAll.acre : [],
        color: '#ff9900',
        lineWidth: 4,
        marker: {
          radius: 4
        }
      }, {
        type,
        showInLegend: true,
        name: "Farmer Count",
        data: farmerDataAll ? farmerDataAll.count : [],
        color: '#006600',
        lineWidth: 4,
        marker: {
          radius: 4
        }
      }, {
        type,
        showInLegend: true,
        name: "Estimate",
        data: farmerDataAll ? farmerDataAll.estimate : [],
        color: '#000066',
        lineWidth: 4,
        marker: {
          radius: 4
        }
      }, {
        type,
        showInLegend: true,
        name: "Procured",
        data: farmerDataAll ? farmerDataAll.production : [],
        color: '#cc3300',
        lineWidth: 4,
        marker: {
          radius: 4
        }
      }]
    };
  };

  const FilterPopup = () => {
    return (
      <div>
        { showFilter && (
          <>
            <div className="fixPopupFilters flex h-full align-items-center w-auto z-[999] fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Filters</h3>
                  <button className="text-[20px]" onClick={ () => {
                    setShowFilter(!showFilter);
                  }
                  }>&times;</button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Program
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setProgramId(e.target.value) }
                            value={ programId }
                          >
                            <option value="">Select Program</option>
                            { programs.map((program: any) => (
                              <option key={ program.id } value={ program.id }>
                                { program.program_name }
                              </option>
                            )) }
                          </select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Brand
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setBrandId(e.target.value) }
                            value={ brandId }
                          >
                            <option value="">Select Brand</option>
                            { brands.map((brand: any) => (
                              <option key={ brand.id } value={ brand.id }>
                                { brand.brand_name }
                              </option>
                            )) }
                          </select>

                        </div>
                        { curTab === 1 && <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Season
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setSeasonId(e.target.value) }
                            value={ seasonId }
                          >
                            <option value="">Select Season</option>
                            { seasons.map((season: any) => (
                              <option key={ season.id } value={ season.id }>
                                { season.name }
                              </option>
                            )) }
                          </select>
                        </div> }
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Country
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setCountryId(e.target.value) }
                            value={ countryId }
                          >
                            <option value="">Select Country</option>
                            { countries.map((country: any) => (
                              <option key={ country.id } value={ country.id }>
                                { country.county_name }
                              </option>
                            )) }
                          </select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a State
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setStateId(e.target.value) }
                            value={ stateId }
                          >
                            <option value="">Select State</option>
                            { states.map((state: any) => (
                              <option key={ state.id } value={ state.id }>
                                { state.state_name }
                              </option>
                            )) }
                          </select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a District
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setDistrictId(e.target.value) }
                            value={ districtId }
                          >
                            <option value="">Select District</option>
                            { districts.map((district: any) => (
                              <option key={ district.id } value={ district.id }>
                                { district.district_name }
                              </option>
                            )) }
                          </select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Block
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setBlockId(e.target.value) }
                            value={ blockId }
                          >
                            <option value="">Select Block</option>
                            { blocks.map((block: any) => (
                              <option key={ block.id } value={ block.id }>
                                { block.block_name }
                              </option>
                            )) }
                          </select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Village
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setVillageId(e.target.value) }
                            value={ villageId }
                          >
                            <option value="">Select Village</option>
                            { villages.map((village: any) => (
                              <option key={ village.id } value={ village.id }>
                                { village.village_name }
                              </option>
                            )) }
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={ () => {
                              onApplyBtnClick();
                              setShowFilter(false);
                            } }
                          >
                            APPLY ALL FILTERS
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={ onCancelBtnClick }
                          >
                            CLEAR ALL FILTERS
                          </button>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) }
      </div>
    );
  };


  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }



  return (
    <div>
      <div className="flex justify-around mt-4">
        <button
          onClick={ () => setCurTab(1) }
          className={ `${ curTab === 1 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-full h-12 m-2` }
        >Farmer Dashboard</button>
        <button
          onClick={ () => setCurTab(2) }
          className={ `${ curTab === 2 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-full h-12 m-2` }
        >Trend Analysis</button>
      </div>
      <div className="mt-4">
        <button
          className="flex"
          type="button"
          onClick={ () => setShowFilter(!showFilter) }
        >
          FILTERS <BiFilterAlt className="m-1" />
        </button>
        <div className="relative">
          <FilterPopup />
        </div>
      </div>
      { curTab === 1 ?
        (<div>
          <div className="columns-3 mt-4">
            <div>
              <div className="w-full h-[400px] z-0 relative">
                { typeof window !== 'undefined' && <MapContainer
                  key={ Math.random() }
                  center={ [
                    20.593684,
                    78.96288
                  ] }
                  zoom={ 3 }
                  style={ { height: "400px", width: "100%" } }
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  { farmerByCountry && farmerByCountry.map((country: any, index: number) =>
                    <Marker
                      key={ index }
                      position={ [
                        country.latitude,
                        country.longitude,
                      ] }
                      icon={ MapIcon }
                    >
                      <Popup>
                        <div>
                          <div>{ country.countryName }</div>
                          <div>No.of Farmers:{ country.farmers }</div>
                          <div>Area:{ country.area }</div>
                        </div>
                      </Popup>
                    </Marker>
                  ) }
                </MapContainer> }

              </div>
            </div>
            <HighChartsReact
              options={ getOverAreaOptions() }
              highcharts={ HighCharts }
            />
            <HighChartsReact
              options={ getOverAllFarmersOptions() }
              highcharts={ HighCharts }
            />
          </div>
          <div className="columns-3 mt-4">
            <HighChartsReact
              options={ getFarmerCountOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getTotalAreaOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getEstimateAndProductionOptions() }
              highcharts={ HighCharts }

            />
          </div>
        </div>) : (<div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getFarmerCountAndAreaOptions() }
              highcharts={ HighCharts }
            />
            <HighChartsReact
              options={ getEstimateVsProductionOptions() }
              highcharts={ HighCharts }
            />
          </div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getCountVsAreaEstimateVsProductionOptions('column') }
              highcharts={ HighCharts }
            />
            <HighChartsReact
              options={ getCountVsAreaEstimateVsProductionOptions('spline') }
              highcharts={ HighCharts }
            />
          </div>
        </div>)
      }

    </div>
  );
}
