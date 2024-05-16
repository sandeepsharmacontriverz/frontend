"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "./MultiSelectDropDown";
import API from "@lib/Api";

const materialData = [
  {
    id: 1,
    name: "Lint"
  },
  {
    id: 2,
    name: 'Yarn'
  },
  {
    id: 3,
    name: 'Fabric'
  },
  {
    id: 4,
    name: 'Garment'
  }

]

const yarnTypeData = [
  {
    id: 1,
    name: "Combed"
  },
  {
    id: 2,
    name: 'Carded'
  },
  {
    id: 3,
    name: 'Open End'
  }
]

export default function ProcessorRegistration({
  type,
  errors,
  processorFormData,
  onProcessorChangeData,
  onBlur,
  handleMultiSelect,
  IsEdit
}: any) {
  const [initialData, setInitialData] = useState({
    programs: [],
    fabricType: [],
    productionCap: [],
    unitCert: [],
    brand: [],
    loomType: [],
    materialTrading: [],
    yarnCountRange: "",
    yarnType: ""
  })

  const [countries, setCountries] = useState<any>([]);
  const [states, setStates] = useState<any>([]);
  const [programs, setProgram] = useState<any>([]);
  const [loomType, setLoomType] = useState<any>([]);
  const [fabricType, setFabricType] = useState<any>([]);
  const [productionCap, setProductionCap] = useState<any>([]);
  const [brand, setBrand] = useState<any>([]);
  const [materialTrading, setMaterialTrading] = useState<any>(materialData);
  const [unitCert, setUnitCert] = useState<any>([]);
  const [yarnCountRange, setYarnCountRange] = useState<any>([])
  const [yarnType, setYarnType] = useState<any>(yarnTypeData)


  useEffect(() => {
    getCountries();
    getPrograms();
    getUnitCertification();
    getBrands();
    if (type === "Spinner") {
      getYarnCountRange();
    }

    if (type === "Garment" || type === "Knitter" || type === "Weaving" || type === "Fabric") {
      getFabricTypes();
    }
    if (type === "Weaving") {
      getLoomTypes();
    }
    if (type === "Garment" || type === "Knitter" || type === "Weaving") {
      getProdCap();
    }
  }, []);

  const getUnitCertification = async () => {
    try {
      const res = await API.get("unit/unit-certification");
      if (res.success) {
        setUnitCert(res.data);
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
      if (processorFormData.countryId) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${processorFormData.countryId}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get("program?status=true");
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLoomTypes = async () => {
    try {
      const res = await API.get("loom-type?status=true");
      if (res.success) {
        setLoomType(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFabricTypes = async () => {
    try {
      const res = await API.get("fabric-type?status=true");
      if (res.success) {
        setFabricType(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getProdCap = async () => {
    try {
      const res = await API.get("production-capacity");
      if (res.success) {
        setProductionCap(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getYarnCountRange = async () => {
    try {
      const res = await API.get("yarncount?status=true");
      if (res.success) {
        setYarnCountRange(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrand(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (processorFormData.countryId) {
      getStates();
    }
  }, [processorFormData.countryId]);

  useEffect(() => {
    const matchNames: any = unitCert
      .filter((unitCert: any) => processorFormData?.unitCert.includes(unitCert.id))
      .map((unitCert: any) => unitCert.certification_name);

    setInitialData((prev) => ({
      ...prev,
      unitCert: matchNames
    })
    );
  }, [processorFormData.unitCert])

  useEffect(() => {
    if (type === "Spinner" && yarnType) {
      const matchNames: any = yarnType
        .filter((yarnType: any) => processorFormData?.yarnType?.includes(yarnType.name))
        .map((yarnType: any) => yarnType.name);

      setInitialData((prev) => ({
        ...prev,
        yarnType: matchNames
      })
      );
    }
  }, [processorFormData.yarnType])

  useEffect(() => {
    if (type === "Spinner" && yarnCountRange) {
      const matchNames: any = yarnCountRange
        .filter((yarnCountRange: any) => processorFormData?.yarnCountRange?.includes(yarnCountRange.id))
        .map((yarnCountRange: any) => yarnCountRange.yarnCount_name);

      setInitialData((prev) => ({
        ...prev,
        yarnCountRange: matchNames
      })
      );
    }
  }, [processorFormData.yarnCountRange])

  useEffect(() => {
    if (programs) {
      const matchNames: any = programs
        .filter((program: any) => processorFormData?.programIds.includes(program.id))
        .map((program: any) => program.program_name);

      setInitialData((prev) => ({
        ...prev,
        programs: matchNames
      })
      );
    }
  }, [processorFormData?.programIds, programs])

  useEffect(() => {
    if (type === "Weaving") {
      const matchNames: any = loomType
        .filter((loomType: any) => processorFormData?.loomType?.includes(loomType.id))
        .map((loomType: any) => loomType.name);

      setInitialData((prev) => ({
        ...prev,
        loomType: matchNames
      })
      );
    }
  }, [processorFormData?.loomType])



  useEffect(() => {
    if (type === "Garment" || type === "Knitter" || type === "Weaving" || type === "Fabric") {
      const matchNames: any = fabricType
        .filter((fabricType: any) => processorFormData?.fabricType?.includes(fabricType.id))
        .map((fabricType: any) => fabricType.fabricType_name);

      setInitialData((prev) => ({
        ...prev,
        fabricType: matchNames
      })
      )
    }
  }, [processorFormData?.fabricType])

  useEffect(() => {
    if (type === "Garment" || type === "Knitter" || type === "Weaving") {
      const matchNames: any = productionCap
        .filter((productionCap: any) => processorFormData?.prodCap?.includes(productionCap.id))
        .map((productionCap: any) => productionCap.name);

      setInitialData((prev) => ({
        ...prev,
        productionCap: matchNames
      })
      );
    }
  }, [processorFormData?.prodCap])


  useEffect(() => {
    const matchNames: any = brand
      .filter((brand: any) => processorFormData?.brand.includes(brand.id))
      .map((brand: any) => brand.brand_name);

    setInitialData((prev) => ({
      ...prev,
      brand: matchNames
    })
    );
  }, [processorFormData?.brand, brand])

  useEffect(() => {
    setInitialData((prev) => ({
      ...prev,
      materialTrading: processorFormData?.materialTrading
    }))
  }, [processorFormData?.materialTrading])

  return (
    <div className="lg:flex w-full border-t-4 md:flex-wrap  sm:flex-wrap">
      <div className="lg:w-1/2 px-4 md:w-full sm:w-full">
        <div className="flex mt-3">
          <div className="w-1/2 ">
            <label className="text-sm font-medium text-gray-700">
              {type} Name <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="w-1/2 ">
            <input
              name="name"
              value={processorFormData.name}
              onBlur={onBlur}
              onChange={(event) => onProcessorChangeData(event)}
              type="text"
              placeholder={`${type} Name`}
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {errors.name && (
              <p className="text-red-500  text-sm mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        {(type === "Spinner" || type == "Ginner") && (
          <div className="flex mt-3">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">
                {type == "Ginner" ? "Gin" : "Spin"} Short Name
                <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="w-1/2">
              <input
                type="text"
                name="shortName"
                value={processorFormData.shortName}
                onChange={(event) => onProcessorChangeData(event)}
                placeholder={`${type == "Ginner" ? "Gin" : "Spin"} Short Name`}
                className=" w-full  border rounded px-2 py-1 text-sm"
              />
              {errors.shortName && (
                <p className="text-red-500  text-sm mt-1">{errors.shortName}</p>
              )}
            </div>
          </div>
        )}
        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Address <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="w-1/2">
            <textarea
              rows={3}
              name="address"
              value={processorFormData.address}
              onChange={(event) => onProcessorChangeData(event)}
              placeholder="Address"
              className=" w-full  border rounded px-2 py-1 text-sm"
            />
            {errors.address && (
              <p className="text-red-500  text-sm mt-1">{errors.address}</p>
            )}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span></label>
          </div>
          <div className="w-1/2">
            <select
              name="countryId"
              value={processorFormData.countryId}
              onChange={(event) => onProcessorChangeData(event)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">Select Country</option>
              {countries?.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.county_name}
                </option>
              ))}
            </select>
            {errors.countryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.countryId}
              </p>
            )}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">State <span className="text-red-500">*</span></label>
          </div>
          <div className="w-1/2">
            <select
              name="stateId"
              value={processorFormData.stateId}
              onChange={(event) => onProcessorChangeData(event)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">Select State</option>
              {states?.map((states: any) => (
                <option key={states.id} value={states.id}>
                  {states.state_name}
                </option>
              ))}
            </select>
            {errors.stateId && (
              <p className="text-red-500  text-sm mt-1">{errors.stateId}</p>
            )}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">Program <span className="text-red-500">*</span></label>
          </div>
          <div className="w-1/2">
            <MultiSelectDropdown
              name="programIds"
              initiallySelected={initialData.programs}
              options={programs?.map((item: any) => {
                return item.program_name;
              })}
              onChange={handleMultiSelect}
            />
            {errors.programIds && (
              <p className="text-red-500  text-sm mt-1">
                {errors.programIds}
              </p>
            )}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">
              GPS Information
            </label>
          </div>
          <div className="lg:flex flex-wrap md:w-1/2 sm:w-1/2 justify-between">
            <div>
              <input
                name="latitude"
                value={processorFormData.latitude || ''}
                onChange={(event) => onProcessorChangeData(event)}
                type="text"
                placeholder="Latitude"
                className=" w-full  border rounded px-2 py-1 text-sm "
              />
              {/* {errors.programIds && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.latitude}
                </p>
              )} */}
            </div>
            <div>
              <input
                name="longitude"
                value={processorFormData.longitude || ''}
                onChange={(event) => onProcessorChangeData(event)}
                type="text"
                placeholder="Longitude"
                className=" w-full  border rounded px-2 py-1 text-sm"
              />
              {/* {errors.longitude && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.longitude}
                </p>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">
              Website{" "}
            </label>
          </div>
          <div className="w-1/2">
            <input
              name="website"
              value={processorFormData.website}
              onChange={(event) => onProcessorChangeData(event)}
              type="text"
              placeholder="Website"
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {/* {errors.website && (
              <p className="text-red-500  text-sm mt-1">{errors.website}</p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">
              Contact Person Name <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="w-1/2">
            <input
              name="contactPerson"
              value={processorFormData.contactPerson}
              onChange={(event) => onProcessorChangeData(event)}
              type="text"
              placeholder="Contact Person name"
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {errors.contactPerson && (
              <p className="text-red-500  text-sm mt-1">
                {errors.contactPerson}
              </p>
            )}
          </div>
        </div>

        <h2 className="mt-5 text-bold">Contact Number:</h2>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">
              Mobile No
            </label>
          </div>
          <div className="w-1/2">
            <input
              name="mobile"
              value={processorFormData.mobile}
              onChange={(event) => onProcessorChangeData(event)}
              type="text"
              placeholder="Mobile No"
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {/* {errors.mobile && (
              <p className="text-red-500  text-sm mt-1">{errors.mobile}</p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">
              LandLine No
            </label>
          </div>
          <div className="w-1/2">
            <input
              name="landline"
              value={processorFormData.landline}
              onChange={(event) => onProcessorChangeData(event)}
              type="text"
              placeholder="LandLine No"
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {/* {errors.landline && (
              <p className="text-red-500  text-sm mt-1">
                {errors.landline}
              </p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700">Email </label>
          </div>
          <div className="w-1/2">
            <input
              name="email"
              value={processorFormData.email}
              onChange={(event) => onProcessorChangeData(event)}
              type="text"
              placeholder="Email"
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {/* {errors.email && (
              <p className="text-red-500  text-sm mt-1">{errors.email}</p>
            )} */}
          </div>
        </div>

        {type === "Spinner" && (
          <div className="flex mt-3">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Yarn Type{" "}
              </label>
            </div>
            <div className="w-1/2">
              <MultiSelectDropdown
                name="yarnType"
                initiallySelected={initialData.yarnType}
                options={yarnType?.map((item: any) => {
                  return item.name;
                })}
                onChange={handleMultiSelect}
              />
              {errors.yarnType && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.yarnType}
                </p>
              )}
            </div>
          </div>
        )}

        {type === "Weaving" && (
          <div className="flex mt-3">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 ">
                Loom Type{" "}
              </label>
            </div>
            <div className="w-1/2">
              <MultiSelectDropdown
                initiallySelected={initialData.loomType}
                name="loomType"
                options={loomType?.map((item: any) => {
                  return item.name;
                })}
                onChange={handleMultiSelect}
              />
              {/* {errors.loomType && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.loomType}
                </p>
              )} */}
            </div>
          </div>
        )}

        {type === "Ginner" && (
          <div className="flex mt-3">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 ">
                Type of Gin:
              </label>
            </div>
            <div className="ml-5 w-1/2">
              <label className="inline-flex items-center text-sm">
                <input
                  type="radio"
                  name="ginType"
                  checked={processorFormData.ginType === 'fully automatic'}
                  onChange={(event) => onProcessorChangeData(event)}
                  value="fully automatic"
                  className="form-radio"
                />
                <span className="ml-2 text-sm">Fully Automated</span>
              </label>
              <label className="inline-flex items-center ml-5 text-sm">
                <input
                  type="radio"
                  name="ginType"
                  checked={processorFormData.ginType === 'semi automatic'}
                  onChange={(event) => onProcessorChangeData(event)}
                  value="semi automatic"
                  className="form-radio"
                />
                <span className="ml-2 text-sm"> Semi-Automated</span>
              </label>
              <label className="inline-flex items-center ml-5 text-sm">
                <input
                  type="radio"
                  name="ginType"
                  checked={processorFormData.ginType === 'manual'}
                  onChange={(event) => onProcessorChangeData(event)}
                  value="manual"
                  className="form-radio"
                />
                <span className="ml-2 text-sm">Manual</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="lg:w-1/2 px-4 md:w-full sm:w-full">
        {(type === "Garment" || type === "Knitter" || type === "Weaving" || type === "Fabric") && (
          <div className="flex mt-3 ">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">
                No of Machines{" "}
              </label>
            </div>
            <div className="w-1/2">
              <input
                name="noOfMachines"
                value={processorFormData.noOfMachines}
                onChange={(event) => onProcessorChangeData(event)}
                type="text"
                placeholder="No of Machines"
                className="w-full  border rounded px-2 py-1 text-sm"
              />
              {/* {errors.noOfMachines && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.noOfMachines}
                </p>
              )} */}
            </div>
          </div>
        )}

        {(type === "Garment" || type === "Knitter" || type === "Weaving" || type === "Fabric") && (
          <div className="flex mt-3 ">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">
                {type === "Fabric" ? "Fabric Processor Type" : "Fabric Type"}
                {type === "Fabric" && <span className="text-red-500">*</span>}
              </label>
            </div>
            <div className="w-1/2">
              <MultiSelectDropdown
                name="fabricType"
                initiallySelected={initialData.fabricType}
                options={fabricType?.map((item: any) => {
                  return item.fabricType_name;
                })}
                onChange={handleMultiSelect}
              />
              {(type === "Weaver" || type === "Fabric") && errors.fabricType && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.fabricType}
                </p>
              )}
            </div>
          </div>
        )}

        {(type === "Garment" || type === "Knitter" || type === "Weaving") && (
          <div className="flex mt-3 ">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Production Capacity{" "}
              </label>
            </div>
            <div className="w-1/2">
              <MultiSelectDropdown
                name="prodCap"
                initiallySelected={initialData.productionCap}
                options={productionCap?.map((item: any) => {
                  return item.name;
                })}
                onChange={handleMultiSelect}
              />
              {/* {errors.prodCap && (
                <p className="text-red-500  text-sm mt-1">
                  {errors.prodCap}
                </p>
              )} */}
            </div>
          </div>
        )}

        {(type === "Garment" || type === "Knitter" || type === "Weaving" || type === "Fabric") && (
          <div className="flex mt-3">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 ">
                Loss % <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="lg:flex flex-wrap md:w-1/2 sm:w-1/2 justify-between">
              <div>
                <input
                  name="lossFrom"
                  value={processorFormData.lossFrom}
                  onChange={(event) => onProcessorChangeData(event)}
                  type="text"
                  placeholder="From"
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                {errors.lossFrom && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.lossFrom}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="lossTo"
                  value={processorFormData.lossTo}
                  onChange={(event) => onProcessorChangeData(event)}
                  type="text"
                  placeholder="To"
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                {errors.lossTo && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.lossTo}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {type === "Spinner" && (
          <>          <div className="flex mt-3 ">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Yarn Count Range{" "}
              </label>
            </div>
            <div className="w-1/2">
              <MultiSelectDropdown
                name="yarnCountRange"
                initiallySelected={initialData.yarnCountRange}
                options={yarnCountRange?.map((item: any) => {
                  return item.yarnCount_name;
                })}
                onChange={handleMultiSelect}
              />

            </div>
          </div>

            <div className="flex mt-3 ">
              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700">
                  Yarn Realisation Range{" "}
                </label>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="From"
                  name="rangeFrom"
                  value={processorFormData.rangeFrom}
                  onChange={(event) => onProcessorChangeData(event)}
                  className="w-full  border rounded px-2 py-1 text-sm "
                />
                {errors.rangeFrom && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.rangeFrom}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="To"
                  name="rangeTo"
                  value={processorFormData.rangeTo}
                  onChange={(event) => onProcessorChangeData(event)}
                  className="w-full mt-2  border rounded px-2 py-1 text-sm"
                />
                {errors.rangeTo && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.rangeTo}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {type === "Ginner" && (
          <>
            <div className="flex mt-3 ">
              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700 sm:col-span-4">
                  Mandi Outturn Range<span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="From"
                  name="outturnRangeFrom"
                  value={processorFormData.outturnRangeFrom}
                  onChange={(event) => onProcessorChangeData(event)}
                  className="w-full  border rounded px-2 py-1 text-sm "
                />
                {errors.outturnRangeFrom && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.outturnRangeFrom}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="To"
                  name="outturnRangeTo"
                  value={processorFormData.outturnRangeTo}
                  onChange={(event) => onProcessorChangeData(event)}
                  className="w-full mt-2  border rounded px-2 py-1 text-sm"
                />
                {errors.outturnRangeTo && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.outturnRangeTo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex mt-3 ">
              <div className="w-1/2">
                <label className="text-sm font-medium text-gray-700">
                  Bale Weight Range<span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="From"
                  name="baleWeightFrom"
                  value={processorFormData.baleWeightFrom}
                  onChange={(event) => onProcessorChangeData(event)}
                  className="w-full  border rounded px-2 py-1 text-sm"
                />
                {errors.baleWeightFrom && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.baleWeightFrom}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="To"
                  name="baleWeightTo"
                  value={processorFormData.baleWeightTo}
                  onChange={(event) => onProcessorChangeData(event)}
                  className="w-full mt-2 border rounded px-2 py-1 text-sm"
                />
                {errors.baleWeightTo && (
                  <p className="text-red-500  text-sm mt-1">
                    {errors.baleWeightTo}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
        <div className="flex mt-3 ">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Unit Certified For{" "}
            </label>
          </div>
          <div className="w-1/2">
            <MultiSelectDropdown
              name="unitCert"
              initiallySelected={initialData.unitCert}
              options={unitCert?.map((item: any) => {
                return item.certification_name;
              })}
              onChange={handleMultiSelect}
            />
            {/* {errors.unitCert && (
              <p className="text-red-500  text-sm mt-1">
                {errors.unitCert}
              </p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3 ">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Company Information{" "}
            </label>
          </div>

          <div className="w-1/2">
            <textarea
              rows={3}
              name="companyInfo"
              value={processorFormData.companyInfo}
              onChange={(event) => onProcessorChangeData(event)}
              placeholder="Company Information "
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            {/* {errors.companyInfo && (
              <p className="text-red-500  text-sm mt-1">
                {errors.companyInfo}
              </p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3 ">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Organisation Logo{" "}
            </label>
          </div>
          <div className="w-1/2">
            <input
              name="logo"
              type="file"
              onChange={(event) => onProcessorChangeData(event)}
              className="w-full  border rounded px-2 py-1 text-sm "
            />
            <p className="py-2 text-sm">(Max: 75kb) (Format: jpg/jpeg/bmp)</p>


            {IsEdit && processorFormData.logo &&
              <img src={processorFormData?.logo} className="w-[150px] h-[150px]" />
            }
            {/* {errors.logo && (
              <p className="text-red-500  text-sm mt-1">{errors.logo}</p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3 ">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Organisation Photo{" "}
            </label>
          </div>
          <div className="w-1/2">
            <input
              name="photo"
              onChange={(event) => onProcessorChangeData(event)}
              type="file"
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            <p className="py-2 text-sm">(Max: 100kb) (Format: jpg/jpeg/bmp)</p>
            {IsEdit && processorFormData.photo &&
              <img src={processorFormData?.photo} className="w-[150px] h-[150px]" />
            }
            {/* {errors.photo && (
              <p className="text-red-500  text-sm mt-1">{errors.photo}</p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3 ">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Certificates
            </label>
          </div>
          <div className="w-1/2">
            <input
              type="file"
              name="certs"
              onChange={(event) => onProcessorChangeData(event)}
              className="w-full  border rounded px-2 py-1 text-sm"
            />
            <p className="py-2 text-sm">(Max: 75kb) (Format: jpg/jpeg/bmp)</p>
            {IsEdit && processorFormData.certs &&
              <img src={processorFormData?.certs} className="w-[150px] h-[150px]" />
            }

            {/* {errors.certs && (
              <p className="text-red-500  text-sm mt-1">{errors.certs}</p>
            )} */}
          </div>
        </div>

        <div className="flex mt-3 ">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 ">
              Brand Mapped <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="w-1/2">
            <MultiSelectDropdown
              name="brand"
              initiallySelected={initialData.brand}
              options={brand?.map((item: any) => {
                return item.brand_name;
              })}
              onChange={handleMultiSelect}
            />
            {errors.brand && (
              <p className="text-red-500  text-sm mt-1">{errors.brand}</p>
            )}
          </div>
        </div>

        {type === "Trader" && (
          <div className="flex mt-3 ">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-700 ">
                Material Trading <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="w-1/2">
              <MultiSelectDropdown
                name="materialTrading"
                initiallySelected={initialData.materialTrading}
                options={materialTrading?.map((item: any) => {
                  return item.name;
                })}
                onChange={handleMultiSelect}
              />
              {errors.materialTrading && (
                <p className="text-red-500  text-sm mt-1">{errors.materialTrading}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
