"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdvancedTable from "./advanced";

const DataTablePage = () => {

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Table</CardTitle>
        </CardHeader>
        <CardContent >
          <AdvancedTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default DataTablePage;
