"use client";
import AdvancedTable from "@/components/table/advanced";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataTablePage = () => {
    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdvancedTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default DataTablePage;
