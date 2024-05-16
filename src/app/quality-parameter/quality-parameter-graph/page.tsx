"use client";
import React, { useEffect, useState, useRef } from "react";
import useTranslations from "@hooks/useTranslation";
import Accordian from "@components/core/Accordian";
import ChartsGrouped from "@components/charts/ChartsGrouped";
import useRole from "@hooks/useRole";
import { BiFilterAlt } from "react-icons/bi";
import API from "@lib/Api";
import Form from "react-bootstrap/Form";

const Graph: any = () => {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();

  const [seasons, setSeasons] = useState<any>([]);
  const [states, setState] = useState<any>([]);
  const [countries, setCountries] = useState<any>([]);
  const [checkedSeason, setCheckedSeason] = useState<any>();
  const [activeProcessor, setActiveProcessor] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [ginners, setGinners] = useState<any>([]);
  const [spinners, setSpinners] = useState<any>([]);

  const [ginnerMonthly, setGinnerMonthly] = useState<any>([]);
  const [spinnerMonthly, setSpinnerMonthly] = useState<any>([]);

  const [ginnerComparision, setGinnerComparision] = useState<any>([]);
  const [spinnerComparision, setspinnerComparision] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [filters, setFilters] = useState<any>({
    countries: "",
    states: "",
    spinners: "",
    ginners: ""
  })
  const themeColors:any =  ["#177029", "#D15E9C", "#F09E29", "#F54521","#0F265C", "#ABC4E8", "#FAF2EE"]

  useEffect(() => {
    if (translations) {
      setActiveProcessor(translations?.common?.Ginner)
    }
  }, [translations])

  const commonCategoriesList = [
    translations?.qualityParameter?.sci,
    translations?.qualityParameter?.moisture,
    translations?.qualityParameter?.mic,
    translations?.qualityParameter?.mat,
    translations?.qualityParameter?.uhml,
    translations?.qualityParameter?.ui,
    translations?.qualityParameter?.sf,
    translations?.qualityParameter?.str,
    translations?.qualityParameter?.elg,
    translations?.qualityParameter?.rb,
    translations?.qualityParameter?.b,
  ];
  // const commonCategoriesList = [
  //   'SCI',
  //   'Moisture',
  //   'Mic',
  //   'Mat',
  //   'UHML(mm)',
  //   'UI(%)',
  //   'SF(%)',
  //   'Str(%)',
  //   'Elg(%)',
  //   'RB',
  //   '+b',
  // ];

  const highestSeason = seasons.find((item: any) => {
    const date = new Date();
    const fromDate = new Date(item.from);
    const toDate = new Date(item.to);
    return date >= fromDate && date <= toDate;
  });


  useEffect(() => {
    if (highestSeason) {
      setCheckedSeason(highestSeason?.id);
    }
  }, [highestSeason]);

  useEffect(() => {
    getSeasons();
    getCountries();
    getGinners();
    getSpinners();
  }, []);

  useEffect(() => {
    if (filters?.countries) {
      getStates();
    }
    else {
      setState([])
    }
  }, [filters?.countries]);

  useEffect(() => {
    const getMonthlyData = async () => {
      if (checkedSeason) {
        switch (activeProcessor) {
          case translations?.common?.Ginner:
            getGinnermonthly();
            break;
          case translations?.common?.Spinner:
            getSpinnerMonthly();
            break;
          case translations?.common?.GinnerComparsion:
            getGinnerComparision();
            break;
          case translations?.common?.SpinnerComparsion:
            getSpinnerComparision();
            break;
          default:
            break;
        }
      }
    };

    getMonthlyData();
  }, [checkedSeason, isClear, activeProcessor]);

  const getSeasons = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      setSeasons(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getGinners = async () => {
    try {
      const res = await API.get("ginner");
      if (res.success) {
        setGinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getSpinners = async () => {
    try {
      const res = await API.get("spinner");
      if (res.success) {
        setSpinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getStates = async () => {
    try {
      if (filters?.countries !== "") {
        const res = await API.get(
          `location/get-states?status=true&countryId=${filters?.countries}`
        );
        if (res.success) {
          setState(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { data, monthlyResults } = ginnerMonthly
  const { spinnerdata, spinnermonthly } = spinnerMonthly
  const { ginnercomparision, country, monthGinnerComparision } = ginnerComparision
  const { spinnercomparision, countryspinner, monthSpinnerComparision } = spinnerComparision
  const month = monthlyResults?.map((item: any) => item.month);
  const monthSpin = spinnermonthly?.map((item: any) => item.month);

  const generateChartsginner = (properties: string[]) => {
    return properties.map((property) => ({
      name: property
        .split(/(?=[A-Z])/)
        .join(" ")
        .toUpperCase(),
      data: monthlyResults?.map((item: any) => parseFloat(Number(item[property]).toFixed(2))),
    }));
  };

  const firstChartGinner = generateChartsginner(["totaluhml", "totalMic"]);
  const secondChartGinner = generateChartsginner(["totaluhml", "totalRd"]);
  const thirdChartGinner = generateChartsginner(["totaluhml", "totalSci"]);
  const fourthChartGinner = generateChartsginner([
    "totaluhml",
    "totalMoisture",
  ]);
  const fifthChartGinner = generateChartsginner(["totalMic", "totalMoisture"]);
  const SixthChartGinner = generateChartsginner([
    "totalMic",
    "totaluhml",
    "totalMoisture",
    "totalSf",
    "totalRd",
    "totalSci",
  ]);

  const generateChart = (property1: string, property2: string) => {
    const data = spinnerMonthly?.spinnermonthly;
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return [
      {
        name: property1.toUpperCase(),
        data: data.map((item: any) => item?.[property1] ?? []),
      },
      {
        name: property2.toUpperCase(),
        data: data.map((item: any) => item?.[property2] ?? []),
      },
    ];
  };
  const firstChartSpin = generateChart("totalMic", "totaluhml");
  const secondChartSpin = generateChart("totaluhml", "totalRd");
  const thirdChartSpin = generateChart("totaluhml", "totalSci");
  const fouthChartSpin = generateChart("totaluhml", "totalMoisture");
  const fifthChartSpin = generateChart("totalMic", "totalMoisture");
  const SixthChartSpin = generateChart("totalMic", "totaluhml").concat(
    generateChart("totalMoisture", "totalSf"),
    generateChart("totalRd", "totalSci")
  );

  const datahighestGinner = data?.map((item: any, index: any) => {
    const values = Object.values(item);
    const roundedValues = values.map(val => typeof val === 'number' ? Number(val.toFixed(2)) : val);
    roundedValues.splice(-2);
    return { name: item.processor, data: [...roundedValues] };
  }) ?? [];
  let dataLowestGinner = datahighestGinner.slice().reverse();
  const datahighestSpin = spinnerdata?.map((item: any, index: any) => {
    const values = Object.values(item);
    const roundedValues = values.map(val => typeof val === 'number' ? Number(val.toFixed(2)) : val);
    roundedValues.splice(-2);
    return { name: item.processor, data: [...roundedValues] };
  }) ?? [];

  let dataLowestSpin = datahighestSpin.slice().reverse();
  const roundToDecimal = (value: any, decimalPlaces: any) => {
    const multiplier = 10 ** decimalPlaces;
    return Math.round(value * multiplier) / multiplier;
  };

  const createDataGinnerComp = (ginnercomparision: any, property: any, decimalPlaces: any) => {
    return ginnercomparision?.map((item: any, index: any) => {
      const data = item.data.map((innerItem: any) => roundToDecimal(innerItem[property], decimalPlaces));
      return { name: country[index]?.county_name, data };
    }) ?? [];
  };
  const decimalPlaces = 2;
  const dataGinnerCompMIC = createDataGinnerComp(
    ginnercomparision,
    "totalMic",
    decimalPlaces
  );
  const dataGinnerCompUHML = createDataGinnerComp(
    ginnercomparision,
    "totaluhml",
    decimalPlaces
  );
  const dataGinnerMoisture = createDataGinnerComp(
    ginnercomparision,
    "totalMoisture",
    decimalPlaces
  );
  const dataGinnerRD = createDataGinnerComp(
    ginnercomparision,
    "totalRd",
    decimalPlaces
  );

  const createSpinnerData = (
    spinnercomparision: any,
    property: any,
    decimalPlaces: any
  ) => {
    return (
      spinnercomparision?.map((item: any, index: any) => {
        const data = item.data.map((innerItem: any) =>
          roundToDecimal(innerItem[property], decimalPlaces)
        );
        return { name: countryspinner[index]?.county_name, data };
      }) ?? []
    );
  };

  const dataSpinnerMIC = createSpinnerData(spinnercomparision, 'totalMat', decimalPlaces);
  const dataSpinnerUHML = createSpinnerData(spinnercomparision, 'totaluhml', decimalPlaces);
  const dataSpinnerMoisture = createSpinnerData(spinnercomparision, 'totalMoisture', decimalPlaces);
  const dataSpinnerRd = createSpinnerData(spinnercomparision, 'totalRd', decimalPlaces);

  const getGinnermonthly = async () => {
    if (checkedSeason && activeProcessor === translations?.common?.Ginner) {
      const url = `quality-parameter/graph?filter=ginner&seasonId=${checkedSeason}&countryId=${filters?.countries}&stateId=${filters?.states}&processId=${filters?.ginners}`;
      try {
        const response = await API.get(url);
        setGinnerMonthly(response.data);
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  const getSpinnerMonthly = async () => {
    if (checkedSeason && activeProcessor === translations?.common?.Spinner) {
      const url = `quality-parameter/graph?filter=spinner&seasonId=${checkedSeason}&countryId=${filters?.countries}&stateId=${filters?.states}&processId=${filters?.spinners}`;
      try {
        const response = await API.get(url);
        setSpinnerMonthly({
          spinnerdata: response.data?.data,
          spinnermonthly: response.data?.monthlyResults,
        });
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  const getGinnerComparision = async () => {
    if (checkedSeason && activeProcessor === translations?.common?.GinnerComparsion) {
      const url = `quality-parameter/graph-country?filter=ginner&seasonId=${checkedSeason}&countryId=${filters?.countries}&stateId=${filters?.states}&ginnerId=${filters?.ginners}`;
      try {
        const response = await API.get(url);
        const country = response.data?.map((country: any) => country.country)

        const monthGinnerComparision = response.data?.map((month: any) =>
          month?.data?.map((item: any, index: any) => item.month)
        );
        setGinnerComparision({ ginnercomparision: response?.data, country: country, monthGinnerComparision: monthGinnerComparision[0] })
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  const getSpinnerComparision = async () => {
    if (checkedSeason && activeProcessor === translations?.common?.SpinnerComparsion) {
      const url = `quality-parameter/graph-country?filter=spinner&seasonId=${checkedSeason}&countryId=${filters?.countries}&stateId=${filters?.states}&spinnerId=${filters?.spinners}`;
      try {
        const response = await API.get(url);
        const country = response.data?.map((country: any) => country.country)
        const monthSpinnerComparision = response.data?.map((month: any) =>
          month?.data?.map((item: any, index: any) => item.month)
        );
        setspinnerComparision({ spinnercomparision: response?.data, countryspinner: country, monthSpinnerComparision: monthSpinnerComparision[0] })
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const clearFilter = () => {
    setCheckedSeason(highestSeason?.id);
    setFilters({
      ...filters,
      countries: "",
      states: "",
      spinners: "",
      ginners: "",
    });
    setIsClear(!isClear);
  };
  const handleChange1 = (event: any) => {
    const { value, name } = event.target;
    if (name === "season") {
      setCheckedSeason(value);
    }
    else if (name === "country") {
      setFilters({ ...filters, countries: value })
    }
    else if (name === "state") {
      setFilters({ ...filters, states: value })
    }
    else if (name === "spinner") {
      setFilters({ ...filters, spinners: value })
    }
    else if (name === "ginner") {
      setFilters({ ...filters, ginners: value })
    }
  };


  const getFilter = () => {
    switch (activeProcessor) {
      case translations?.common?.Ginner:
        getGinnermonthly();
        break;
      case translations?.common?.Spinner:
        getSpinnerMonthly();
        break;
      case translations?.common?.GinnerComparsion:
        getGinnerComparision();
        break;
      default:
        getSpinnerComparision();
    }

    setShowFilter(false);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">{translations?.common?.Filters}</h3>
                <button
                  className="text-[20px]"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  &times;
                </button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      {activeProcessor === translations?.common?.Ginner ||
                        activeProcessor === translations?.common?.GinnerComparsion ? (
                        <>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectSeason}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={checkedSeason || ""}
                              name="season"
                              onChange={handleChange1}
                            >
                              {seasons?.map((season: any) => (
                                <option key={season.id} value={season.id}>
                                  {season.name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectCountry}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={filters.countries || ""}
                              name="country"
                              onChange={handleChange1}
                            >
                              <option value="">{translations?.common?.SelectCountry}</option>
                              {countries?.map((country: any) => (
                                <option key={country.id} value={country.id}>
                                  {country.county_name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectState}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={filters.states || ""}
                              name="state"
                              onChange={handleChange1}
                            >
                              <option value=""> {translations?.common?.SelectState}
                              </option>
                              {states?.map((state: any) => (
                                <option key={state.id} value={state.id}>
                                  {state.state_name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>

                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectGinner}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={filters.ginners || ""}
                              name="ginner"
                              onChange={handleChange1}
                            >
                              <option value="">{translations?.common?.SelectGinner}
                              </option>
                              {ginners?.map((ginner: any) => (
                                <option key={ginner.id} value={ginner.id}>
                                  {ginner.name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {activeProcessor === translations?.common?.Spinner ||
                        activeProcessor === translations?.common?.SpinnerComparsion ? (
                        <>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectSeason}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={checkedSeason || ""}
                              name="season"
                              onChange={handleChange1}
                            >
                              {seasons?.map((season: any) => (
                                <option key={season.id} value={season.id}>
                                  {season.name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectCountry}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={filters.countries || ""}
                              name="country"
                              onChange={handleChange1}
                            >
                              <option value="">{translations?.common?.SelectCountry}</option>
                              {countries?.map((country: any) => (
                                <option key={country.id} value={country.id}>
                                  {country.county_name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectState}

                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={filters.states || ""}
                              name="state"
                              onChange={handleChange1}
                            >
                              <option value="">{translations?.common?.SelectState}
                              </option>
                              {states?.map((state: any) => (
                                <option key={state.id} value={state.id}>
                                  {state.state_name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectSpinner}
                            </label>
                            <Form.Select
                              aria-label="Default select example"
                              className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                              value={filters.spinners || ""}
                              name="spinner"
                              onChange={handleChange1}
                            >
                              <option value="">{translations?.common?.SelectSpinner}</option>
                              {spinners?.map((spinner: any) => (
                                <option key={spinner.id} value={spinner.id}>
                                  {spinner.name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getFilter();
                          }}
                        >
                          {translations?.common?.ApplyAllFilters}
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilter}
                        >
                          {translations?.common?.ClearAllFilters}
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const switchProcessorTab = (processorType: string) => {
    setCheckedSeason(highestSeason?.id);
    setFilters({
      ...filters,
      countries: "",
      states: "",
      spinners: "",
      ginners: "",
    });

    setActiveProcessor(processorType);
  };
  if (loading) {
    return <div> Loading...</div>;
  }
  if (!roleLoading) {
    return (
      <div>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form ">
              <div className="table-minwidth w-100">
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="topTrader">
                      <section className="buttonTabnew">
                        <button
                          className={`${activeProcessor === translations?.common?.Ginner ? "activeView" : ""
                            }`}
                          type="button"
                          onClick={() => switchProcessorTab(translations?.common?.Ginner)}
                        >
                          {translations?.common?.Ginner}
                        </button>
                        <button
                          className={`${activeProcessor === translations?.common?.Spinner ? "activeView" : ""
                            }`}
                          type="button"
                          onClick={() => switchProcessorTab(translations?.common?.Spinner)}
                        >
                          {translations?.common?.Spinner}
                        </button>
                        <button
                          className={`${activeProcessor === translations?.common?.GinnerComparsion
                            ? "activeView"
                            : ""
                            }`}
                          type="button"
                          onClick={() =>
                            switchProcessorTab(translations?.common?.GinnerComparsion)
                          }
                        >
                          {translations?.common?.GinnerComparsion}
                        </button>
                        <button
                          className={`${activeProcessor === translations?.common?.SpinnerComparsion
                            ? "activeView"
                            : ""
                            }`}
                          type="button"
                          onClick={() =>
                            switchProcessorTab(translations?.common?.SpinnerComparsion)
                          }
                        >
                          {translations?.common?.SpinnerComparsion}
                        </button>
                      </section>
                    </div>
                    <div className="headTrader">
                      <button
                        className="flex"
                        type="button"
                        onClick={() => setShowFilter(!showFilter)}
                      >
                        {translations?.common?.Filters} <BiFilterAlt className="m-1" />
                      </button>
                    </div>
                    <div>
                      <div className="relative">
                        <FilterPopup
                          openFilter={showFilter}
                          onClose={!showFilter}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                {activeProcessor === translations?.common?.Ginner ? (
                  <div>
                    <div className="row">
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.GinnerMonthlyMICandUHML}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={month}
                              dataChart={firstChartGinner}
                              titleChart={translations?.common?.GinnerMonthlyMICandUHML}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.GinnerMonthlyUHMLandRd}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={month}
                              dataChart={secondChartGinner}
                              titleChart={translations?.common?.GinnerMonthlyUHMLandRd}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.GinnerMonthlyUHMLandSCI}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={month}
                              dataChart={thirdChartGinner}
                              titleChart={translations?.common?.GinnerMonthlyUHMLandSCI}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.GinnerMonthlyUHMLandMoisture}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={month}
                              dataChart={fourthChartGinner}
                              titleChart={translations?.common?.GinnerMonthlyUHMLandMoisture}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.GinnerMonthlyMicandMoisture}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={month}
                              dataChart={fifthChartGinner}
                              titleChart={translations?.common?.GinnerMonthlyMicandMoisture}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.NationalMonthlyParameterVariation}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={month}
                              dataChart={SixthChartGinner}
                              titleChart={translations?.common?.NationalMonthlyParameterVariation}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 mt-4">
                        <Accordian
                          title={translations?.common?.Highesttop5ofGinner}
                          content={
                            <ChartsGrouped
                              type="column"
                              categoriesList={commonCategoriesList}
                              titleChart={translations?.common?.Highesttop5ofGinner}
                              dataChart={datahighestGinner}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 mt-4">
                        <Accordian
                          title={translations?.common?.Lowesttop5ofGinner}
                          content={
                            <ChartsGrouped
                              type="column"
                              categoriesList={commonCategoriesList}
                              dataChart={dataLowestGinner}
                              titleChart={translations?.common?.Lowesttop5ofGinner}
                              themeColors={ themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : activeProcessor === translations?.common?.Spinner ? (
                  <div>
                    <div className="row">
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.SpinnerMonthlyMICandUHML}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={monthSpin}
                              dataChart={firstChartSpin}
                              titleChart={translations?.common?.SpinnerMonthlyMICandUHML}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.SpinnerMonthlyUHMLandRd}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={monthSpin}
                              dataChart={secondChartSpin}
                              titleChart={translations?.common?.SpinnerMonthlyUHMLandRd}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.SpinnerMonthlyUHMLandSCI}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={monthSpin}
                              dataChart={thirdChartSpin}
                              titleChart={translations?.common?.SpinnerMonthlyUHMLandSCI}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.SpinnerMonthlyUHMLandMoisture}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={monthSpin}
                              dataChart={fouthChartSpin}
                              titleChart={translations?.common?.SpinnerMonthlyUHMLandMoisture}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.SpinnerMonthlyMicandMoisture}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={monthSpin}
                              titleChart={translations?.common?.SpinnerMonthlyMicandMoisture}
                              dataChart={fifthChartSpin}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6 col-sm-6 mt-4">
                        <Accordian
                          title={translations?.common?.NationalMonthlyParameterVariation}
                          content={
                            <ChartsGrouped
                              type="spline"
                              categoriesList={monthSpin}
                              titleChart={translations?.common?.NationalMonthlyParameterVariation}
                              dataChart={SixthChartSpin}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 mt-4">
                        <Accordian
                          title={translations?.common?.Highesttop5ofSpinner}
                          content={
                            <ChartsGrouped
                              type="column"
                              categoriesList={commonCategoriesList}
                              dataChart={datahighestSpin}
                              titleChart={translations?.common?.Highesttop5ofSpinner}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                      <div className="col-12 mt-4">
                        <Accordian
                          title={translations?.common?.Lowesttop5Spinner}
                          content={
                            <ChartsGrouped
                              type="column"
                              titleChart={translations?.common?.Lowesttop5Spinner}
                              categoriesList={commonCategoriesList}
                              dataChart={dataLowestSpin}
                              themeColors={themeColors}
                            />
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : activeProcessor === translations?.common?.GinnerComparsion ? (
                  <div className="row">
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalMICComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            categoriesList={monthGinnerComparision}
                            titleChart={translations?.common?.GlobalMICComparison}
                            dataChart={dataGinnerCompMIC}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalUHMLComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            titleChart={translations?.common?.GlobalUHMLComparison}
                            categoriesList={monthGinnerComparision}
                            dataChart={dataGinnerCompUHML}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalMoistureComparison}
                        content={
                          <ChartsGrouped
                            titleChart={translations?.common?.GlobalMoistureComparison}
                            type="spline"
                            categoriesList={monthGinnerComparision}
                            dataChart={dataGinnerMoisture}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalRDComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            titleChart={translations?.common?.GlobalRDComparison}
                            categoriesList={monthGinnerComparision}
                            dataChart={dataGinnerRD}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalMICComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            titleChart={translations?.common?.GlobalMICComparison}
                            categoriesList={monthSpinnerComparision}
                            dataChart={dataSpinnerMIC}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalUHMLComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            titleChart={translations?.common?.GlobalUHMLComparison}
                            categoriesList={monthSpinnerComparision}
                            dataChart={dataSpinnerUHML}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalMoistureComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            titleChart={translations?.common?.GlobalMoistureComparison}
                            categoriesList={monthSpinnerComparision}
                            dataChart={dataSpinnerMoisture}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <Accordian
                        title={translations?.common?.GlobalRDComparison}
                        content={
                          <ChartsGrouped
                            type="spline"
                            titleChart={translations?.common?.GlobalRDComparison}
                            categoriesList={monthSpinnerComparision}
                            dataChart={dataSpinnerRd}
                            themeColors={themeColors}
                          />
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Graph;
