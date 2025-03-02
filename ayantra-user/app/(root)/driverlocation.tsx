import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { neon } from '@neondatabase/serverless';
import { useUser } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the reload icon
import { TouchableOpacity } from "react-native-gesture-handler";
import CustomButton from "@/components/CustomButton"; // Adjust the import path as needed
import { Href, router } from "expo-router";

const D_URL = "postgresql://neondb_owner:npg_Se5mgLDMtu0V@ep-autumn-bar-a1kfg0n8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const GOOGLE_MAPS_API_KEY = 'AIzaSyCuREYFPODYiUBDM6qOPeffe78rN8DsMxE'; // Replace with your Google Maps API key

const DriverLocation = () => {
  const { user } = useUser();
  const [driverCoordinates, setDriverCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState<any>(null);
  const [rideStatus, setRideStatus] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchDirections = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      setDirections(data);
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  useEffect(() => {
    const fetchMostRecentRide = async () => {
      try {
        const sql = neon(D_URL);
        const response: Record<string, any>[] = await sql`
          SELECT driver_id, status
          FROM rides 
          WHERE user_id = ${user?.id} 
          ORDER BY created_at DESC 
          LIMIT 1;
        `;

        console.log("Most Recent Ride Response:", response);

        if (response.length > 0) {
          const { driver_id, status } = response[0];
          fetchDriverCoordinates(driver_id);
          setRideStatus(status);
          // Set an interval to fetch driver coordinates and ride status every 10 seconds
          intervalRef.current = setInterval(() => {
            fetchDriverCoordinates(driver_id);
            fetchRideStatus();
          }, 10000);
        } else {
          console.error("No rides found for the user");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching most recent ride:", error);
        setLoading(false);
      }
    };

    const fetchDriverCoordinates = async (driverId: number) => {
      try {
        console.log("Fetching coordinates for driverId:", driverId);
        const sql = neon(D_URL);
        const response: Record<string, any>[] = await sql`
          SELECT curr_latitude, curr_longitude 
          FROM drivers 
          WHERE id = ${driverId};
        `;

        console.log("Database Response:", response);

        if (response.length > 0) {
          const { curr_latitude, curr_longitude } = response[0];
          const driverCoords = { latitude: parseFloat(curr_latitude), longitude: parseFloat(curr_longitude) };
          setDriverCoordinates(driverCoords);

          if (userLocation) {
            fetchDirections(userLocation, driverCoords);
          }
        } else {
          console.error("Driver not found");
        }
      } catch (error) {
        console.error("Error fetching driver coordinates:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRideStatus = async () => {
      try {
        const sql = neon(D_URL);
        const response: Record<string, any>[] = await sql`
          SELECT status 
          FROM rides 
          WHERE user_id = ${user?.id} 
          ORDER BY created_at DESC 
          LIMIT 1;
        `;

        console.log("Ride Status Response:", response);

        if (response.length > 0) {
          const { status } = response[0];
          setRideStatus(status);
          console.log("Ride Status:", status);
          if (status === false) {
            setSuccess(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ride status:", error);
      }
    };

    if (user?.id) {
      fetchMostRecentRide();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationUpdates = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      // Enable high-accuracy tracking (real-time updates)
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(userCoords);

          // Calculate and update distance dynamically
          if (driverCoordinates) {
            const dist = getDistance(userCoords, driverCoordinates) / 1000; // Convert to km
            setDistance(dist.toFixed(2)); // Round to 2 decimal places
            fetchDirections(userCoords, driverCoordinates);
          }
        }
      );
    };

    startLocationUpdates();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [driverCoordinates]);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Location</Text>
      {distance !== null && <Text style={styles.distanceText}>Distance: {distance} km</Text>}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: driverCoordinates?.latitude || 0,
          longitude: driverCoordinates?.longitude || 0,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {driverCoordinates && <Marker coordinate={driverCoordinates} title="Driver" pinColor="blue" />}
        {userLocation && <Marker coordinate={userLocation} title="You" pinColor="red" />}
        {directions && directions.routes && directions.routes.length > 0 && (
          <Polyline
            coordinates={directions.routes[0].legs[0].steps.map((step: any) => ({
              latitude: step.start_location.lat,
              longitude: step.start_location.lng,
            }))}
            strokeWidth={3}
            strokeColor="blue"
          />
        )}
      </MapView>
      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Ionicons name="checkmark-circle" size={64} color="green" />
          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Ride Started
          </Text>
          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Sit back and enjoy your ride.
          </Text>
          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              // Navigate back to home or any other screen
              router.push("/(root)/(tabs)/home" as Href<string | object>);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  distanceText: { fontSize: 16, marginBottom: 10 },
  map: { width: "100%", height: "70%" },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  homeButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DriverLocation;