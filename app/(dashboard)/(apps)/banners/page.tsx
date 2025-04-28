"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BannerTable from "./BannerTable";

const BannerPage = () => {
    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Banner</CardTitle>
                </CardHeader>
                <CardContent>
                    <BannerTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default BannerPage;
