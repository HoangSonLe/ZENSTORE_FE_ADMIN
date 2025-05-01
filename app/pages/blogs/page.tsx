"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BlogTable from "./BlogTable";

const BlogPage = () => {
    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Bài viết</CardTitle>
                </CardHeader>
                <CardContent>
                    <BlogTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogPage;
