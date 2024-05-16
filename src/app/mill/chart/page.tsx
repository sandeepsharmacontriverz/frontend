"use client";
import React, { useEffect, useState } from "react";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';
import { BiFilterAlt } from "react-icons/bi";
import Loader from "@components/core/Loader";
import User from "@lib/User";

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
  const [spinners, setSpinners] = useState([]);
  const [topGinner, setTopGinner] = useState<any>();
  const [procuredProcessed, setProcuredProcessed] = useState<any>();
  const [procuredSold, setProcuredSold] = useState<any>();
  const [dataAll, setDataAll] = useState<any>();
  const [topFabric, setTopFabric] = useState<any>();

  const [programId, setProgramId] = useState("");
  const [brandId, setBrandId] = useState<any>(User.brandId ? User.brandId : '');
  const [seasonId, setSeasonId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [spinnerId, setSpinnerId] = useState("");
  const userSpinnerId = User.MillId;

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append("program", programId);
    params.append("brand", brandId);
    params.append("season", seasonId);
    params.append("country", countryId);
    params.append("state", stateId);
    params.append("district", districtId);
    params.append("spinner", String(userSpinnerId));

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

  const fetchSpinners = async () => {
    try {
      const params = new URLSearchParams();
      params.append("brandId", brandId);
      params.append("countryId", countryId);
      params.append("stateId", stateId);
      params.append("districtId", districtId);
      params.append("limit", "100");
      const res = await API.get("spinner?" + params.toString());
      if (res.success) {
        setSpinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTopGinners = async () => {
    try {
      const res = await API.get("dashboard/spinner/top/ginners?" + getQueryParams());
      if (res.success) {
        setTopGinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLintProcuredProcessed = async () => {
    try {
      const res = await API.get("dashboard/spinner/lint/procured/processed?" + getQueryParams());
      if (res.success) {
        setProcuredProcessed(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchYarnProcuredSold = async () => {
    try {
      const res = await API.get("dashboard/spinner/yarn/procured/sold?" + getQueryParams());
      if (res.success) {
        setProcuredSold(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const fetchDataAll = async () => {
    try {
      const res = await API.get("dashboard/spinner/data/get/all?" + getQueryParams());
      if (res.success) {
        setDataAll(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const fetchTopFabricAll = async () => {
    try {
      const res = await API.get("dashboard/spinner/top/fabric?" + getQueryParams());
      if (res.success) {
        setTopFabric(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };




  const onApplyBtnClick = () => {
    fetchTopGinners();
    fetchLintProcuredProcessed();
    fetchYarnProcuredSold();
    fetchDataAll();
    fetchTopFabricAll();
  };

  const onCancelBtnClick = () => {
    setProgramId("");
    setBrandId("");
    setSeasonId("");
    setCountryId("");
    setStateId("");
    setDistrictId("");
    setSpinnerId("");
    onApplyBtnClick();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchSeasons(),
        fetchPrograms(),
        fetchTopGinners(),
        fetchLintProcuredProcessed(),
        fetchYarnProcuredSold(),
        fetchDataAll(),
        fetchTopFabricAll()
      ]);
      setLoading(false);
    };
    if (userSpinnerId)
      fetchData();
  }, [userSpinnerId]);

  useEffect(() => {
    setBrandId('');
    fetchBrand();
  }, [programId]);

  useEffect(() => {
    setSpinnerId('');
    fetchSpinners();
  }, [brandId]);


  useEffect(() => {
    setStateId('');
    fetchStates();
    setSpinnerId('');
    fetchSpinners();
  }, [countryId]);

  useEffect(() => {
    setDistrictId('');
    fetchDistricts();
    setSpinnerId('');
    fetchSpinners();
  }, [stateId]);

  useEffect(() => {
    setSpinnerId('');
    fetchSpinners();
  }, [districtId]);


  const getProcuredAndProcessedOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Lint Procured vs Lint Processed',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: procuredProcessed ? procuredProcessed.season : [],
      },
      series: [{
        type: 'column',
        name: "Lint Procured",
        data: procuredProcessed ? procuredProcessed.lintProcured : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Lint Processed",
        data: procuredProcessed ? procuredProcessed.lintProcessed : [],
        color: '#ff9900'
      }]
    };
  };

  const getProcuredVsProcessedOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Lint Procured vs Lint Processed',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: procuredProcessed ? procuredProcessed.season : [],
      },
      series: [{
        type: 'spline',
        name: "Lint Procured",
        data: procuredProcessed ? procuredProcessed.lintProcured : [],
        color: '#ff3399'
      }, {
        type: 'spline',
        name: "Lint Processed",
        data: procuredProcessed ? procuredProcessed.procured : [],
        color: '#cc3300'
      }]
    };
  };

  const getYarnProcuredVsProcessedOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Yarn Processed vs Yarn Sold',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: procuredSold ? procuredSold.season : [],
      },
      series: [{
        type: 'spline',
        name: "Yarn Processed",
        data: procuredSold ? procuredSold.yarnProcured : [],
        color: '#5651c7'
      }, {
        type: 'spline',
        name: "Yarn Sold",
        data: procuredSold ? procuredSold.yarnSold : [],
        color: '#cc3300'
      }]
    };
  };

  const getYanProcuredAndSoldOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Yarn Processed vs Yarn Sold',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: procuredSold ? procuredSold.season : [],
      },
      series: [{
        type: 'column',
        name: "Yarn Processed",
        data: procuredSold ? procuredSold.yarnProcured : [],
        color: '#5651c7'
      }, {
        type: 'column',
        name: "Yarn Sold",
        data: procuredSold ? procuredSold.yarnSold : [],
        color: '#cc3300'
      }]
    };
  };

  const getCountVsAreaEstimateVsProductionOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Lint Procured Vs Lint Processed vs Yarn Procured Vs Yarn Sold',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: dataAll ? dataAll.month : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Lint Procured",
        data: dataAll ? dataAll.lintProcessed : [],
        color: '#ff3399'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Lint Processed",
        data: dataAll ? dataAll.lintProcured : [],
        color: '#ff9900'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Yarn Procured",
        data: dataAll ? dataAll.yarnProcured : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Yarn Sold",
        data: dataAll ? dataAll.yarnSold : [],
        color: '#cc3300'
      }]
    };
  };

  const getTopTenGinnersOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Lint Procured - Top 10 ginners',
        align: 'left',
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: topGinner ? topGinner.ginners : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Lint Procured",
        data: topGinner ? topGinner.count : [],
        color: '#006600'
      }]
    };
  };

  const getTopTenFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Yarn Sold - Top 10 Fabric mills',
        align: 'left',
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      xAxis: {
        categories: topFabric ? topFabric.name : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Yarn Sold",
        data: topFabric ? topFabric.count : [],
        color: '#ff9900'
      }]
    };
  };

  const FilterPopup = () => {
    return (
      <div>
        { showFilter && (
          <>
            <div className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
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
                        {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
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

                        </div> */}
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Season
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setSeasonId(e.target.value) }
                            value={ seasonId }
                          >
                            <option value="">Select a Season</option>
                            { seasons.map((season: any) => (
                              <option key={ season.id } value={ season.id }>
                                { season.name }
                              </option>
                            )) }
                          </select>
                        </div>
                        {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
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
                            Select a Spinner
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setSpinnerId(e.target.value) }
                            value={ spinnerId }
                          >
                            <option value="">Select Spinner</option>
                            { spinners.map((spinner: any) => (
                              <option key={ spinner.id } value={ spinner.id }>
                                { spinner.name }
                              </option>
                            )) }
                          </select>
                        </div> */}

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
      <div>
        <div className="columns-2 mt-4">
          <HighChartsReact
            options={ getProcuredAndProcessedOptions() }
            highcharts={ HighCharts }

          />
          <HighChartsReact
            options={ getProcuredVsProcessedOptions() }
            highcharts={ HighCharts }
          />
        </div>
        <div className="columns-2 mt-4">
          <HighChartsReact
            options={ getYanProcuredAndSoldOptions() }
            highcharts={ HighCharts }

          />
          <HighChartsReact
            options={ getYarnProcuredVsProcessedOptions() }
            highcharts={ HighCharts }
          />
        </div>
        <div className="columns-1 mt-4">
          <HighChartsReact
            options={ getCountVsAreaEstimateVsProductionOptions() }
            highcharts={ HighCharts }
          />
        </div>
        <div className="columns-1 mt-4">
          <HighChartsReact
            options={ getTopTenGinnersOptions() }
            highcharts={ HighCharts }
          />
          <HighChartsReact
            options={ getTopTenFabricOptions() }
            highcharts={ HighCharts }
          />
        </div>
      </div>
    </div>
  );
}
