"useClient";

import React, { useEffect, useState } from "react";
import API from "@lib/Api";
import User from "@lib/User";
import NavLink from "./nav-link";
import Dropdown from "react-bootstrap/Dropdown";
import { Scrollbars } from "react-custom-scrollbars";
import Accordion from "react-bootstrap/Accordion";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { usePathname } from "next/navigation";
import { useRouter } from "@lib/router-events";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import useNewContext from "context/ContextProvider";
import Select, { GroupBase } from "react-select";
import Loader from "./Loader";
import Link from "next/link";

async function importSelectedFile(selectedOption: string) {
  switch (selectedOption) {
    case "Superadmin":
      return import("@lib/navigation-data/Superadmin");
    case "Admin":
      return import("@lib/navigation-data/Admin");
    case "Brand":
      return import("@lib/navigation-data/Brand");
    case "Mandi":
      return import("@lib/navigation-data/Mandi");
    case "Mill":
      return import("@lib/navigation-data/Mill");
    case "Third_Party_Inspection":
      return import("@lib/navigation-data/ThirdPartyInspection");
      case "Container_Management_System":
        return import("@lib/navigation-data/ContainerManagementSystem");
      case "Lab":
        return import("@lib/navigation-data/Lab");
    case "Garment":
      return import("@lib/navigation-data/Garment");
    case "Fabric":
      return import("@lib/navigation-data/Fabric");
    case "Physical_Partner":
      return import("@lib/navigation-data/PhysicalPartner");
    case "Developer":
      return import("@lib/navigation-data/Developer");
    default:
      return null;
  }
}

