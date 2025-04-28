import React from "react";
import { Search } from "lucide-react";
import { SiteLogo } from "@/components/svg";
import Link from "next/link";
const horizontalHeader = ({ handleOpenSearch }: { handleOpenSearch: () => void }) => {
    return (
        <div className="flex items-center lg:gap-12 gap-3 ">
            <div>
                <Link href="/products" className=" text-primary flex items-center gap-2">
                    <SiteLogo className="h-7 w-7" />
                    <span className=" text-xl font-semibold lg:inline-block hidden"> DashTail</span>
                </Link>
            </div>
        </div>
    );
};

export default horizontalHeader;
