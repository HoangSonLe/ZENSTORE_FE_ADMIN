"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductTable from "./ProductTable";

const DataTablePage = () => {
    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default DataTablePage;
