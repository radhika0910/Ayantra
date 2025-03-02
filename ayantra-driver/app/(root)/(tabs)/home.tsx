import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { neon } from "@neondatabase/serverless";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the reload icon

// Define the Ride type
type Ride = {
  ride_id: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  fare_price: number;
  ride_time: string;
};

// Simplified coordinate type
type Coordinate = {
  latitude: number;
  longitude: number;
};

const D_URL = "postgresql://neondb_owner:npg_Se5mgLDMtu0V@ep-autumn-bar-a1kfg0n8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const HomeScreen = () => {
  const [latestRide, setLatestRide] = useState<Ride | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const updateLocationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Define the driverId (replace with actual logic to get the logged-in driver's ID)
  const driverId =4; // Example driver ID, replace with actual logic

  const fetchLatestRide = async () => {
    try {
      setLoading(true);
      const sql = neon(D_URL);
      const response: Record<string, any>[] = await sql`
        SELECT *
  FROM rides
  WHERE status IS NULL OR status = false
  ORDER BY ride_id DESC
  LIMIT 1;
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
          origin_longitude: parseFloat(response[0].origin_longitude) || 0
        };
        setLatestRide(ride);
      } else {
        setLatestRide(null);
      }
    } catch (error) {
      console.error("Error fetching latest ride:", error);
    } finally {
      setLoading(false);
    }
  };

  

  const updateDriverLocation = async (latitude: number, longitude: number) => {
    try {
      const sql = neon(D_URL);
      await sql`
        UPDATE drivers
        SET curr_latitude = ${latitude}, curr_longitude = ${longitude}
        WHERE id = ${driverId};
      `;
      console.log("Driver location updated:", { latitude, longitude,driverId });
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  };

  useEffect(() => {
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

    getLocation();
    fetchLatestRide();

    // Only set up the interval if a ride hasn't been accepted
    if (!rideAccepted) {
      fetchIntervalRef.current = setInterval(fetchLatestRide, 10000);
    }

    // Set up interval to update driver location every 10 seconds
    updateLocationIntervalRef.current = setInterval(() => {
      if (location) {
        updateDriverLocation(location.coords.latitude, location.coords.longitude);
      }
    }, 10000);

    // Cleanup function
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
      if (updateLocationIntervalRef.current) {
        clearInterval(updateLocationIntervalRef.current);
        updateLocationIntervalRef.current = null;
      }
    };
  }, [rideAccepted, location]);

  // Effect to clear the interval when a ride is accepted
  useEffect(() => {
    if (rideAccepted && fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
      console.log("Stopped fetching rides after acceptance");
    }
  }, [rideAccepted]);

  // Create a direct path between points as fallback
  const createDirectPath = (start: Coordinate, end: Coordinate): Coordinate[] => {
    return [start, end];
  };

  // Get route directions when a ride is accepted
  useEffect(() => {
    const generateRoute = () => {
      if (rideAccepted && latestRide && location) {
        // For simplicity and reliability, we'll use a direct line between points
        const driverLocation: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };

        const pickupLocation: Coordinate = {
          latitude: latestRide.origin_latitude,
          longitude: latestRide.origin_longitude
        };

        console.log("Driver location:", driverLocation);
        console.log("Pickup location:", pickupLocation);

        // Create a direct line as fallback
        const directPath = createDirectPath(driverLocation, pickupLocation);
        setRouteCoordinates(directPath);

        // Try to fit these points in the map view
        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates([driverLocation, pickupLocation], {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true
            });
          }, 1000);
        }

        // Fetch a route from the Google Directions API
        fetchRouteFromAPI(driverLocation, pickupLocation);
      }
    };

    generateRoute();
  }, [rideAccepted, latestRide, location]);

  // This function attempts to fetch a route from the Google Directions API
  const fetchRouteFromAPI = async (start: Coordinate, end: Coordinate) => {
    try {
      console.log("Attempting to fetch route from API...");
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude}&key=AIzaSyCuREYFPODYiUBDM6qOPeffe78rN8DsMxE`
      );

      const data = await response.json();
      console.log("API response:", data);

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        if (decodedPoints.length > 0) {
          setRouteCoordinates(decodedPoints);
          console.log("Route coordinates set from API:", decodedPoints.length);
        }
      }

    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Decode polyline points if needed
  const decodePolyline = (encoded: string): Coordinate[] => {
    let idx = 0, lat = 0, lng = 0;
    const len = encoded.length;
    const result: Coordinate[] = [];

    while (idx < len) {
      let b, shift = 0, result1 = 0;
      do {
        b = encoded.charCodeAt(idx++) - 63;
        result1 |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = ((result1 & 1) !== 0 ? ~(result1 >> 1) : (result1 >> 1));
      lat += dlat;

      shift = 0;
      result1 = 0;
      do {
        b = encoded.charCodeAt(idx++) - 63;
        result1 |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = ((result1 & 1) !== 0 ? ~(result1 >> 1) : (result1 >> 1));
      lng += dlng;

      result.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5
      });
    }

    return result;
  };

  const handleRejectRide = () => {
    console.log("Ride Rejected:", latestRide?.ride_id);
    // Add API call or logic to reject the ride
  };

  const handleAcceptRide = async () => {
    if (!latestRide) {
      Alert.alert("Error", "No ride available to accept");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Location not available");
      return;
    }

    // Validate coordinates
    if (latestRide.origin_latitude === 0 || latestRide.origin_longitude === 0) {
      Alert.alert("Error", "Invalid pickup coordinates");
      return;
    }

    console.log("Accepting ride with coordinates:", {
      pickup: {
        lat: latestRide.origin_latitude,
        lng: latestRide.origin_longitude
      },
      driver: {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      }
    });

    setRideAccepted(true);

    // Stop fetching new rides
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
    }

    // Keep this API call for your backend
    try {
      await fetch(`/directionscreen?origin_lat=${latestRide.origin_latitude}&origin_lng=${latestRide.origin_longitude}&dest_lat=${location.coords.latitude}&dest_lng=${location.coords.longitude}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin_lat: latestRide.origin_latitude,
          origin_lng: latestRide.origin_longitude,
          dest_lat: location.coords.latitude,
          dest_lng: location.coords.longitude,
        }),
      });
    } catch (error) {
      console.error("Error calling API:", error);
      // Continue with the UI updates even if the API call fails
    }
  };

  const handleStartRide = () => {
    console.log("Ride Started:", latestRide?.ride_id);
    // Add logic to start the ride
  };

  const handleReload = () => {
    setLoading(true);
    setLatestRide(null);
    setRideAccepted(false);
    setRouteCoordinates([]);
    fetchLatestRide();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar} />

      {rideAccepted && (
        <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
          <Text style={styles.buttonText}>Start Ride</Text>
        </TouchableOpacity>
      )}

      <View style={rideAccepted ? styles.mapContainerLarge : styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE} // Use Google Maps if available
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* Driver marker */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />

            {/* Show pickup location and route when ride is accepted */}
            {rideAccepted && latestRide && (
              <>
                <Marker
                  coordinate={{
                    latitude: latestRide.origin_latitude,
                    longitude: latestRide.origin_longitude,
                  }}
                  title="Pickup Location"
                  pinColor="red"
                />

                {/* Polyline for the route */}
                {routeCoordinates.length > 0 && (
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={4}
                    strokeColor="#1a73e8"
                    geodesic={true}
                  />
                )}
              </>
            )}
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      </View>

      <View style={styles.rideContainer}>
        <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
          <Ionicons name="reload" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>{rideAccepted ? "Ride Details" : "Recent Ride"}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : latestRide ? (
          <View style={styles.card}>
            <Text style={styles.rideText}>🚖 Ride ID: {latestRide.ride_id}</Text>
            <Text style={styles.rideText}>📍 From: {latestRide.origin_address}</Text>
            <Text style={styles.rideText}>📍 To: {latestRide.destination_address}</Text>
            <Text style={styles.rideText}>💰 Fare: ₹{latestRide.fare_price}</Text>
            <Text style={styles.rideText}>⏳ Time: {latestRide.ride_time}</Text>

            <View style={styles.buttonContainer}>
              {rideAccepted ? (
                <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
                  <Text style={styles.buttonText}>▶️ Start Ride</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRide}>
                    <Text style={styles.buttonText}>✅ Accept Ride</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={handleRejectRide}>
                    <Text style={styles.buttonText}>❌ Reject Ride</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.noRideText}>No recent rides available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f0f0f0" 
  },
  topBar: {
    height: 60,
    backgroundColor: "#1a73e8",
  },
  mapContainer: { 
    flex: 1 
  },
  mapContainerLarge: { 
    flex: 3 // This makes the map take up 3/4 of the screen when ride is accepted
  },
  map: { 
    width: "100%", 
    height: "100%" 
  },
  rideContainer: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  reloadButton: {
    position: 'absolute',
    top: -30,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    elevation: 5,
  },
  heading: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 15, 
    color: "#333", 
    textAlign: "center" 
  },
  card: { 
    padding: 20, 
    backgroundColor: "#f9f9f9", 
    borderRadius: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 4 
  },
  rideText: { 
    fontSize: 16, 
    marginBottom: 8, 
    color: "#555" 
  },
  noRideText: { 
    fontSize: 16, 
    color: "#777", 
    textAlign: "center", 
    marginTop: 20 
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 15 
  },
  acceptButton: { 
    flex: 1, 
    backgroundColor: "#4CAF50", 
    padding: 12, 
    borderRadius: 5, 
    alignItems: "center", 
    marginRight: 5 
  },
  rejectButton: { 
    flex: 1, 
    backgroundColor: "#FF5252", 
    padding: 12, 
    borderRadius: 5, 
    alignItems: "center", 
    marginLeft: 5 
  },
  startButton: {
    position: 'absolute',
    top: 60, // Position below the top bar
    left: 10,
    backgroundColor: "#1a73e8", // Blue color for Start Ride button
    padding: 12, 
    borderRadius: 10, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
});

export default HomeScreen;