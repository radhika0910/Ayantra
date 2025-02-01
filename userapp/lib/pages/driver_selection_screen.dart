import 'package:flutter/material.dart';

import 'waiting_screen.dart';

class Driver {
  final String name;
  final double rating;
  final String vehicle;

  Driver({required this.name, required this.rating, required this.vehicle});
}

class DriverSelectionScreen extends StatelessWidget {
  final String destination;
  final List<Driver> drivers = [
    Driver(name: "Amit Sharma", rating: 4.8, vehicle: "Toyota Innova"),
    Driver(name: "Ravi Kumar", rating: 4.6, vehicle: "Maruti Swift"),
    Driver(name: "Sneha Patil", rating: 4.9, vehicle: "Hyundai i20"),
  ];

  DriverSelectionScreen({Key? key, required this.destination})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Select a Driver")),
      body: ListView.builder(
        itemCount: drivers.length,
        itemBuilder: (context, index) {
          final driver = drivers[index];
          return ListTile(
            leading: const Icon(Icons.person),
            title: Text(driver.name),
            subtitle: Text("${driver.vehicle} - ⭐ ${driver.rating}"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => WaitingScreen(driverName: driver.name),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
