"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment, { Moment } from "moment";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import { toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Select from "react-select";

const ProcessorType: any = [
  {
    id: 1,
    name: "Mandi",
  },
  {
    id: 2,
    name: "Mill",
  },
  // {
  //   id: 3,
  //   name: "Knitter",
  // },
  // {
  //   id: 4,
  //   name: "Weaver",
  // },
  // {
  //   id: 5,
  //   name: "Garment",
  // },
];

const trainingMode = [
  {
    id: 1,
    name: "Online",
  },
  {
    id: 2,
    name: "Offline",
  },
];

const options = [
  { value: 'TraceRice General Training', label: 'TraceRice General Training' },
  { value: 'TraceRice Customised Training', label: 'TraceRice Customised Training' },
  { value: 'Other Training', label: 'Other Training' },
];

const page = () => {
  const router = useRouter();
  const [roleLoading] = useRole();

  useTitle("Create Processor Training");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [country, setCountry] = useState<any>([]);
  const [state, setState] = useState<any>([]);
  const [brands, setBrands] = useState<any>([]);
  const [processorName, setProcessorName] = useState<any>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedSTime, setSSelectedTime] = useState<Moment>();
  const [selectedETime, setESelectedTime] = useState<Moment>();
  const [formData, setFormData] = useState<any>({
    trainingType: "TraceRice General Training",
    brandId: null,
    countryId: null,
    stateId: null,
    processor: "",
    trainingMode: "",
    processorName: "",
    trainingDescription: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: null,
  });

  const [errors, setErrors] = useState<any>({
    brandId: "",
    countryId: "",
    stateId: "",
    processor: "",
    trainingMode: "",
    processorName: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const requiredFields = [
    "brandId",
    "countryId",
    "stateId",
    "processor",
    "trainingMode",
    "venue",
    "date",
    "startTime",
    "endTime",
  ];

  useEffect(() => {
    getCountry();
    getBrands();
  }, []);

  useEffect(() => {
    if (formData.countryId !== undefined && formData.countryId !== null && formData.countryId !== "") {
      getStates();
    } else {
      setState([])
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        stateId: null
      }));
    }
  }, [formData.countryId]);



  useEffect(() => {
    if (
      formData.stateId &&
      formData.brandId &&
      formData.processor &&
      formData.trainingType === "TraceRice Customised Training"
    ) {
      getProcessorName();
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        processorName: "",
      }));
    }
  }, [
    formData.stateId,
    formData.brandId,
    formData.processor,
    formData.trainingType,
  ]);

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountry(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    if (formData.countryId !== undefined && formData.countryId !== null && formData.countryId !== "") {
      const url = `location/get-states?status=true&countryId=${formData.countryId}`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;
          setState(res);
        }
      } catch (error) {
        console.error("Error during the request:", error);
      }
    }
  };


  const getBrands = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProcessorName = async () => {
    const processorType = formData.processor?.toLowerCase();
    const url = `${processorType}?stateId=${formData.stateId}&brandId=${formData.brandId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProcessorName(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };


  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      switch (name) {
        case "brandId":
          return value?.length === 0 || value === null || value === undefined
            ? "Brand Name is Required"
            : "";
        case "countryId":
          return value?.length === 0 || value === null || value === undefined
            ? "Country Name is Required"
            : "";
        case "stateId":
          return value?.length === 0 || value === null || value === undefined
            ? "State Name is Required"
            : "";
        case "processor":
          return value?.length === 0 || value === null || value === undefined
            ? "Processor is Required"
            : "";
        case "trainingMode":
          return value?.length === 0 || value === null || value === undefined
            ? "Mode of training is Required"
            : "";
        case "venue":
          return value.length === 0 ? "Venue is Required" : "";
        case "date":
          return value.length === 0 ? "Date is Required" : "";
        case "startTime":
          return value?.length === 0 || value === null || value === undefined
            ? "Start Time is Required"
            : "";
        case "endTime":
          if (selectedETime) {
            if (moment(selectedETime)?.isBefore(moment(selectedSTime))) {
              return "End time must be greater than or equal to start time";
            } else {
              return "";
            }
          }
        default:
          return "";
      }
    }
  };

  const handleTimeChange = (newTime: any, name: any) => {
    if (!moment.isMoment(newTime)) {
      if (name === "startTime") {
        setSSelectedTime(undefined);
      } else {
        setESelectedTime(undefined);
      }
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: null,
      }));
      return;
    }
    const isStartTime = name === "startTime";
    if (isStartTime) {
      setSSelectedTime(newTime);
      setESelectedTime(undefined);
    } else {
      setESelectedTime(newTime);
    }

    const formatted = newTime.format("HH:mm:ss");
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: formatted,
    }));
    setErrors((prevFormData: any) => ({
      ...prevFormData,
      [name]: "",
    }));
  };

  const handleCancel = () => {
    router.push("/training/processor-training");
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });
    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (!hasErrors) {
      const url = "training/set-training";
      try {
        const response = await API.post(url, formData);
        setIsSubmitting(true);
        if (response.success) {
          toasterSuccess(
            "Processor Training created Successfully",
            3000,
            response.data.id
          );
          router.push("/training/processor-training");
        }
      } catch (error) {
        console.log(error, "error");
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };


  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "brandId" || name === "stateId") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        processorName: "",
      }));
    }
    if (name === "trainingType" && value !== "Other Training") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        trainingDescription: "",
      }));
    }
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const handleDate = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: newDate,
    }));
    setErrors((prevFormData: any) => ({
      ...prevFormData,
      date: "",
    }));
  };
  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <NavLink href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Training</li>
                <li>
                  <NavLink href="/training/processor-training">
                    Processor Training
                  </NavLink>
                </li>
                <li>Create Processor Training</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Training Type*
                    </label>
                    <Select
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      value={options.find(option => option.value === formData.trainingType)}
                      onChange={(selectedOption: any) => handleChange('trainingType', selectedOption.value)}
                      options={options}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Brand *
                    </label>
                    <Select
                      name="brandId"
                      value={formData.brandId ? { label: brands?.find((brandId: any) => brandId.id === formData.brandId)?.brand_name, value: formData.brandId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Brand"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(brands || []).map(({ id, brand_name }: any) => ({
                        label: brand_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("brandId", item?.value);
                      }}
                    />
                    {errors.brandId && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.brandId}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Country *
                    </label>
                    <Select
                      name="countryId"
                      value={formData.countryId ? { label: country?.find((countryId: any) => countryId.id === formData.countryId)?.county_name, value: formData.countryId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Country"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(country || []).map(({ id, county_name }: any) => ({
                        label: county_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("countryId", item?.value);
                      }}
                    />
                    {errors.countryId && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.countryId}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      State *
                    </label>
                    <Select
                      name="stateId"
                      value={formData.stateId ? { label: state?.find((stateId: any) => stateId.id === formData.stateId)?.state_name, value: formData.stateId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select State"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(state || []).map(({ id, state_name }: any) => ({
                        label: state_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("stateId", item?.value);
                      }}
                    />
                    {errors.stateId && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.stateId}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Processor *
                    </label>
                    <Select
                      name="processor"
                      value={formData.processor ? { label: ProcessorType?.find((processor: any) => processor.name == formData.processor)?.name, value: formData.processor } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Processor"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(ProcessorType || []).map(({ id, name }: any) => ({
                        label: name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("processor", item?.label);
                      }}
                    />
                    {errors.processor && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.processor}
                      </p>
                    )}
                  </div>

                  {formData.trainingType ===
                    "TraceRice Customised Training" && (
                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Processor By Name
                        </label>
                        <Select
                          name="processorName"
                          value={formData.processorName ? { label: processorName?.find((processor: any) => processor.id == formData.processorName)?.name, value: formData.processorName } : null}
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Processor Name"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={(processorName || []).map(({ id, name }: any) => ({
                            label: name,
                            value: id,
                            key: id
                          }))}
                          onChange={(item: any) => {
                            handleChange("processorName", item?.value);
                          }}
                        />

                      </div>
                    )}

                  {formData.trainingType === "Other Training" && (
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Training Description
                      </label>
                      <div>
                        <textarea
                          className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          rows={3}
                          name="trainingDescription"
                          value={formData.trainingDescription}
                          onChange={(e) => handleChange("trainingDescription", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Mode of Training *
                    </label>
                    <Select
                      name="trainingMode"
                      value={formData.trainingMode ? { label: trainingMode?.find((trainingMode: any) => trainingMode.name === formData.trainingMode)?.name, value: formData.trainingMode } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Training Mode"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(trainingMode || []).map(({ id, name }: any) => ({
                        label: name,
                        value: name,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("trainingMode", item?.value);
                      }}
                    />
                    {errors.trainingMode && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.trainingMode}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Venue *
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      placeholder="Enter the Venue"
                      name="venue"
                      onChange={(e) => handleChange("venue", e.target.value)}
                    />
                    {errors.venue && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.venue}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date *
                    </label>
                    <DatePicker
                      showIcon
                      selected={date}
                      onChange={handleDate}
                      minDate={new Date()}
                      showYearDropdown
                      placeholderText="dd-mm-yyyy"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.date && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Start Time *
                    </label>
                    <div className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom">
                      <TimePicker
                        className="w-100"
                        onChange={(e) => handleTimeChange(e, "startTime")}
                        value={selectedSTime}
                        placeholder="- - : - -"
                        showSecond={false}
                        use12Hours={true}
                      />
                    </div>
                    {errors.startTime && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      End Time
                    </label>
                    <div className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom">
                      <TimePicker
                        className="w-100"
                        onChange={(e) => handleTimeChange(e, "endTime")}
                        value={selectedETime}
                        placeholder="- - : - -"
                        showSecond={false}
                        use12Hours={true}
                      />
                    </div>
                    {errors.endTime && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-12 w-100 d-flex justify-start customButtonGroup">
                <section>
                  <button
                    className="btn-purple mr-2"
                    disabled={isSubmitting}
                    style={
                      isSubmitting
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    onClick={handleSubmit}
                  >
                    SUBMIT
                  </button>
                </section>

                <section>
                  <button
                    className="btn-outline-purple mr-2"
                    onClick={handleCancel}
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default page;
