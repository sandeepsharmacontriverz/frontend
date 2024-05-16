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
  const [programs, setPrograms] = useState<any>([]);
  const [brands, setBrands] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>([]);
  const [countries, setCountries] = useState<any>([]);
  const [states, setStates] = useState<any>([]);
  const [districts, setDistricts] = useState<any>([]);
  const [blocks, setBlocks] = useState<any>([]);
  const [villages, setVillages] = useState<any>([]);
  const [ginners, setGinners] = useState<any>([]);
  const [monGinners, setMonGinners] = useState<any>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [monShowFilter, setMonShowFilter] = useState(false);
  const [countryEstimateProduction, setCountryEstimateProduction] = useState<any>();
  const [estimatedProcured, setEstimatedProcured] = useState<any>();
  const [procuredProcessed, setProcuredProcessed] = useState<any>();
  const [monthlyProcuredProcessed, setMonthlyProcuredProcessed] = useState<any>();
  const [estimatedProcuredProcessed, setEstimatedProcuredProcessed] = useState<any>();

  const [programId, setProgramId] = useState("");
  const [brandId, setBrandId] = useState<any>(User.brandId ? User.brandId : '');
  const [seasonId, setSeasonId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [ginnerId, setGinnerId] = useState("");
  const [curTab, setCurTab] = useState(1);
  const [monCountryId, setMonCountryId] = useState("");
  const [monSeasonId, setMonSeasonId] = useState("");
  const [monGinnerId, setMonGinnerId] = useState("");

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append("program", programId);
    params.append("brand", brandId);
    params.append("season", seasonId);
    params.append("country", countryId);
    params.append("state", stateId);
    params.append("district", districtId);
    params.append("block", blockId);
    params.append("village", villageId);
    params.append("ginner", ginnerId);

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

  const fetchMonGinners = async () => {
    try {
      const params = new URLSearchParams();
      params.append("countryId", monCountryId);
      const res = await API.get("ginner?" + params.toString());
      if (res.success) {
        setMonGinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCountryEstimateProduction = async () => {
    try {
      const res = await API.get("dashboard/procurement/country/estimate/production?" + getQueryParams());
      if (res.success) {
        setCountryEstimateProduction(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEstimatedProcured = async () => {
    try {
      const res = await API.get("dashboard/procurement/estimated/procured?" + getQueryParams());
      if (res.success) {
        setEstimatedProcured(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProcuredProcessed = async () => {
    try {
      const res = await API.get("dashboard/procurement/procured/processed?" + getQueryParams());
      if (res.success) {
        setProcuredProcessed(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProcuredProcessedMonthly = async () => {
    try {
      const params = new URLSearchParams();

      params.append("season", monSeasonId);
      params.append("country", monCountryId);
      params.append("ginner", monGinnerId);

      const res = await API.get("dashboard/procurement/procured/processed/monthly?" + params.toString());
      if (res.success) {
        setMonthlyProcuredProcessed(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEstimatedProcuredProcessed = async () => {
    try {
      const res = await API.get("dashboard/procurement/estimated/procured/processed?" + getQueryParams());
      if (res.success) {
        setEstimatedProcuredProcessed(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onApplyBtnClick = () => {
    fetchCountryEstimateProduction();
    fetchEstimatedProcured();
    fetchProcuredProcessed();
    fetchEstimatedProcuredProcessed();
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
    setGinnerId("");
    onApplyBtnClick();
  };

  const onMonApplyBtnClick = () => {
    fetchProcuredProcessedMonthly();
  };

  const onMonCancelBtnClick = () => {
    setMonCountryId("");
    setMonGinnerId("");
    setMonSeasonId("");
    onMonApplyBtnClick();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchSeasons(),
        fetchPrograms(),
        fetchCountryEstimateProduction(),
        fetchEstimatedProcured(),
        fetchProcuredProcessed(),
        fetchProcuredProcessedMonthly(),
        fetchEstimatedProcuredProcessed(),
        fetchGinners(),
        fetchMonGinners()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(()=> {
    setMonGinnerId('')
    fetchMonGinners();
  },[monCountryId])

  useEffect(() => {
    setGinnerId('');
    fetchGinners();
  }, [brandId]);

  useEffect(() => {
    setBrandId('');
    fetchBrand();
  }, [programId]);

  useEffect(() => {
    setStateId('');
    fetchStates();
    setGinnerId('');
    fetchGinners();
  }, [countryId]);

  useEffect(() => {
    setDistrictId('');
    fetchDistricts();
    setGinnerId('');
    fetchGinners();
  }, [stateId]);

  useEffect(() => {
    setBlockId('');
    fetchBlocks();
    setGinnerId('');
    fetchGinners();
  }, [districtId]);

  useEffect(() => {
    setVillageId('');
    fetchVillages();
  }, [blockId]);

  const getEstimatedProcuredOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Total Estimated seed cotton vs Total seed cotton procured',
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
        categories: estimatedProcured ? estimatedProcured.season : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Total Estimated seed cotton",
        data: estimatedProcured ? estimatedProcured.estimate : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Total seed cotton procured",
        data: estimatedProcured ? estimatedProcured.procured : [],
        color: '#cc3300'
      }]
    };
  };

  const getProcuredProcessedOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Total seed cotton procured vs Total seed cotton processed',
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
        categories: procuredProcessed ? procuredProcessed.season : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Total seed cotton procured",
        data: procuredProcessed ? procuredProcessed.procured : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Total seed cotton processed",
        data: procuredProcessed ? procuredProcessed.processed : [],
        color: '#cc3300'
      }]
    };
  };

  const getProcuredProcessedMonthlyOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Season Summary for Seed Cotton Procured Vs Seed Cotton Processed',
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
        categories: monthlyProcuredProcessed ? monthlyProcuredProcessed.month : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Seed Cotton Procured",
        data: monthlyProcuredProcessed ? monthlyProcuredProcessed.procured : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Seed Cotton Processed",
        data: monthlyProcuredProcessed ? monthlyProcuredProcessed.processed : [],
        color: '#cc3300'
      }]
    };
  };


  const getEstimatedProcuredProcessedColumnOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Seed cotton Estimated vs Procured vs Processed',
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
        categories: estimatedProcuredProcessed ? estimatedProcuredProcessed.season : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Seed cotton Estimated",
        data: estimatedProcuredProcessed ? estimatedProcuredProcessed.estimated : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Procured",
        data: estimatedProcuredProcessed ? estimatedProcuredProcessed.procured : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Processed",
        data: estimatedProcuredProcessed ? estimatedProcuredProcessed.processed : [],
        color: '#cc3300'
      }]
    };
  };

  const getEstimatedProcuredProcessedSplineOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Seed cotton Estimated vs Procured vs Processed',
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
        categories: estimatedProcuredProcessed ? estimatedProcuredProcessed.season : [],
      },
      series: [{
        type: 'spline',
        showInLegend: true,
        name: "Seed cotton Estimated",
        data: estimatedProcuredProcessed ? estimatedProcuredProcessed.estimated : [],
        color: '#5651c7'
      }, {
        type: 'spline',
        showInLegend: true,
        name: "Procured",
        data: estimatedProcuredProcessed ? estimatedProcuredProcessed.procured : [],
        color: '#5651c7'
      }, {
        type: 'spline',
        showInLegend: true,
        name: "Processed",
        data: estimatedProcuredProcessed ? estimatedProcuredProcessed.processed : [],
        color: '#cc3300'
      }]
    };
  };

  const getCountryEstimateProcuredOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Total estimated production vs Total cotton procured',
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
        categories: countryEstimateProduction ? countryEstimateProduction.name : [],
      },
      series: [{
        type: 'column',
        showInLegend: true,
        name: "Total estimated production",
        data: countryEstimateProduction ? countryEstimateProduction.estimate : [],
        color: '#5651c7'
      }, {
        type: 'column',
        showInLegend: true,
        name: "Total cotton procured",
        data: countryEstimateProduction ? countryEstimateProduction.production : [],
        color: '#cc3300'
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
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
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

  const MonFilterPopup = () => {
    return (
      <div>
        { monShowFilter && (
          <>
            <div className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Filters</h3>
                  <button className="text-[20px]" onClick={ () => {
                    setMonShowFilter(!monShowFilter);
                  }
                  }>&times;</button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Country
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setMonCountryId(e.target.value) }
                            value={ monCountryId }
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
                            Select a Season
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setMonSeasonId(e.target.value) }
                            value={ monSeasonId }
                          >
                            <option value="">Select a Season</option>
                            { seasons.map((season: any) => (
                              <option key={ season.id } value={ season.id }>
                                { season.name }
                              </option>
                            )) }
                          </select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <div className="text-gray-500 text-[12px] font-medium">
                            Select a Ginner
                          </div>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onChange={ (e) => setMonGinnerId(e.target.value) }
                            value={ monGinnerId }
                          >
                            <option value="">Select Ginner</option>
                            { monGinners.map((ginner: any) => (
                              <option key={ ginner.id } value={ ginner.id }>
                                { ginner.name }
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
                              onMonApplyBtnClick();
                              setMonShowFilter(false);
                            } }
                          >
                            APPLY ALL FILTERS
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={ onMonCancelBtnClick }
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
      <div>
        <div className="flex justify-around mt-5">
          <button
            onClick={ () => setCurTab(1) }
            className={ `${ curTab === 1 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-2/5 h-12` }
          >Seed Cotton Procurement</button>
          <button
            onClick={ () => setCurTab(2) }
            className={ `${ curTab === 2 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-2/5 h-12` }
          >Country Level Procurement</button>
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
      </div>
      <div>
        { curTab === 1 ? <div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getEstimatedProcuredOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getProcuredProcessedOptions() }
              highcharts={ HighCharts }
            />
          </div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getEstimatedProcuredProcessedColumnOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getEstimatedProcuredProcessedSplineOptions() }
              highcharts={ HighCharts }
            />
          </div>
          <div className="mt-4">
            <button
              className="flex"
              type="button"
              onClick={ () => setMonShowFilter(!monShowFilter) }
            >
              FILTERS <BiFilterAlt className="m-1" />
            </button>

            <div className="relative">
              <MonFilterPopup />
            </div>
          </div>
          <div className="columns-1 mt-4">
            <HighChartsReact
              options={ getProcuredProcessedMonthlyOptions() }
              highcharts={ HighCharts }
            />
          </div>
        </div> : <div>
          <div className="columns-1 mt-4">
            <HighChartsReact
              options={ getCountryEstimateProcuredOptions() }
              highcharts={ HighCharts }
            />
          </div>
        </div> }

      </div>
    </div>
  );
}
