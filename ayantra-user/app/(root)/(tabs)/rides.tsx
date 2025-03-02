import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, FlatList, Image, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import RideCard from "@/components/RideCard";
import { images, icons } from "@/constants";
import { neon } from '@neondatabase/serverless';

type Ride = {
  destination_longitude: number;
  destination_latitude: number;
  ride_id: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  fare_price: number;
  ride_time: string;
  created_at: string;
  first_name: string;
  last_name: string;
  car_seats: number;
  payment_status: string;
};

const D_URL = "postgresql://neondb_owner:npg_Se5mgLDMtu0V@ep-autumn-bar-a1kfg0n8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const Rides = () => {
  const { user, isLoaded } = useUser();
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  // Function to fetch user rides
  const fetchUserRides = async (userId: string) => {
    try {
      setLoading(true);
      const sql = neon(D_URL);
      const response: Record<string, any>[] = await sql`
        SELECT r.*, 
               d.first_name, d.last_name, d.car_seats 
        FROM rides r 
        LEFT JOIN drivers d ON r.driver_id = d.id 
        WHERE r.user_id = ${userId} 
        ORDER BY r.created_at DESC;
      `;

      console.log("Database Response:", response);
      
      if (response.length > 0) {
        const rides: Ride[] = response.map((ride) => ({
          destination_longitude: ride.destination_longitude,
          destination_latitude: ride.destination_latitude,
          ride_id: ride.ride_id,
          origin_address: ride.origin_address,
          destination_address: ride.destination_address,
          origin_latitude: ride.origin_latitude,
          origin_longitude: ride.origin_longitude,
          fare_price: ride.fare_price,
          ride_time: ride.ride_time,
          created_at: ride.created_at,
          first_name: ride.first_name,
          last_name: ride.last_name,
          car_seats: ride.car_seats,
          payment_status: ride.payment_status,
        }));
        setRecentRides(rides);
      } else {
        setRecentRides([]);
      }
    } catch (error) {
      console.error("Error fetching user rides:", error);
      setRecentRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch rides if user is logged in
    if (user?.id) {
      fetchUserRides(user.id);
    }
  }, [user?.id]);

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to format time
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString;
  };

  // Custom ride card renderer
  const renderRideItem = ({ item }: { item: Ride }) => (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${item.destination_longitude || 0},${item.destination_latitude || 0}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {item.origin_address || "Unknown origin"}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {item.destination_address || "Unknown destination"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Date & Time
            </Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {formatDate(item.created_at)}, {formatTime(item.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Driver
            </Text>
            <Text className="text-md font-JakartaBold">
              {item.first_name || "Unknown"} {item.last_name || ""}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Car Seats
            </Text>
            <Text className="text-md font-JakartaBold">
              {item.car_seats || "N/A"}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Payment Status
            </Text>
            <Text
              className={`text-md capitalize font-JakartaBold ${item.payment_status === "paid" ? "text-green-500" : "text-red-500"}`}
            >
              {item.payment_status || "unpaid"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recentRides}
        renderItem={renderRideItem}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-JakartaBold my-5">All Rides</Text>
            <TouchableOpacity
              onPress={() => {
                if (user?.id) {
                  fetchUserRides(user.id);
                }
              }}
              className="justify-center items-center w-10 h-10 rounded-full bg-white"
            >
              <Text className="text-xl">↻</Text>
            </TouchableOpacity>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Rides;
