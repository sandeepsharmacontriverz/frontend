"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";

import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import DataTable from "react-data-table-component";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import NavLink from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import Select, { GroupBase } from "react-select";


let uncreatable_menus = new Array(8, 10, 11, 12, 13, 15, 18, 19, 21, 26, 30);
// new Array(18, 20, 14, 17, 24, 26, 23, 21, 27, 29, 8, 10, 11, 12, 13, 33, 49, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 102, 103, 101, 98, 99, 100, 106, 104, 105, 66)

let uneditable_menus = new Array(10, 11, 12, 13, 26, 30);
// new Array(19, 15.16, 25, 91, 22, 90, 28, 92, 10, 11, 12, 13, 33, 49, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 102, 103, 101, 98, 99, 100, 106, 104, 105, 66)

let undeletable_menus = new Array(10, 11, 12, 13, 15, 18, 19, 21, 26, 30);
// new Array(18, 20, 14, 17, 24, 26, 23, 21, 27, 29, 10, 11, 12, 13, 33, 49, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 102, 103, 101, 98, 99, 100, 106, 104, 105, 66)


export default function editMenuEntitlement() {
  useTitle("Edit Role");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();

  const [userCategory, setUserCategory] = useState<any>([]);
  const [userRole, setUserRole] = useState<any>([]);
  const [userMenuList, setUserMenuList] = useState<any>([]);
  const [userPrivileges, setUserPrivileges] = useState<any>([]);
  const [isBrandSelected, setIsBrandSelected] = useState<any>(false);
  const [errors, setErrors] = useState<any>({});
  const [brandList, setBrandList] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [roleData, setRoleData] = useState<any>([]);
  const [ids, setIds] = useState<any[]>([])
  const [formData, setFormData] = useState<any>({
    id: "",
    userRole: "",
    brandId: null,
    privileges: [],
  });

  const [headerRow, setHeaderRow] = useState<any>({
    create: false,
    view: false,
    edit: false,
    delete: false,
  });

  useEffect(() => {
    fetchRolesMenu();
    getBrands();
  }, [id]);

  useEffect(() => {
    const filtered = roleData
      .filter((menu: any) => {
        return !(
          !ids?.includes(menu.id) &&
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
  }, [ids])

  const getBrands = async () => {
    const res = await API.get(`brand`);
    if (res.success) {
      setBrandList(res.data);
    }
  };

  const fetchRolesMenu = async () => {
    const res = await API.get(`user/get-user-role?id=${id}`);
    if (res.success) {
      setFormData((prevData: any) => ({
        ...prevData,
        id: res.data?.role?.id,
        userRole: res.data?.role?.user_role,
        brandId: res.data?.role?.brand_id,
      }));

      if (res.data.role?.userCategory?.category_name === "Brand") {
        setIsBrandSelected(true);
      }
      setUserRole(res.data.role);
      setUserCategory(res.data.role.userCategory);
      setUserMenuList(res.data.menuList);
      setUserPrivileges(res.data.privileges);
    }
  };

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
      .map((item: any) => {
        return {
          ...item,
          menuId: item.id,
        };
      });


    const includeIds = filtered.filter((item: any) => {
      return (
        uncreatable_menus?.includes(item.id) ||
        undeletable_menus?.includes(item.id) ||
        uneditable_menus?.includes(item.id)
      );
    });

    // Updating create, edit, delete to false for items with matching ids
    const updatedFiltered = filtered.map((item: any) => {
      if (includeIds.some((idItem: any) => idItem.id === item.id)) {
        return {
          ...item,
          create: false,
          edit: false,
          delete: false,
        };
      }
      return item;
    });

    setFormData((prevData: any) => ({
      ...prevData,
      privileges: updatedFiltered,
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

    const idSet = updatedData
      .filter((item: any) => item.id === id)
      .map((getId: any) => getId.id);
    setIds((prevIds) => [...prevIds, ...idSet]);
  };

  const alreadyExistName = async (name: string, value: string) => {
    const res = await API.post("user/check-role", {
      roleId: formData.id,
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
    if (name === "brandId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
      setIsSubmitting(true)
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

    if (!isBrandSelected && (formData.userRole === "" || !formData.userRole)) {
      setErrors((prevData: any) => ({
        ...prevData,
        userRole: "User Role is required",
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

    if (isBrandSelected && (formData.brandId === "" || !formData.brandId)) {
      setErrors((prevData: any) => ({
        ...prevData,
        brandId: "Brand is required",
      }));
      isError = true;
    }

    if (isSubmitting === true && !errors.userRole) {
      if (!isError) {
        const res = await API.put("user/update-user-role", {
          id: formData.id,
          userRole: !isBrandSelected ? formData.userRole : "",
          brandId: isBrandSelected ? Number(formData.brandId) : null,
          privileges: formData.privileges,
        });
        if (res.success) {
          router.push('/role/menu-entitlement');
          toasterSuccess("Role Updated Successfully", 3000, formData.id);
          setIsSubmitting(false);
        } else {
          toasterError(res.error?.code, 3000, formData.id);
          setIsSubmitting(false);
        }
      }
    }
  };

  if (loading || roleLoading) {
    return <div> <Loader /></div>;
  }

  const columns = [
    {
      name: translations?.common.srNo,
      cell: (row: any, index: any) => index + 1,
      width: "70px",
    },
    {
      name: translations?.menuEntitlement.menuName,
      selector: (row: any) => row.menu_name,
      width: "300px",
    },
    {
      name: (
        <div className="flex justify-between w-14 ">
          {translations?.menuEntitlement.create}
          <input
            name="create"
            type="checkbox"
            checked={headerRow.create}
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
          {translations?.menuEntitlement.view}
          <input
            name="view"
            type="checkbox"
            checked={headerRow.view}
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
            checked={headerRow.edit}
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
            checked={headerRow.delete}
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
              <li>Edit Role</li>
            </ul>
          </div>
        </div>
      </div>

      {/* <div className="flex space-x-5 mt-5 gap-10">
      
        </div>
        {isBrandSelected ? (
          <div className="w-1/3 flex">
            <div className="w-1/3">
              <label className="px-2 py-2 text-md">
                {translations.menuEntitlement.brand}:{" "}
              </label>
            </div>
            <div className="w-2/3 text-sm">
              <select
                className="w-full border rounded px-2 py-2 text-md"
                placeholder={translations.menuEntitlement.brand}
                value={formData.brandId || ''}
                onChange={(event) => handleChange(event)}
                name="brandId"
              >
                <option value="" className="text-md">
                  Select Brand
                </option>
                {brandList?.map((category: any) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="text-md"
                  >
                    {category.brand_name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <p className="text-red-500 mt-1">{errors.brandId}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-1/3 flex">
            <div className="w-1/3">
              <label className="px-2 py-2 text-md">
                {translations.menuEntitlement.userRole}:{" "}
              </label>
            </div>
            <div className="w-2/3 text-sm">
              <input
                type="text"
                name="userRole"
                onBlur={onBlurCheck}
                placeholder={translations.menuEntitlement.roleName}
                className="w-full border rounded px-2 py-2 text-sm"
                value={formData.userRole || ""}
                onChange={(event) => handleChange(event)}
              />
              {errors.userRole && (
                <p className="text-red-500 mt-1">{errors.userRole}</p>
              )}
            </div>
          </div>
        )}
      </div> */}
      <div className="row">
        <div className="col-12  col-sm-6 mt-4">
          <label className="text-gray-500 text-[12px] font-medium">User Category</label>
          <Select
            name="categoryId"
            value={userCategory?.category_name ? { label: userCategory?.category_name, value: userCategory?.category_name } : null}
            menuShouldScrollIntoView={false}
            isClearable
            placeholder="Select User Category"
            className="z-[2] dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
            isDisabled
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
                className="z-[2] dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
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
      </div >
      <div className="mt-10 border">
        <DataTable
          persistTableHead
          fixedHeader={true}
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
    </div>
  );
}
