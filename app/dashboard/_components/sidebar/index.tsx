"use client";
import { IoLogOutSharp } from "react-icons/io5";
import Image from "next/image";
import NavOptions from "./nav-options";
import { Suspense } from "react"; // Import Suspense
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const router = useRouter();

  return (
    <div className="hidden w-[220px] lg:flex flex-col min-h-screen space-y-6 sidebar pl-3 py-8 justify-between shadow-xl bg-slate-800">
      <div className="w-full flex flex-col gap-y-3">
        <div className="w-full flex justify-start items-start gap-x-2 ml-3">
          <Image src="/breezedunord-logo.png" height={60} width={100} alt="breeze du nord" />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <NavOptions />
        </Suspense>
      </div>
      <div
        className="w-[80%] mx-auto cursor-pointer px-4 flex items-center justify-center gap-x-2 py-2 bg-gray-300/40 hover:bg-gray-300/65 rounded-lg"
      >
        <div className="h-full flex flex-col justify-around">
          <p className="text-[16px] font-[500] text-muted">
            Sign Out
          </p>
        </div>
        <div className="ml-4">
          <IoLogOutSharp className="text-[24px] text-muted cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
