"use client";
import Link from "next/link";
import { IoGrid } from "react-icons/io5";
import { ImList } from "react-icons/im";
import { BiBarChartAlt2 } from "react-icons/bi";
import { MdOutlineAutoGraph, MdOutlineHistoryEdu } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NavOptions = () => {
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab");
  return (
    <div className="w-full flex-col space-y-2 mt-3 items-center">
      <Link
        href="/dashboard"
        className={cn(
          `w-full px-4 flex py-2 justify-start items-center hover:text-blue-500 gap-x-2`,
          !tab ? "text-blue-500" : "text-muted-foreground"
        )}
      >
        <div className="">
          <IoGrid className="w-[22px] h-[22px]" />
        </div>
        <p className="text-[16px] font-[500]">Dashboard</p>
      </Link>
      <Link
        href={{
          pathname: "/dashboard",
          query: { tab: `invoice` },
        }}
        className={cn(
          `w-full px-4 flex py-2 justify-start items-center hover:text-blue-500 gap-x-2`,
          tab === `invoice` ? "text-blue-500" : "text-muted-foreground"
        )}
      >
        <div className="">
          <ImList className="w-[19px] h-[17px]" />
        </div>
        <p className="text-[16px] font-[500]">Invoices</p>
      </Link>
      <Link
        href={{
          pathname: "/dashboard",
          query: { tab: `history` },
        }}
        className={cn(
          `w-full px-4 flex py-2 justify-start items-center hover:text-blue-500 gap-x-2`,
          tab === `history` ? "text-blue-500" : "text-muted-foreground"
        )}
      >
        <div className="">
          <MdOutlineHistoryEdu className="w-[19px] h-[17px]" />
        </div>
        <p className="text-[16px] font-[500]">History</p>
      </Link>
      
    </div>
  );
};

export default NavOptions;
