"use client";
import Link from "@components/core/nav-link";
import React, { useEffect, useRef } from "react";
import { useState } from "react";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from 'react-icons/bi';
import Form from "react-bootstrap/Form";
import Loader from "@components/core/Loader";


interface TableData {
  id: number;
  farmer_name: string;
  estimated_qty: number;
  sold_qty: number;
  available_qty: number;
  country: string;
  state: string;
  district: string;
  block: string;
  program: string;
  ginner: string;
  qty: string;
}

export default function transactions() {
  useTitle('Paddy Availability')
  const [roleLoading] = useRole()
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    districtId: "",
    blockId: "",
    villageId: "",
    programId: "",
    ginnerId: "",
    filterby: "location",
  })

  const [error, setError] = useState<any>({
    countries: '',
    state: '',
    district: '',
    block: '',
    village: '',
    program: '',
    ginner: ''
  });

  // const router = useRouter();
  const { translations, loading } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState<any>([])

  const [showFilter, setShowFilter] = useState(false);

  const [selectedOption, setSelectedOption] = useState<string>('location');
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [district, setDistricts] = useState<any>();
  const [block, setBlocks] = useState<any>();
  const [village, setVillage] = useState<any>();
  const [program, setProgram] = useState<any>();
  const [ginner, setGinner] = useState<any>();
  const [ginnerName, setGinnerName] = useState<any>()

  const [showColumns, setShowColumns] = useState<any>({
    showLocationColumn: true,
    showGinColumn: false,
  })

  useEffect(() => {
    fetchCottonAvailability()
  }, [page, limit, searchQuery])

  useEffect(() => {
    getCountries();
    getPrograms();
    getGinners();
  }, []);

  useEffect(() => {
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.stateId) {
      getDistricts();
    }
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.districtId) {
      getBlocks();
    }
  }, [formData.districtId]);

  useEffect(() => {
    if (formData.blockId) {
      getVillages();
    }
  }, [formData.blockId]);

  const getCountries = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    try {
      const res = await API.get(
        `location/get-states?status=true&countryId=${formData.countryId}&status=true`
      );
      if (res.success) {
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.stateId}&status=true`
      );
      if (res.success) {
        setDistricts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      const res = await API.get(
        `location/get-blocks?districtId=${formData.districtId}&status=true`
      );
      if (res.success) {
        setBlocks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVillages = async () => {
    try {
      const res = await API.get(
        `location/get-villages?blockId=${formData.blockId}&status=true`
      );
      if (res.success) {
        setVillage(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get(
        `program?status=true`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinners = async () => {
    try {
      const res = await API.get(
        `mandi?districtId=${formData.districtId}&status=true`
      );
      if (res.success) {
        setGinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCottonAvailability = async () => {
    try {
      const res = await API.get(`procurement/all-village-cotton-data?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilteredData([])
    const { value, name } = event.target;
    setSelectedOption(value)
    setFormData((prevData) => ({
      ...prevData,
      filterby: value
    }));
    if (value == "gin") {
      setShowColumns((prev: any) => ({
        showGinColumn: true,
        showLocationColumn: false
      }))
    }
    else if (value == "location") {
      setShowColumns((prev: any) => ({
        showGinColumn: false,
        showLocationColumn: true
      }))
    }
  };


  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
        stateId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        countries: "",
      }));
    } else if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        state: "",
      }));
    } else if (name === "districtId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        villageId: ""
      }));
      setError((prevError: any) => ({
        ...prevError,
        district: "",
      }));
    } else if (name === "blockId") {
      setFormData((prevData: any) => ({
        ...prevData,
        villageId: ""
      }));
      setError((prevError: any) => ({
        ...prevError,
        block: "",
      }));
    }
    else if (name === "villageId") {
      setError((prevError: any) => ({
        ...prevError,
        village: "",
      }));
    }
    else if (name === "programId") {
      setError((prevError: any) => ({
        ...prevError,
        program: "",
      }));
    }
    else if (name === "ginnerId") {
      const matchingItem = ginner.find((item: any) => item.id == value);
      setError((prevError: any) => ({
        ...prevError,
        ginner: "",
      }));
      setGinnerName(matchingItem?.name)
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleErrors = () => {
    let isError = false;

    if (!formData.countryId || formData.countryId === "") {
      setError((prevError: any) => ({
        ...prevError,
        countries: "Country is required",
      }));
      isError = true;
    }

    if (!formData.stateId) {
      setError((prevError: any) => ({
        ...prevError,
        state: "State Name is required",
      }));
      isError = true;
    }

    if (!formData.districtId) {
      setError((prevError: any) => ({
        ...prevError,
        district: "District Name is required",
      }));
      isError = true;
    }

    if (!formData.blockId) {
      setError((prevError: any) => ({
        ...prevError,
        block: "Block Name is required",
      }));
      isError = true;
    }

    if (!formData.villageId) {
      setError((prevError: any) => ({
        ...prevError,
        village: "Village Name is required",
      }));
      isError = true;
    }

    if (!formData.programId) {
      setError((prevError: any) => ({
        ...prevError,
        program: "Program is required",
      }));
      isError = true;
    }

    if (selectedOption === "gin" && !formData.ginnerId) {
      setError((prevError: any) => ({
        ...prevError,
        ginner: "Mandi Name is required",
      }));
      isError = true;
    }

    return isError;
  };

  const filterData = async () => {
    const url = `${selectedOption == "location" ? `procurement/cotton-data?villageId=${formData.villageId}&programId=${formData.programId}&pagination=true` : `procurement/cotton-data?mandiId=${formData.ginnerId}&programId=${formData.programId}&pagination=true`}`
    if (handleErrors()) {
      return;
    }
    else {
      try {
        const res = await API.get(url);
        if (res.success) {
          setFilteredData([res.data]);
          setShowFilter(false);
        }
      } catch (error) {
        console.log(error);
        setCount(0);
      }
    }
  };

  const clearFilter = () => {
    setFormData({
      countryId: "",
      stateId: "",
      districtId: "",
      blockId: "",
      villageId: "",
      programId: "",
      ginnerId: "",
      filterby: "location",
    });

    setError({
      countries: '',
      state: '',
      district: '',
      block: '',
      village: '',
      program: '',
      ginner: ''
    });

    setFilteredData([]);
    setSelectedOption('location');
    setShowColumns({
      showLocationColumn: true,
      showGinColumn: false,
    });
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilter(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Filter By:
                        </label>
                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                id="1"
                                type="radio"
                                name="filterby"
                                value="location"
                                checked={selectedOption === "location"}
                                onChange={handleRadioChange}
                              />
                              <span></span>
                            </section>{" "}
                            Location
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                id="2"
                                type="radio"
                                name="filterby"
                                value="gin"
                                checked={selectedOption === "gin"}
                                onChange={handleRadioChange}
                              />
                              <span></span>
                            </section>{" "}
                            Mandi
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Country *
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="countryId"
                          onChange={handleChange}
                          value={formData.countryId}
                        >
                          <option value="">Select a Country</option>
                          {countries?.map((countries: any) => (
                            <option key={countries.id} value={countries.id}>
                              {countries.county_name}
                            </option>
                          ))}
                        </Form.Select>
                        {error?.countries && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.countries}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select State *
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="stateId"
                          value={formData.stateId}
                          onChange={handleChange}
                        >
                          <option value="">Select a State</option>
                          {states?.map((state: any) => (
                            <option key={state.id} value={state.id}>
                              {state.state_name}
                            </option>
                          ))}
                        </Form.Select>
                        {error?.state && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.state}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select District *
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="districtId"
                          value={formData.districtId}
                          onChange={handleChange}
                        >
                          <option value="">Select District*</option>
                          {district?.map((district: any) => (
                            <option key={district.id} value={district.id}>
                              {district.district_name}
                            </option>
                          ))}
                        </Form.Select>
                        {error?.district && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.district}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Taluk/Block *
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="blockId"
                          value={formData.blockId}
                          onChange={handleChange}
                        >
                          <option value="">Select Block*</option>
                          {block?.map((block: any) => (
                            <option key={block.id} value={block.id}>
                              {block.block_name}
                            </option>
                          ))}
                        </Form.Select>
                        {error?.block && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.block}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Village *
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="villageId"
                          value={formData.villageId}
                          onChange={handleChange}
                        >
                          <option value="">Select Village*</option>
                          {village?.map((village: any) => (
                            <option key={village.id} value={village.id}>
                              {village.village_name}
                            </option>
                          ))}
                        </Form.Select>
                        {error?.village && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.village}
                          </p>
                        )}
                      </div>

                      {selectedOption === "gin" && (
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Mandi *
                          </label>
                          <Form.Select
                            aria-label="Default select example"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                            name="ginnerId"
                            value={formData.ginnerId}
                            onChange={handleChange}
                          >
                            <option value="">Select Mandi*</option>
                            {ginner?.map((ginner: any) => (
                              <option key={ginner.id} value={ginner.id}>
                                {ginner.name}
                              </option>
                            ))}
                          </Form.Select>
                          {error?.ginner && (
                            <p className="text-red-500 text-sm mt-1">
                              {error.ginner}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Program *
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          value={formData.programId}
                          name="programId"
                          onChange={handleChange}
                        >
                          <option value="">Select Program*</option>
                          {program?.map((program: any) => (
                            <option key={program.id} value={program.id}>
                              {program.program_name}
                            </option>
                          ))}
                        </Form.Select>
                        {error?.program && (
                          <p className="text-red-500 text-sm mt-1">
                            {error.program}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={filterData}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button className="btn-outline-purple" onClick={clearFilter}>
                          CLEAR ALL FILTERS
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

  if (loading) {
    return <div>  <Loader /></div>;
  }

  const filteredColumns = [
    showColumns.showLocationColumn &&
    {
      name: translations.location.village,
      selector: (row: TableData) => row.farmer_name,
      sortable: false,
    },
    showColumns.showLocationColumn &&
    {
      name: 'Estimated Quantity (Kg)',
      selector: (row: TableData) => row.estimated_qty,
      sortable: false,
    },
    showColumns.showLocationColumn &&
    {
      name: 'Sold Quantity (Kg)',
      selector: (row: TableData) => row.sold_qty,
      sortable: false,
    },
    showColumns.showLocationColumn &&
    {
      name: 'Available Quantity (Kg)',
      selector: (row: TableData) => row.available_qty,
      sortable: false,
    },

    showColumns.showGinColumn &&
    {
      name: 'Mandi Name',
      selector: (row: TableData) => ginnerName,
      sortable: false,
    },
    showColumns.showGinColumn &&
    {
      name: 'Procurement Quantity',
      selector: (row: TableData) => row.qty,
      sortable: false,
    }

  ].filter(Boolean);

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: translations.location.village,
      selector: (row: TableData) => row.farmer_name,
      sortable: false,
    },
    {
      name: 'Estimated Quantity (Kg)',
      selector: (row: TableData) => row.estimated_qty,
      sortable: false,
    },
    {
      name: 'Sold Quantity (Kg)',
      selector: (row: TableData) => row.sold_qty,
      sortable: false,
    },
    {
      name: 'Available Quantity (Kg)',
      selector: (row: TableData) => row.available_qty,
      sortable: false,
    },

  ];

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
                <li>Procurement</li>
                <li>Paddy Availability</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth">
                <div>
                  <div className="headTrader py-3 borderFix">
                    <button
                      className="flex"
                      type="button"
                      onClick={() => setShowFilter(!showFilter)}
                    >
                      FILTERS <BiFilterAlt className="m-1" />
                    </button>
                  </div>
                </div>

                {/* Show Filter Data Table  */}
                {filteredData.length > 0 && (
                  <div className="py-2 border-y-4 border-black mb-4">
                    <DataTable
                      persistTableHead
                      columns={filteredColumns}
                      data={filteredData}
                    />
                  </div>
                )}

                {/* search */}
                <div className="search-filter-row mt-3">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search"
                          value={searchQuery}
                          onChange={searchData}
                        />
                        <button type="submit" className="search-btn">
                          <span className="icon-search"></span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
                <CommonDataTable
                  columns={columns}
                  count={count}
                  data={data}
                  updateData={updatePage}
                />
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
      </div>
    );
  }
}
