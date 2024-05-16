import React, { useState } from 'react';
import Link from 'next/link';
import {BiSolidRightArrow} from "react-icons/bi"
import Route from '@lib/Route';

interface Item {
  id: number;
  item: string;
  childrens?: Item[];
  icon: React.ElementType; 
  path: string;
}

interface SideBarItemsProps {
  item: Item;
}

export default function SideBarItems({ item }: SideBarItemsProps) {
  const [open, setOpen] = useState(false);

  if (item.childrens) {
    return (
      <div className={`${open ? "open" : ""} sidebar-item`}>
        <div
          className="sidebar-title mb-4 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <span className="flex">
            {item.icon && <item.icon className="w-5 h-5 mr-2" />} 
            <p className="text-sm">{item.item}</p>
            <div className="flex justify-end">
            <BiSolidRightArrow className={`w-3 h-3  transition-transform ${open ? 'transform rotate-90' : ''}`} />
              </div>
          </span>
        </div>
        <div
          className={`sidebar-content ${open ? "" : "hidden"} ${
            open ? "ml-4" : ""
          }`}
        >
          {item.childrens.map((child, index) => (
            <SideBarItems key={index} item={child} />
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="mb-4">
        {/* <Link href={item.path || "#"}> */}
          <div className="sidebar-item plain cursor-pointer" 
          onClick={()=>{Route.load(item.path)}}
          >
            <span className="flex">
              {item.icon && <item.icon className="w-5 h-5 mr-2" />} 
              <p className="text-sm">{item.item}</p>
            </span>
          </div>
        {/* </Link> */}
      </div>
     
    );
  }
}
