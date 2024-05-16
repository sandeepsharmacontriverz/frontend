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
  const [seasons, setSeasons] = useState<any>([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villages, setVillages] = useState([]);
  const [knitterYarn, setKnitterYarn] = useState<any>();
  const [knitterFabric, setKnitterFabric] = useState<any>();
  const [weaverYarn, setWeaverYarn] = useState<any>();
  const [weaverFabric, setWeaverFabric] = useState<any>();
  const [garmentFabric, setGarmentFabric] = useState<any>();
  const [garmentInventory, setGarmentInventory] = useState<any>();
  const [fabricInventory, setFabricInventory] = useState<any>();
  const [fabric, setFabric] = useState<any>();

  const [programId, setProgramId] = useState("");
  const [brandId, setBrandId] = useState<any>(User.brandId ? User.brandId : '');
  const [seasonId, setSeasonId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [curTab, setCurTab] = useState(1);

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


  const fetchKnitterYarn = async () => {
    try {
      const res = await API.get("dashboard/processor/knitter/yarn?" + getQueryParams());
      if (res.success) {
        setKnitterYarn(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchKnitterFabric = async () => {
    try {
      const res = await API.get("dashboard/processor/knitter/fabric?" + getQueryParams());
      if (res.success) {
        setKnitterFabric(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWeaverYarn = async () => {
    try {
      const res = await API.get("dashboard/processor/weaver/yarn?" + getQueryParams());
      if (res.success) {
        setWeaverYarn(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWeaverFabric = async () => {
    try {
      const res = await API.get("dashboard/processor/weaver/fabric?" + getQueryParams());
      if (res.success) {
        setWeaverFabric(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGarmentFabric = async () => {
    try {
      const res = await API.get("dashboard/processor/garment/fabric?" + getQueryParams());
      if (res.success) {
        setGarmentFabric(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGarmentInventory = async () => {
    try {
      const res = await API.get("dashboard/processor/garment/inventory?" + getQueryParams());
      if (res.success) {
        setGarmentInventory(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFabricInventory = async () => {
    try {
      const res = await API.get("dashboard/processor/fabric/inventory?" + getQueryParams());
      if (res.success) {
        setFabricInventory(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFabric = async () => {
    try {
      const res = await API.get("dashboard/processor/fabric?" + getQueryParams());
      if (res.success) {
        setFabric(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onApplyBtnClick = () => {
    fetchKnitterYarn();
    fetchKnitterFabric();
    fetchWeaverYarn();
    fetchWeaverFabric();
    fetchGarmentFabric();
    fetchGarmentInventory();
    fetchFabricInventory();
    fetchFabric();
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
        fetchKnitterYarn(),
        fetchKnitterFabric(),
        fetchWeaverYarn(),
        fetchWeaverFabric(),
        fetchGarmentFabric(),
        fetchGarmentInventory(),
        fetchFabricInventory(),
        fetchFabric()
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

  const getKnitterYarnOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Yarn Total Quantity vs Yarn Stock Quantity',
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
        categories: knitterYarn ? knitterYarn.program : [],
      },
      series: [{
        type: 'column',
        name: "Yarn Total Quantity",
        data: knitterYarn ? knitterYarn.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Yarn Stock Quantity",
        data: knitterYarn ? knitterYarn.stockQty : [],
        color: '#ff9900'
      }]
    };
  };

  const getKnitterFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Inventory',
        align: 'left'
      },
      chart: {
        type: 'column',
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
        categories: knitterFabric ? knitterFabric.program : [],
      },
      series: knitterFabric ? knitterFabric.fabricList : []
    };
  };

  const getWeaverYarnOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Yarn Total Quantity vs Yarn Stock Quantity',
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
        categories: weaverYarn ? weaverYarn.program : [],
      },
      series: [{
        type: 'column',
        name: "Yarn Total Quantity",
        data: weaverYarn ? weaverYarn.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Yarn Stock Quantity",
        data: weaverYarn ? weaverYarn.stockQty : [],
        color: '#ff9900'
      }]
    };
  };

  const getWeaverFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Inventory',
        align: 'left'
      },
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
        categories: weaverFabric ? weaverFabric.program : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      series: weaverFabric ? weaverFabric.fabricList : []
    };
  };

  const getGarmentFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Total Quantity vs Fabric Stock Quantity',
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
        categories: garmentFabric ? garmentFabric.program : [],
      },
      series: [{
        type: 'column',
        name: "Fabric Total Quantity",
        data: garmentFabric ? garmentFabric.totalQty : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Fabric Stock Quantity",
        data: garmentFabric ? garmentFabric.stockQty : [],
        color: '#ff9900'
      }]
    };
  };

  const getGarmentInventoryOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Garment Inventory',
        align: 'left'
      },
      chart: {
        type: 'column',
        spacingTop: 20,
        spacingBottom: 25
      },
      accessibility: {
        enabled: false
      },
      yAxis: {
        title: {
          text: 'Number of pieces'
        }
      },
      xAxis: {
        categories: garmentInventory ? garmentInventory.program : [],
      },
      series: garmentInventory ? garmentInventory.fabricList : []
    };
  };




  const getFabricInventoryOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Fabric Inventory',
        align: 'left'
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25,
        type: 'column'
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
        categories: fabricInventory ? fabricInventory.program : [],
      },
      series: fabricInventory ? fabricInventory.fabricList : []
    };
  };

  const getFabricOptions = (): HighCharts.Options => {
    return {
      title: {
        text: 'Total fabric received vs Total fabric processed vs Total fabric sold',
        align: 'left'
      },

      xAxis: {
        categories: fabric ? fabric.programs : [],
      },
      yAxis: {
        title: {
          text: 'Number of Quantity'
        }
      },
      accessibility: {
        enabled: false
      },
      chart: {
        spacingTop: 20,
        spacingBottom: 25
      },
      series: [{
        type: 'column',
        name: "Total fabric received",
        data: fabric ? fabric.receivedList : [],
        color: '#ff3399'
      }, {
        type: 'column',
        name: "Total fabric processed",
        data: fabric ? fabric.processedList : [],
        color: '#cc3300'
      }, {
        type: 'column',
        name: "Total fabric sold",
        data: fabric ? fabric.stockList : [],
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
      <div>
        <div className="flex justify-around mt-4">
          <button
            onClick={ () => setCurTab(1) }
            className={ `${ curTab === 1 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-full h-12 m-2` }
          >Fabrics</button>
          <button
            onClick={ () => setCurTab(2) }
            className={ `${ curTab === 2 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-full h-12 m-2` }
          >Knitters</button>
          <button
            onClick={ () => setCurTab(3) }
            className={ `${ curTab === 3 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-full h-12 m-2` }
          >Weavers</button>
          <button
            onClick={ () => setCurTab(4) }
            className={ `${ curTab === 4 ? 'bg-blue-600' : 'bg-[#c5cedb]' } w-full h-12 m-2` }
          >Garments</button>
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
        { curTab === 1 && <div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getFabricOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getFabricInventoryOptions() }
              highcharts={ HighCharts }
            />
          </div>
        </div>
        }

        { curTab === 2 && <div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getKnitterYarnOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getKnitterFabricOptions() }
              highcharts={ HighCharts }
            />
          </div>
        </div> }

        { curTab === 3 && <div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getWeaverYarnOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getWeaverFabricOptions() }
              highcharts={ HighCharts }
            />
          </div>
        </div> }

        { curTab === 4 && <div>
          <div className="columns-2 mt-4">
            <HighChartsReact
              options={ getGarmentFabricOptions() }
              highcharts={ HighCharts }

            />
            <HighChartsReact
              options={ getGarmentInventoryOptions() }
              highcharts={ HighCharts }
            />
          </div>
        </div> }

      </div>
    </div >
  );
}