export default function ({
  isMenuCollapsed,
  setIsMenuCollapsed,
  isMenuToggle,
}: any) {
  const [processorDetails, setProcessorDetails] = useState<any>([]);
  const [showLoginProcessor, setShowLoginProcessor] = useState<any>(false);
  const [loadingProc, setLoadingProc] = useState<any>(false);

  const [selectLoading, setSelectLoading] = useState({
    isCountryLoading: false,
    isStatesLoading: false,
    isProcessorLoading: false
  })
  const [menuAccessList, setMenuAccessList] = useState<any>([]);
  const [dashboardUrl, setDashboardUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [processorName, setProcessorName] = useState("");
  const [country, setCountry] = useState<any>([]);
  const [states, setStates] = useState<any>([]);
  const [processor, setProcessor] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState<any>({
    countryId: "",
    stateId: "",
    processorId: "",
  });

  const [orgToken, setOrgToken] = useState<any>("");
  const router: any = useRouter();
  const pathname = usePathname();
  const { setSavedData } = useNewContext();

  const tooltip = (data: any) => (
    <Tooltip id="tooltip" className={`${isMenuCollapsed ? "block" : "hidden"}`}>
      {data}
    </Tooltip>
  );

  const isItemActive = (item: any, index: any): boolean => {
    if (item.path) {
      return pathname.startsWith(item.path);
    }

    if (item.childrens) {
      return item.childrens.some((child: any, index: any) =>
        isItemActive(child, index)
      );
    }

    return false;
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      if (localStorage.getItem("orgToken")) {
        if (sessionStorage.getItem("User")) {
          getMenuList();
        } else {
          // const orgToken: any = localStorage.getItem("orgToken");
          // localStorage.setItem("accessToken", orgToken);
          // localStorage.removeItem("orgToken");
        }
      }
      getMenuList();
    }
  }, [pathname]);

  useEffect(() => {
    if (processorName) {
      if (processorName === "Brand") {
        getProcessor()
      }
      else {
        getCountry();
      }
    }
  }, [processorName]);

  useEffect(() => {
    if (
      localStorage.getItem("accessToken") &&
      localStorage.getItem("orgToken")
    ) {
      switch (true) {
        case window.location.pathname.startsWith("/mill"):
        case window.location.pathname.startsWith("/mandi"):
        case window.location.pathname.startsWith("/third-party-inspection"):
        case window.location.pathname.startsWith("/lab"):
        case window.location.pathname.startsWith("/container-management"):
        case window.location.pathname.startsWith("/farm"):
        case window.location.pathname.startsWith("/garment"):
        case window.location.pathname.startsWith("/brand"):
        case window.location.pathname.startsWith("/physical-partner"):
          setOrgToken(localStorage.getItem("orgToken"));
          break;
        case localStorage.getItem("orgToken") && !window.location.pathname.startsWith("/dashboard") && sessionStorage.getItem("User") === "brand":
          setOrgToken(localStorage.getItem("orgToken"));
          break;
        default:
          setOrgToken("");
          break;
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (formData.countryId !== "" && formData.countryId !== undefined) {
      getStates();
    } else {
      setStates([]);
      setProcessor([]);
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.stateId !== "" && formData.stateId !== undefined) {
      getProcessor();
    } else {
      setProcessor([]);
    }
  }, [formData.stateId]);

  const logout = async () => {
    await User.signOut();
  };

  const backToAdmin = () => {
    setProcessorDetails([]);
    sessionStorage.clear();
    // localStorage.removeItem("accessToken");
    // const orgToken: any = localStorage.getItem("orgToken");
    getMenuList();
    setOrgToken("");
    router.push("/dashboard");
  };

  const handleClick = () => {
    if (window.innerWidth <= 912) {
      setIsMenuCollapsed(!isMenuCollapsed);
    } else {
      document.body.click()
    }
  }

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    setSelectLoading({
      isCountryLoading: true,
      isProcessorLoading: false,
      isStatesLoading: false
    })
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountry(res);
        setSelectLoading({
          isCountryLoading: false,
          isProcessorLoading: false,
          isStatesLoading: false
        })
      }
    } catch (error) {
      console.log(error, "error");
      setSelectLoading({
        isCountryLoading: false,
        isProcessorLoading: false,
        isStatesLoading: false
      })
    }
  };

  const getStates = async () => {
    const url = `location/get-states?status=true&countryId=${formData.countryId}`;
    if (formData.countryId && formData.countryId !== "") {
      setSelectLoading({
        isCountryLoading: false,
        isProcessorLoading: false,
        isStatesLoading: true
      })
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;
          setStates(res);
          setSelectLoading({
            isCountryLoading: false,
            isProcessorLoading: false,
            isStatesLoading: false
          })
        }
      } catch (error) {
        console.log(error, "error");
        setSelectLoading({
          isCountryLoading: false,
          isProcessorLoading: false,
          isStatesLoading: false
        })
      }
    }
  };

  const getProcessor = async () => {
    const name = processorName.toLowerCase().split(' ').join('-');
    const url = name === "brand" ? `${name}` : name === "farm" ?  `farm-processor` : `${name}?stateId=${formData.stateId}`;
    if (name !== "brand" && formData.stateId && formData.stateId !== "") {
      setSelectLoading({
        isCountryLoading: false,
        isProcessorLoading: true,
        isStatesLoading: false
      })
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;
          setProcessor(res);
          setSelectLoading({
            isCountryLoading: false,
            isProcessorLoading: false,
            isStatesLoading: false
          })
        }
      } catch (error) {
        console.log(error, "error");
        setSelectLoading({
          isCountryLoading: false,
          isProcessorLoading: false,
          isStatesLoading: false
        })
      }
    }
    else {
      try {
        setSelectLoading({
          isCountryLoading: false,
          isProcessorLoading: true,
          isStatesLoading: false
        })
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;
          setProcessor(res);
          setSelectLoading({
            isCountryLoading: false,
            isProcessorLoading: false,
            isStatesLoading: false
          })
        }
      } catch (error) {
        console.log(error, "error");
        setSelectLoading({
          isCountryLoading: false,
          isProcessorLoading: false,
          isStatesLoading: false
        })
      }
    }
  };

  const getMenuList = async () => {
    let res = await User.role();
    if (res) {
      let processor: any = res?.processor[0];

      setSavedData(processor && processor === "Brand" ? res?.[processor?.toLowerCase()]?.brand_name : processor && processor === "Third_Party_Inspection" ? res?.['thirdPartyInspection']?.name : processor && processor === "Container_Management_System" ? res?.['containerManagementSystem']?.name : processor && processor !== "Brand" ? res?.[processor?.toLowerCase()]?.name : res?.user?.username);

      let role: string = res?.role?.userCategory?.category_name;
      if (res?.processor.length > 1) {
        setProcessorDetails(res)
      }
      else {
        setProcessorDetails([])
      }

      if (role === "Superadmin" || role === "Developer" || role === "Admin") {
        getDashboardUrl(role);
        importSelectedFile(role)
          .then((module) => {
            // if (role?.toLowerCase() !== "admin" && role?.toLowerCase() !== "superadmin") {
            sessionStorage.setItem("User", role?.toLowerCase())
            // }
            return setMenuAccessList(module ? module.default?.list : null)

          })
          .catch((error) => {
            console.error("Error loading module:", error);
          });

        return;
      }

      if (role !== "") {
        getDashboardUrl(role);

        importSelectedFile(role)
          .then((module) => {
            // Handle the imported module here
            const menu = module?.default?.list
              ?.map((item: any) => {
                // Check if the parent item's name matches any access menu_name
                const isParentMatching = res?.privileges?.some(
                  (access: any) => {
                    return item.name !== undefined || item.name
                      ? item.name === access?.menu?.menu_name
                      : item.item === access?.menu?.menu_name;
                  }
                );

                // If the parent matches, return the parent item along with all subchildren
                if (isParentMatching) {
                  return item;
                } else {
                  // If the parent doesn't match, check if any subchild's name matches any access menu_name
                  if (item.childrens) {
                    const filteredChildren = item.childrens.filter(
                      (child: any) => {
                        const isChildrenMatching = res?.privileges?.some(
                          (access: any) => {
                            if (child.item === "Farmer Registration") {
                              return (
                                "Farmer Enrollment" === access?.menu?.menu_name
                              );
                            }

                            if (child.item === "Farmer Reports") {
                              return (
                                "Organic Farmer Report" ===
                                access?.menu?.menu_name ||
                                "Non Organic Farmer Report" ===
                                access?.menu?.menu_name
                              );
                            }
                            if (child.item === "Procurement") {
                              return (
                                "Procurement Report" ===
                                access?.menu?.menu_name ||
                                "Procurement Tracker" ===
                                access?.menu?.menu_name ||
                                "PSCP Procurement and Sell Live Tracker" ===
                                access?.menu?.menu_name ||
                                "APP Procurement Report" ===
                                access?.menu?.menu_name
                              );
                            }
                            if (child.item === "Ginner Data Section") {
                              return (
                                "Ginner Summary Report" ===
                                access?.menu?.menu_name ||
                                "Ginner Bales Report" ===
                                access?.menu?.menu_name ||
                                "Ginner Sales Pending" ===
                                access?.menu?.menu_name ||
                                "Ginner Sales Report" ===
                                access?.menu?.menu_name ||
                                "Ginner Seed Cotton Stock Report" ===
                                access?.menu?.menu_name
                              );
                            }

                            if (child.item === "Spinner Data Section") {
                              return (
                                "Spinner Bale Receipt" ===
                                access?.menu?.menu_name ||
                                "Spinner Pending Bales Receipt Report" ===
                                access?.menu?.menu_name ||
                                "Spinner Yarn Process" ===
                                access?.menu?.menu_name ||
                                "Spinner Yarn Sale" ===
                                access?.menu?.menu_name ||
                                "Spinner Summary Report" ===
                                access?.menu?.menu_name ||
                                "Spinner Lint Cotton Stock Report" ===
                                access?.menu?.menu_name
                              );
                            }

                            if (child.item === "Knitter Data Section") {
                              return (
                                "Knitter Summary Report" ===
                                access?.menu?.menu_name ||
                                "Knitter Process Report" ===
                                access?.menu?.menu_name ||
                                "Knitter Yarn Receipt" ===
                                access?.menu?.menu_name ||
                                "Knitter Fabric Sale" ===
                                access?.menu?.menu_name
                              );
                            }

                            if (child.item === "Weaver Data Section") {
                              return (
                                "Weaver Summary Report" ===
                                access?.menu?.menu_name ||
                                "Weaver Process Report" ===
                                access?.menu?.menu_name ||
                                "Weaver Yarn Receipt" ===
                                access?.menu?.menu_name ||
                                "Weaver Fabric Sale" === access?.menu?.menu_name
                              );
                            }

                            if (child.item === "Garment Data Section") {
                              return (
                                "Garment Summary Report" ===
                                access?.menu?.menu_name ||
                                "Garment Process Report" ===
                                access?.menu?.menu_name ||
                                "Garment Fabric Receipt" ===
                                access?.menu?.menu_name ||
                                "Garment Sale Report" ===
                                access?.menu?.menu_name ||
                                "QR Code Track" === access?.menu?.menu_name

                              );
                            }

                            // if (child.item === "Fabric Data Section") {
                            //   return (
                            //     "Spinner Bale Receipt" === access?.menu?.menu_name || "Spinner Pending Bales Receipt" === access?.menu?.menu_name
                            //   );
                            // }
                            // return child.item === access?.menu?.menu_name;
                            return child.name !== undefined || child.name
                              ? child.name === access?.menu?.menu_name
                              : child.item === access?.menu?.menu_name;
                          }
                        );
                        if (isChildrenMatching) {
                          return child;
                        } else {
                          if (child.childrens) {
                            const subChildrenFilter = child.childrens.filter(
                              (subChild: any) => {
                                return res?.privileges?.some((access: any) => {
                                  return subChild.name !== undefined ||
                                    subChild.name
                                    ? subChild.name === access?.menu?.menu_name
                                    : subChild.item === access?.menu?.menu_name;
                                });
                              }
                            );
                            if (subChildrenFilter.length > 0) {
                              return { ...child, childrens: subChildrenFilter };
                            }
                          }
                        }
                      }
                    );

                    // If there are matching subchildren, return the parent item with filtered subchildren
                    if (filteredChildren.length > 0) {
                      return { ...item, childrens: filteredChildren };
                    }
                  }
                  // If neither the parent nor any subchild matches, return null
                  return null;
                }
              })
              .filter((item:any) => item !== null);
            setMenuAccessList(menu);
            // if (role?.toLowerCase() !== "admin" && role?.toLowerCase() !== "superadmin") {
            sessionStorage.setItem("User", role?.toLowerCase())
            // }
          })
          .catch((error) => {
            console.error("Error loading module:", error);
          });
      } else if (role === "") {
        getDashboardUrl("Brand");

        importSelectedFile("Brand")
          .then((module) => {
            const menu = module?.default?.list
              ?.map((item: any) => {
                // Check if the parent item's name matches any access menu_name
                const isParentMatching = res?.privileges?.some(
                  (access: any) => {
                    // return item.item === access?.menu?.menu_name;
                    return item.name !== undefined || item.name
                      ? item.name === access?.menu?.menu_name
                      : item.item === access?.menu?.menu_name;
                  }
                );

                // If the parent matches, return the parent item along with all subchildren
                if (isParentMatching) {
                  return item;
                } else {
                  // If the parent doesn't match, check if any subchild's name matches any access menu_name
                  if (item.childrens) {
                    const filteredChildren = item.childrens.filter(
                      (child: any) => {
                        return res?.privileges?.some((access: any) => {
                          if (child.item === "Farmer Registration") {
                            return (
                              "Farmer Enrollment" === access?.menu?.menu_name
                            );
                          }

                          // if (child.item === "Farmer Reports") {
                          //   return (
                          //     "Organic Farmer Report" === access?.menu?.menu_name || "Non Organic Farmer Report" === access?.menu?.menu_name
                          //   );
                          // }
                          if (child.item === "Procurement") {
                            return (
                              "Procurement Report" ===
                              access?.menu?.menu_name ||
                              "Procurement Tracker" ===
                              access?.menu?.menu_name ||
                              "PSCP Procurement and Sell Live Tracker" ===
                              access?.menu?.menu_name ||
                              "APP Procurement Report" ===
                              access?.menu?.menu_name
                            );
                          }
                          if (child.item === "Ginner Data Section") {
                            return (
                              "Ginner Summary Report" ===
                              access?.menu?.menu_name ||
                              "Ginner Bales Report" ===
                              access?.menu?.menu_name ||
                              "Ginner Sales Pending" ===
                              access?.menu?.menu_name ||
                              "Ginner Sales Report" ===
                              access?.menu?.menu_name ||
                              "Ginner Seed Cotton Stock Report" ===
                              access?.menu?.menu_name
                            );
                          }

                          if (child.item === "Spinner Data Section") {
                            return (
                              "Spinner Bale Receipt" ===
                              access?.menu?.menu_name ||
                              "Spinner Pending Bales Receipt Report" ===
                              access?.menu?.menu_name ||
                              "Spinner Yarn Process" ===
                              access?.menu?.menu_name ||
                              "Spinner Yarn Sale" === access?.menu?.menu_name ||
                              "Spinner Summary Report" ===
                              access?.menu?.menu_name ||
                              "Spinner Lint Cotton Stock Report" ===
                              access?.menu?.menu_name
                            );
                          }

                          if (child.item === "Knitter Data Section") {
                            return (
                              "Knitter Summary Report" ===
                              access?.menu?.menu_name ||
                              "Knitter Process Report" ===
                              access?.menu?.menu_name ||
                              "Knitter Yarn Receipt" ===
                              access?.menu?.menu_name ||
                              "Knitter Fabric Sale" === access?.menu?.menu_name
                            );
                          }

                          if (child.item === "Weaver Data Section") {
                            return (
                              "Weaver Summary Report" ===
                              access?.menu?.menu_name ||
                              "Weaver Process Report" ===
                              access?.menu?.menu_name ||
                              "Weaver Yarn Receipt" ===
                              access?.menu?.menu_name ||
                              "Weaver Fabric Sale" === access?.menu?.menu_name
                            );
                          }

                          if (child.item === "Garment Data Section") {
                            return (
                              "Garment Summary Report" ===
                              access?.menu?.menu_name ||
                              "Garment Process Report" ===
                              access?.menu?.menu_name ||
                              "Garment Fabric Receipt" ===
                              access?.menu?.menu_name ||
                              "Garment Sale Report" === access?.menu?.menu_name ||
                              "QR Code Track" === access?.menu?.menu_name
                            );
                          }

                          // if (child.item === "Fabric Data Section") {
                          //   return (
                          //     "Spinner Bale Receipt" === access?.menu?.menu_name || "Spinner Pending Bales Receipt" === access?.menu?.menu_name
                          //   );
                          // }
                          // return child.item === access?.menu?.menu_name;
                          return child.name !== undefined || child.name
                            ? child.name === access?.menu?.menu_name
                            : child.item === access?.menu?.menu_name;
                          // return child.item === access?.menu?.menu_name;
                        });
                      }
                    );

                    // If there are matching subchildren, return the parent item with filtered subchildren
                    if (filteredChildren.length > 0) {
                      return { ...item, childrens: filteredChildren };
                    }
                  }

                  // If neither the parent nor any subchild matches, return null
                  return null;
                }
              })
              .filter((item:any) => item !== null);
            setMenuAccessList(menu);
            // if (role?.toLowerCase() !== "admin" && role?.toLowerCase() !== "superadmin") {
            sessionStorage.setItem("User", role?.toLowerCase())
            // }
          })
          .catch((error) => {
            console.error("Error loading module:", error);
          });
      }
    }
  };

  const getDashboardUrl = (role: string) => {
    if (role === "Superadmin" || role === "Admin" || role === "Developer") {
      return setDashboardUrl("/dashboard");
    } else {
      const otherRoles = "/" + role.toLowerCase().replaceAll('_', '-');
      return setDashboardUrl(otherRoles + "/dashboard");
    }
  };

  const handleToggle = () => {
    if (window.innerWidth >= 992) {
      setIsMenuCollapsed(!isMenuCollapsed);
    } else {
      const isMenu: any = document.getElementById("menu-section");
      if (isMenu) {
        isMenu.classList.remove("active");
      }
    }
  };

  function renderView({ style, ...props }: any) {
    const viewStyle = {
      backgroundColor: `rgba(255,255,255,.4)`,
    };
    return (
      <div className="box" style={{ ...style, ...viewStyle }} {...props} />
    );
  }

  const handleMenuItemClick = (item: any) => {
    setProcessorName(item);
    setIsModalOpen(true);
  };

  const handleChange = (name: any, value: any) => {
    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        countryId: value,
        stateId: "",
        processorId: "",
      }));
      setStates([]);
    }
    if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        stateId: value,
        processorId: "",
      }));
      setProcessor([])
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const requiredFields = ["countryId", "stateId", "processorId"];

  const validateField = (
    name: string,
    value: any,
    dataName: string
  ) => {
    if (dataName === "errors") {
      if (requiredFields.includes(name)) {
        switch (name) {
          case "countryId":
            return processorName !== "Brand" && value?.length === 0 || value === null
              ? "Country is required"
              : "";
          case "stateId":
            return processorName !== "Brand" && value?.length === 0 || value === null
              ? "State is required"
              : "";
          case "processorId":
            return value?.length === 0 || value === null
              ? `${processorName} is required`
              : "";
          default:
            return "";
        }
      } else {
        return "";
      }
    }
  };

  const stringToCamelCase = (str: string): string => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const nameLowerCase = processorName?.toLowerCase()?.split(' ')?.join('-');

    let nameCamelCase;
    // if(nameLowerCase === "container-management-system"){
    //   nameCamelCase = 'containerManagement';
    // }
    // else{
      nameCamelCase = stringToCamelCase(processorName);
    // }

    console.log(nameLowerCase)
    console.log(nameCamelCase)
    sessionStorage.clear();
    const newErrors: any = {};

    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      setErrors(newErrors);
    }
    if (!hasErrors) {
      try {
        const res = await API.get(
          `user/processor-admin?type=${nameLowerCase}&${nameCamelCase}Id=${formData.processorId}`
        );
        if (res.success) {
          const token: any = localStorage.getItem("accessToken");
          setOrgToken(token);
          // localStorage.setItem("orgToken", token);
          // localStorage.setItem("accessToken", res.data.accessToken);
          // if (nameLowerCase !== "admin" && nameLowerCase !== "superadmin") {
          sessionStorage.setItem("User", nameLowerCase)
          // }
          localStorage.setItem("orgToken", res.data.accessToken);
          setFormData({
            countryId: "",
            stateId: "",
            processorId: "",
          });
          setErrors({});
          setProcessorName("");
          router.push(`/${nameLowerCase}/dashboard`);
          getMenuList();
          setIsModalOpen(false);
        }
      } catch (error) {
        console.log(error);
        setErrors({});
      }
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = React.useRef<HTMLDivElement>(null);

    const selectedCountry = country?.find((item: any) => {
      return item?.id === formData?.countryId;
    });

    const selectedStates = states?.find((item: any) => {
      return item?.id === formData?.stateId;
    });

    const selectedProcessors = processor?.find((item: any) => {
      return item?.id === formData?.processorId;
    });

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Select {processorName}</h3>
                <button
                  className="text-[20px]"
                  onClick={() => {
                    setErrors({});
                    setFormData({
                      countryId: "",
                      stateId: "",
                      processorId: "",
                    });
                    setIsModalOpen(!isModalOpen);
                  }}
                >
                  &times;
                </button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      {processorName !== "Brand" &&
                        <>
                          <div className="col-12  mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Country Name*
                            </label>
                            <Select
                              defaultValue={{
                                value: selectedCountry?.id,
                                label: selectedCountry?.county_name || "Select",
                              }}
                              isSearchable
                              isLoading={selectLoading.isCountryLoading}
                              loadingMessage={() => 'Countries are Loading'}
                              name="countryId"
                              menuShouldScrollIntoView={false}
                              isClearable
                              placeholder="Select"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={
                                (country || []).map(({ id, county_name }: any) => ({
                                  label: county_name,
                                  value: id,
                                })) as unknown as readonly (
                                  | string
                                  | GroupBase<string>
                                )[]
                              }
                              onChange={(item: any) =>
                                handleChange("countryId", item?.value)
                              }
                            />
                            {errors?.countryId !== "" && (
                              <div className="text-sm text-red-500">
                                {errors.countryId}
                              </div>
                            )}
                          </div>

                          <div className="col-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              State Name*
                            </label>
                            <Select
                              defaultValue={{
                                value: selectedStates?.id,
                                label: selectedStates?.state_name || "Select",
                              }}
                              isSearchable
                              name="stateId"
                              menuShouldScrollIntoView={false}
                              isLoading={selectLoading.isStatesLoading}
                              loadingMessage={() => 'States are Loading'}
                              isClearable
                              placeholder={selectLoading.isStatesLoading ? "Loading" : "Select"}
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={
                                (states || []).map(({ id, state_name }: any) => ({
                                  label: state_name,
                                  value: id,
                                })) as unknown as readonly (
                                  | string
                                  | GroupBase<string>
                                )[]
                              }
                              onChange={(item: any) =>
                                handleChange("stateId", item?.value)
                              }
                            />
                            {errors?.stateId !== "" && (
                              <div className="text-sm text-red-500">
                                {errors.stateId}
                              </div>
                            )}
                          </div>
                        </>
                      }
                      <div className="col-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {processorName} Name*
                        </label>
                        <Select
                          defaultValue={{
                            value: selectedProcessors?.id,
                            label: (processorName === 'Brand' ? selectedProcessors?.brand_name : selectedProcessors?.name) || "Select",
                          }}
                          isSearchable
                          name="processorId"
                          isLoading={selectLoading.isProcessorLoading}
                          loadingMessage={() => `${processorName} are Loading`}
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder={selectLoading.isProcessorLoading ? "Loading" : "Select"}
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={
                            (processor || []).map((item: any) => ({
                              label: processorName === 'Brand' ? item.brand_name : item.name,
                              value: item.id,
                            })) as unknown as readonly (
                              | string
                              | GroupBase<string>
                            )[]
                          }
                          onChange={(item: any) =>
                            handleChange("processorId", item?.value)
                          }
                        />
                        {errors?.processorId !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.processorId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={(event) => {
                            handleSubmit(event);
                          }}
                        >
                          Submit
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            setIsModalOpen(!isModalOpen);
                            setErrors({});
                            setFormData({
                              countryId: "",
                              stateId: "",
                              processorId: "",
                            });
                            setProcessorName("");
                          }}
                        >
                          Cancel
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

  const LoginAs: React.FC<{
    data: any;
    id: number;
  }> = ({ data, id }) => {
    // function Loader() {
    //   return (
    //     <div className="text-center w-full min-h-[20px] flex justify-center items-center">
    //       <div role="status">
    //         <svg aria-hidden="true" className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    //           <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
    //           <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
    //         </svg>
    //         <span className="sr-only">Loading...</span>
    //       </div>
    //     </div>
    //   );
    // }

    const ProcessorCard: React.FC<{
      processor: any;
      type: string;
      path: string;
      name: string;
    }> = ({ processor, type, path, name }) => {
      const router = useRouter();

      const handleProcessorLogin = async (processorname: string, processorId: number) => {
        try {
          setLoadingProc(true);
          const res = await API.get(
            `user/processor-admin?type=${processorname}&${processorname}Id=${processorId}`
          );
          if (res.success) {
            localStorage.setItem("accessToken", res.data.accessToken)
            sessionStorage.clear();
            setShowLoginProcessor(false);
            setLoadingProc(false);
            router.push(path);
          }
        } catch (error) {
          console.log(error);
          setLoadingProc(false);
        }
      }
      return (
        <div className="sm:w-100 lg:w-1/2 md:w-1/2 p-4 ">
          <div className="border border-gray-300 rounded-lg shadow-md p-6 hover:cursor-pointer hover:shadow-lg transition duration-300" onClick={() => handleProcessorLogin(name, processor.id)}>
            <p className="font-bold text-lg mt-4 mb-2">Processor Type:</p>
            <p>{type}</p>
            <p className="font-bold text-lg mb-2">Processor Name:</p>
            <p>{processor.name}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {loadingProc ?
          <Loader /> :
          <div className="fixPopupFilters fixWidth flex w-full align-items-center z-10 fixed justify-center top-0 left-0 right-0 bottom-0 p-3">
            <div className="bg-gray-100 h-auto  rounded-lg shadow-md p-3">
              <p className="text-right">
                <button
                  className="text-[25px] "
                  onClick={() => setShowLoginProcessor(!showLoginProcessor)}
                >
                  &times;
                </button>
              </p>
              <div className="flex justify-center">
                <h1 className="text-3xl font-bold mb-8">Switch Profile To</h1>
              </div>

              <div className="flex flex-wrap justify-center overflow-y-scroll h-[500px]">
                {(data.mandi && data.role.user_role !== "Mandi") && <ProcessorCard processor={data.mandi} type="Mandi" path="/mandi/dashboard" name="mandi" />}
                {(data.mill && data.role.user_role !== "Mill") && <ProcessorCard processor={data.mill} type="Mill" path="/mill/dashboard" name="mill" />}
                {/* {(data.knitter && data.role.user_role !== "Knitter") && <ProcessorCard processor={data.knitter} type="Knitter" path="/knitter/dashboard" name="knitter" />}
                {(data.weaver && data.role.user_role !== "Weaver") && <ProcessorCard processor={data.weaver} type="Weaver" path="/weaver/dashboard" name="weaver" />}
                {(data.garment && data.role.user_role !== "Garment") && <ProcessorCard processor={data.garment} type="Garment" path="/garment/dashboard" name="garment" />}
                {(data.fabric && data.role.user_role !== "Fabric") && <ProcessorCard processor={data.fabric} type="Fabric" path="/fabric/dashboard" name="fabric" />} */}
              </div>

            </div>
          </div>
        }
      </>
    );
  }


  return (
    <>
      <section
        id="menu-section"
        className={`navigation-menu-left-wrapper ${isMenuCollapsed ? "navigation-collapsed" : ""
          }`}
      >
        <div className="navigation-top">
          <Link prefetch={true} className="logo-wrapper" href={dashboardUrl}>
            <span className="logo">
              <img src="/images/logo.svg" />
            </span>
            <span className="logo-power-by">
              <img src="/images/logo-text.svg" />
              <span className="small">Powered by</span>
              <span>RiceTraceability</span>
            </span>
          </Link>
          <div className="menu-toggle">
            <OverlayTrigger placement="right" overlay={tooltip("Menu")}>
              <button
                className="btn btn-link"
                type="button"
                onClick={handleToggle}
              >
                <a className="text-white">
                  <i className="icon-menu-left" />
                </a>
                <span>Menu</span>
              </button>
            </OverlayTrigger>
          </div>
        </div>
        <div className="navigation-menu myNavSetting h-[100vh]">
          <Scrollbars
            renderThumbVertical={renderView}
            autoHide
            autoHideTimeout={5000}
            autoHideDuration={500}
            autoHeight
            autoHeightMin={0}
            autoHeightMax={200}
            thumbMinSize={30}
            universal={true}
          >
    
            {(dashboardUrl !== "/fabric/dashboard" && dashboardUrl !== "/lab/dashboard" && dashboardUrl !== "/brand/dashboard") && (
            
              <div className="navigation-item">
                <Link
                  className={
                    pathname.startsWith(dashboardUrl)
                      ? "navigation-menu-item active"
                      : "navigation-menu-item"
                  }
                  href={dashboardUrl}
                  prefetch={true}
                >
                  <OverlayTrigger
                    placement="right"
                    overlay={tooltip("Dashboard")}
                  >
                    <>
                      <i className="icon-Isolation_Mode" />
                      <span>Dashboard</span>
                    </>
                  </OverlayTrigger>
                </Link>
              </div>
            )}
            {/* Dynamic Side Navigation Menu */}
            {menuAccessList.length<=0 ? 
            <>
              <div className="flex flex-col items-center animate-bounce-pulse space-y-4">
                <div className="w-9 h-9 bg-gray-200 rounded-full shadow-lg"></div>
              </div>
            </> : 
            menuAccessList?.map((item: any, name: any, index: any) => (
              <div key={item.id} className="navigation-item dropend">
                {item.childrens ? (
                  <Dropdown autoClose={true}
                    className={`mydaynamicDropdown ${isItemActive(item, index) ? "active" : ""
                      }`}
                    drop="end"
                  >
                    <OverlayTrigger
                      placement="right"
                      overlay={tooltip(item.item)}
                    >
                      <Dropdown.Toggle id="dropdown-basic">
                        <item.icon />
                        <span>{item.item}</span>
                      </Dropdown.Toggle>
                    </OverlayTrigger>
                    <Dropdown.Menu className="sideBarSetting">
                      <label>{item.item}</label>
                      <Scrollbars
                        renderThumbVertical={renderView}
                        autoHide
                        autoHideTimeout={5000}
                        autoHideDuration={500}
                        autoHeight
                        autoHeightMin={0}
                        autoHeightMax={200}
                        thumbMinSize={30}
                        universal={true}
                      >
                        {item.childrens?.map((child: any, index: any) => (
                          <div key={child.id}>
                            {child.childrens ? (
                              <>
                                <Accordion key={child.id}>
                                  <Accordion.Item
                                    eventKey="0"
                                    className="bg-transparent"
                                  >
                                    <Accordion.Header>
                                      <child.icon />
                                      {""}
                                      {child.item}
                                    </Accordion.Header>
                                    {child.childrens?.map(
                                      (subChild: any, subIndex: any) =>
                                        subChild.path ? (
                                          <Accordion.Body
                                            key={subChild.id}
                                            className="visible p-0"
                                          >
                                            <NavLink
                                              href={subChild.path}
                                              key={subIndex}
                                              onClick={handleClick}
                                              prefetch={true}
                                            >
                                              {/* <Dropdown.Item key={subChild.id} href="#/action-1"> */}
                                              <subChild.icon />
                                              {subChild.item}
                                              {/* </Dropdown.Item> */}
                                            </NavLink>
                                          </Accordion.Body>
                                        ) : (
                                          <Accordion.Body
                                            key={subChild.id}
                                            className="visible p-0"
                                          >
                                            <Dropdown.Item
                                              key={subChild.id}
                                              href="#/action-1"
                                              onClick={handleClick}
                                            >
                                              <subChild.icon />
                                              {subChild.item}
                                            </Dropdown.Item>
                                          </Accordion.Body>
                                        )
                                    )}
                                  </Accordion.Item>
                                </Accordion>
                              </>
                            ) : (
                              <>
                                {child.path ? (
                                  <NavLink href={child.path} key={index}
                                    onClick={handleClick}
                                    prefetch={true}
                                  >
                                    {/* <Dropdown.Item key={child.id} href="#/action-1"> */}
                                    <child.icon />
                                    {child.item}
                                    {/* </Dropdown.Item> */}
                                  </NavLink>
                                ) : (
                                  <Dropdown.Item
                                    key={child.id}
                                    onClick={() => {
                                      handleMenuItemClick(child.item),
                                        handleClick
                                    }}
                                  >
                                    <child.icon />
                                    {child.item}
                                  </Dropdown.Item>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </Scrollbars>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <NavLink
                    href={item.path}
                    key={index}
                    className={`navigation-menu-item ${isItemActive(item, index) ? "active" : ""
                      }`}
                    prefetch={true}
                  >
                    <OverlayTrigger
                      placement="right"
                      overlay={tooltip(item.item)}
                    >
                      {/* <Link href={item.path} key={index}> */}
                      {/* <Dropdown.Item key={child.id} href="#/action-1"> */}
                      <>
                        <item.icon />
                        <span>{item.item}</span>
                      </>
                      {/* </Dropdown.Item> */}
                      {/* </Link> */}

                    </OverlayTrigger>
                  </NavLink>
                )}
              </div>
            ))}
            {((processorDetails && processorDetails.processor?.length > 1) && !orgToken) && (
              <div className="navigation-item dropend">
                <OverlayTrigger placement="right" overlay={tooltip("Switch Profile")}>
                  <button className="navigation-menu-item" onClick={() => setShowLoginProcessor(true)}>
                    <RxAvatar size={20} />
                    <span>Switch Profile</span>
                  </button>
                </OverlayTrigger>
              </div>
            )}
            {orgToken && (
              <div className="navigation-item dropend">
                <OverlayTrigger placement="right" overlay={tooltip("Back To Admin")}>
                  <button className="navigation-menu-item" onClick={backToAdmin}>
                    <IoArrowBackCircleOutline size={20} />
                    <span>Back To Admin</span>
                  </button>
                </OverlayTrigger>
              </div>
            )}
          </Scrollbars>
        </div>
        <div className="navigation-bottom">
          <OverlayTrigger placement="right" overlay={tooltip("Logout")}>
            <button className="btn btn-link" onClick={logout}>
              <i className="icon-logout"></i> <span>Logout</span>
            </button>
          </OverlayTrigger>
        </div>
      </section>

      <div className="relative">
        <FilterPopup openFilter={isModalOpen} onClose={!isModalOpen} />
      </div>

      {showLoginProcessor &&
        <LoginAs
          data={processorDetails}
          id={processorDetails?.user?.id}
        />
      }
    </>
  );
}
