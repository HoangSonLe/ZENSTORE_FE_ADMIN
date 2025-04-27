import { NextResponse, NextRequest } from "next/server";
import { user } from "../data";

export async function GET(request: NextRequest) {
    try {
        // In a real application, you would verify the JWT token from the Authorization header
        // and retrieve the user based on the token payload

        // For demo purposes, we'll just return the first user or a default user
        const defaultUser = user[0] || {
            id: 1,
            name: "Default User",
            email: "user@example.com",
            image: "/images/avatar/avatar-3.jpg",
        };

        // Always return a user (no validation)
        return NextResponse.json({
            status: "success",
            data: {
                id: defaultUser.id,
                name: defaultUser.name,
                email: defaultUser.email,
                image: defaultUser.image,
            },
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json(
            {
                status: "fail",
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}
