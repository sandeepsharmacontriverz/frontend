"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "@lib/router-events";

import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import DataTable from "react-data-table-component";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import useRole from "@hooks/useRole";
import Select, { GroupBase } from "react-select";


let uncreatable_menus = new Array(8, 10, 11, 12, 13, 15, 18, 19, 21, 26, 30);
// new Array(18, 20, 14, 17, 24, 26, 23, 21, 27, 29, 8, 10, 11, 12, 13, 33, 49, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 102, 103, 101, 98, 99, 100, 106, 104, 105, 66)
let uneditable_menus = new Array(10, 11, 12, 13, 26, 30)
// new Array(19, 15.16, 25, 91, 22, 90, 28, 92, 10, 11, 12, 13, 33, 49, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 102, 103, 101, 98, 99, 100, 106, 104, 105, 66)
let undeletable_menus = new Array(10, 11, 12, 13, 15, 18, 19, 21, 26, 30)
// new Array(18, 20, 14, 17, 24, 26, 23, 21, 27, 29, 10, 11, 12, 13, 33, 49, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 102, 103, 101, 98, 99, 100, 106, 104, 105, 66)

export default function addMenuEntitlement() {
  useTitle("Add Role");
  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [roleLoading] = useRole();

  const [userCategory, setUserCategory] = useState<any>([]);
  const [userMenuList, setUserMenuList] = useState<any>([]);
  const [userPrivileges, setUserPrivileges] = useState<any>([]);

  const [roleData, setRoleData] = useState<any>([]);
  const [isBrandSelected, setIsBrandSelected] = useState<any>(false);
  const [brandList, setBrandList] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(true);

  const [formData, setFormData] = useState<any>({
    categoryId: "",
    userRole: "",
    privileges: [],
  });

  const [headerRow, setHeaderRow] = useState<any>({
    create: false,
    view: false,
    edit: false,
    delete: false,
  });

  useEffect(() => {
    getCategories();
    getBrands();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      getMenuList();
    }
  }, [formData.categoryId]);

  useEffect(() => {
    if (userMenuList?.length > 0) {
      const combinedData = userMenuList.map((menuItem: any) => {
        const privilegesItem = userPrivileges.find(
          (privilegesItem: any) => privilegesItem.menu_id === menuItem.id
        );
        return {
          ...menuItem,
          create: privilegesItem ? privilegesItem.create_privilege : false,
          view: privilegesItem ? privilegesItem.view_privilege : false,
          edit: privilegesItem ? privilegesItem.edit_privilege : false,
          delete: privilegesItem ? privilegesItem.delete_privilege : false,
        };
      });

      setRoleData(combinedData);
      const filtered = combinedData
        .filter((menu: any) => {
          return !(
            menu.create === false &&
            menu.delete === false &&
            menu.edit === false &&
            menu.view === false
          );
        })
        .map((item: any) => {
          return {
            ...item,
            menuId: item.id,
          };
        });

      setFormData((prevData: any) => ({
        ...prevData,
        privileges: filtered,
      }));
    }
  }, [userMenuList, userPrivileges]);

  const getCategories = async () => {
    const res = await API.get("user/get-user-categories");
    if (res.success) {
      const category = res.data?.filter((val: any) => {
        return val.category_name === 'Superadmin' || val.category_name === "Brand" || val.category_name === 'Admin' || val.category_name === 'Mandi' || val.category_name === 'Mill' || val.category_name === 'Third_Party_Inspection' || val.category_name === 'Lab' || val.category_name === 'Container_Management_System' || val.category_name === 'Farm' || val.category_name === 'Garment' || val.category_name === 'Fabric' || val.category_name === "Developer"
      })
      setUserCategory(category);
    }
  };

  const getMenuList = async () => {
    const res = await API.get(
      `user/get-menu-list?categoryId=${formData.categoryId}`
    );
    if (res.success) {
      setUserMenuList(res.data);
    }
  };

  const getBrands = async () => {
    const res = await API.get(`brand`);
    if (res.success) {
      setBrandList(res.data);
    }
  };

  const handleCancel = () => {
    router.push('/role/menu-entitlement');
  };

  const handleHeaderCheckboxChange = (e: any) => {
    const { name, checked } = e.target;
    setHeaderRow((prevData: any) => {
      return {
        ...prevData,
        [name]: checked,
      };
    });
    const updatedData = roleData.map((row: any) => {
      if (name === "create") {
        if (checked) {
          return {
            ...row,
            [name]:
              uncreatable_menus && !uncreatable_menus?.includes(row.id)
                ? checked
                : false,
            view:
              uncreatable_menus && !uncreatable_menus?.includes(row.id)
                ? checked
                : false,
          };
        } else {
          return {
            ...row,
            [name]:
              uncreatable_menus && !uncreatable_menus?.includes(row.id)
                ? checked
                : false,
          };
        }
      } else if (name === "edit") {
        if (checked) {
          return {
            ...row,
            [name]:
              uneditable_menus && !uneditable_menus?.includes(row.id)
                ? checked
                : false,
            view:
              uneditable_menus && !uneditable_menus?.includes(row.id)
                ? checked
                : false,
          };
        } else {
          return {
            ...row,
            [name]:
              uneditable_menus && !uneditable_menus?.includes(row.id)
                ? checked
                : false,
          };
        }
      } else if (name === "delete") {
        if (checked) {
          return {
            ...row,
            [name]:
              undeletable_menus && !undeletable_menus?.includes(row.id)
                ? checked
                : false,
            view:
              undeletable_menus && !undeletable_menus?.includes(row.id)
                ? checked
                : false,
          };
        } else {
          return {
            ...row,
            [name]:
              undeletable_menus && !undeletable_menus?.includes(row.id)
                ? checked
                : false,
          };
        }
      } else {
        return {
          ...row,
          [name]: checked,
        };
      }
    });
    setRoleData(updatedData);

    const filtered = updatedData
      .filter((menu: any) => {
        return !(
          menu.create === false &&
          menu.delete === false &&
          menu.edit === false &&
          menu.view === false
        );
      })
      .map((item: any) => {
        return {
          ...item,
          menuId: item.id,
        };
      });

    setFormData((prevData: any) => ({
      ...prevData,
      privileges: filtered,
    }));
  };

  const handleRowCheckboxChange = (id: any, e: any) => {
    const { name, checked } = e.target;

    const updatedData = roleData.map((row: any) => {
      if (row.id === id) {
        if (name === "create") {
          if (checked) {
            return {
              ...row,
              [name]:
                uncreatable_menus && !uncreatable_menus?.includes(row.id)
                  ? checked
                  : false,
              view:
                uncreatable_menus && !uncreatable_menus?.includes(row.id)
                  ? checked
                  : false,
            };
          } else {
            return {
              ...row,
              [name]:
                uncreatable_menus && !uncreatable_menus?.includes(row.id)
                  ? checked
                  : false,
            };
          }
        } else if (name === "edit") {
          if (checked) {
            return {
              ...row,
              [name]:
                uneditable_menus && !uneditable_menus?.includes(row.id)
                  ? checked
                  : false,
              view:
                uneditable_menus && !uneditable_menus?.includes(row.id)
                  ? checked
                  : false,
            };
          } else {
            return {
              ...row,
              [name]:
                uneditable_menus && !uneditable_menus?.includes(row.id)
                  ? checked
                  : false,
            };
          }
        } else if (name === "delete") {
          if (checked) {
            return {
              ...row,
              [name]:
                undeletable_menus && !undeletable_menus?.includes(row.id)
                  ? checked
                  : false,
              view:
                undeletable_menus && !undeletable_menus?.includes(row.id)
                  ? checked
                  : false,
            };
          } else {
            return {
              ...row,
              [name]:
                undeletable_menus && !undeletable_menus?.includes(row.id)
                  ? checked
                  : false,
            };
          }
        } else {
          return {
            ...row,
            [name]: checked,
          };
        }
      }
      return row;
    });
    setRoleData(updatedData);

    const filtered = updatedData
      .filter((menu: any) => {
        return !(
          menu.create === false &&
          menu.delete === false &&
          menu.edit === false &&
          menu.view === false
        );
      })
      .map((item: any) => {
        return {
          ...item,
          menuId: item.id,
        };
      });

    setFormData((prevData: any) => ({
      ...prevData,
      privileges: filtered,
    }));
  };

  const alreadyExistName = async (name: string, value: string) => {
    const res = await API.post("user/check-role", {
      [name]: value
    });

    if (res?.data?.exist === true) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "Role Name Already Exists. Please Try Another",
      }));
    }
    else {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  }
  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value != "") {
      alreadyExistName(name, value);
    }
  }

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "categoryId") {
      setIsBrandSelected(false);
      let isBrand = userCategory?.filter(
        (item: any) => item.category_name === "Brand" && item.id == value
      );
      if (isBrand?.length > 0) {
        setIsBrandSelected(true);
      }
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
        userRole: ""
      }));
      setErrors((prevData: any) => ({
        ...prevData,
        userRole: "",
      }));
    }

    if (name === "brandId") {
      setIsSubmitting(true);
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
        userRole: ""
      }));

    }

    if (name === "userRole") {
      setIsSubmitting(true);
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
        brandId: null
      }));
      setErrors((prevData: any) => ({
        ...prevData,
        brandId: "",
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


  const handleSubmit = async () => {
    const regex: any = /^[a-zA-Z_]*$/;
    const valid = regex.test(formData.userRole)
    let isError = false;
    if (!formData.categoryId) {
      setErrors((prevData: any) => ({
        ...prevData,
        categoryId: "User Category is Required",
      }));
      isError = true;
    }

    if (!isBrandSelected && !valid) {
      setErrors((prevData: any) => ({
        ...prevData,
        userRole: "Enter Only Alphabets"
      }))
      isError = true;
    }

    if (!isBrandSelected && (formData.userRole === "" || !formData.userRole)) {
      setErrors((prevData: any) => ({
        ...prevData,
        userRole: "User Role is Required",
      }));

      isError = true;
    }
    if (isBrandSelected && (formData.brandId === "" || !formData.brandId)) {
      setErrors((prevData: any) => ({
        ...prevData,
        brandId: "Brand is required",
      }));
      isError = true;
    }

    if (isSubmitting === true && !errors.userRole) {
      if (!isError) {
        const res = await API.post("user/set-user-role", {
          categoryId: Number(formData.categoryId),
          userRole: !isBrandSelected ? formData.userRole : "",
          brandId: isBrandSelected ? Number(formData.brandId) : null,
          privileges: formData.privileges,
        });

        if (res.success) {
          router.push('/role/menu-entitlement');
          toasterSuccess("Role Created Successfully", 3000, res.data.role.id);
          setIsSubmitting(false);
        } else {
          toasterError(res.error?.code);
          setIsSubmitting(true);
        }
      }
    }
  };

  if (loading || roleLoading) {
    return <div> <Loader /></div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => index + 1,
      width: "70px",
    },
    {
      name: translations.menuEntitlement.menuName,
      selector: (row: any) => row.menu_name,
      width: "300px",
    },
    {
      name: (
        <div className="flex justify-between w-14 ">
          {translations.menuEntitlement.create}
          <input
            name="create"
            type="checkbox"
            value={headerRow.create}
            onChange={handleHeaderCheckboxChange}
          />
        </div>
      ),
      cell: (row: any) => (
        <div>
          {uncreatable_menus && !uncreatable_menus?.includes(row.id) ? (
            <input
              type="checkbox"
              name="create"
              checked={row.create}
              onChange={(e) => handleRowCheckboxChange(row.id, e)}
            />
          ) : (
            "N/A"
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: (
        <div className="flex justify-between w-12 ">
          {translations.menuEntitlement.view}
          <input
            name="view"
            type="checkbox"
            value={headerRow.view}
            onChange={handleHeaderCheckboxChange}
          />
        </div>
      ),

      cell: (row: any) => (
        <div>
          <input
            type="checkbox"
            name="view"
            checked={row.view}
            onChange={(e) => handleRowCheckboxChange(row.id, e)}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: (
        <div className="flex justify-between w-10 ">
          {translations.menuEntitlement.edit}
          <input
            name="edit"
            type="checkbox"
            value={headerRow.edit}
            onChange={handleHeaderCheckboxChange}
          />
        </div>
      ),

      cell: (row: any) => (
        <div>
          {uneditable_menus && !uneditable_menus?.includes(row.id) ? (
            <input
              name="edit"
              type="checkbox"
              checked={row.edit}
              onChange={(e) => handleRowCheckboxChange(row.id, e)}
            />
          ) : (
            "N/A"
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: (
        <div className="flex justify-between w-14 ">
          {translations.menuEntitlement.delete}
          <input
            name="delete"
            type="checkbox"
            value={headerRow.delete}
            onChange={handleHeaderCheckboxChange}
          />
        </div>
      ),

      cell: (row: any) => (
        <div>
          {undeletable_menus && !undeletable_menus?.includes(row.id) ? (
            <input
              name="delete"
              type="checkbox"
              checked={row.delete}
              onChange={(e) => handleRowCheckboxChange(row.id, e)}
            />
          ) : (
            "N/A"
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <NavLink href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>Role</li>
              <li>
                <NavLink href="/role/menu-entitlement">Menu & Entitlement</NavLink>
              </li>
              <li>Add Role</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12  col-sm-6 mt-4">
          <label className="text-gray-500 text-[12px] font-medium">User Category</label>
          <Select
            name="categoryId"
            value={formData.categoryId ? { label: userCategory?.find((users: any) => users.id === formData.categoryId)?.category_name, value: formData.categoryId } : null}
            menuShouldScrollIntoView={false}
            isClearable
            placeholder="Select User Category"
            className="z-[1] dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
            options={(userCategory || []).map(({ id, category_name }: any) => ({
              label: category_name,
              value: id,
              key: id
            }))}
            onChange={(item: any) => {
              handleChange("categoryId", item?.value);
            }}
          />
          {errors.categoryId && (
            <p className="text-red-500 mt-1">{errors.categoryId}</p>
          )}
        </div>
        <div className="col-12  col-sm-6 mt-4 ">
          {isBrandSelected ? (
            <>
              <label className="text-gray-500 text-[12px] font-medium">
                {translations.menuEntitlement.brand}
              </label>
              <Select
                name="brandId"
                value={formData.brandId ? { label: brandList?.find((seasonId: any) => seasonId.id === formData.brandId)?.brand_name, value: formData.brandId } : null}
                menuShouldScrollIntoView={false}
                isClearable
                placeholder="Select Brand"
                className="z-[1] dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                options={(brandList || []).map(({ id, brand_name }: any) => ({
                  label: brand_name,
                  value: id,
                  key: id
                }))}
                onChange={(item: any) => {
                  handleChange("brandId", item?.value);
                }}
              />
              {errors.brandId && (
                <p className="text-red-500 mt-1">{errors.brandId}</p>
              )}
            </>
          ) : (

            <div >
              <label className="text-gray-500 text-[12px] font-medium">
                {translations.menuEntitlement.userRole}{" "}
              </label>
              <input
                type="text"
                name="userRole"
                autoComplete="off"
                onBlur={onBlurCheck}
                placeholder={translations.menuEntitlement.roleName}
                className="w-full shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                value={formData.userRole || ""}
                onChange={(e) => handleChange("userRole", e.target.value)}
              />
              {errors.userRole && (
                <p className="text-red-500 mt-1">{errors.userRole}</p>
              )}
            </div>
          )}
        </div>


        {/* <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="search-filter-row">
                <div className="search-filter-left ">
                  <div className="search-bars">
                    <form className="form-group mb-0 search-bar-inner" >
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
            </div>
          </div>
        </div> */}
      </div >

      <div className="mt-10 border">
        <DataTable
          persistTableHead
          fixedHeader={true}
          className="z-0"
          noDataComponent={""}
          fixedHeaderScrollHeight={"500px"}
          columns={columns}
          data={roleData}
        />
      </div>
      <div className="pt-12 w-100 d-flex justify-end customButtonGroup mb-2">
        <section>
          <button
            className="btn-purple mr-2"
            disabled={!isSubmitting}
            style={
              !isSubmitting
                ? { cursor: "not-allowed", opacity: 0.8 }
                : { cursor: "pointer", backgroundColor: "#D15E9C" }
            }
            onClick={handleSubmit}
          >
            SUBMIT
          </button>
          <button
            className="btn-outline-purple"
            onClick={handleCancel}

          >
            CANCEL
          </button>
        </section>
      </div>
    </div >
  );
}
