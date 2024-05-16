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
  const [ginners, setGinners] = useState([]);
  const [topVillage, setTopVillage] = useState<any>();
  const [topSpinner, setTopSpinner] = useState<any>();
  const [procuredProcessed, setProcuredProcessed] = useState<any>();
  const [procuredSold, setProcuredSold] = useState<any>();
  const [dataAll, setDataAll] = useState<any>();

  const [programId, setProgramId] = useState("");
  const [brandId, setBrandId] = useState<any>(User.brandId ? User.brandId : '');
  const [seasonId, setSeasonId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [ginnerId, setGinnerId] = useState("");
  const userGinnerId = User.MandiId;

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append("program", programId);
    params.append("brand", brandId);
    params.append("season", seasonId);
    params.append("country", countryId);
    params.append("state", stateId);
    params.append("district", districtId);
    params.append("ginner", String(userGinnerId));

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

  const fetchGinners = async () => {
    try {
      const params = new URLSearchParams();
      params.append("brandId", brandId);
      params.append("countryId", countryId);
      params.append("stateId", stateId);
      params.append("districtId", districtId);
      params.append("limit", "100");
      const res = await API.get("ginner?" + params.toString());
      if (res.success) {
        setGinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTopVillage = async () => {
    try {
      const res = await API.get("dashboard/ginner/top/village?" + getQueryParams());
      if (res.success) {
        setTopVillage(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTopSpinners = async () => {
    try {
      const res = await API.get("dashboard/ginner/top/spinners?" + getQueryParams());
      if (res.success) {
        setTopSpinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProcuredProcessed = async () => {
    try {
      const res = await API.get("dashboard/ginner/procured/processed?" + getQueryParams());
      if (res.success) {
        setProcuredProcessed(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProcuredSold = async () => {
    try {
      const res = await API.get("dashboard/ginner/lint/procured/sold?" + getQueryParams());
      if (res.success) {
        setProcuredSold(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const fetchDataAll = async () => {
    try {
      const res = await API.get("dashboard/ginner/data/get/all?" + getQueryParams());
      if (res.success) {
        setDataAll(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };




  const onApplyBtnClick = () => {
    fetchTopVillage();
    fetchTopSpinners();
    fetchProcuredProcessed();
    fetchProcuredSold();
    fetchDataAll();
  };

  const onCancelBtnClick = () => {
    setProgramId("");
    setBrandId("");
    setSeasonId("");
    setCountryId("");
    setStateId("");
    setDistrictId("");
    setGinnerId("");
    onApplyBtnClick();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchSeasons(),
        fetchPrograms(),
        fetchTopVillage(),
        fetchTopSpinners(),
        fetchProcuredProcessed(),
        fetchProcuredSold(),
        fetchDataAll()
      ]);
      setLoading(false);
    };
    if (userGinnerId)
      fetchData();

  }, [userGinnerId]);

  useEffect(() => {
    setBrandId('');
    fetchBrand();
  }, [programId]);

  useEffect(() => {
    setGinnerId('');
    fetchGinners();
  }, [brandId]);

  useEffect(() => {
    setStateId('');
    setGinnerId('');
    fetchGinners();
    fetchStates();
  }, [countryId]);

  useEffect(() => {
    setDistrictId('');
    setGinnerId('');
    fetchDistricts();
    fetchGinners();
  }, [stateId]);

  useEffect(() => {
    setGinnerId('');
    fetchGinners();
  }, [districtId]);



  const getProcuredAndProcessedOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Seed Cotton Procured vs Seed Cotton Processed',
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
        categories: procuredProcessed ? procuredProcessed.season : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'column',
        name: "Seed Cotton Procured",
        data: procuredProcessed ? procuredProcessed.stock : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Seed Cotton Processed",
        data: procuredProcessed ? procuredProcessed.procured : [],
        color: '#5651c7'
      }]
    };
  };

  const getProcuredVsProcessedOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Seed Cotton Procured vs Seed Cotton Processed',
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
        categories: procuredProcessed ? procuredProcessed.season : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'spline',
        name: "Seed Cotton Procured",
        data: procuredProcessed ? procuredProcessed.stock : [],
        color: '#000066'
      }, {
        type: 'spline',
        name: "Seed Cotton Processed",
        data: procuredProcessed ? procuredProcessed.procured : [],
        color: '#cc3300'
      }]
    };
  };

  const getLintProcuredVsSoldOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Lint Processed vs Lint Sold',
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
        categories: procuredSold ? procuredSold.season : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'spline',
        name: "Lint Processed",
        data: procuredSold ? procuredSold.procured : [],
        color: '#ff3399'
      }, {
        type: 'spline',
        name: "Lint Sold",
        data: procuredSold ? procuredSold.sold : [],
        color: '#5651c7'
      }]
    };
  };

  const getLintProcuredAndSoldOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Lint Processed vs Lint Sold',
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
        categories: procuredSold ? procuredSold.season : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'column',
        name: "Lint Processed",
        data: procuredSold ? procuredSold.procured : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Lint Sold",
        data: procuredSold ? procuredSold.sold : [],
        color: '#5651c7'
      }]
    };
  };

  const getCountVsAreaEstimateVsProductionOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Seed Cotton Procured vs Seed Cotton Processed vs Lint Processed vs Lint Sold',
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
        categories: dataAll ? dataAll.month : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Seed Cotton Procured",
        data: dataAll ? dataAll.cottonProcured : [],
        color: '#006600'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Seed Cotton Processed",
        data: dataAll ? dataAll.cottonStock : [],
        color: '#ff3399'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Lint Processed",
        data: dataAll ? dataAll.procured : [],
        color: '#ff9900'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Lint Sold",
        data: dataAll ? dataAll.sold : [],
        color: '#cc3300'
      }]
    };
  };

  const getTopTenVillageOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Total Seed Cotton Procured for top 10 villages',
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
        categories: topVillage ? topVillage.village : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Total Seed Cotton Procured",
        data: topVillage ? topVillage.count : [],
        color: '#006600'
      }]
    };
  };

  const getTopTenSpinnersOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Total Lint Sold to top 10 spinners',
        align: 'left',
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
        categories: topSpinner ? topSpinner.spinners : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Total Lint Sold",
        data: topSpinner ? topSpinner.count : [],
        color: '#ff3399'
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
                        </div> */}
                        {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
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
                        </div> */}
                        {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Ginner
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setGinnerId(e.target.value) }
                            value={ ginnerId }
                          >
                            <option value="">Select Ginner</option>
                            { ginners.map((ginner: any) => (
                              <option key={ ginner.id } value={ ginner.id }>
                                { ginner.name }
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
            options={ getLintProcuredAndSoldOptions() }
            highcharts={ HighCharts }

          />
          <HighChartsReact
            options={ getLintProcuredVsSoldOptions() }
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
            options={ getTopTenVillageOptions() }
            highcharts={ HighCharts }
          />
        </div>
        <div className="columns-1 mt-4">
          <HighChartsReact
            options={ getTopTenSpinnersOptions() }
            highcharts={ HighCharts }
          />
        </div>
      </div>
    </div>
  );
}
