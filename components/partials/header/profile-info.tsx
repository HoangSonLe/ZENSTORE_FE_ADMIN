"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { Icon } from "@iconify/react";
import Image from "next/image";

const ProfileInfo = () => {
    const { user, logout } = useAuth();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className=" cursor-pointer">
                <div className=" flex items-center  ">
                    {user?.image && (
                        <Image
                            src={user.image}
                            alt={user.name ?? ""}
                            width={36}
                            height={36}
                            className="rounded-full"
                        />
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-0" align="end">
                <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
                    {user?.image && (
                        <Image
                            src={user.image}
                            alt={user.name ?? ""}
                            width={36}
                            height={36}
                            className="rounded-full"
                        />
                    )}
                    <div>
                        <div className="text-sm font-medium text-default-800 capitalize ">
                            {user?.name ?? "Zen Store"}
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mb-0 dark:bg-background" />
                <DropdownMenuItem
                    onSelect={() => logout()}
                    className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
                >
                    <Icon icon="heroicons:power" className="w-4 h-4" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default ProfileInfo;
