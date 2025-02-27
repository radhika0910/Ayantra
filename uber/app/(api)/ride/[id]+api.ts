import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, context: { params: { id?: string } }) {
    const id = context.params?.id; // Extract the id safely

    if (!id) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const response = await sql`
            SELECT
                rides.ride_id,
                rides.origin_address,
                rides.destination_address,
                rides.origin_latitude,
                rides.origin_longitude,
                rides.destination_latitude,
                rides.destination_longitude,
                rides.ride_time,
                rides.fare_price,
                rides.payment_status,
                rides.created_at,
                json_build_object(
                    'driver_id', drivers.id,
                    'first_name', drivers.first_name,
                    'last_name', drivers.last_name,
                    'profile_image_url', drivers.profile_image_url,
                    'car_image_url', drivers.car_image_url,
                    'car_seats', drivers.car_seats,
                    'rating', drivers.rating
                ) AS driver 
            FROM 
                rides
            INNER JOIN
                drivers ON rides.driver_id = drivers.id
            WHERE 
                rides.user_id = ${id}
            ORDER BY 
                rides.created_at DESC;
        `;

        return new Response(JSON.stringify({ data: response }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching recent rides:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
