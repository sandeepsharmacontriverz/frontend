"use client";
import React, { useEffect, useState, useRef } from "react";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import Accordian from "@components/core/Accordian";
import ChartsGrouped from "@components/charts/ChartsGrouped";
import { BiFilterAlt } from "react-icons/bi";
import API from "@lib/Api";
import Form from "react-bootstrap/Form";
import Loader from "@components/core/Loader";
const Dashboard: any = () => {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  const [showFilter, setShowFilter] = useState(false);
  const [seasons, setSeasons] = useState<any>([]);
  const [states, setState] = useState([]);
  const [countries, setCountries] = useState<any>([]);
  const [checkedSeason, setCheckedSeason] = useState<any>("");
  const [activeProcessor, setActiveProcessor] = useState("");
  const [ginners, setGinners] = useState<any>([])

  const [spinners, setSpinners] = useState<any>([])
  const [globalQuaParameter, setGlobalQualityParameter] = useState<any>([])
  const [nationalQuaParameter, setNationalQualityParameter] = useState<any>([])
  const [processorQtyParameter, setprocessorQtyParameter] = useState<any>([])
  const [isClear, setIsClear] = useState(false);
  const [filters, setFilters] = useState({
    countries: "",
    states: "",
    spinners: "",
    ginners: ""
  })
  useEffect(() => {
    if (translations) {
      setActiveProcessor(translations?.common?.GlobalQualityParameter)
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

  const themeColors:any =  ["#177029", "#D15E9C", "#F09E29", "#F54521","#0F265C", "#ABC4E8", "#FAF2EE"]

  const highestSeason = seasons.find((item: any) => {
    const date = new Date();
    const fromDate = new Date(item.from);
    const toDate = new Date(item.to);
    return date >= fromDate && date <= toDate;
  });


  useEffect(() => {
    if (highestSeason) {
      setCheckedSeason(highestSeason?.id)
    }
  }, [highestSeason])

  useEffect(() => {
    if (checkedSeason !== "" && activeProcessor === translations?.common?.NationalQualityParameter) {
      nationalQualityParameter()
    }
  }, [checkedSeason, isClear, activeProcessor])

  useEffect(() => {
    if (checkedSeason !== "" && activeProcessor === translations?.common?.GlobalQualityParameter) {
      globalQualityParameter()
    }
  }, [checkedSeason, isClear, activeProcessor])

  useEffect(() => {
    if (checkedSeason !== "" && activeProcessor === translations?.common?.ProcessorQualityParameter) {
      processorQualityParameter()
    }
  }, [checkedSeason, isClear, activeProcessor])

  useEffect(() => {
    getSeasons();
    getCountries();
    getGinners()
    getSpinners()
  }, []);

  useEffect(() => {
    if (filters?.countries) {
      getStates();
    }
    else {
      setState([])
    }
  }, [filters?.countries]);

  const { avgGinner, avgSpinner, noOfTesting, volume, country } = globalQuaParameter;
  const { nationalavgginner, nationalaveragespinner, stateAverageGinner, stateAverageSpinner, nationalCountry, countriesSpinner, statespinner, stateginner } = nationalQuaParameter;
  const { ginnerCountMonth, ginnerMonth, nationalAvgGinner, nationalAvgSpinner, spinnerCountMonth, spinnerMonth, months, spinmonth } = processorQtyParameter
  const formatNumericValues = (values: any) => {
    return values.map((value: any) => {
      return typeof value === 'number' ? Number(value.toFixed(2)) : value;
    });
  };
  const parseAndFormatNumericValues = (item: any) => {
    const values = Object.values(item?.total_count);
    return formatNumericValues(values.map((value: any) => parseInt(value, 10)));
  };

  const matchingCountries = countries
    .filter((item: any) => country?.includes(item.id))
    .map((item: any) => item.county_name);

  const matchingStatesSpinner = states.filter((item: any) => statespinner?.includes(item?.id))
    .map((item: any) => item.state_name)

  const matchingStatesGinner = states.filter((item: any) => stateginner?.includes(item?.id))
    .map((item: any) => item.state_name)

  const matchingCountriesNationalGinner = countries
    .filter((item: any) =>
      nationalCountry?.includes(item.id))
    .map((item: any) => item.county_name);

  const matchingCountriesNationalSpinner = countries
    .filter((item: any) =>
      countriesSpinner?.includes(item.id))
    .map((item: any) => item.county_name)

  const filterseason = seasons.find((item: any) => item.id === Number(checkedSeason))

  const dataGlobalAverageGinner = avgGinner?.map((item: any, index: any) => {
    const values = Object.values(item);
    const formattedData = values.map((value) => {
      if (typeof value === 'number') {
        return Number(value.toFixed(2));
      } else {
        return value;
      }
    });
    return { name: filterseason?.name, data: formattedData };
  }) ?? [];

  const averangeSpinner = avgSpinner?.map((item: any) => {
    const values = Object.values(item);
    const formattedData = values.map((value) => {
      if (typeof value === 'number') {
        return Number(value.toFixed(2));
      } else {
        return value;
      }
    });
    return { name: filterseason?.name, data: formattedData };
  }) ?? [];
  const dataVolumeTesting = [
    {
      name: translations?.common?.TotalNumberofbales
        ? translations.common.TotalNumberofbales
        : '',
      data: volume?.map((item: any) => {
        const numericValue = item.number_of_bales;
        return typeof numericValue === 'number' ? Number(numericValue.toFixed(2)) : numericValue;
      }),
    },
    {
      name: translations?.common?.NumberofTesting
        ? translations.common.NumberofTesting
        : '',
      data: volume?.map((item: any) => {
        const numericValue = item.number_of_test;
        return typeof numericValue === 'number' ? Number(numericValue.toFixed(2)) : numericValue;
      }),
    },
  ];



  const nationalavgGinnerData = nationalavgginner?.map((item: any, index: any) => ({
    name: matchingCountriesNationalGinner[index],
    data: formatNumericValues(Object.values(item).slice(1)),
  })) ?? [];

  const nationalavgSpinnerData = nationalaveragespinner?.map((item: any, index: any) => ({
    name: matchingCountriesNationalSpinner[index],
    data: formatNumericValues(Object.values(item).slice(1)),
  })) ?? [];

  const stateAvgGinner = stateAverageGinner?.map((item: any, index: any) => ({
    name: matchingStatesGinner[index],
    data: formatNumericValues(Object.values(item).slice(1)),

  })) ?? []

  const stateAvgSpinner = stateAverageSpinner?.map((item: any, index: any) => ({
    name: matchingStatesSpinner[index],
    data: formatNumericValues(Object.values(item).slice(1)),

  })) ?? []

  const processorqtyparameterginnerwise = nationalAvgGinner?.map((item: any) => ({
    name: filterseason?.name,
    data: formatNumericValues(Object.values(item)),
  })) ?? [];
  const processorqtyparameterspinnerwise = nationalAvgSpinner?.map((item: any) => ({
    name: filterseason?.name,
    data: formatNumericValues(Object.values(item)),
  })) ?? [];

  const processorqtyginnermonthly = ginnerMonth?.map((item: any, index: any) => ({
    name: months[index],
    data: formatNumericValues(Object.values(item).slice(1)),
  })) ?? [];

  const processorqtyspinnermonthly = spinnerMonth?.map((item: any, index: any) => ({
    name: spinmonth[index],
    data: formatNumericValues(Object.values(item).slice(1)),
  })) ?? [];

  const GinnerMonthWise = ginnerCountMonth?.map((item: any, index: any) => ({
    name: ginnerCountMonth[index].month,
    data: parseAndFormatNumericValues(item),
  })) ?? [];

  const spinnerMonthWise = spinnerCountMonth?.map((item: any, index: any) => ({
    name: spinnerCountMonth[index].month,
    data: parseAndFormatNumericValues(item),
  })) ?? [];

  const Testing = noOfTesting

  const getSeasons = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      setSeasons(response.data);
    } catch (error) {
      console.log(error, "error");
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
      if (filters.countries !== "") {
        const res = await API.get(
          `location/get-states?status=true&countryId=${filters.countries}`
        );
        if (res.success) {
          setState(res.data);
        }
      }
    } catch (error) {
      console.log(error);
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
  const globalQualityParameter = async () => {
    if (checkedSeason !== "" && activeProcessor === translations?.common?.GlobalQualityParameter) {
      try {
        const res = await API.get(`quality-parameter/graph-dashboard?seasonId=${checkedSeason}&countryId=${filters?.countries}`)
        if (res.success) {
          let countries = res.data?.volume?.map((item: any) => item.country_id
          )
          setGlobalQualityParameter({ ...res.data, country: countries })
        }
      }
      catch (error) {
        console.log(error)
      }
    }
  }
  const nationalQualityParameter = async () => {
    if (checkedSeason !== "" && activeProcessor === translations?.common?.NationalQualityParameter) {
      try {
        const res = await API.get(`quality-parameter/graph-national?seasonId=${checkedSeason}&countryId=${filters?.countries}&stateId=${filters?.states}`)
        if (res.success) {
          let countries = res.data?.nationalAvgGinner?.map((item: any) => item.country_id)
          let statesGinner = res.data?.stateAverageGinner?.map((item: any) => item.state_id)
          let statesSpinner = res.data?.stateAverageSpinner?.map((item: any) => item.state_id)
          setNationalQualityParameter({
            ...res.data, nationalavgginner: res.data?.nationalAvgGinner, nationalaveragespinner: res.data?.nationalAvgSpinner, nationalCountry: countries, countriesSpinner: countries,
            statespinner: statesSpinner, stateginner: statesGinner

          })
        }
      }
      catch (error) {
        console.log(error)
      }
    }
  }
  const processorQualityParameter = async () => {
    if (checkedSeason !== "" && activeProcessor === translations?.common?.ProcessorQualityParameter) {
      try {
        const res = await API.get(`quality-parameter/graph-processor?seasonId=${checkedSeason}&countryId=${filters?.countries}&stateId=${filters?.states}&ginnerId=${filters?.ginners}&spinnerId=${filters?.spinners}`)
        let countries = res.data?.ginnerCountMonth?.map((item: any) => item.month)
        let countriespin = res.data?.spinnerCountMonth?.map((item: any) => item.month)
        if (res.success) {
          setprocessorQtyParameter({ ...res.data, months: countries, spinmonth: countriespin })
        }
      }
      catch (error) {
        console.log(error)
      }
    }
  }
  const clearFilterList = () => {
    setFilters({
      ...filters,
      countries: "",
      states: "",
      spinners: "",
      ginners: ""
    });
    setCheckedSeason(highestSeason?.id);
    setIsClear(!isClear);
  };
  const getFilter = () => {
    switch (activeProcessor) {
      case translations?.common?.GlobalQualityParameter:
        globalQualityParameter();
        break;
      case translations?.common?.NationalQualityParameter:
        nationalQualityParameter();
        break;
      default:
        processorQualityParameter();
    }
    setShowFilter(false);
  };

  if (loading) {
    return <div> Loading...</div>;
  }
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
                      {
                        activeProcessor === translations?.common?.GlobalQualityParameter && (
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
                                  <option
                                    key={season.id}
                                    value={season.id}
                                  >
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
                                  <option
                                    key={country.id}
                                    value={country.id}
                                  >
                                    {country.county_name}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </>)}
                      {
                        activeProcessor === translations?.common?.NationalQualityParameter && (
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
                                  <option
                                    key={season.id}
                                    value={season.id}
                                  >
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
                                  <option
                                    key={country.id}
                                    value={country.id}
                                  >
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
                                  <option
                                    key={state.id}
                                    value={state.id}
                                  >
                                    {state.state_name}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </>)}
                      {
                        activeProcessor === translations?.common?.ProcessorQualityParameter && (
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
                                  <option
                                    key={season.id}
                                    value={season.id}
                                  >
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
                                  <option
                                    key={country.id}
                                    value={country.id}
                                  >
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
                                  <option
                                    key={state.id}
                                    value={state.id}
                                  >
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
                                  <option
                                    key={ginner.id}
                                    value={ginner.id}
                                  >
                                    {ginner.name}
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
                                  <option
                                    key={spinner.id}
                                    value={spinner.id}
                                  >
                                    {spinner.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </>
                        )
                      }
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getFilter()
                          }}
                        >
                          {translations?.common?.ApplyAllFilters}

                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilterList}
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
        )
        }
      </div >
    );
  };
  const switchProcessorTab = (processorType: string) => {
    setFilters({
      ...filters,
      countries: "",
      states: "",
      spinners: "",
      ginners: ""
    });
    setCheckedSeason(highestSeason?.id)
    setActiveProcessor(processorType);
  }
  if (loading) { return <div>  <Loader /> </div> }

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
                          className={`${activeProcessor === translations?.common?.GlobalQualityParameter ? "activeView" : ""
                            }`}
                          type="button"
                          onClick={() => switchProcessorTab(translations?.common?.GlobalQualityParameter)}
                        >
                          {translations?.common?.GlobalQualityParameter}
                        </button>
                        <button
                          className={`${activeProcessor === translations?.common?.NationalQualityParameter ? "activeView" : ""
                            } rounded-r-lg`}
                          type="button"
                          onClick={() => switchProcessorTab(translations?.common?.NationalQualityParameter)}
                        >
                          {translations?.common?.NationalQualityParameter}
                        </button>
                        <button
                          className={`${activeProcessor === translations?.common?.ProcessorQualityParameter ? "activeView" : ""
                            }`}
                          type="button"
                          onClick={() => switchProcessorTab(translations?.common?.ProcessorQualityParameter)}
                        >{translations?.common?.ProcessorQualityParameter}
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
                <div>
                  <div className="flex flex-wrap">
                  </div>
                  {activeProcessor === translations?.common?.GlobalQualityParameter ? (
                    <div>
                      <div className="row">
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.GlobalNumberofTesting}
                            content={
                              <ChartsGrouped
                                type="column"
                                titleChart={translations?.common?.GlobalNumberofTesting}
                                categoriesList={[]}
                                dataChart={[{ name: filterseason?.name, data: [Testing] }]}
                                themeColors={themeColors}
                              />
                            }
                          />
                        </div>
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.HistoricalGlobalAverageGinner}
                            content={
                              <ChartsGrouped
                                type="column"
                                titleChart={translations?.common?.HistoricalGlobalAverageGinner}
                                categoriesList={commonCategoriesList}
                                dataChart={dataGlobalAverageGinner}
                                themeColors={themeColors}
                              />
                            }
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6 col-sm-6  mt-4">
                          <Accordian
                            title={translations?.common?.HistoricalGlobalAverageSpinner}
                            content={
                              <ChartsGrouped
                                type="column"
                                titleChart={translations?.common?.HistoricalGlobalAverageSpinner}
                                categoriesList={commonCategoriesList}
                                dataChart={averangeSpinner}
                                themeColors={themeColors}
                              />
                            }
                          />
                        </div>
                        <div className="col-12 col-md-6 col-sm-6  mt-4">
                          <Accordian
                            title={translations?.common?.VolumeVsTesting}
                            content={
                              dataVolumeTesting && dataVolumeTesting.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.VolumeVsTesting}
                                  categoriesList={matchingCountries}
                                  dataChart={dataVolumeTesting}
                                  themeColors={themeColors}
                                />) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeProcessor === translations?.common?.NationalQualityParameter ? (
                    <div>
                      <div className="row">
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.NationalAverageGinner}
                            content={
                              nationalavgGinnerData && nationalavgGinnerData.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.NationalAverageGinner}
                                  categoriesList={commonCategoriesList}
                                  dataChart={nationalavgGinnerData}
                                  themeColors={themeColors}
                                />) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.NationalAverageSpinner}
                            content={
                              nationalavgSpinnerData && nationalavgSpinnerData.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.NationalAverageSpinner}
                                  categoriesList={commonCategoriesList}
                                  dataChart={nationalavgSpinnerData}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.StateAverageGinner}
                            content={
                              stateAvgGinner && stateAvgGinner.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.StateAverageGinner}
                                  categoriesList={commonCategoriesList}
                                  dataChart={stateAvgGinner}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectAnyStateToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.StateAverageSpinner}
                            content={
                              stateAvgSpinner && stateAvgSpinner.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.StateAverageSpinner}
                                  categoriesList={commonCategoriesList}
                                  dataChart={stateAvgSpinner}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectAnyStateToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="row">
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.GinnerWiseAverage}
                            content={
                              processorqtyparameterginnerwise && processorqtyparameterginnerwise.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.GinnerWiseAverage}
                                  categoriesList={commonCategoriesList}
                                  dataChart={processorqtyparameterginnerwise}
                                  themeColors={themeColors}
                                />) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.SpinnerWiseAverage}
                            content={
                              processorqtyparameterspinnerwise && processorqtyparameterspinnerwise.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.SpinnerWiseAverage}
                                  categoriesList={commonCategoriesList}
                                  dataChart={processorqtyparameterspinnerwise}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12  mt-4">
                          <Accordian
                            title={translations?.common?.GinnerMonthlyTestingAverageParameters}
                            content={
                              processorqtyginnermonthly && processorqtyginnermonthly.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.GinnerMonthlyTestingAverageParameters}
                                  categoriesList={commonCategoriesList}
                                  dataChart={processorqtyginnermonthly}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                        <div className="col-12 mt-4">
                          <Accordian
                            title={translations?.common?.SpinnerMonthlyTestingAverageParameters}
                            content={
                              processorqtyspinnermonthly && processorqtyspinnermonthly.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.SpinnerMonthlyTestingAverageParameters}
                                  categoriesList={commonCategoriesList}
                                  dataChart={processorqtyspinnermonthly}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.GinnerMonthWiseTesting}
                            content={
                              GinnerMonthWise && GinnerMonthWise.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.GinnerMonthWiseTesting}
                                  categoriesList={[]}
                                  dataChart={GinnerMonthWise}
                                  categoryTitle={translations?.common?.GinnerMonthWiseTesting}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>

                              )
                            }
                          />
                        </div>
                        <div className="col-12 col-md-6 col-sm-6 mt-4">
                          <Accordian
                            title={translations?.common?.SpinnerMonthWiseTesting}
                            content={
                              spinnerMonthWise && spinnerMonthWise.length > 0 ? (
                                <ChartsGrouped
                                  type="column"
                                  titleChart={translations?.common?.SpinnerMonthWiseTesting}
                                  categoriesList={[]}
                                  dataChart={spinnerMonthWise}
                                  categoryTitle={translations?.common?.SpinnerMonthWiseTesting}
                                  themeColors={themeColors}
                                />
                              ) : (
                                <p>
                                  <b>{translations?.common?.PleaseSelectanotherSeasonToChart}</b>
                                </p>
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Dashboard
