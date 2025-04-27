import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";
import { cookies } from "next/headers";

const layout = async ({
    children,
    params: { lang },
}: {
    children: React.ReactNode;
    params: { lang: any };
}) => {
    // Temporarily skip token validation
    // In a real application, you would check for a valid token here

    // Uncomment the following code when you want to enable authentication again
    /*
    const cookieStore = cookies();
    const authToken = cookieStore.get("authToken");

    if (!authToken) {
        redirect("/auth/login");
    }
    */

    const trans = await getDictionary(lang);

    return <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>;
};

export default layout;
