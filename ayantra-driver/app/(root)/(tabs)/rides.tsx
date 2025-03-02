import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useUser } from "@clerk/clerk-expo";
import { neon } from "@neondatabase/serverless";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the reload icon
import { Ride } from "@/types/type";

const GOOGLE_MAPS_API_KEY = "AIzaSyCuREYFPODYiUBDM6qOPeffe78rN8DsMxE"; // Replace with your API key
const D_URL = "postgresql://neondb_owner:npg_Se5mgLDMtu0V@ep-autumn-bar-a1kfg0n8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const Rides = () => {
  const { user } = useUser();
  const [ride, setRide] = useState<Ride | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [rideStarted, setRideStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      setLoading(false);
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  const fetchRide = async () => {
    try {
      setLoading(true);
      const sql = neon(D_URL);
      const response: Record<string, any>[] = await sql`
        SELECT * FROM rides WHERE status IS NULL OR status = false ORDER BY ride_id DESC LIMIT 1;
      `;

      console.log("Database Response:", response);

      if (response.length > 0) {
        const ride: Ride = {
          ride_id: response[0].ride_id,
          origin_address: response[0].origin_address,
          destination_address: response[0].destination_address,
          fare_price: response[0].fare_price,
          ride_time: response[0].ride_time,
          origin_latitude: parseFloat(response[0].origin_latitude) || 0,
          origin_longitude: parseFloat(response[0].origin_longitude) || 0,
          destination_latitude: parseFloat(response[0].destination_latitude) || 0,
          destination_longitude: parseFloat(response[0].destination_longitude) || 0,
          payment_status: "",
          status: false,
          driver_id: 0,
          user_id: "",
          created_at: "",
          driver: {
            first_name: "",
            last_name: "",
            car_seats: 0
          }
        };
        setRide(ride);
      } else {
        setRide(null);
      }
    } catch (error) {
      console.error("Error fetching ride:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
    fetchRide();
  }, []);

  const handleStartRide = async () => {
    if (ride) {
      try {
        const sql = neon(D_URL);
        await sql`
          UPDATE rides SET status = false WHERE ride_id = ${ride.ride_id};
        `;
        setRideStarted(true);
        console.log("Ride started:", ride.ride_id);
      } catch (error) {
        console.error("Error starting ride:", error);
      }
    }
  };

  const handleEndRide = async () => {
    if (ride) {
      try {
        const sql = neon(D_URL);
        await sql`
          UPDATE rides SET status = true WHERE ride_id = ${ride.ride_id};
        `;
        setRideStarted(false);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 5000);
        // Reload the app by refetching the ride data
        fetchRide();
      } catch (error) {
        console.error("Error ending ride:", error);
      }
    }
  };

  const handleReload = () => {
    setLoading(true);
    setRide(null);
    setRideStarted(false);
    setTimeLeft(null);
    fetchRide();
  };

  const calculateTimeLeft = (distance: number) => {
    const speed = 40; // Assume average speed of 40 km/h
    const time = distance / speed; // Time in hours
    const minutes = Math.round(time * 60); // Convert to minutes
    setTimeLeft(`${minutes} min`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar} />
      <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
        <Ionicons name="reload" size={24} color="white" />
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : ride && location ? (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
            <Marker
              coordinate={{
                latitude: ride.origin_latitude,
                longitude: ride.origin_longitude,
              }}
              title="Start Location"
              pinColor={rideStarted ? "green" : "red"}
            />
            <Marker
              coordinate={{
                latitude: ride.destination_latitude,
                longitude: ride.destination_longitude,
              }}
              title="Destination"
              pinColor="red"
            />
            <MapViewDirections
              origin={{
                latitude: ride.origin_latitude,
                longitude: ride.origin_longitude,
              }}
              destination={{
                latitude: ride.destination_latitude,
                longitude: ride.destination_longitude,
              }}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor="blue"
              onReady={(result) => {
                calculateTimeLeft(result.distance);
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }}
            />
          </MapView>
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.endButton} onPress={handleEndRide}>
              <Text style={styles.buttonText}>End Ride</Text>
            </TouchableOpacity>
            {timeLeft && <Text style={styles.timeText}>{timeLeft}</Text>}
            {!rideStarted && (
              <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
                <Text style={styles.buttonText}>Start Ride</Text>
              </TouchableOpacity>
            )}
          </View>
          {showPopup && (
            <View style={styles.popup}>
              <Text style={styles.popupText}>Ride Completed</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noRideText}>No rides available</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  topBar: {
    height: 60,
    backgroundColor: "#f0f0f0",
  },
  controlsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    elevation: 5,
  },
  endButton: {
    backgroundColor: "#FF5252",
    padding: 10,
    borderRadius: 5,
  },
  startButton: {
    backgroundColor: "#1a73e8",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  noRideText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  reloadButton: {
    position: 'absolute',
    top: 790,
    right: 20,
    backgroundColor: "#000", // Black background color
    borderRadius: 15,
    padding: 5,
    elevation: 5,
  },
  popup: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center horizontally
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  popupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Rides;