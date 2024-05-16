"use client";
import React, { useEffect, useRef, useState } from "react";
import BarChart from "@components/charts/BarChart";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import API from "@lib/Api";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
interface DataItem {
  processor_type: string;
  count: string;
}
const EscalationMatrixDashboard = () => {
  useTitle("Analytical Dashboard");
  const [roleLoading] = useRole();
  const [data, setData] = useState<any>([]);
  const [approved, setApproved] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [pending, setPending] = useState([]);
  const [progress, setProgress] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchApproved();
    fetchPending();
    fetchResolved();
    fetchProgress();
    fetchRejected();
  }, []);

  const fetchAll = async () => {
    try {
      const response = await API.get("ticketing/count");
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchApproved = async () => {
    try {
      const response = await API.get("ticketing/count?status=Approved");
      if (response.success) {
        setApproved(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchPending = async () => {
    try {
      const response = await API.get("ticketing/count?status=Pending");
      if (response.success) {
        setPending(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchResolved = async () => {
    try {
      const response = await API.get("ticketing/count?status=Resolved");
      if (response.success) {
        setResolved(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchProgress = async () => {
    try {
      const response = await API.get("ticketing/count?status=In Progress");
      if (response.success) {
        setProgress(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchRejected = async () => {
    try {
      const response = await API.get("ticketing/count?status=Rejected");
      if (response.success) {
        setRejected(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const chartDataAll = data.map((item: DataItem) => ({
    name: item.processor_type,
    y: parseFloat(item.count),
    drilldown: item.processor_type.toLowerCase(),
  }));

  const chartResolved = resolved.map((item: DataItem) => ({
    name: item.processor_type,
    y: parseFloat(item.count),
    drilldown: item.processor_type.toLowerCase(),
  }));

  const chartPending = pending.map((item: DataItem) => ({
    name: item.processor_type,
    y: parseFloat(item.count),
    drilldown: item.processor_type.toLowerCase(),
  }));

  const chartInProgress = progress.map((item: DataItem) => ({
    name: item.processor_type,
    y: parseFloat(item.count),
    drilldown: item.processor_type.toLowerCase(),
  }));

  const chartRejected = rejected.map((item: DataItem) => ({
    name: item.processor_type,
    y: parseFloat(item.count),
    drilldown: item.processor_type.toLowerCase(),
  }));

  const chartApproved = approved.map((item: DataItem) => ({
    name: item.processor_type,
    y: parseFloat(item.count),
    drilldown: item.processor_type.toLowerCase(),
  }));

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
                          Select program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="brand_name"
                          // selectedValues={brands?.filter((item: any) =>
                          //   checkedBrand.includes(item.id)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(
                          //   selectedList: any,
                          //   selectedItem: any
                          // ) => {
                          //   handleChange(selectedList, selectedItem, "brand");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(
                          //   selectedList: any,
                          //   selectedItem: any
                          // ) => {
                          //   handleChange(selectedList, selectedItem, "brand");
                          // }}
                          // options={brands}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Brand
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="brand_name"
                          // selectedValues={brands?.filter((item: any) =>
                          //   checkedBrand.includes(item.id)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(
                          //   selectedList: any,
                          //   selectedItem: any
                          // ) => {
                          //   handleChange(selectedList, selectedItem, "brand");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(
                          //   selectedList: any,
                          //   selectedItem: any
                          // ) => {
                          //   handleChange(selectedList, selectedItem, "brand");
                          // }}
                          // options={brands}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="brand_name"
                          // selectedValues={brands?.filter((item: any) =>
                          //   checkedBrand.includes(item.id)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(
                          //   selectedList: any,
                          //   selectedItem: any
                          // ) => {
                          //   handleChange(selectedList, selectedItem, "brand");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(
                          //   selectedList: any,
                          //   selectedItem: any
                          // ) => {
                          //   handleChange(selectedList, selectedItem, "brand");
                          // }}
                          // options={brands}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          // selectedValues={countries?.filter((item: any) =>
                          //   checkedCountries.includes(item.id)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "country");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "country");
                          // }}
                          // options={countries}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select State
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          // selectedValues={processorOptions?.filter(
                          //   (item: any) => checkedProcessor.includes(item.name)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(
                          //     selectedList,
                          //     selectedItem,
                          //     "processor"
                          //   );
                          // }}
                          // onSearch={function noRefCheck() {}}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(
                          //     selectedList,
                          //     selectedItem,
                          //     "processor"
                          //   );
                          // }}
                          // options={processorOptions}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          // selectedValues={statusOptions?.filter((item: any) =>
                          //   checkedStatus.includes(item.name)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          // options={statusOptions}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Spinner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          // selectedValues={statusOptions?.filter((item: any) =>
                          //   checkedStatus.includes(item.name)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          // options={statusOptions}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Knitter
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          // selectedValues={statusOptions?.filter((item: any) =>
                          //   checkedStatus.includes(item.name)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          // options={statusOptions}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Weaver
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          // selectedValues={statusOptions?.filter((item: any) =>
                          //   checkedStatus.includes(item.name)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          // options={statusOptions}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Garment
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          // selectedValues={statusOptions?.filter((item: any) =>
                          //   checkedStatus.includes(item.name)
                          // )}
                          onKeyPressFn={function noRefCheck() { }}
                          // onRemove={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          onSearch={function noRefCheck() { }}
                          // onSelect={(selectedList: any, selectedItem: any) => {
                          //   handleChange(selectedList, selectedItem, "status");
                          // }}
                          // options={statusOptions}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            setShowFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                        // onClick={clearFilter}
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
        )}
      </div>
    );
  };

  if (!roleLoading) {
    return (
      <>
        <hr className="mt-6" />
        {/* <div className="bg-gray-200 ml-5 mr-5">
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="program"
              >
                <option value="">Program</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="brand"
              >
                <option value="">Brand</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="season"
              >
                <option value="">Season</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="farmgroup"
              >
                <option value="">Country</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="state"
              >
                <option value="">State</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="ginner"
              >
                <option value="">Ginner</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="spinner"
              >
                <option value="">Spinner</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="knitter"
              >
                <option value="">Knitter</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3 black-border"
                name="weaver"
              >
                <option value="">Weaver</option>
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <select
                className="w-80 border rounded px-2 py-1 mr-4 text-sm ml-6 mt-3"
                name="garment"
              >
                <option value="">Garment</option>
              </select>
            </div>

            <div className="w-full sm:w-1/4">
              <button className="bg-green-500 p-2 text-white rounded ml-5 text-sm  mt-3 mb-2 ">
                Filter
              </button>
              <button className="bg-red-500 p-2 text-white rounded ml-5 text-sm  mt-3 mb-2 ">
                Reset
              </button>
            </div>
          </div>
        </div> */}

        <div className="bg-white rounded-lg mt-4">
          <div className="p-3">
            <div className="search-filter-left ">
              <div className="fliterBtn">
                <button
                  className="flex"
                  type="button"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  FILTERS <BiFilterAlt className="m-1" />
                </button>

                <div className="relative">
                  <FilterPopup openFilter={showFilter} onClose={!showFilter} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 mt-5 mb-5">
              <div className="w-full h-full">
                <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
                  Total Ticketing Recieved
                </h4>
                <BarChart
                  title="Total Ticketing Recieved"
                  data={chartDataAll}
                  type={"column"}
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2 mt-5 mb-5">
              <div className="w-full h-full">
                <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
                  Total Ticketing Resolved
                </h4>
                <BarChart
                  title="Total tickets resolved"
                  data={chartResolved}
                  type={"column"}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 mb-5">
              <div className="w-full h-full">
                <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
                  Total tickets pending for approval
                </h4>
                <BarChart
                  title="Total tickets pending for approval"
                  data={chartPending}
                  type={"column"}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2 mb-5">
              <div className="w-full h-full">
                <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
                  Total tickets in progress
                </h4>
                <BarChart
                  title="Total tickets in progress"
                  data={chartInProgress}
                  type={"column"}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2">
              <div className="w-full h-full">
                <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
                  Total tickets rejected
                </h4>
                <BarChart
                  title="Total tickets rejected"
                  data={chartRejected}
                  type={"column"}
                />
              </div>
            </div>
            <div className="w-full sm:w-1/2">
              <div className="w-full h-full">
                <h4 className=" font-bold ml-8 text-white bg-[#172554] bg-opacity-90 text-sm p-2 mt-3 mr-3">
                  Total tickets Approved
                </h4>
                <BarChart
                  title="Total tickets Approved"
                  data={chartApproved}
                  type={"column"}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default EscalationMatrixDashboard;
