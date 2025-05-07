import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/store";

const SidebarLogo = ({ hovered }: { hovered?: boolean }) => {
    const { sidebarType, setCollapsed, collapsed } = useSidebar();
    return (
        <div className="px-4 py-4 sidebar-logo-height">
            <div className=" flex items-center">
                <div className="flex flex-1 items-center gap-x-3  ">
                    <Avatar className=" h-8 w-8">
                        <AvatarImage src={"/images/avatar/logo-admin.jpg"} alt="" />
                        <AvatarFallback>{"ZN"}</AvatarFallback>
                    </Avatar>

                    {(!collapsed || hovered) && (
                        <div className="flex-1  text-xl text-primary  font-semibold">Zen Store</div>
                    )}
                </div>
                {sidebarType === "classic" && (!collapsed || hovered) && (
                    <div className="flex-none lg:block hidden">
                        <div
                            onClick={() => setCollapsed(!collapsed)}
                            className={`h-4 w-4 border-[1.5px] border-default-900 dark:border-default-200 rounded-full transition-all duration-150
          ${
              collapsed
                  ? ""
                  : "ring-2 ring-inset ring-offset-4 ring-default-900  bg-default-900  dark:ring-offset-default-300"
          }
          `}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarLogo;
