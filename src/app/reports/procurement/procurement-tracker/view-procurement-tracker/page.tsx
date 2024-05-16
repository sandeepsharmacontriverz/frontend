"use client"
import React, { useState, useEffect, useRef } from 'react'
import CommonDataTable from '@components/core/Table';
import Link from "@components/core/nav-link";
import { BiFilterAlt } from 'react-icons/bi';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import API from '@lib/Api';
import { handleDownload } from '@components/core/Download';
import Multiselect from 'multiselect-react-dropdown';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@lib/router-events';
import Loader from '@components/core/Loader';
import User from '@lib/User';

const page = () => {
  const [roleLoading] = useRole()
  const [isClient, setIsClient] = useState(false)
  const search = useSearchParams();
  const seasonId = search.get('id');
  const seasonName = search.get('season');

  const { translations, loading } = useTranslations();
  useTitle(translations?.reports?.procurementTracker + " " + seasonName);

  const router = useRouter();
  const [data, setData] = useState<any>([])
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [country, setCountry] = useState([]);
  const [checkedCountries, setCheckedCountries] = useState<any>([]);
  const [checkedSeason, setCheckedSeason] = useState<any>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [isClear, setIsClear] = useState(false);

  const code = encodeURIComponent(searchQuery);
  const brandId = User.brandId;

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (seasonId) {
      getReports(),
        getCountry();
    }
  }, [seasonId, isClear, page, limit, searchQuery, brandId])


  const searchData = (e: any) => {
    setSearchQuery(e.target.value)
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  const handleExport = async () => {
    const url = `reports/export-ginner-pscp-precurement-report?seasonId=${seasonId}&countryId=${checkedCountries}&page=${page}&limit=${limit}&search=${code}&pagination=true`
    try {
      const response = await API.get(url)
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, 'Rice Traceability- Procurement Tracker Report', '.xlsx')
        }
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const getReports = async () => {
    const url = `reports/get-ginner-pscp-precurement-report?brandId=${brandId ? brandId : ''}&seasonId=${seasonId}&countryId=${checkedCountries}&search=${code}&page=${page}&limit=${limit}&pagination=true`
    try {
      const response = await API.get(url)
      if (response.success) {
        setData(response.data)
        setCount(response.count)
      }
    }
    catch (error) {
      setCount(0)
    }
  };

  const getCountry = async () => {
    const url = "location/get-countries?status=true"
    try {
      const response = await API.get(url)
      if (response.success) {
        const res = response.data
        setCountry(res)
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeason.includes(itemId)) {
        setCheckedSeason(
          checkedSeason.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeason([...checkedSeason, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setCheckedCountries([])
    setCheckedSeason([])
    setIsClear(!isClear)
  }

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-0 left-0 right-0 bottom-0 p-3 ">
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">{translations?.common?.Filters}</h3>
                <button className="text-[20px]" onClick={() => setShowFilter(!showFilter)}>&times;</button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      <div className="col-12 col-sm-12 col-md-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectCountry}
                        </label>
                        <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={country?.filter((item: any) => checkedCountries.includes(item.id))}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(selectedList, selectedItem, "countries", true)
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => handleFilterChange(selectedList, selectedItem, "countries", true)}
                          options={country}
                          showCheckbox
                        />
                      </div>
                      {/* <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Seasons
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={season?.filter((item: any) =>
                            checkedSeason.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "seasons",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "seasons"
                            )
                          }
                          options={season}
                          showCheckbox
                        />
                      </div> */}
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getReports()
                            setShowFilter(false)
                          }
                          }
                        >
                          {translations?.common?.ApplyAllFilters}
                        </button>
                        <button className="btn-outline-purple" onClick={clearFilter}>{translations?.common?.ClearAllFilters}</button>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div><Loader /></div>;
  }
  const formatDecimal = (value: string | number): string | number => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (Number.isFinite(numericValue)) {
      const formattedValue = numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(2);
      return formattedValue.toString().replace(/\.00$/, '');
    }

    return numericValue;
  };
  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations.common.srNo}</p>),
      width: '70px',
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.ginnerName}</p>),
      wrap: true,
      selector: (row: any) => row.ginner?.name
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.procuredSeedCottonMT}</p>),
      selector: (row: any) => formatDecimal(row.procurement_seed_cotton),
      wrap: true,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.procuredLintCottonMT}</p>),
      selector: (row: any) => formatDecimal(row.procured_lint_cotton),
      wrap: true,

    }, {
      name: (<p className="text-[13px] font-medium">{translations.mandiInterface.noOfBales}</p>),
      selector: (row: any) => row.no_of_bales,
      wrap: true,

    }, {
      name: (<p className="text-[13px] font-medium">{translations.transactions.totalQuantityLintProducedMT}</p>),
      selector: (row: any) => formatDecimal(row.total_qty_lint_produced),
      wrap: true,

    }, {
      name: (<p className="text-[13px] font-medium">{translations.transactions.soldBales}</p>),
      selector: (row: any) => row.sold_bales,
      wrap: true,

    }, {
      name: (<p className="text-[13px] font-medium">{translations.transactions.averageBaleWeightKgs}</p>),
      selector: (row: any) => formatDecimal(row.average_weight),
      wrap: true,

    }, {
      name: (<p className="text-[13px] font-medium">  {translations.transactions.totalQuantityLintSoldMT}</p>),
      selector: (row: any) => formatDecimal(row.total_qty_sold_lint),
      wrap: true,

    }, {
      name: (<p className="text-[13px] font-medium">{translations.transactions.balanceStockbales}</p>),
      selector: (row: any) => row.balace_stock,
      wrap: true,

    }, {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.balanceLintQuantityStockMT}
        </p>
      ),
      cell: (row: any) => {
        const balanceLintQuantity: any = formatDecimal(row.balance_lint_quantity);
        return balanceLintQuantity < 0 ? formatDecimal(0) : balanceLintQuantity;
      },
      wrap: true,
    }

  ];

  if (!roleLoading) {
    return (
      <div >
        {isClient ? (
          <div >
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href={brandId ? "/brand/dashboard" : "/dashboard"}>
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>{translations.common.reports}</li>
                    <li><Link href="/reports/procurement">Procurement</Link></li>
                    <li>{translations?.reports?.procurementTracker}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form ">
                  <div className="table-minwidth w-100">
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
                          <button className="flex" type="button" onClick={() => setShowFilter(!showFilter)} >
                            {translations?.common?.Filters} <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showFilter}
                              onClose={!showFilter}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='flex customButtonGroup'>
                        <div className="search-filter-right">
                          <button className="btn-purple text-sm m-2" onClick={() => router.push('/reports/procurement')} >{translations.common.back}</button>
                          <button className="py-1.5 border-0 px-4 m-2 rounded bg-yellow-500 text-white font-bold text-sm" onClick={() => { handleExport() }} >{translations.common.export}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          'Loading...'
        )}
      </div>
    )
  }
}

export default page
