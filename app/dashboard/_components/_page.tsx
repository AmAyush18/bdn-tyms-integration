'use client'

import { useSearchParams } from "next/navigation";
import { Invoices } from "./invoices";
import { Main } from "./profile";
import { Turnover } from "./turnover";
import { Bookings } from "./bookings";

export const DashboardPage = () => {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");

    return (
        <div className="h-full px-3 pt-3">
            {!tab && <Main />}
            {tab === `invoice` && <Invoices />}
            {tab === `turnover` && <Turnover />}
            {tab === `bookings` && <Bookings />}
        </div>
    )
}
