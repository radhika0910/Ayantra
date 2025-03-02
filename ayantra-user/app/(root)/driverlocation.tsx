import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from "geolib";

const DriverLocation = () => {
  const driverCoordinates = { latitude: 21.118703, longitude: 79.023157 };
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

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
          const dist = getDistance(userCoords, driverCoordinates) / 1000; // Convert to km
          setDistance(dist.toFixed(2)); // Round to 2 decimal places
        }
      );
    };

    startLocationUpdates();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Location</Text>
      {distance !== null && <Text style={styles.distanceText}>Distance: {distance} km</Text>}
      <MapView
        style={styles.map}
        initialRegion={{
          ...driverCoordinates,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={driverCoordinates} title="Driver" pinColor="blue" />
        {userLocation && <Marker coordinate={userLocation} title="You" pinColor="red" />}
        {userLocation && (
          <Polyline
            coordinates={[driverCoordinates, userLocation]}
            strokeWidth={3}
            strokeColor="blue"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  distanceText: { fontSize: 16, marginBottom: 10 },
  map: { width: "100%", height: "90%" },
});

export default DriverLocation;
