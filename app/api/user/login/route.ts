import { NextResponse, NextRequest } from "next/server";
import { user } from "../../user/data";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Temporarily skip validation and use the first user from the data
        // or create a default user if none exists
        const defaultUser = user[0] || {
            id: 1,
            name: "Default User",
            email: email || "user@example.com",
            image: "/images/avatar/avatar-3.jpg",
        };

        // In a real application, you would generate a JWT token here
        const token = "mock-jwt-token-" + Date.now();

        return NextResponse.json({
            status: "success",
            message: "Login successful",
            token,
            user: {
                id: defaultUser.id,
                name: defaultUser.name,
                email: defaultUser.email || email,
                image: defaultUser.image,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            {
                status: "fail",
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}
