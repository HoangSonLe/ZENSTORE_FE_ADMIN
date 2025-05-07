"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import toast from "react-hot-toast";

// Define form schema (for both login and lock screen)
const schema = z.object({
    code: z.string().min(4, "Mã phải có ít nhất 4 ký tự"),
});

type FormValues = z.infer<typeof schema>;

const LockForm = () => {
    const [passwordType, setPasswordType] = useState("password");
    const [isPending, startTransition] = useTransition();
    const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
    const { user, authByCode, isSessionExpired } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    const togglePasswordType = () => {
        if (passwordType === "text") {
            setPasswordType("password");
        } else if (passwordType === "password") {
            setPasswordType("text");
        }
    };
    // Handle form submission (for both login and lock screen)
    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            await authByCode(data.code);
        });
    };

    return (
        <div className="w-full">
            <div className="flex justify-center">
                <Link href="/dashboard" className="inline-block">
                    <SiteLogo className="h-10 w-10 2xl:h-14 2xl:w-14 text-primary" />
                </Link>
            </div>
            <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900 text-center">
                {isSessionExpired ? "Màn hình khóa" : "Đăng nhập"}
            </div>
            <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6 text-center">
                {isSessionExpired
                    ? "Phiên của bạn đã hết hạn. Vui lòng nhập mã xác thực của bạn để tiếp tục."
                    : "Nhập mã xác thực của bạn để đăng nhập."}
            </div>

            <div className="mt-6 flex justify-center">
                <Avatar className="h-[72px] w-[72px]">
                    <AvatarImage src={user?.image || "/images/avatar/logo-admin.jpg"} alt="" />
                    <AvatarFallback>{user?.name?.substring(0, 2) || "UN"}</AvatarFallback>
                </Avatar>
            </div>
            <div className="text-center mt-4 text-xl font-medium text-default-900">
                {user?.name || "Zen Store"}
            </div>

            <form className="2xl:mt-7 mt-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="relative ">
                    <Input
                        removeWrapper
                        type={passwordType}
                        id="code"
                        {...register("code")}
                        size={!isDesktop2xl ? "xl" : "lg"}
                        placeholder=" "
                        className="peer"
                    />
                    <Label
                        htmlFor="code"
                        className="absolute text-base text-default-600  duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0]   bg-background  px-2 peer-focus:px-2
               peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75
               peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                        Mã xác thực
                    </Label>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
                        onClick={togglePasswordType}
                    >
                        {passwordType === "password" ? (
                            <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
                        ) : (
                            <Icon icon="heroicons:eye-slash" className="w-5 h-5 text-default-400" />
                        )}
                    </div>
                </div>
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
                <div className="mt-6">
                    <Button
                        type="submit"
                        className="w-full"
                        size={!isDesktop2xl ? "lg" : "md"}
                        disabled={isPending}
                    >
                        {isPending ? "Đang xác thực..." : "Đăng nhập"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default LockForm;
