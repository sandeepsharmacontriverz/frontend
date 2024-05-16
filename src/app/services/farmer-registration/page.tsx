"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "next/navigation";
import { AiFillDelete } from "react-icons/ai";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { handleDownload } from "@components/core/Download";
import { BiFilterAlt } from "react-icons/bi";
import checkAccess from "@lib/CheckAccess";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";

const certificatesData = [
  {
    id: 1,
    name: "IC1",
  },
  {
    id: 2,
    name: "IC12",
  },
  {
    id: 3,
    name: "IC3",
  },
  {
    id: 4,
    name: "Organic",
  },
];

const page = () => {
  useTitle("Farmer Registration");
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [farmCount, setFarmCount] = useState([]);

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [showExportMessage, setShowExportMessage] = useState(false);


  const [showGenerateQRModal, setShowGenerateQRModal] = useState(false);
  const [showExportQRModal, setShowExportQRModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showFilterExport, setShowFilterExport] = useState(false);

  const [programs, setProgram] = useState<any>();
  const [brands, setBrands] = useState<any>();
  const [farmGroups, setFarmGroups] = useState<any>();
  const [icsNames, setIcsNames] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const[riceVariety,setRiceVariety]=useState<any>()
  const [states, setStates] = useState<any>();
  const [seasons, setSeasons] = useState<any>();
  const [certificates, setCertificates] = useState<any>();

  const [brandsExport, setBrandsExport] = useState<any>();
  const [farmGroupsExport, setFarmGroupsExport] = useState<any>();
  const [icsNamesExport, setIcsNamesExport] = useState<any>();
  const [countriesExport, setCountriesExport] = useState<any>();
  const [statesExport, setStatesExport] = useState<any>();
  const [districtExport, setDistrictExport] = useState<any>();
  const [blockExport, setBlockExport] = useState<any>();
  const [villageExport, setVillageExport] = useState<any>();
  const [riceVarietyExport, setRiceVarietyExport] = useState<any>();

  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedRiceVariety, setCheckedRiceVariety] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedFarmGroups, setCheckedFarmGroups] = useState<any>([]);
  const [checkedIcsName, setCheckedIcsName] = useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [checkedCertificates, setCheckedCertificates] = useState<any>([]);
  const [hasAccess, setHasAccess] = useState<any>({});
  const [isClear, setIsClear] = useState(false);
  const [errorExport, setErrorExport] = useState(false);

  const [checkedExportCountries, setCheckedExportCountries] =
    React.useState<any>([]);
  const [checkedExportStates, setCheckedExportStates] = React.useState<any>([]);
  const [checkedExportDistrict, setCheckedExportDistrict] = React.useState<any>(
    []
  );
  const [checkedExportBlock, setCheckedExportBlocks] = React.useState<any>([]);
  const [checkedExportRiceVariety, setCheckedExportRiceVariety] = React.useState<any>([]);
  const [checkedExportVillages, setCheckedExportVillages] = React.useState<any>(
    []
  );
  const [checkedExportPrograms, setCheckedExportPrograms] = React.useState<any>(
    []
  );
  const [checkedExportBrands, setCheckedExportBrands] = React.useState<any>([]);
  const [checkedExportFarmGroups, setCheckedExportFarmGroups] = useState<any>(
    []
  );
  const [checkedExportIcsName, setCheckedExportIcsName] = useState<any>([]);
  const [checkedExportSeasons, setCheckedExportSeasons] = useState<any>([]);
  const [checkedExportCertificates, setCheckedExportCertificates] =
    useState<any>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>("");
  const [isExportClear, setIsExportClear] = useState(false);
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const brandId = User.brandId;
  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Farmer Registration");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    if (checkedCountries || checkedExportCountries) {
      getStates();
    }
  }, [checkedCountries, checkedExportCountries]);

  useEffect(() => {
    if (checkedExportStates) {
      getDistricts();
    }
  }, [checkedExportStates]);

  useEffect(() => {
    if (checkedExportDistrict) {
      getBlocks();
    }
  }, [checkedExportDistrict]);

  useEffect(() => {
    if (checkedExportBlock) {
      getVillages();
    }
  }, [checkedExportBlock]);

  useEffect(() => {
    getPrograms();
    getRiceVariety()
    getCountries();
    getSeasons();
    getFarmersCount();
    setIsClient(true);
    setCertificates(certificatesData);
  }, []);

  useEffect(() => {
    if (checkedPrograms || checkedExportPrograms) {
      getBrands();
    }
  }, [checkedPrograms, checkedExportPrograms]);

  useEffect(() => {
    if (checkedBrands || checkedExportBrands || brandId) {
      getFarmGroups();
    }
  }, [checkedBrands, checkedExportBrands, brandId]);

  useEffect(() => {
    if (checkedFarmGroups || checkedExportFarmGroups) {
      getIcsName();
    }
  }, [checkedFarmGroups, checkedExportFarmGroups]);

  useEffect(() => {
    getFarmersList();
  }, [brandId, code, page, limit, isClear]);

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
      if (checkedExportPrograms.length !== 0) {
        const programs = checkedExportPrograms;
        const res = await API.get(`brand?programId=${programs}`);
        if (res.success) {
          setBrandsExport(res.data);
        }
      } else if (checkedPrograms.length !== 0) {
        const programs = checkedPrograms;
        const res = await API.get(`brand?programId=${programs}`);
        if (res.success) {
          setBrands(res.data);
        }
      } else {
        setBrands([]);
        setBrandsExport([]);
        setFarmGroups([]);
        setIcsNames([]);
        setCheckedBrands([]);
        setCheckedFarmGroups([]);
        setCheckedIcsName([]);
        setCheckedExportBrands([]);
        setCheckedExportFarmGroups([]);
        setCheckedExportIcsName([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFarmGroups = async () => {
    try {
      if (brandId) {
        const res = await API.get(`farm-group?brandId=${brandId}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      } else if (checkedExportBrands.length !== 0) {
        const farm = checkedExportBrands;
        const res = await API.get(`farm-group?brandId=${farm}`);
        if (res.success) {
          setFarmGroupsExport(res.data);
        }
      } else if (checkedBrands.length !== 0) {
        const farm = checkedBrands;
        const res = await API.get(`farm-group?brandId=${farm}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      } else {
        setFarmGroups([]);
        setIcsNames([]);
        setFarmGroupsExport([]);
        setCheckedFarmGroups([]);
        setCheckedIcsName([]);
        setCheckedExportFarmGroups([]);
        setCheckedExportIcsName([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getIcsName = async () => {
    try {
      if (checkedExportFarmGroups.length !== 0) {
        const ics = checkedExportFarmGroups;
        const res = await API.get(`ics?farmGroupId=${ics}`);
        if (res.success) {
          setIcsNamesExport(res.data);
        }
      } else if (checkedFarmGroups.length !== 0) {
        const ics = checkedFarmGroups;
        const res = await API.get(`ics?farmGroupId=${ics}`);
        if (res.success) {
          setIcsNames(res.data);
        }
      } else {
        setIcsNames([]);
        setIcsNamesExport([]);
        setCheckedIcsName([]);
        setCheckedExportIcsName([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getSeasons = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
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
      if (checkedExportCountries.length !== 0) {
        const countries = checkedExportCountries;
        const res = await API.get(`location/get-states?status=true&countryId=${countries}`);
        if (res.success) {
          setStatesExport(res.data);
        }
      } else if (checkedCountries.length !== 0) {
        const countries = checkedCountries;
        const res = await API.get(`location/get-states?status=true&countryId=${countries}`);
        if (res.success) {
          setStates(res.data);
        }
      } else {
        setStates([]);
        setStatesExport([]);
        setDistrictExport([]);
        setBlockExport([]);
        setVillageExport([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      if (checkedExportStates.length !== 0) {
        const res = await API.get(
          `location/get-districts?stateId=${checkedExportStates}`
        );
        if (res.success) {
          setDistrictExport(res.data);
        }
      } else {
        setDistrictExport([]);
        setBlockExport([]);
        setVillageExport([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      if (checkedExportDistrict.length !== 0) {
        const res = await API.get(
          `location/get-blocks?districtId=${checkedExportDistrict}`
        );
        if (res.success) {
          setBlockExport(res.data);
        }
      } else {
        setBlockExport([]);
        setVillageExport([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVillages = async () => {
    try {
      if (checkedExportBlock.length !== 0) {
        const res = await API.get(
          `location/get-villages?blockId=${checkedExportBlock}`
        );
        if (res.success) {
          setVillageExport(res.data);
        }
      } else {
        setVillageExport([]);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const getRiceVariety = async () => {
    const url = "rice-variety";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setRiceVarietyExport(res);
        } else {
          setRiceVariety(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };


  useEffect(() => {
    if (programs && checkedExportPrograms) {
      const program = programs.find(
        (p: any) => p.program_name === "Organic" || p.program_name === "organic"
      );
      if (program) {
        const programId = program.id;
        if (checkedExportPrograms.includes(programId)) {
          setSelectedProgram("Organic");
        } else {
          setSelectedProgram("");
        }
      }
    }
  }, [programs, checkedExportPrograms]);

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  const getFarmersCount = async () => {
    const url = "farmer/farm/count";
    try {
      const response = await API.get(url);
      setFarmCount(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getFarmersList = async () => {
    const url = `farmer?countryId=${checkedCountries}&stateId=${checkedStates}&programId=${checkedPrograms}&brandId=${brandId ? brandId : checkedBrands
      }&farmGroupId=${checkedFarmGroups}&icsId=${checkedIcsName}&seasonId=${checkedSeasons}&cert=${checkedCertificates}&limit=${limit}&page=${page}&search=${code}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data.rows);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
  };

  function Loader() {
    return (
      <div className="text-center w-full flex justify-center items-center">
        <div role="status">
          <svg aria-hidden="true" className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Downloading...</span>
        </div>
      </div>
    );
  }

  //export excel
  const handleExport = async () => {
    if (checkedExportSeasons.length === 0) {
      setErrorExport(true);
      return;
    }

    const url = `farmer/export?RiceVarietyId=${checkedExportRiceVariety}&countryId=${checkedExportCountries}&stateId=${checkedExportStates}&districtId=${checkedExportDistrict}&blockId=${checkedExportBlock}&villageId=${checkedExportVillages}&programId=${checkedExportPrograms}&brandId=${checkedExportBrands}&farmGroupId=${checkedExportFarmGroups}&icsId=${checkedExportIcsName}&seasonId=${checkedExportSeasons}&cert=${checkedExportCertificates}`;
    try {
      setErrorExport(false);
      setIsExportClear(true);
      setShowExportMessage(true);
      const response = await API.get(url);
      if (response.success) {
        if (response.data.link) {
          handleDownload(response.data, "Farmer Data", ".xlsx");
          ExportClear();
          setShowFilterExport(!showFilterExport);
          setIsExportClear(false);
          setShowExportMessage(false);
        }
      } else {
        setIsExportClear(false);
        setShowExportMessage(false);
      }
    } catch (error) {
      console.log(error, "error");
      setIsExportClear(false);
      setShowExportMessage(false);
    }
  };

  //export QR
  const handleQRExport = async () => {
    setShowExportQRModal(true);
  };

  const handleGenerateQR = async () => {
    setShowGenerateQRModal(true);
  };

  const handleQr = async (formData: any) => {
    getFarmersList();
    setShowGenerateQRModal(false);

  };

  const handleExportQr = async (formData: any) => {
    setShowExportQRModal(false);
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedCertificates([]);
    setCheckedIcsName([]);
    setCheckedBrands([]);
    setCheckedPrograms([]);
    setCheckedFarmGroups([]);
    setCheckedSeasons([]);
    setCheckedStates([]);
    setIsClear(!isClear);
  };


  const ExportClear = () => {
    setCheckedExportCountries([]);
    setCheckedExportCertificates([]);
    setCheckedExportIcsName([]);
    setCheckedExportBrands([]);
    setCheckedExportPrograms([]);
    setCheckedExportFarmGroups([]);
    setCheckedExportRiceVariety([])
    setCheckedExportSeasons([]);
    setCheckedExportStates([]);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } 
    
    else if (name === "riceVariety") {
      if (checkedRiceVariety.includes(itemId)) {
        setCheckedRiceVariety(
          checkedRiceVariety.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedRiceVariety([...checkedRiceVariety, itemId]);
      }
    }else if (name === "states") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    } else if (name === "programs") {
      setCheckedBrands([]);
      setCheckedFarmGroups([]);
      setCheckedIcsName([]);
      setCheckedPrograms(selectedList.map((item: any) => item.id));
    } else if (name === "brands") {
      setCheckedFarmGroups([]);
      setCheckedIcsName([]);
      if (checkedBrands.includes(itemId)) {
        setCheckedBrands(checkedBrands.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "farmGroups") {
      setCheckedIcsName([]);
      if (checkedFarmGroups.includes(itemId)) {
        setCheckedFarmGroups(
          checkedFarmGroups.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedFarmGroups([...checkedFarmGroups, itemId]);
      }
    } else if (name === "icsNames") {
      if (checkedIcsName.includes(itemId)) {
        setCheckedIcsName(
          checkedIcsName.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedIcsName([...checkedIcsName, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "certificates") {
      setCheckedCertificates(selectedList.map((item: any) => item.name));
    }
  };

  const handleExportChange = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      if (checkedExportCountries.includes(itemId)) {
        setCheckedExportCountries(
          checkedExportCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportCountries([...checkedExportCountries, itemId]);
      }
    }  else if (name === "riceVariety") {
      if (checkedExportRiceVariety.includes(itemId)) {
        setCheckedExportRiceVariety(
          checkedExportRiceVariety.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportRiceVariety([...checkedExportRiceVariety, itemId]);
      }
    }
    
    else if (name === "states") {
      if (checkedExportStates.includes(itemId)) {
        setCheckedExportStates(
          checkedExportStates.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportStates([...checkedExportStates, itemId]);
      }
    } else if (name === "districts") {
      if (checkedExportDistrict.includes(itemId)) {
        setCheckedExportDistrict(
          checkedExportDistrict.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportDistrict([...checkedExportDistrict, itemId]);
      }
    } else if (name === "blocks") {
      if (checkedExportBlock.includes(itemId)) {
        setCheckedExportBlocks(
          checkedExportBlock.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportBlocks([...checkedExportBlock, itemId]);
      }
    } else if (name === "villages") {
      if (checkedExportVillages.includes(itemId)) {
        setCheckedExportVillages(
          checkedExportVillages.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportVillages([...checkedExportVillages, itemId]);
      }
    } else if (name === "programs") {
      setCheckedExportBrands([]);
      setCheckedExportFarmGroups([]);
      setCheckedExportIcsName([]);
      setCheckedExportCertificates([]);
      setCheckedExportPrograms(selectedList.map((item: any) => item.id));
    } else if (name === "brands") {
      setCheckedExportFarmGroups([]);
      setCheckedExportIcsName([]);
      if (checkedExportBrands.includes(itemId)) {
        setCheckedExportBrands(
          checkedExportBrands.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportBrands([...checkedExportBrands, itemId]);
      }
    } else if (name === "farmGroups") {
      setCheckedExportIcsName([]);
      if (checkedExportFarmGroups.includes(itemId)) {
        setCheckedExportFarmGroups(
          checkedExportFarmGroups.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportFarmGroups([...checkedExportFarmGroups, itemId]);
      }
    } else if (name === "icsNames") {
      if (checkedExportIcsName.includes(itemId)) {
        setCheckedExportIcsName(
          checkedExportIcsName.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportIcsName([...checkedExportIcsName, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedExportSeasons.includes(itemId)) {
        setCheckedExportSeasons(
          checkedExportSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportSeasons([...checkedExportSeasons, itemId]);
      }
    } else if (name === "certificates") {
      setCheckedExportCertificates(selectedList.map((item: any) => item.name));
    }
  };

  //filters
  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => {
                      setShowFilter(!showFilter);
                    }}
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
                            {translations?.common?.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programs?.filter((item: any) =>
                              checkedPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            options={programs}
                            showCheckbox
                          />
                        </div>
                        {!brandId && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.Selectbrand}
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="brand_name"
                              selectedValues={brands?.filter((item: any) =>
                                checkedBrands.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "brands"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "brands"
                                )
                              }
                              options={brands}
                              showCheckbox
                            />
                          </div>
                        )}
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectFarmGroup}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={farmGroups?.filter((item: any) =>
                              checkedFarmGroups.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "farmGroups"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "farmGroups"
                              )
                            }
                            options={farmGroups}
                            showCheckbox
                          />
                        </div>
                        {!brandId && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectICSName}
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="ics_name"
                              selectedValues={icsNames?.filter((item: any) =>
                                checkedIcsName.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "icsNames"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "icsNames"
                                )
                              }
                              options={icsNames}
                              showCheckbox
                            />
                          </div>
                        )}
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectCountry}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="county_name"
                            selectedValues={countries?.filter((item: any) =>
                              checkedCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              )
                            }
                            options={countries}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectState}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="state_name"
                            selectedValues={states?.filter((item: any) =>
                              checkedStates.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "states"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "states")
                            }
                            options={states}
                            showCheckbox
                          />
                        </div>


                        {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                           Select Rice Variety
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="variety_name"
                            selectedValues={riceVariety?.filter((item: any) =>
                              checkedRiceVariety.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "riceVariety"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "riceVariety")
                            }
                            options={riceVariety}
                            showCheckbox
                          />
                        </div> */}




                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectSeason}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={seasons?.filter((item: any) =>
                              checkedSeasons.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              )
                            }
                            options={seasons}
                            showCheckbox
                          />
                        </div>
                        {!brandId && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select a Certificates
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={certificates?.filter(
                                (item: any) =>
                                  checkedCertificates.includes(item.name)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "certificates"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "certificates"
                                )
                              }
                              options={certificates}
                              showCheckbox
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getFarmersList();
                              setShowFilter(false);
                            }}
                          >
                            {translations.common.ApplyAllFilters}
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={() => {
                              clearFilter();
                            }}
                          >
                            {translations.common.ClearAllFilters}
                          </button>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const FilterExport = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
                  <button
                    className="text-[20px]"
                    style={
                      isExportClear
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer" }
                    }
                    disabled={isExportClear}
                    onClick={() => {
                      setErrorExport(false);
                      setShowFilterExport(!showFilterExport);
                    }}
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
                            {translations?.common?.SelectSeason}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasons?.filter((item: any) =>
                              checkedExportSeasons.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              )
                            }
                            options={seasons}
                            showCheckbox
                          />
                          {errorExport && (
                            <p className="text-red-500  text-sm mt-1">
                              Season is Required
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectProgram}

                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programs?.filter((item: any) =>
                              checkedExportPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            options={programs}
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
                            selectedValues={brandsExport?.filter((item: any) =>
                              checkedExportBrands.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              )
                            }
                            options={brandsExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectCountry}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={countries?.filter((item: any) =>
                              checkedExportCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              )
                            }
                            options={countries}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectState}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="state_name"
                            selectedValues={statesExport?.filter((item: any) =>
                              checkedExportStates.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "states"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "states"
                              )
                            }
                            options={statesExport}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectDistrict}
                          </label>

                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="district_name"
                            selectedValues={districtExport?.filter(
                              (item: any) =>
                                checkedExportDistrict.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "districts"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "districts"
                              )
                            }
                            options={districtExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectBlock}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="block_name"
                            selectedValues={blockExport?.filter((item: any) =>
                              checkedExportBlock.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "blocks"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "blocks"
                              )
                            }
                            options={blockExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectVillage}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="village_name"
                            selectedValues={villageExport?.filter((item: any) =>
                              checkedExportVillages.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "villages"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "villages"
                              )
                            }
                            options={villageExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                           Select Rice Variety
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="variety_name"
                            selectedValues={riceVariety?.filter((item: any) =>
                              checkedExportRiceVariety.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "riceVariety"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "riceVariety"
                              )
                            }
                            options={riceVariety}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectFarmGroup}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={farmGroupsExport?.filter(
                              (item: any) =>
                                checkedExportFarmGroups.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "farmGroups"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "farmGroups"
                              )
                            }
                            options={farmGroupsExport}
                            showCheckbox
                          />
                        </div>

                        {selectedProgram && (
                          <>
                            <div className="col-12 col-md-6 col-lg-3 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                {translations?.common?.SelectICSName}
                              </label>
                              <Multiselect
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                displayValue="ics_name"
                                selectedValues={icsNamesExport?.filter(
                                  (item: any) =>
                                    checkedExportIcsName.includes(item.id)
                                )}
                                onKeyPressFn={function noRefCheck() { }}
                                onRemove={(
                                  selectedList: any,
                                  selectedItem: any
                                ) => {
                                  handleExportChange(
                                    selectedList,
                                    selectedItem,
                                    "icsNames"
                                  );
                                }}
                                onSearch={function noRefCheck() { }}
                                onSelect={(
                                  selectedList: any,
                                  selectedItem: any
                                ) =>
                                  handleExportChange(
                                    selectedList,
                                    selectedItem,
                                    "icsNames"
                                  )
                                }
                                options={icsNamesExport}
                                showCheckbox
                              />
                            </div>

                         
                          </>
                        )}
                      </div>
                      {showExportMessage && (
                        <div className="flex flex-col justify-center mt-3 border-y py-2">
                          <p className="text-center font-semibold text-md text-green-700 py-1">
                            Note: Export all records will take time based on the
                            speed of internet and total no of records
                          </p>{" "}
                          <Loader />
                        </div>
                      )}
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            disabled={isExportClear}
                            style={
                              isExportClear
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : {
                                  cursor: "pointer",
                                  backgroundColor: "#D15E9C",
                                }
                            }
                            onClick={() => {
                              handleExport();
                              setShowFilter(false);
                            }}
                          >
                            Export
                          </button>
                          <button
                            className="btn-outline-purple"
                            disabled={isExportClear}
                            style={
                              isExportClear
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer" }
                            }
                            onClick={() => {
                              ExportClear();
                            }}
                          >
                            {translations.common.ClearAllFilters}
                          </button>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }

  const columns: any = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "70px",
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      cell: (row: any) => row?.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Name</p>,
      wrap: true,
      selector: (row: any) => (
        <>
          {hasAccess?.edit && !brandId ? (
            <Link
              href={`/services/farmer-registration/view-farmer-details?id=${row?.id}&farmer=${row?.farmer_id}`}
              className=" text-blue-500 hover:text-blue-300"
            >
              {row?.farmer?.firstName + " " + row?.farmer?.lastName}
            </Link>
          ) : (
            <div>{row?.farmer?.firstName + " " + row?.farmer?.lastName}</div>
          )}
        </>
      ),
      // sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Code</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.code,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.program?.program_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Country</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.country?.county_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">State</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.state?.state_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Village</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.village?.village_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Rice Variety</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.rice_variety?.variety_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Agri Area</p>,
      wrap: true,
      selector: (row: any) => row?.agri_total_area,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Paddy Area</p>,
      wrap: true,
      selector: (row: any) => row?.paddy_total_area,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Tracenet Id</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.tracenet_id,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Certification Status</p>,
      compact: true,
      wrap: true,
      selector: (row: any) => row?.farmer.cert_status,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">QR Code</p>,
      wrap: true,
      cell: (row: any) =>
        row?.farmer.qrUrl ? (
          <Link
            // legacyBehavior
            href={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.farmer.qrUrl}
          >
            <a
              className="text-blue-500 hover:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Click to view
            </a>
          </Link>
        ) : (
          ""
        ),
      sortable: false,
    },
    !brandId && {
      name: <p className="text-[13px] font-medium">Brand</p>,
      wrap: true,
      selector: (row: any) => row?.farmer?.brand?.brand_name,
    },

    !brandId && {
      name: (
        <p className="text-[13px] font-medium">{translations.common.action}</p>
      ),
      center: true,
      cell: (row: any) => (
        <>
          {hasAccess?.delete && (
            <button
              className="bg-red-500 p-2 ml-3 rounded"
              onClick={() => handleDelete(row.id)}
            >
              <AiFillDelete size={18} color="white" />
            </button>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ].filter(Boolean);

  if (!roleLoading && !hasAccess.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link
                        href={!brandId ? "/dashboard" : "/brand/dashboard"}
                        className="active"
                      >
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Services</li>
                    <li>Farmer Registration</li>
                  </ul>
                </div>
              </div>
            </div>
          

            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="search-bars">
                          <form className="form-group mb-0 search-bar-inner">
                            <input
                              type="text"
                              className="form-control form-control-new jsSearchBar "
                              placeholder={translations.common.search}
                              value={searchQuery}
                              onChange={searchData}
                            />
                            <button type="submit" className="search-btn">
                              <span className="icon-search"></span>
                            </button>
                          </form>
                        </div>
                        <div className="fliterBtn">
                          <button
                            className="flex"
                            type="button"
                            onClick={() => setShowFilter(!showFilter)}
                          >
                            {translations.common.Filters} <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showFilter}
                              onClose={!showFilter}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        {hasAccess?.create && !brandId && (
                          <div className="search-filter-right ml-3">
                            <button
                              className="btn btn-all btn-purple"
                              onClick={() =>
                                router.push(
                                  "/services/farmer-registration/add-farmer"
                                )
                              }
                            >
                              {translations.common.add}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!brandId && (
                      <div className="flex mt-2 justify-end borderFix pt-2 pb-2">
                        <div className="search-filter-right">
                          <button
                            className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                            onClick={() => {
                              handleGenerateQR();
                            }}
                          >
                            Generate QR Code
                          </button>
                        </div>
                        <div className="search-filter-right">
                          <button
                            className="h-100 py-1.5 px-4 mx-3 rounded bg-yellow-500 text-white font-bold text-sm"
                            onClick={() => {
                              handleQRExport();
                            }}
                          >
                            Export QR Code
                          </button>
                        </div>
                        <div className="search-filter-right">
                          <button
                            className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                            onClick={() => {
                              setShowFilterExport(!showFilterExport);
                            }}
                          >
                            {translations.common.export}
                          </button>
                          <div className="relative">
                            <FilterExport
                              openFilter={showFilterExport}
                              onClose={!showFilterExport}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <CommonDataTable
                      columns={columns}
                      count={count}
                      data={data}
                      updateData={updatePage}
                    />
                    {showGenerateQRModal && (
                      <QrGeneratePopup
                        title={"Generate QR Code"}
                        onClose={() => setShowGenerateQRModal(false)}
                        onSubmit={(formData: any) => {
                          handleQr(formData);
                        }}
                      />
                    )}

                    {showExportQRModal && (
                      <QrGeneratePopup
                        title={"Bulk Download QR Code"}
                        onClose={() => setShowExportQRModal(false)}
                        onSubmit={(formData: any) => {
                          handleExportQr(formData);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "farmer";
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId,
                      });
                      if (response.success) {
                        toasterSuccess("Record has been deleted successfully");
                        getFarmersList();
                      } else {
                        toasterError("Failed to delete record");
                      }
                    } catch (error) {
                      toasterError("An error occurred");
                    }
                    setShowDeleteConfirmation(false);
                    setDeleteItemId(null);
                  }
                }}
                onCancel={handleCancel}
              />
            )}
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
};

export default page;

const QrGeneratePopup = ({ title, onClose, onSubmit }: any) => {
  const [show, setShow] = useState(false);
  const [showExportError, setShowExportError] = useState(false);
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [villages, setVillages] = useState<any>();
  // const [riceVariety, setRiceVariety] = useState<any>();

  const [actionButtonActive, setActionButtonActive] = useState(false)

  const [error, setError] = useState<any>({
    country: "",
    state: "",
    district: "",
    block: "",
    village: "",
    riceVariety:""
  });

  const [data, setData] = useState<any>({
    country: "",
    state: "",
    district: "",
    block: "",
    village: "",
    riceVariety:""

  });

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (data.country !== "") {
      getStates();
    }
  }, [data.country]);

  useEffect(() => {
    if (data.state !== "") {
      getDistricts();
    }
  }, [data.state]);

  useEffect(() => {
    if (data.district !== "") {
      getBlocks();
    }
  }, [data.district]);

  useEffect(() => {
    if (data.block !== "") {
      getVillages();
    }
  }, [data.block]);

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
      const res = await API.get(
        `location/get-states?status=true&countryId=${data.country}`
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
      const res = await API.get(`location/get-districts?stateId=${data.state}`);
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
        `location/get-blocks?districtId=${data.district}`
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
      const res = await API.get(`location/get-villages?blockId=${data.block}`);
      if (res.success) {
        setVillages(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name == "country") {
      setStates([]);
      setDistricts([]);
      setBlocks([]);
      setVillages([]);
      setData((prevData: any) => ({
        ...prevData,
        state: "",
        district: "",
        block: "",
        village: "",
      }));
    } else if (name == "state") {
      setDistricts([]);
      setBlocks([]);
      setVillages([]);
      setData((prevData: any) => ({
        ...prevData,
        district: "",
        block: "",
        village: "",
      }));
    } else if (name === "district") {
      setBlocks([]);
      setVillages([]);
      setData((prevData: any) => ({
        ...prevData,
        block: "",
        village: "",
      }));
    } else if (name === "block") {
      setVillages([]);
      setData((prevData: any) => ({
        ...prevData,
        village: "",
      }));
    }

    setData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));

    setError((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const handleErrors = () => {
    let isError = false;

    if (!data.country || data.country === "") {
      setError((prevError: any) => ({
        ...prevError,
        country: "Country Name is required",
      }));
      isError = true;
    }
    if (!data.riceVariety || data.riceVariety === "") {
      setError((prevError: any) => ({
        ...prevError,
        riceVariety: "Rice Variety  is required",
      }));
      isError = true;
    }

    if (!data.state) {
      setError((prevError: any) => ({
        ...prevError,
        state: "State Name is required",
      }));
      isError = true;
    }

    if (!data.district) {
      setError((prevError: any) => ({
        ...prevError,
        district: "District Name is required",
      }));
      isError = true;
    }

    if (!data.block) {
      setError((prevError: any) => ({
        ...prevError,
        block: "Block Name is required",
      }));
      isError = true;
    }

    if (!data.village) {
      setError((prevError: any) => ({
        ...prevError,
        village: "Village Name is required",
      }));
      isError = true;
    }

    return isError;
  };

  const submit = async () => {
    setShowExportError(false)
    if (handleErrors()) {
      return;
    }

    setActionButtonActive(true)
    if (title === "Bulk Download QR Code") {
      const url = `farmer/export-qr?villageId=${data.village}`;
      try {
        setShow(true);
        const response = await API.get(url);
        if (response.success) {
          if (response.data) {
            handleDownload(response.data?.link, "qrCodes", ".zip");
            onSubmit(data.village);
            setShow(false);
            setActionButtonActive(false)

          }
        }
        else {
          setShowExportError(true)
          setShow(false);
          setActionButtonActive(false)

        }
      } catch (error) {
        setShowExportError(true)
        setShow(false);
        setActionButtonActive(false)
      }
    }
    else {
      const url = `farmer/generate?villageId=${data.village}`;
      try {
        setShow(true);
        const response = await API.get(url);
        if (response.success) {
          if (response.data) {
            onSubmit(data.villageId)
            setShow(false);
            setActionButtonActive(false)
          }
        }
        else {
          setShowExportError(true)
          setShow(false);
          setActionButtonActive(false)
        }
      } catch (error) {
        console.log(error, "error");
        setShowExportError(true)
        setShow(false);
        setActionButtonActive(false)
      }
    }

  };

  return (
    <div className="fixPopup flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
        <div className="flex justify-between">
          <h3 className="text-lg pb-2">{title}</h3>
          <button className="text-xl" disabled={actionButtonActive} style={
            actionButtonActive
              ? { cursor: "not-allowed", opacity: 0.8 }
              : { cursor: "pointer" }
          } onClick={onClose}>
            &times;
          </button>
        </div>
        <hr />
        <div className="py-2">
          <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Country Name*</span>
            <div>
              <select
                name="country"
                value={data.country}
                onChange={handleChange}
                className="w-80 border rounded p-2 text-sm"
              >
                <option value="">Select a country</option>
                {countries?.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select>
              {error?.country && (
                <div className="text-red-500 text-sm mt-1">{error.country}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <div>
              <span className="text-sm mr-8">State Name *</span>
            </div>
            <div className="flex-col">
              <select
                name="state"
                value={data.state}
                onChange={handleChange}
                className="w-80 border rounded p-2 text-sm"
              >
                <option value="">Select a State</option>
                {states?.map((state: any) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}
              </select>
              {error?.state && (
                <div className="text-red-500 text-sm mt-1">{error.state}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <div>
              <span className="text-sm mr-8">District Name*</span>
            </div>
            <div className="flex-col">
              <select
                value={data.district}
                onChange={handleChange}
                name="district"
                className="w-80 border rounded p-2 text-sm"
              >
                <option value="">Select a District</option>
                {districts?.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
              {error?.district && (
                <div className="text-red-500 text-sm mt-1">
                  {error.district}
                </div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <div>
              <span className="text-sm mr-8">Taluk/Block Name *</span>
            </div>
            <div className="flex-col">
              <select
                value={data.block}
                onChange={handleChange}
                name="block"
                className="w-80 border rounded p-2 text-sm"
              >
                <option value="">Select a Block Name</option>

                {blocks?.map((block: any) => (
                  <option key={block.id} value={block.id}>
                    {block.block_name}
                  </option>
                ))}
              </select>
              {error?.block && (
                <div className="text-red-500 text-sm mt-1">{error.block}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Village Name*</span>
            <div>
              <select
                value={data.village}
                onChange={handleChange}
                name="village"
                className="w-80 border rounded p-2 text-sm"
              >
                <option value="">Select a Village Name</option>
                {villages?.map((village: any) => (
                  <option key={village.id} value={village.id}>
                    {village.village_name}
                  </option>
                ))}
              </select>
              {error?.village && (
                <div className="text-red-500 text-sm mt-1">{error.village}</div>
              )}
            </div>
          </div>

          {/* <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Rice Variety*</span>
            <div>
              <select
                value={data.riceVariety}
                onChange={handleChange}
                name="riceVariety"
                className="w-80 border rounded p-2 text-sm"
              >
                <option value="">Select a Rice Variety</option>
                {riceVariety?.map((rice: any) => (
                  <option key={rice.id} value={rice.id}>
                    {rice.variety_name}
                  </option>
                ))}
              </select>
              {error?.riceVariety && (
                <div className="text-red-500 text-sm mt-1">{error.riceVariety}</div>
              )}
            </div>
          </div> */}
          {show && title === "Generate QR Code" && (
            <div className="flex justify-center items-center mt-5">
              <p className="text-green-600 ">
                Generating QR code, Please wait....
              </p>
            </div>
          )}

          {showExportError && (
            <div className="flex justify-center mt-3 border-y">
              <p className="text-center font-semibold text-md text-red-600 py-1">
                No Data Found in this village.
              </p>{" "}
            </div>
          )}
        </div>

        <div className="pt-3 mt-5 flex justify-end border-t">
          <button onClick={submit} disabled={actionButtonActive} className="btn-purple mr-2" style={
            actionButtonActive
              ? { cursor: "not-allowed", opacity: 0.8 }
              : { cursor: "pointer" }
          }>
            Submit
          </button>
          <button
            onClick={onClose}
            disabled={actionButtonActive}
            className="mr-2 text-sm font-bold py-2 px-4 rounded-md border"
            style={
              actionButtonActive
                ? { cursor: "not-allowed" }
                : { cursor: "pointer" }
            }
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
