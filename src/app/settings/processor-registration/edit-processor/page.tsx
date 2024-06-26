"use client";

import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Form from "react-bootstrap/Form";
import DatePicker from "react-datepicker";
import { GrAttachment } from "react-icons/gr";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import Loader from "@components/core/Loader";
import "react-datepicker/dist/react-datepicker.css";
import "react-tabs/style/react-tabs.css";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import User from "@lib/User";
import Select from "react-select";

// const materialData = [
//   {
//     id: 1,
//     name: "Lint",
//   },
//   {
//     id: 2,
//     name: "Yarn",
//   },
//   {
//     id: 3,
//     name: "Fabric",
//   },
//   {
//     id: 4,
//     name: "Garment",
//   },
// ];

// const fabricProcessorType = ["Dyeing", "Washing", "Printing", "Compacting"];

let intializeData: any = {
  firstname: "",
  position: "",
  username: "",
  email: "",
  mobile: "",
  password: "",
  reenterpassword: "",
  status: "",
};

export default function page() {
  useTitle("Edit Processor");
  const [roleLoading] = useRole();
  const searchParams = useSearchParams();
  const processorId: any = searchParams.get("id");
  const processorType: any = searchParams.get("type");

  const router = useRouter();
  const [programs, setProgram] = useState<any>();
  const [brands, setBrands] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<any>([]);
  const [selectedProcessor, setSelectedProcessor] = useState<any>([]);
  const [unitCert, setUnitCert] = useState<any>([]);
  const [riceType, setRiceType] = useState<any>([]);
  const [riceVariety, setRiceVariety]= useState<any>([])

  const [loomType, setLoomType] = useState<any>([]);
  const [fabricType, setFabricType] = useState<any>([]);
  const [productionCap, setProductionCap] = useState<any>([]);

  const brandId = User.brandId;

  const [formData, setFormData] = useState<any>({
    processType: [],
    process_role: [],
    name: "",
    shortName: "",
    address: "",
    countryId: null,
    stateId: null,
    districtId: null,
    programIds: [],
    latitude: "",
    longitude: "",
    website: "",
    contactPerson: "",
    unitCert: [],
    companyInfo: "",
    logo: "",
    photo: "",
    certs: "",
    registrationDocument: "",
    brand: [],
    mobile: "",
    landline: "",
    email: "",
    outturnRangeFrom: "",
    outturnRangeTo: "",
    bagWeightFrom: "",
    bagWeightTo: "",
    mandiType: "",
    riceType: [],
    rangeFrom: "",
    rangeTo: "",
    riceVariety: "",
    // weaverNoOfMachines: "",
    // weaverFabricType: [],
    // weaverProdCap: [],
    // weaverLossFrom: "",
    // weaverLossTo: "",
    // loomType: [],
    // knitNoOfMachines: "",
    // KnitFabricType: [],
    // KnitProdCap: [],
    // KnitLossFrom: "",
    // KnitLossTo: "",
    // materialTrading: [],
    // garmentNoOfMachines: "",
    // garmentFabricType: [],
    // garmentProdCap: [],
    // garmentLossFrom: "",
    // garmentLossTo: "",
    // fabricNoOfMachines: "",
    // fabricType: [],
    // fabricProdCap: [],
    // fabricLossFrom: "",
    // fabricLossTo: "",
    mandiId: null,
    millId: null,
    // knitterId: null,
    // weaverId: null,
    // traderId: null,
    // garmentId: null,
    // fabricId: null,
    // physicalPartnerId: null,
    deletedMandiId: null,
    deletedMillId: null,
    // deletedKnitterId: null,
    // deletedWeaverId: null,
    // deletedTraderId: null,
    // deletedGarmentId: null,
    // deletedFabricId: null,
    // deletedPhysicalPartnerId: null
  });

  const [fileName, setFileName] = useState({ logo: "", photo: "", certs: "", registrationDocument: "" })

  const [errors, setErrors] = useState<any>({
    processType: "",
    name: "",
    shortName: "",
    address: "",
    countryId: "",
    latitude: "",
    longitude: "",
    stateId: "",
    districtId: "",
    programIds: "",
    contactPerson: "",
    brand: "",
    KnitLossFrom: "",
    KnitLossTo: "",
    mobile: "",
    email: "",
  });

  const [users, setUsers] = useState<any>([
    {
      firstname: "",
      position: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      reenterpassword: "",
      status: null,
    },
  ]);

  const [initialData, setInitialData] = useState({
    processType: [],
    programs: [],
    unitCert: [],
    brand: [],
    // loomType: [],
    // materialTrading: [],
    riceType: [],
    riceVariety: [],
    // weaverFabricType: [],
    // // weaverProdCap: [],
    // KnitFabricType: [],
    // KnitProdCap: [],
    // garmentFabricType: [],
    // garmentProdCap: [],
    // fabricType: [],
    // fabricProdCap: [],
  });

  const [userErrors, setUserErrors] = useState<any>([
    {
      firstname: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      reenterpassword: "",
      status: "",
    },
  ]);

  useEffect(() => {
    getPrograms();
    getBrands();
    getCountries();
    getUnitCertification();
    getUserRoles();
    // getFabricTypes();
    // getProdCap();
    // getLoomTypes();
    getRiceType();
    getRiceVariety();
  }, []);

  useEffect(() => {
    if (processorId && processorType && roles) {
      getExistingProcessor();
    }
  }, [processorId, processorType, roles]);

  useEffect(() => {
    setDistricts([]);
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
    const matchNames: any = unitCert
      .filter((unitCert: any) => formData?.unitCert.includes(unitCert.id))
      .map((unitCert: any) => unitCert.certification_name);

    setInitialData((prev) => ({
      ...prev,
      unitCert: matchNames,
    }));
  }, [formData.unitCert]);

  useEffect(() => {
    const matchNames: any = riceVariety
      .filter((riceVariety: any) => formData?.riceVariety?.includes(riceVariety.id))
      .map((riceVariety: any) => riceVariety.variety_name);

    setInitialData((prev) => ({
      ...prev,
      riceVariety: matchNames,
    }));
  }, [formData.riceVariety]);

  useEffect(() => {
    const matchNames: any = riceType
      .filter((riceType: any) =>
        formData?.riceType?.includes(riceType.id)
      )
      .map((riceType: any) => riceType.riceType_name);

    setInitialData((prev) => ({
      ...prev,
      riceType: matchNames,
    }));
  }, [formData.riceType]);

  useEffect(() => {
    if (programs) {
      const matchNames: any = programs
        .filter((program: any) => formData?.programIds.includes(program.id))
        .map((program: any) => program.program_name);

      setInitialData((prev) => ({
        ...prev,
        programs: matchNames,
      }));
    }
  }, [formData?.programIds, programs]);

  // useEffect(() => {
  //   const matchNames: any = loomType
  //     .filter((loomType: any) => formData?.loomType?.includes(loomType.id))
  //     .map((loomType: any) => loomType.name);

  //   setInitialData((prev) => ({
  //     ...prev,
  //     loomType: matchNames,
  //   }));
  // }, [formData.loomType]);

  // useEffect(() => {
  //   const matchKnitterFabric: any = fabricType
  //     .filter((fabricType: any) =>
  //       formData?.KnitFabricType?.includes(fabricType.id)
  //     )
  //     .map((fabricType: any) => fabricType.fabricType_name);
  //   const matchGarmentFabric: any = fabricType
  //     .filter((fabricType: any) =>
  //       formData?.garmentFabricType?.includes(fabricType.id)
  //     )
  //     .map((fabricType: any) => fabricType.fabricType_name);
  //   const matchWeaverFabric: any = fabricType
  //     .filter((fabricType: any) =>
  //       formData?.weaverFabricType?.includes(fabricType.id)
  //     )
  //     .map((fabricType: any) => fabricType.fabricType_name);

  //   setInitialData((prev) => ({
  //     ...prev,
  //     KnitFabricType: matchKnitterFabric,
  //     garmentFabricType: matchGarmentFabric,
  //     weaverFabricType: matchWeaverFabric,
  //   }));
  // }, [
  //   formData.KnitFabricType,
  //   formData.garmentFabricType,
  //   formData?.weaverFabricType,
  // ]);

  // useEffect(() => {
  //   const matchKnitterProdCap: any = productionCap
  //     .filter((productionCap: any) =>
  //       formData?.KnitProdCap?.includes(productionCap.id)
  //     )
  //     .map((productionCap: any) => productionCap.name);
  //   const matchGarmentProdCap: any = productionCap
  //     .filter((productionCap: any) =>
  //       formData?.garmentProdCap?.includes(productionCap.id)
  //     )
  //     .map((productionCap: any) => productionCap.name);
  //   const matchWeaverProdCap: any = productionCap
  //     .filter((productionCap: any) =>
  //       formData?.weaverProdCap?.includes(productionCap.id)
  //     )
  //     .map((productionCap: any) => productionCap.name);
  //   const matchFabricProdCap: any = productionCap
  //     .filter((productionCap: any) =>
  //       formData?.fabricProdCap?.includes(productionCap.id)
  //     )
  //     .map((productionCap: any) => productionCap.name);

  //   setInitialData((prev) => ({
  //     ...prev,
  //     KnitProdCap: matchKnitterProdCap,
  //     garmentProdCap: matchGarmentProdCap,
  //     weaverProdCap: matchWeaverProdCap,
  //     fabricProdCap: matchFabricProdCap,
  //   }));
  // }, [
  //   formData.KnitProdCap,
  //   formData.garmentProdCap,
  //   formData?.weaverProdCap,
  //   formData?.fabricProdCap,
  // ]);

  useEffect(() => {
    const matchNames: any = brands
      ?.filter((brand: any) => formData?.brand.includes(brand.id))
      .map((brand: any) => brand.brand_name);

    setInitialData((prev) => ({
      ...prev,
      brand: matchNames,
    }));
  }, [formData?.brand, brands]);

  // useEffect(() => {
  //   setInitialData((prev) => ({
  //     ...prev,
  //     materialTrading: formData?.materialTrading,
  //   }));
  // }, [formData?.materialTrading]);

  useEffect(() => {
    setInitialData((prev) => ({
      ...prev,
      fabricType: formData?.fabricType,
    }));
  }, [formData?.fabricType]);

  const getExistingProcessor = async () => {
    let url = `new-processor/get-processor?type=${processorType}&id=${processorId}`;
    try {
      const res = await API.get(url);
      if (res.success) {
        let dataKey = processorType.toLowerCase();
        let data = res?.data[dataKey];
        let selected = roles
          .map((item: any) => {
            let process = res?.data?.userData[0]?.process_role.some(
              (access: any) => {
                return item.id === access;
              }
            );
            if (process) {
              return item.user_role;
            }
            return null;
          })
          .filter((userRole: any) => userRole !== null);

        setInitialData((prevData: any) => ({
          ...prevData,
          processType: selected,
        }));
        setSelectedProcessor(selected);

        setFormData({
          processType: selected,
          process_role: res?.data?.userData[0]?.process_role,
          name: data.name,
          shortName: data.short_name,
          address: data.address,
          countryId: data.country_id,
          stateId: data.state_id,
          districtId: data.district_id,
          programIds: data.program_id,
          latitude: data.latitude,
          longitude: data.longitude,
          website: data.website,
          contactPerson: data.contact_person,
          unitCert: data.unit_cert,
          companyInfo: data.company_info,
          logo: data.org_logo,
          photo: data.org_photo,
          certs: data.certs,
          registrationDocument: data.registration_document,
          brand: data.brand,
          mobile: data.mobile,
          landline: data.landline,
          email: data.email,
          outturnRangeFrom: res.data?.mandi?.outturn_range_from,
          outturnRangeTo: res.data?.mandi?.outturn_range_to,
          bagWeightFrom: res.data?.mandi?.bag_weight_from,
          bagWeightTo: res.data?.mandi?.bag_weight_to,
          mandiType: res.data?.mandi?.mandi_type,
          rangeFrom: res.data?.mill?.realisation_range_from,
          rangeTo: res.data?.mill?.realisation_range_to,
          riceType: res.data?.mill?.rice_type,
          riceVariety: res.data?.mill?.rice_variety,
          // weaverNoOfMachines: res.data?.weaver?.no_of_machines,
          // weaverFabricType: res.data?.weaver?.fabric_type,
          // weaverProdCap: res.data?.weaver?.prod_cap,
          // weaverLossFrom: res.data?.weaver?.loss_from,
          // weaverLossTo: res.data?.weaver?.loss_to,
          // loomType: res.data?.weaver?.loom_type,
          // knitNoOfMachines: res.data?.knitter?.no_of_machines,
          // KnitFabricType: res.data?.knitter?.fabric_type,
          // KnitProdCap: res.data?.knitter?.prod_cap,
          // KnitLossFrom: res.data?.knitter?.loss_from,
          // KnitLossTo: res.data?.knitter?.loss_to,
          // materialTrading: res.data?.trader?.material_trading,
          // garmentNoOfMachines: res.data?.garment?.no_of_machines,
          // garmentFabricType: res.data?.garment?.fabric_type,
          // garmentProdCap: res.data?.garment?.prod_cap,
          // garmentLossFrom: res.data?.garment?.loss_from,
          // garmentLossTo: res.data?.garment?.loss_to,
          // fabricNoOfMachines: res.data?.fabric?.no_of_machines,
          // fabricType: res.data?.fabric?.fabric_processor_type,
          // fabricProdCap: res.data?.fabric?.prod_capt,
          // fabricLossFrom: res.data?.fabric?.loss_from,
          // fabricLossTo: res.data?.fabric?.loss_to,
          mandiId: res.data.mandi ? res.data.mandi.id : null,
          millId: res.data?.mill ? res.data.mill.id : null,
          thirdPartyInspectionId: res.data?.third_party_inspection ? res.data.third_party_inspection.id : null,
          labId: res.data?.lab ? res.data.lab.id : null,
          containerManagementSystemId: res.data?.container_management_system ? res.data.container_management_system.id : null,
          // traderId: res.data?.trader ? res.data.trader.id : null,
          // garmentId: res.data?.garment ? res.data.garment.id : null,
          // fabricId: res.data?.fabric ? res.data.fabric.id : null,
          // physicalPartnerId: res.data?.physical_partner ? res.data.physical_partner.id : null,
          deletedMandiId: null,
          deletedMillId: null,
          deletedThirtPartyInspectionId: null,
          deletedLabId: null,
          deletedContainerManagementSystemId: null,
          // deletedTraderId: null,
          // deletedGarmentId: null,
          // deletedFabricId: null,
          // deletedPhysicalPartnerId: null
        });

        const updatedUsers = res?.data?.userData?.map((item: any) => {
          return {
            id: item.id,
            firstname: item.firstname,
            position: item.position,
            username: item.username,
            email: item.email,
            mobile: item.mobile,
            password: "",
            reenterpassword: "",
            status: item.status,
          };
        });
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const getBrands = async () => {
    try {
      const res = await API.get(`brand`);
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRiceType = async () => {
    try {
      const res = await API.get("rice-type");
      if (res.success) {
        setRiceType(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRiceVariety = async () => {
    try {
      const res = await API.get("rice-variety");
      if (res.success) {
        setRiceVariety(res.data);
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
      if (formData.countryId) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${formData.countryId}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.stateId}`
      );
      if (res.success) {
        setDistricts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLoomTypes = async () => {
    try {
      const res = await API.get("loom-type");
      if (res.success) {
        setLoomType(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserRoles = async () => {
    const res = await API.get("user/get-user-roles");
    if (res.success) {
      const roles = res.data?.filter((val: any) => {
        return (
          val.user_role === "Mandi" ||
          val.user_role === "Mill" ||
          val.user_role === "Third_Party_Inspection" ||
          val.user_role === "Lab" ||
          val.user_role === "Container_Management_System" ||
          val.user_role === "Farm"
          // // val.user_role === "Trader" ||
          // val.user_role === "Fabric" ||
          // val.user_role === "Garment" ||
          // val.user_role === "Physical_Partner"
        );
      });
      setRoles(roles);
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

  const handleSelectionChange = (
    selectedOptions: string[],
    name: string,
    index: number = 0
  ) => {
    if (name === "unitCert") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = unitCert.find((option: any) => {
            return option.certification_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        unitCert: result,
      }));
    }
    if (name === "brand") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = brands.find((option: any) => {
            return option.brand_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        brand: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "programIds") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = programs.find((option: any) => {
            return option.program_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        programIds: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "processType") {
      setSelectedProcessor(selectedOptions);
      let deselectedIntial: any = initialData.processType.filter(
        (item: string) => !selectedOptions.includes(item)
      );
      //restore data if initially selected and but then deselected
      if (deselectedIntial.length > 0) {
        if (deselectedIntial.includes("Mandi")) {
          setFormData((prevData: any) => ({
            ...prevData,
            deletedMandiId: formData.mandiId,
            mandiId: null,
          }));
        } else if (deselectedIntial.includes("Mill")) {
          setFormData((prevData: any) => ({
            ...prevData,
            deletedMillId: formData.millId,
            millId: null,
          }));
        } else if (deselectedIntial.includes("Third_Party_Inspection")) {
          setFormData((prevData: any) => ({
            ...prevData,
            deletedThirtPartyInspectionId: formData.thirdPartyInspectionId,
            thirdPartyInspectionId: null,
          }));
        } else if (deselectedIntial.includes("Lab")) {
          setFormData((prevData: any) => ({
            ...prevData,
            deletedLabId: formData.labId,
            labId: null,
          }));
        } else if (deselectedIntial.includes("Container_Management_System")) {
          setFormData((prevData: any) => ({
            ...prevData,
            deletedContainerManagementSystemId: formData.containerManagementSystemId,
            containerManagementSystemId: null,
          }));
        // } else if (deselectedIntial.includes("Trader")) {
        //   setFormData((prevData: any) => ({
        //     ...prevData,
        //     deletedTraderId: formData.traderId,
        //     traderId: null,
        //   }));
        // } else if (deselectedIntial.includes("Fabric")) {
        //   setFormData((prevData: any) => ({
        //     ...prevData,
        //     deletedFabricId: formData.fabricId,
        //     fabricId: null,
        //   }));
        // } else if (deselectedIntial.includes("Physical_Partner")) {
        //   setFormData((prevData: any) => ({
        //     ...prevData,
        //     deletedPhysicalPartnerId: formData.physicalPartnerId,
        //     physicalPartnerId: null,
        //   }));
        }
      } else {
        //restore data if initially selected and then deleted  but again selected
        if (selectedOptions.includes("Mandi") && formData.deletedMandiId) {
          setFormData((prevData: any) => ({
            ...prevData,
            mandiId: formData.deletedMandiId,
            deletedMandiId: null,
          }));
        } else if (
          selectedOptions.includes("Mill") &&
          formData.deletedMillId
        ) {
          setFormData((prevData: any) => ({
            ...prevData,
            millId: formData.deletedMillId,
            deletedMillId: null,
          }));
        } else if (
          selectedOptions.includes("Third_Party_Inspection") &&
          formData.deletedThirtPartyInspectionId
        ) {
          setFormData((prevData: any) => ({
            ...prevData,
            thirdPartyInspectionId: formData.deletedThirtPartyInspectionId,
            deletedThirtPartyInspectionId: null,
          }));
        } 
        else if (
          selectedOptions.includes("Lab") &&
          formData.deletedLabId
        ) {
          setFormData((prevData: any) => ({
            ...prevData,
            labId: formData.deletedLabId,
            deletedLabId: null,
          }));
        } 
        else if (
          selectedOptions.includes("Container_Management_System") &&
          formData.deletedContainerManagementSystemId
        ) {
          setFormData((prevData: any) => ({
            ...prevData,
            containerManagementSystemId: formData.deletedContainerManagementSystemId,
            deletedContainerManagementSystemId: null,
          }));
        } 
      }

      const result = selectedOptions
        .map((item: string) => {
          const find: any = roles.find((option: any) => {
            return option.user_role === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        processType: selectedOptions,
        process_role: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "riceVariety") {
      const result = selectedOptions
      .map((item: string) => {
        const find: any = riceVariety.find((option: any) => {
          return option.variety_name === item;
        });
        return find ? find.id : null;
      })
      .filter((id) => id !== null);
      setFormData((prevData: any) => ({
        ...prevData,
        riceVariety: result,
      }));
    }

    if (name === "riceType") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = riceType.find((option: any) => {
            return option.riceType_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => ({
        ...prevData,
        riceType: result,
      }));
    }

    // if (
    //   name === "KnitProdCap" ||
    //   name === "weaverProdCap" ||
    //   name === "garmentProdCap" ||
    //   name === "fabricProdCap"
    // ) {
    //   const result = selectedOptions
    //     .map((item: string) => {
    //       const find: any = productionCap.find((option: any) => {
    //         return option.name === item;
    //       });
    //       return find ? find.id : null;
    //     })
    //     .filter((id) => id !== null);

    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     [name]: result,
    //   }));
    // }

    // if (
    //   name === "weaverFabricType" ||
    //   name === "KnitFabricType" ||
    //   name === "garmentFabricType"
    // ) {
    //   const result = selectedOptions
    //     .map((item: string) => {
    //       const find: any = fabricType.find((option: any) => {
    //         return option.fabricType_name === item;
    //       });
    //       return find ? find.id : null;
    //     })
    //     .filter((id) => id !== null);

    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     [name]: result,
    //   }));
    // }

    // if (name === "fabricType" || name === "materialTrading") {
    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     [name]: selectedOptions,
    //   }));
    //   setErrors((prev: any) => ({
    //     ...prev,
    //     [name]: "",
    //   }));
    // }

    // if (name === "loomType") {
    //   const result = selectedOptions
    //     .map((item: string) => {
    //       const find: any = loomType.find((option: any) => {
    //         return option.name === item;
    //       });
    //       return find ? find.id : null;
    //     })
    //     .filter((id) => id !== null);

    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     [name]: result,
    //   }));
    // }
  };

  const requiredUserFields = [
    "firstname",
    "email",
    "mobile",
    "username",
    "password",
    "position",
    "reenterpassword",
    "status",
  ];

  const requiredFormFields = [
    "processType",
    "name",
    "shortName",
    "address",
    "email",
    "website",
    "mobile",
    "contactPerson",
    "programIds",
    "countryId",
    "stateId",
    "districtId",
    "latitude",
    "longitude",
    "brand",
    "outturnRangeFrom",
    "outturnRangeTo",
    "bagWeightFrom",
    "bagWeightTo",
    "rangeFrom",
    "rangeTo",
    // "garmentLossFrom",
    // "garmentLossTo",
    // "KnitLossFrom",
    // "KnitLossTo",
    // "weaverLossFrom",
    // "weaverLossTo",
    // "fabricLossFrom",
    // "fabricLossTo",
    // "fabricType",
    // "materialTrading",
  ];

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    const regexWebsite =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const strongPasswordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
    const stdCodeRegex = /^\+?1?[ -]?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/;

    if (dataName === "user") {
      if (requiredUserFields.includes(name)) {
        switch (name) {
          case "username":
            return value.trim() === ""
              ? "Username is required"
              : userErrors[index]?.username !== ""
                ? userErrors[index]?.username
                : "";
          case "firstname":
            return value.trim() === ""
              ? "Name is required"
              : userErrors[index]?.firstname !== ""
                ? userErrors[index]?.firstname
                : "";
          case "password":
            if (value && !strongPasswordRegex.test(value)) {
              return "Password should include special characters, numbers, capital letters and  it should be minimum of 8 characters.";
            } else {
              return "";
            }
          case "reenterpassword":
            return users && users[index].password !== value.trim()
              ? "Passwords not matched"
              : "";
          case "mobile":
            return value.trim() === "" ? "Mobile No is required" : !stdCodeRegex.test(value) ? "Invalid format for mobile no." : "";
          case "email":
            return userErrors[index] && userErrors[index]?.email !== ""
              ? userErrors[index].email
              : value.trim() === ""
                ? "Email is required"
                : /\S+@\S+\.\S+/.test(value)
                  ? ""
                  : "Invalid email format";
          case "status":
            return typeof value !== "boolean"
              ? "Select at least one option"
              : "";
          default:
            return "";
        }
      }
    } else if (dataName === "otherFields") {
      if (requiredFormFields.includes(name)) {
        switch (name) {
          case "website":
            return value.trim() !== "" && !regexWebsite.test(value)
              ? "Invalid website format"
              : "";
          case "mobile":
            return value.trim() !== "" && !stdCodeRegex.test(value) ? "Invalid format for mobile no." : "";
          case "processType":
            return selectedProcessor.length < 1
              ? "Select at least one option"
              : "";
          case "email":
            return value.trim() !== "" && !(/\S+@\S+\.\S+/).test(value)
              ? "Invalid email format"
              : ""
          case "name":
            return value?.trim() === ""
              ? "Name is required"
              : errors.name !== ""
                ? errors.name
                : "";
          case "shortName":
            return value?.trim() === ""
              ? "Short Name is required"
              : errors.shortName !== ""
                ? errors.shortName
                : "";
          case "address":
            return value?.trim() === "" ? "Address is required" : "";
          case "contactPerson":
            return value?.trim() === ""
              ? "Contact Person is required"
              : errors.contactPerson !== ""
                ? errors.contactPerson
                : "";
          case "outturnRangeFrom":
          case "outturnRangeTo":
          case "bagWeightFrom":
          case "bagWeightTo":
            return (value === "" || value === null || value === undefined) &&
              selectedProcessor.includes("Mandi")
              ? "This Field is required"
              : "";
          case "rangeFrom":
          case "rangeTo":
            return (value === "" || value === null || value === undefined) &&
              selectedProcessor.includes("Mill")
              ? "This Field is required"
              : "";
          // case "garmentLossFrom":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Garment")
          //     ? "This Field is required"
          //     : "";
          // case "garmentLossTo":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Garment")
          //     ? "This Field is required"
          //     : "";
          // case "KnitLossFrom":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Knitter")
          //     ? "This Field is required"
          //     : "";
          // case "KnitLossTo":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Knitter")
          //     ? "This Field is required"
          //     : "";
          // case "weaverLossFrom":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Weaver")
          //     ? "This Field is required"
          //     : "";
          // case "weaverLossTo":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Weaver")
          //     ? "This Field is required"
          //     : "";
          // case "fabricLossFrom":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Fabric")
          //     ? "This Field is required"
          //     : "";
          // case "fabricLossTo":
          //   return (value === "" || value === null || value === undefined) &&
          //     selectedProcessor.includes("Fabric")
          //     ? "This Field is required"
          //     : "";
          // case "fabricType":
          //   return (value?.length === 0 ||
          //     value === null ||
          //     value === undefined) &&
          //     selectedProcessor.includes("Fabric")
          //     ? "This Field is required"
          //     : "";
          case "programIds":
            return value?.length === 0 || value === null
              ? "Program is required"
              : "";
          case "brand":
            return value?.length === 0 || value === null
              ? "Brand Mapped is required"
              : "";
          case "countryId":
            return value === undefined || value === null ? "Country is required" : "";
          case "stateId":
            return value === undefined || value === null ? "State is required" : "";
          case "districtId":
            return value === undefined || value === null ? "District is required" : "";
          case "latitude":
          case "longitude":
            return value?.trim() === "" || value === null
              ? "GPS information is required"
              : "";
          default:
            return "";
        }
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newUserErrors: any = [];
    const newSpinnerErrors: any = {};

    users?.map((user: any, index: number) => {
      const userErrors: any = {};
      Object.keys(user).forEach((fieldName: string) => {
        const fieldError = validateField(
          fieldName,
          user[fieldName as keyof any],
          "user",
          index
        );
        if (fieldError) {
          userErrors[fieldName] = fieldError;
        }
      });
      newUserErrors[index] = userErrors;
    });

    Object.keys(formData).forEach((fieldName: string) => {
      newSpinnerErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "otherFields"
      );
    });

    const hasErrors = Object.values(newSpinnerErrors).some((error) => !!error);
    const hasUserErrors = newUserErrors.some((errors: any) =>
      Object.values(errors).some((error) => !!error)
    );

    if (hasErrors) {
      setErrors(newSpinnerErrors);
    }

    if (hasUserErrors) {
      setUserErrors(newUserErrors);
    }

    if (!hasErrors && !hasUserErrors && !errors.name) {
      setIsSubmitting(true);
      try {
        const response = await API.put("new-processor", {
          ...formData,
          riceType: formData.riceType
            ? String(formData.riceType)
            : null,
          riceVariety: formData.riceVariety ? String(formData.riceVariety) : null,
          // loomType: formData.loomType ? String(formData.loomType) : null,
          userData: users,
        });
        if (response.success) {
          toasterSuccess("Processor Updated Successfully");
          router.back();
        } else {
          toasterError(response.error?.code, 3000, formData.code);
          setIsSubmitting(false);
        }
      } catch (error) {
        toasterError("An Error occurred.");
        setIsSubmitting(false);
      }
    } else {
      return;
    }
  };

  const dataUpload = async (e: any) => {
    const { name, files } = e.target;
    const url = "file/upload";

    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "image/bmp"
    ];
    const dataVideo = new FormData();
        if (!allowedFormats.includes(files[0]?.type)) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: "Invalid file format.Upload a valid Format",
          }));

          e = "";
          return;
        }

        const maxFileSize = 100 * 1024;

        if (files[0].size > maxFileSize) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: `File size exceeds the maximum limit (100KB).`,
          }));

          e = "";
          return;
        }

        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
      
      dataVideo.append("file", files[0]);
      try {
        const response = await API.postFile(url, dataVideo);
        if (response.success) {
          setFileName((prevFile: any) => ({
            ...prevFile,
            [name]: files[0].name,
          }));
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: response.data,
          }));

          setErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      } catch (error) {
        console.log(error, "error");
      }
  };

  const alreadyExistsCheck = async (
    name: string,
    value: string,
    index: number,
    id: number
  ) => {
    const res = await API.post("brand/user", {
      id:id,
      [name]: value,
    });

    const newErrors = [...userErrors];

    if (res?.data?.user === true) {
      newErrors[index] = {
        ...newErrors[index],
        [name]: "Already Exists. Please try another",
      };
    } else {
      newErrors[index] = {
        ...newErrors[index],
        [name]: "",
      };
    }

    setUserErrors(newErrors);
  };

  const checkValidFormat = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexWebsite =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const stdCodeRegex = /^\+?1?[ -]?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/;

    if (value !== "" && type === "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else if (value !== "" && type === "website") {
      const valid = regexWebsite.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid website format",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else if (value !== "" && type === "email") {
      const valid = regexEmail.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid email format",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else if (type === "mobile") {
      const valid = stdCodeRegex.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid format for mobile no.",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const alreadyExistName = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const regexAlphabets = /^[().\-_a-zA-Z ]*$/;
    const valid = regexAlphabets.test(value);
    if (!valid) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "Accepts only Alphabets and special characters like _,-,()",
      }));
    } else {
      const res = await API.post("new-processor/check-name", {
        name: value,
        mandiId: formData.mandiId,
        millId: formData.millId,
        LabId: formData.labId,
        thirdPartyInspectionId: formData.thirdPartyInspectionId,
        containerManagementSystemId: formData.containerManagementSystemId,
      });

      if (res?.data?.exist === true) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Name Already Exists. Please Try Another",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const onBlurCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
    index: number
  ) => {
    const { name, value } = e.target;
    if (name === "username") {
      if (value != "") {
        alreadyExistsCheck(name, value, index, users[index].id);
      }
    } else {
      const newErrors = [...userErrors];
      const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
      const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (value !== "" && type === "alphabets") {
        const valid = regexAlphabets.test(value);
        if (!valid) {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "Accepts only Alphabets and special characters like _,-,()",
          };
        } else {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "",
          };
        }
      } else if (value !== "" && type === "email") {
        const valid = regexEmail.test(value);
        if (!valid) {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "Invalid email format",
          };
        } else {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "",
          };
          if (value != "") {
            alreadyExistsCheck(name, value, index, users[index].id);
          }
        }
      }
      setUserErrors(newErrors);
    }
  };

  const handleChange = (e: any, value?: any) => {
    if (e === "countryId" || e === "stateId" || e === "districtId") {
      if (e === "countryId") {
        setFormData((prevData: any) => ({
          ...prevData,
          countryId: value,
          stateId: undefined,
          districtId: undefined,
        }));
      }
      if (e === "stateId") {
        setFormData((prevData: any) => ({
          ...prevData,
          stateId: value,
          districtId: undefined,
        }));
      }
      if (e === "districtId") {
        setFormData((prevData: any) => ({
          ...prevData,
          districtId: value,
        }));
      }
      setErrors((prevData: any) => ({
        ...prevData,
        [e]: "",
      }));
    } else {
      const { name, value } = e.target;
      if (name === "processorType") {
        setSelectedProcessor(value);
      }

      if (
        name === "logo" ||
        name === "photo" ||
        name === "certs" ||
        name === "registrationDocument"
      ) {
        dataUpload(e);
        return;
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
      setErrors((prevData: any) => ({
        ...prevData,
        [name]: "",
      }));
    }
  };

  // const getStrongPasswordError = (value: any) => {
  //   const strongPasswordRegex =
  //     /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;

  //   if (!hasMinimumLength) {
  //     return "Password must have a minimum length of 8 characters.";
  //   }

  //   if (!hasSpecialCharacter) {
  //     return "Password must contain at least 1 special character.";
  //   }

  //   if (!hasNumericValue) {
  //     return "Password must contain at least 1 numeric value.";
  //   }

  //   if (!hasUppercaseAlphabet) {
  //     return "Password must contain at least 1 uppercase alphabet.";
  //   }

  //   return "";
  // };

  const handleAddMore = () => {
    setUsers([...users, { ...intializeData }]);
  };

  const handleDeleteRow = (index: any) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);
    setUsers(newUsers);
  };

  // const onUserAccessChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   index: number
  // ) => {
  //   const { name, value, type } = e.target;
  //   const newUsers = [...users];
  //   if (type === "radio") {
  //     if (name === `status-${index}`) {
  //       newUsers[index]["status"] = value === "active" ? true : false;
  //     }
  //   } else {
  //     newUsers[index][name] = value;
  //   }

  //   setUsers(newUsers);
  // };

  const checkValidFormatUserAccess = (e: any, type: string, index: number) => {
    const { name, value } = e.target;

    const stdCodeRegex = /^\+?1?[ -]?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/;
    const tempUserErrors = [...userErrors];

    if (value !== "") {
      if (type === "mobile") {
        const valid = stdCodeRegex.test(value);
        if (!valid) {
          tempUserErrors[index][name] = "Invalid format for mobile no.";
        } else {
          tempUserErrors[index][name] = "";
        }
      }
      setUserErrors(tempUserErrors);
    }
  };

  const hanleKeyDownForNumberInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  // const onUserAccessChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   index: number
  // ) => {
  //   const { name, value, type } = e.target;
  //   const strongPasswordRegex =
  //     /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
  //   const newUsers = [...users];
  //   const newErrors = [...userErrors];

  //   if (type === "radio" && name === `status-${index}`) {
  //     newUsers[index]["status"] = value === "active" ? true : false;
  //   } else if (name === "password" || name === "reenterpassword") {
  //     newUsers[index][name] = value;
  //     newErrors[index] = strongPasswordRegex.test(value) || value === ""
  //       ? { ...newErrors[index], [name]: "" }
  //       : { ...newErrors[index], [name]: strongPasswordRegex.test(value) };
  //   } else if (name === "mobile" && /^\d*$/.test(value) && value.length <= 10) {
  //     newUsers[index][name] = value;
  //   } else if (name !== "mobile") {
  //     newUsers[index][name] = value;
  //   }
  //   setUsers(newUsers);
  //   setUserErrors(newErrors);
  // };

  const onUserAccessChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value, type } = e.target;
    const newUsers = [...users];
    if (type === "radio") {
      if (name === `status-${index}`) {
        newUsers[index]["status"] = value === "active" ? true : false;
      }
    } else {
      newUsers[index][name] = value;
    }
    setUsers(newUsers);
    setUserErrors([...userErrors, { [name]: "" }]);
  };


  const { translations, loading } = useTranslations();
  if (roleLoading || loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }
  if (!roleLoading) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href={!brandId ? "/dashboard" : "/brand/dashboard"} className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Settings</li>
                <li>
                  <Link
                    href="/settings/processor-registration"
                    className="active"
                  >
                    Processor Registration
                  </Link>
                </li>
                <li>Edit Processor</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <h2 className="text-xl font-semibold">PROCESSOR REGISTRATION</h2>
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Processor Type <span className="text-red-500">*</span>
                    </label>
                    <MultiSelectDropdown
                      name="processType"
                      initiallySelected={selectedProcessor}
                      options={roles?.map((item: any) => {
                        return item.user_role;
                      })}
                      onChange={handleSelectionChange}
                    />
                    {errors.processType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.processType}
                      </p>
                    )}
                  </div>
                </div>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">
                    PROCCESOR GENERAL INFORMATION:
                  </h4>
                </div>
                <div className="row">
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Processor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Processor Name *"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      value={formData.name}
                      autoComplete="off"
                      onBlur={alreadyExistName}
                      name="name"
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Processor Short Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Processor Short Name *"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="shortName"
                      autoComplete="off"
                      onBlur={(e) => checkValidFormat(e, "alphabets")}
                      onChange={handleChange}
                      value={formData.shortName}
                    />
                    {errors.shortName && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.shortName}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Address *"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="address"
                      rows={3}
                      onChange={handleChange}
                      value={formData.address}
                    />
                    {errors.address && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="countryId"
                      value={formData.countryId ? { label: countries?.find((county: any) => county.id === formData.countryId)?.county_name, value: formData.countryId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select a Country"
                      className=" dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(countries || []).map(({ id, county_name }: any) => ({
                        label: county_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("countryId", item?.value);
                      }}
                    />
                    {errors.countryId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.countryId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="stateId"
                      value={formData.stateId ? { label: states?.find((state: any) => state.id === formData.stateId)?.state_name, value: formData.stateId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select a State"
                      className=" dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(states || []).map(({ id, state_name }: any) => ({
                        label: state_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("stateId", item?.value);
                      }}
                    />
                    {errors.stateId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.stateId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Programme <span className="text-red-500">*</span>
                    </label>
                    <MultiSelectDropdown
                      name="programIds"
                      initiallySelected={initialData.programs}
                      options={programs?.map((item: any) => {
                        return item.program_name;
                      })}
                      onChange={handleSelectionChange}
                    />
                    {errors.programIds && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.programIds}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      District <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="districtId"
                      value={formData.districtId ? { label: districts?.find((district: any) => district.id === formData.districtId)?.district_name, value: formData.districtId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select a District"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(districts || []).map(({ id, district_name }: any) => ({
                        label: district_name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("districtId", item?.value);
                      }}
                    />
                    {errors.districtId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.districtId}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Website
                    </label>
                    <input
                      placeholder="Website"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      autoComplete="off"
                      name="website"
                      onBlur={(e) => checkValidFormat(e, "website")}
                      onChange={handleChange}
                      value={formData.website}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.website}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      GPS Information
                    </label>
                    <div className="row">
                      <div className="col-12 col-sm-6">
                        <input
                          placeholder="Latitude"
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="number"
                          autoComplete="off"
                          name="latitude"
                          onChange={handleChange}
                          value={formData.latitude}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <input
                          placeholder="Longitude"
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="number"
                          name="longitude"
                          autoComplete="off"
                          onChange={handleChange}
                          value={formData.longitude}
                        />
                      </div>
                    </div>
                    {(errors.latitude || errors.longitude) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.latitude || errors.longitude}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Organisation Photo
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          name="photo"
                          type="file"
                          accept=".jpg, .jpeg, .bmp"
                          onChange={(event) => handleChange(event)}
                        />
                      </label>
                    </div>
                    <p className="text-sm">(Max: 100kb) (Format: jpg/jpeg/bmp)</p>
                    {fileName?.photo && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName?.photo}</p>
                      </div>
                    )}
                        {errors.photo && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.photo}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Organisation Logo
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          name="logo"
                          type="file"
                          accept=".jpg, .jpeg, .bmp"
                          onChange={(event) => handleChange(event)}
                        />
                      </label>
                    </div>
                    <p className="text-sm">(Max: 100kb) (Format: jpg/jpeg/bmp)</p>
                  </div>
                  {fileName.logo && (
                    <div className="flex text-sm mt-1">
                      <GrAttachment />
                      <p className="mx-1">{fileName.logo}</p>
                    </div>
                  )}
                      {errors.logo && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.logo}
                      </p>
                    )}
                  {!brandId && (
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Brand Mapped <span className="text-red-500">*</span>
                      </label>
                      <MultiSelectDropdown
                        name="brand"
                        initiallySelected={initialData.brand}
                        options={brands?.map((item: any) => {
                          return item.brand_name;
                        })}
                        onChange={handleSelectionChange}
                      />
                      {errors.brand && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.brand}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Certificates
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          name="certs"
                          accept=".jpg, .jpeg, .bmp"
                          onChange={(event) => handleChange(event)}
                        />
                      </label>
                    </div>
                    <p className="text-sm">(Max: 100kb) (Format: jpg/jpeg/bmp)</p>
                    {fileName?.certs && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName?.certs}</p>
                      </div>
                    )}
                       {errors.certs && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.certs}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Contact Person name"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="contactPerson"
                      autoComplete="off"
                      onBlur={(e) => checkValidFormat(e, "alphabets")}
                      onChange={handleChange}
                      value={formData.contactPerson}
                    />
                    {errors.contactPerson && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.contactPerson}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Unit Certified For
                    </label>
                    <MultiSelectDropdown
                      name="unitCert"
                      initiallySelected={initialData.unitCert}
                      options={unitCert?.map((item: any) => {
                        return item.certification_name;
                      })}
                      onChange={handleSelectionChange}
                    />
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Mobile Number
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="mobile"
                      placeholder="Mobile No"
                      autoComplete="off"
                      onBlur={(e) => checkValidFormat(e, "mobile")}
                      onChange={handleChange}
                      value={formData.mobile}
                    />
                    {errors.mobile && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Company Information
                    </label>
                    <textarea
                      rows={3}
                      name="companyInfo"
                      placeholder="Company Information "
                      autoComplete="off"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      onChange={handleChange}
                      value={formData.companyInfo}
                    />
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      placeholder="Email"
                      autoComplete="off"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      onBlur={(e) => checkValidFormat(e, "email")}
                      onChange={handleChange}
                      value={formData.email}
                    />
                    {errors.email && (
                      <p className="text-red-500  text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Landline Number
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="landline"
                      autoComplete="off"
                      placeholder="LandLine No"
                      onChange={handleChange}
                      value={formData.landline}
                    />
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Upload Factory Registration Document
                    </label>
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          type="file"
                          accept=".jpg, .jpeg, .bmp,"
                          name="registrationDocument"
                          onChange={(event) => handleChange(event)}
                        />
                      </label>
                    </div>
                    <p className="text-sm">(Max: 100kb) (Format: jpg/jpeg/bmp)</p>
                    {fileName?.registrationDocument && (
                      <div className="flex text-sm mt-1">
                        <GrAttachment />
                        <p className="mx-1">{fileName?.registrationDocument}</p>
                      </div>
                    )}
                      {errors.registrationDocument && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.registrationDocument}
                      </p>
                    )}
                  </div>

                </div>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">USER ACCESS:</h4>
                  <div className="w-100">
                    {users?.map((user: any, index: number) => (
                      <div key={index} className=" items-center">
                        <div className="w-full flex justify-end mt-3 mr-5">
                          {index !== 0 && (
                            <button
                              className="ml-2 text-white rounded-full bg-red-600 p-1 w-6 h-6 flex items-center justify-center"
                              onClick={() => handleDeleteRow(index)}
                            >
                              X
                            </button>
                          )}
                        </div>
                        {index > 0 && (
                          <h4 className=" text-sm font-semibold">
                            User {index + 1}
                          </h4>
                        )}
                        <div className="row">
                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              autoComplete="off"
                              name="firstname"
                              id={`name_${index}`}
                              value={user?.firstname}
                              onBlur={(e) => onBlurCheck(e, "alphabets", index)}
                              onChange={(e) => onUserAccessChange(e, index)}
                              placeholder="Name"
                            />
                            {userErrors[index]?.firstname !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.firstname}
                              </div>
                            )}
                          </div>

                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Position in Company
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              name="position"
                              autoComplete="off"
                              id={`position_${index}`}
                              value={user?.position || ""}
                              onBlur={(e) => onBlurCheck(e, "alphabets", index)}
                              onChange={(e) => onUserAccessChange(e, index)}
                              placeholder="Position in Company"
                            />
                            {userErrors[index]?.position !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.position}
                              </div>
                            )}
                          </div>

                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              name="email"
                              id={`email_${index}`}
                              autoComplete="off"
                              onBlur={(e) => onBlurCheck(e, "email", index)}
                              value={user?.email}
                              onChange={(e) => onUserAccessChange(e, index)}
                              placeholder="Email"
                            />
                            {userErrors[index]?.email !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.email}
                              </div>
                            )}
                          </div>
                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Mobile <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              name="mobile"
                              id={`mobile_${index}`}
                              autoComplete="off"
                              value={user?.mobile}
                              onChange={(e) => onUserAccessChange(e, index)}
                              onBlur={(e) =>
                                checkValidFormatUserAccess(e, "mobile", index)
                              }
                              placeholder="Mobile"
                            />
                            {userErrors[index]?.mobile !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.mobile}
                              </div>
                            )}
                          </div>
                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Username <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              name="username"
                              autoComplete="off"
                              onBlur={(e) => onBlurCheck(e, "string", index)}
                              id={`username_${index}`}
                              value={user?.username}
                              onChange={(e) => onUserAccessChange(e, index)}
                              placeholder="Username"
                            />
                            {userErrors[index]?.username !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.username}
                              </div>
                            )}
                          </div>

                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="password"
                              name="password"
                              id={`password_${index}`}
                              value={user?.password}
                              onBlur={(e) => onBlurCheck(e, "password", index)}
                              onChange={(e) => onUserAccessChange(e, index)}
                              placeholder="Password"
                            />
                            {userErrors[index]?.password !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.password}
                              </div>
                            )}
                          </div>
                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="password"
                              name="reenterpassword"
                              id={`reenterpassword_${index}`}
                              onBlur={(e) => onBlurCheck(e, "password", index)}
                              value={user?.reenterpassword}
                              onChange={(e) => onUserAccessChange(e, index)}
                              placeholder="Re-enter Password"
                            />
                            {userErrors[index]?.reenterpassword !== "" && (
                              <div className="text-sm pt-1 text-red-500">
                                {userErrors[index]?.reenterpassword}
                              </div>
                            )}
                          </div>
                          <div className="col-12 col-sm-6 col-md-4 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Status <span className="text-red-500">*</span>
                            </label>
                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                              <label className="mt-1 d-flex mr-4 align-items-center">
                                <section>
                                  <input
                                    type="radio"
                                    name={`status-${index}`}
                                    value="active"
                                    checked={users[index].status === true}
                                    onChange={(e) => onUserAccessChange(e, index)}
                                  />
                                  <span></span>
                                </section>{" "}
                                Active
                              </label>
                              <label className="mt-1 d-flex mr-4 align-items-center">
                                <section>
                                  <input
                                    type="radio"
                                    name={`status-${index}`}
                                    value="inactive"
                                    checked={users[index].status === false}
                                    onChange={(e) => onUserAccessChange(e, index)}
                                  />
                                  <span></span>
                                </section>{" "}
                                Inactive
                              </label>
                              <div>
                                {userErrors[index]?.status !== "" && (
                                  <div className="text-sm pt-1 text-red-500">
                                    {userErrors[index]?.status}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end mr-5 mb-5 mt-2">
                      <button
                        onClick={handleAddMore}
                        className="bg-orange-400 rounded text-white px-2 py-2 text-sm  "
                      >
                        Add More
                      </button>
                    </div>
                  </div>
                </div>
                {selectedProcessor.length > 0 && (
                  <>
                    <hr className="mt-4" />

                    <div className="mt-4">
                      <h4 className="text-md font-semibold">
                        PROCESSOR DETAILS:
                      </h4>
                      <div className="w-100">
                        {selectedProcessor.map((item: any) => {
                          return (
                            <div key={item}>
                              {item === "Mandi" && (
                                <div className="row mt-3">
                                  <h3 className="text-sm font-semibold">
                                    MANDI DETAILS:
                                  </h3>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Type of Mandi
                                    </label>
                                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                      <label className="mt-1 d-flex mr-4 align-items-center">
                                        <section>
                                          <input
                                            type="radio"
                                            name="mandiType"
                                            checked={
                                              formData.mandiType ===
                                              "fully automatic"
                                            }
                                            onChange={(event) =>
                                              handleChange(event)
                                            }
                                            value="fully automatic"
                                          />
                                          <span></span>
                                        </section>{" "}
                                        Fully Automated
                                      </label>
                                      <label className="mt-1 d-flex mr-4 align-items-center">
                                        <section>
                                          <input
                                            type="radio"
                                            name="mandiType"
                                            checked={
                                              formData.mandiType ===
                                              "semi automatic"
                                            }
                                            value="semi automatic"
                                            onChange={(event) =>
                                              handleChange(event)
                                            }
                                          />
                                          <span></span>
                                        </section>{" "}
                                        Semi-Automated
                                      </label>
                                      <label className="mt-1 d-flex mr-4 align-items-center">
                                        <section>
                                          <input
                                            type="radio"
                                            name="mandiType"
                                            checked={
                                              formData.mandiType === "manual"
                                            }
                                            value="manual"
                                            onChange={(event) =>
                                              handleChange(event)
                                            }
                                          />
                                          <span></span>
                                        </section>{" "}
                                        Manual
                                      </label>
                                    </div>
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                    Mandi Out Turn Range <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="outturnRangeFrom"
                                          onChange={handleChange}
                                          value={formData.outturnRangeFrom || ""}
                                        />
                                        {errors?.outturnRangeFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.outturnRangeFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="outturnRangeTo"
                                          onChange={handleChange}
                                          value={formData.outturnRangeTo || ""}
                                        />
                                        {errors?.outturnRangeTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.outturnRangeTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Bag Weight Range <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="bagWeightFrom"
                                          onChange={handleChange}
                                          value={formData.bagWeightFrom || ""}
                                        />
                                        {errors?.bagWeightFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.bagWeightFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="bagWeightTo"
                                          onChange={handleChange}
                                          value={formData.bagWeightTo || ""}
                                        />
                                        {errors?.bagWeightTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.bagWeightTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item === "Mill" && (
                                <div className="row mt-4">
                                  <h3 className="text-sm font-semibold">
                                    MILL DETAILS:
                                  </h3>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                    Rice Variety
                                    </label>
                                    <MultiSelectDropdown
                                      name="riceVariety"
                                      initiallySelected={initialData.riceVariety}
                                      options={riceVariety?.map((item: any) => {
                                        return item.variety_name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                    Rice Type
                                    </label>
                                    <MultiSelectDropdown
                                      name="riceType"
                                      initiallySelected={
                                        initialData.riceType
                                      }
                                      options={riceType?.map(
                                        (item: any) => {
                                          return item.riceType_name;
                                        }
                                      )}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                    Paddy/rice realization range <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="rangeFrom"
                                          onChange={handleChange}
                                          value={formData.rangeFrom || ""}
                                        />
                                        {errors?.rangeFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.rangeFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="rangeTo"
                                          onChange={handleChange}
                                          value={formData.rangeTo || ""}
                                        />
                                        {errors?.rangeTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.rangeTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* {item === "Knitter" && (
                                <div className="row mt-4">
                                  <h3 className="text-sm font-semibold">
                                    KNITTER DETAILS:
                                  </h3>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      No of Machines
                                    </label>
                                    <input
                                      placeholder="No of Machines"
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      autoComplete="off"
                                      type="number"
                                      name="knitNoOfMachines"
                                      onChange={handleChange}
                                      value={formData.knitNoOfMachines || ""}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Production Capacity
                                    </label>
                                    <MultiSelectDropdown
                                      name="KnitProdCap"
                                      initiallySelected={initialData.KnitProdCap}
                                      options={productionCap?.map((item: any) => {
                                        return item.name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Fabric Type
                                    </label>
                                    <MultiSelectDropdown
                                      name="KnitFabricType"
                                      initiallySelected={
                                        initialData.KnitFabricType
                                      }
                                      options={fabricType?.map((item: any) => {
                                        return item.fabricType_name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Loss % <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="KnitLossFrom"
                                          onChange={handleChange}
                                          value={formData.KnitLossFrom || ""}
                                        />
                                        {errors.KnitLossFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors.KnitLossFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          autoComplete="off"
                                          type="number"
                                          name="KnitLossTo"
                                          onChange={handleChange}
                                          value={formData.KnitLossTo || ""}
                                        />
                                        {errors.KnitLossTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors.KnitLossTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item === "Weaver" && (
                                <div className="row mt-4">
                                  <h3 className="text-sm font-semibold">
                                    WEAVING DETAILS:
                                  </h3>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Loom Type
                                    </label>
                                    <MultiSelectDropdown
                                      name="loomType"
                                      initiallySelected={initialData.loomType}
                                      options={loomType?.map((item: any) => {
                                        return item.name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      No of Machines
                                    </label>
                                    <input
                                      placeholder="No of Machines"
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      type="number"
                                      autoComplete="off"
                                      name="weaverNoOfMachines"
                                      onChange={handleChange}
                                      value={formData.weaverNoOfMachines || ""}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Production Capacity
                                    </label>
                                    <MultiSelectDropdown
                                      name="weaverProdCap"
                                      initiallySelected={
                                        initialData.weaverProdCap
                                      }
                                      options={productionCap?.map((item: any) => {
                                        return item.name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Fabric Type
                                    </label>
                                    <MultiSelectDropdown
                                      name="weaverFabricType"
                                      initiallySelected={
                                        initialData.weaverFabricType
                                      }
                                      options={fabricType?.map((item: any) => {
                                        return item.fabricType_name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Loss % <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="weaverLossFrom"
                                          onChange={handleChange}
                                          value={formData.weaverLossFrom || ""}
                                        />
                                        {errors?.weaverLossFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.weaverLossFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="weaverLossTo"
                                          onChange={handleChange}
                                          value={formData.weaverLossTo || ""}
                                        />
                                        {errors?.weaverLossTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.weaverLossTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item === "Garment" && (
                                <div className="row mt-4">
                                  <h3 className="text-sm font-semibold">
                                    GARMENT DETAILS:
                                  </h3>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      No of Machines
                                    </label>
                                    <input
                                      placeholder="No of Machines *"
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      autoComplete="off"
                                      type="number"
                                      name="garmentNoOfMachines"
                                      onChange={handleChange}
                                      value={formData.garmentNoOfMachines || ""}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Production Capacity
                                    </label>
                                    <MultiSelectDropdown
                                      name="garmentProdCap"
                                      initiallySelected={
                                        initialData.garmentProdCap
                                      }
                                      options={productionCap?.map((item: any) => {
                                        return item.name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Fabric Type
                                    </label>
                                    <MultiSelectDropdown
                                      name="garmentFabricType"
                                      initiallySelected={
                                        initialData.garmentFabricType
                                      }
                                      options={fabricType?.map((item: any) => {
                                        return item.fabricType_name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Loss % <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          autoComplete="off"
                                          type="number"
                                          name="garmentLossFrom"
                                          onChange={handleChange}
                                          value={formData.garmentLossFrom || ""}
                                        />
                                        {errors?.garmentLossFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.garmentLossFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          autoComplete="off"
                                          type="number"
                                          name="garmentLossTo"
                                          onChange={handleChange}
                                          value={formData.garmentLossTo || ""}
                                        />
                                        {errors?.garmentLossTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors?.garmentLossTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )} */}

                              {/* {item === "Trader" && (
                              <div className="row mt-4">
                                <h3 className="text-sm font-semibold">
                                  TRADER DETAILS:
                                </h3>

                                <div className="col-12 col-sm-6 mt-4">
                                  <label className="text-gray-500 text-[12px] font-medium">
                                    Material Trading *
                                  </label>
                                  <MultiSelectDropdown
                                    name="materialTrading"
                                    initiallySelected={
                                      initialData.materialTrading
                                    }
                                    options={materialData.map((item: any) => {
                                      return item.name;
                                    })}
                                    onChange={handleSelectionChange}
                                  />
                                  {errors?.materialTrading && (
                                    <p className="text-red-500  text-sm mt-1">
                                      {errors?.materialTrading}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )} */}

                              {/* {item === "Fabric" && (
                                <div className="row mt-4">
                                  <h3 className="text-sm font-semibold">
                                    FABRIC DETAILS:
                                  </h3>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      No of Machines
                                    </label>
                                    <input
                                      placeholder="No of Machines *"
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      autoComplete="off"
                                      type="number"
                                      name="fabricNoOfMachines"
                                      onChange={handleChange}
                                      value={formData.fabricNoOfMachines || ""}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Production Capacity
                                    </label>
                                    <MultiSelectDropdown
                                      name="fabricProdCap"
                                      initiallySelected={
                                        initialData.fabricProdCap
                                      }
                                      options={productionCap?.map((item: any) => {
                                        return item.name;
                                      })}
                                      onChange={handleSelectionChange}
                                    />
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Fabric Processor Type <span className="text-red-500">*</span>
                                    </label>
                                    <MultiSelectDropdown
                                      name="fabricType"
                                      initiallySelected={initialData.fabricType}
                                      options={fabricProcessorType}
                                      onChange={handleSelectionChange}
                                    />
                                    {errors.fabricType && (
                                      <p className="text-red-500  text-sm mt-1">
                                        {errors.fabricType}
                                      </p>
                                    )}
                                  </div>

                                  <div className="col-12 col-sm-6 mt-4">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                      Loss % <span className="text-red-500">*</span>
                                    </label>
                                    <div className="row">
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="From *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="fabricLossFrom"
                                          onChange={handleChange}
                                          value={formData.fabricLossFrom || ""}
                                        />
                                        {errors.fabricLossFrom && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors.fabricLossFrom}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-12 col-sm-6">
                                        <input
                                          placeholder="To *"
                                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                          type="number"
                                          autoComplete="off"
                                          name="fabricLossTo"
                                          onChange={handleChange}
                                          value={formData.fabricLossTo || ""}
                                        />
                                        {errors.fabricLossTo && (
                                          <p className="text-red-500  text-sm mt-1">
                                            {errors.fabricLossTo}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )} */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                <section>
                  <button
                    className="btn-purple mr-2"
                    style={
                      isSubmitting
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    SUBMIT
                  </button>
                </section>
                <section>
                  <button
                    className="btn-outline-purple"
                    onClick={() => router.back()}
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
