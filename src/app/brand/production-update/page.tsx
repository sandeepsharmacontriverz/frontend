"use client";
import React, { useState, useRef, useEffect } from "react";
import DashboardButtons from "../components/core/DashboardButtons";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import CommonDataTable from '@components/core/Table';


export default function page() {
  const { translations, loading } = useTranslations();

  useTitle("Production-Update");
  const [roleLoading] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [checkedCountry, setCheckedCountry] = useState<any>([]);
  const [checkedDepartment, setCheckedDepartment] = useState<any>([]);
  const [checkedProduct, setCheckedProduct] = useState<any>([]);
  const [checkedFabric, setCheckedFabric] = useState<any>([]);
  const [checkedYarn, setCheckedYarn] = useState<any>([]);
  const [checkedDate, setCheckedDate] = useState<any>([]);
  const [checkedGinner, setCheckedGinner] = useState<any>([]);
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [data, setData] = useState([])
  const [countries, setCountries] = useState<any>([]);
  const [isActive, setIsActive] = useState<any>({
    year: false,
    country: false,
    department: false,
    product: false,
    fabric: false,
    yarn: false,
    ginner: false,
  });
  useEffect(() => {
    getCountries()
  }, [])

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true")
      if (res.success) {
        setCountries(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const clearFilter = () => {
    setCheckedCountry([])
    setCheckedDepartment([])
    setCheckedProduct([])
    setCheckedFabric([])
    setCheckedGinner([])
    setCheckedFabric([])
    setCheckedYarn([])
    setIsActive({
      country: false,
      department: false,
      product: false,
      fabric: false,
      yarn: false,
      ginner: false,
    })
    setSearchFilter('')
  }
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const handleChange = (itemId: any, name: string) => {
    if (name === 'date') {
      if (checkedDate.includes(itemId)) {
        setCheckedDate(checkedDate.filter((item: any) => item !== itemId));
      } else {
        setCheckedDate([...checkedDate, itemId]);
      }
    }
    else if (name === 'country') {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(checkedCountry.filter((item: any) => item !== itemId));
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
      }
    }
    else if (name === 'department') {
      if (checkedDepartment.includes(itemId)) {
        setCheckedDepartment(checkedDepartment.filter((item: any) => item !== itemId));
      } else {
        setCheckedDepartment([...checkedDepartment, itemId]);
      }
    }
    else if (name === 'product') {
      if (checkedProduct.includes(itemId)) {
        setCheckedProduct(checkedProduct.filter((item: any) => item !== itemId));
      } else {
        setCheckedProduct([...checkedProduct, itemId]);
      }
    }
    else if (name === 'fabric') {
      if (checkedFabric.includes(itemId)) {
        setCheckedFabric(checkedFabric.filter((item: any) => item !== itemId));
      } else {
        setCheckedFabric([...checkedFabric, itemId]);
      }
    }
    else if (name === 'yarn') {
      if (checkedYarn.includes(itemId)) {
        setCheckedYarn(checkedYarn.filter((item: any) => item !== itemId));
      } else {
        setCheckedYarn([...checkedYarn, itemId]);
      }
    }
    else if (name === 'ginner') {
      if (checkedGinner.includes(itemId)) {
        setCheckedGinner(checkedGinner.filter((item: any) => item !== itemId));
      } else {
        setCheckedGinner([...checkedGinner, itemId]);
      }
    }
  }
  const filterData = async () => {
    // try {
    //   const res = await API.get(`organic-integrity?search=${searchFilter}&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}&limit=${limit}&page=${page}&pagination=true`);
    //   if (res.success) {
    //     setData(res.data)
    //     setCount(res.count)
    //     setShowFilter(false)
    //   }
    // } catch (error) {
    //   console.log(error)
    //   setCount(0)
    // }
  }
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

    const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setSearchFilter(e.target.value);
    };

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="absolute flex h-fit w-auto z-40 justify-center bg-transparent  p-3 "
          >
            <div className="bg-white border w-auto py-3  px-2 border-gray-300 shadow-lg rounded-md">
              <input
                type="text"
                name="searchFilter"
                placeholder={translations.common.search}
                className="border bg-inherit rounded text-sm w-80 p-2 mb-3"
                value={searchFilter}
                onChange={filterSearch}
              />

              <div className="filter-accodian"  >
                <span className={`${isActive.year ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  year: !prevData.year
                }))
                }
                >Year</span>
                {isActive.year === true &&
                  <div className="filter-body" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((year: any) => (
                        <div key={year.id}>
                          <input name="brands" id="brands" value={year.id} type="checkbox" checked={checkedDate.includes(year.id)} onChange={() => handleChange(year.id, 'year')} />
                          <span className="text-sm">  {year.brand_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              <div className="filter-accodian" style={{ fontSize: 10 }} >
                <span className={`${isActive.country ? "active" : ""} filters-row filters-links text-md`} onClick={() => {
                  setIsActive((prevData: any) => ({
                    ...prevData,
                    country: !prevData.country
                  }))
                }
                }>Country</span>
                {isActive.country === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((country: any) => (
                        <div key={country.id}>
                          <input name="country" value={country.id} type="checkbox" checked={checkedCountry.includes(country.id)} onChange={() => handleChange(country.id, 'country')} />
                          <span className="text-sm">  {country.county_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              <div className="filter-accodian"  >
                <span className={`${isActive.department ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  department: !prevData.department
                }))

                }>Department</span>
                {isActive.department === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((department: any) => (
                        <div key={department.id}>
                          <input name="department" value={department.id} type="checkbox" checked={checkedDepartment.includes(department.id)} onChange={() => handleChange(department.id, 'department')} />
                          <span className="text-sm">  {department.ics_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>
              <div className="filter-accodian"  >
                <span className={`${isActive.product ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  product: !prevData.product
                }))

                }>Product Supplier</span>
                {isActive.product === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((product: any) => (
                        <div key={product.id}>
                          <input name="product" value={product.id} type="checkbox" checked={checkedProduct.includes(product.id)} onChange={() => handleChange(product.id, 'product')} />
                          <span className="text-sm">  {product.ics_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              <div className="filter-accodian"  >
                <span className={`${isActive.fabric ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  fabric: !prevData.fabric
                }))

                }>Fabric Supplier</span>
                {isActive.fabric === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((fabric: any) => (
                        <div key={fabric.id}>
                          <input name="fabric" value={fabric.id} type="checkbox" checked={checkedFabric.includes(fabric.id)} onChange={() => handleChange(fabric.id, 'fabric')} />
                          <span className="text-sm">  {fabric.ics_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>

              <div className="filter-accodian"  >
                <span className={`${isActive.yarn ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  yarn: !prevData.yarn
                }))

                }>Yarn Supplier</span>
                {isActive.yarn === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((yarn: any) => (
                        <div key={yarn.id}>
                          <input name="yarn" value={yarn.id} type="checkbox" checked={checkedYarn.includes(yarn.id)} onChange={() => handleChange(yarn.id, 'yarn')} />
                          <span className="text-sm">  {yarn.ics_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>
              <div className="filter-accodian"  >
                <span className={`${isActive.ginner ? "active" : ""} filters-row filters-links`} onClick={() => setIsActive((prevData: any) => ({
                  ...prevData,
                  ginner: !prevData.ginner
                }))

                }>Ginner</span>
                {isActive.ginner === true &&
                  <div className="" style={{ display: 'block' }}>
                    <div >
                      {countries?.map((ginner: any) => (
                        <div key={ginner.id}>
                          <input name="ginner" value={ginner.id} type="checkbox" checked={checkedYarn.includes(ginner.id)} onChange={() => handleChange(ginner.id, 'ginner')} />
                          <span className="text-sm">  {ginner.ics_name} </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>


              <div className="pt-3 flex gap-3 w-full px-2">
                <button
                  className="mr-2 w-1/2 text-sm text-blue-900 font-semibold py-2 px-4 rounded-[10px] border-1 border-blue-900"
                  onClick={clearFilter}
                >
                  Clear
                </button>
                <button
                  className="mr-2 bg-blue-900 w-1/2  text-white text-sm font-semibold py-2 px-4 rounded-[10px] border"
                  onClick={filterData}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const columns = [

    {
      name: "Year",
      selector: (row: any) => row.date?.substring(0, 10)
    },
    {
      name: "Department",
      selector: (row: any) => row?.farmGroup?.name,
    }, {
      name: "Processor Name",
      selector: (row: any) => row?.farmGroup?.name,
    }, {
      name: "Category",
      selector: (row: any) => row.test_stage,
    },
    {
      name: "Organic Cotton",
      selector: (row: any) => row?.ics?.ics_name
    }, {
      name: "Yarn ",
      selector: (row: any) => row.seed_lot
    }, {
      name: "(Kgs)",
      selector: (row: any) => row.seal_no
    },
    {
      name: "Woven Fabric(mtrs)",
      selector: (row: any) => row.sample_code
    },
    {
      name: "Product Pcs(NO)",
      selector: (row: any) => row.integrity_score,
      cell: (row: any) => (
        <p>{row.integrity_score ? 'Positive' : 'Negative'}</p>
      ),
    },

  ];
  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Brand</li>
                <li>Prduction Update</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <DashboardButtons />
        </div>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form lr-mCustomScrollbar">
              <div className="table-minwidth min-w-[650px]">
                {/* search */}
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner" >
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search by Farmer name,Group"
                          value={searchQuery}
                          onChange={searchData}
                        />
                        <button type="submit" className="search-btn">
                          <span className="icon-search"></span>
                        </button>
                      </form>
                    </div>


                    <div>
                      <button className="flex" type="button" onClick={() => setShowFilter(!showFilter)} >
                        FILTERS <BiFilterAlt className="m-1" />
                      </button>

                      <div className="relative">
                        <FilterPopup
                          openFilter={showFilter}
                          onClose={!showFilter}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
