import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TripPlanComp from '@/components/TripPlanComp';
import AttendingStatues from '@/components/AttendingStatues';
import { router } from 'expo-router';
import LeaveOrDeleteTrip from "@/components/LeaveOrDeleteTrip";
import { Colors } from "../styles /colors";

export default function TripPage() {
  return (
      <SafeAreaView edges={["top"]}>
        <ScrollView className="container bg-white w-full h-full text-left" style={{backgroundColor:Colors.secondary}} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="mt-5">
            <TripPlanComp /> 
            <View style={styles.centeredWrapper}>
              <TouchableOpacity
                onPress={() => {
                  router.push("/(list)/Itinerary");
                  console.log("Pressed?");
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Itinerary</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
                
                <TouchableOpacity
                    onPress={() => { router.push("/(list)/grocerylist"); console.log("Pressed?"); }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Grocery List</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { router.push("/(list)/ItemsList"); console.log("Pressed?"); }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Trip List</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { router.push("/(list)/PersonItems"); console.log("Pressed?"); }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Your List</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { router.push("/(list)/TripPeopleList"); console.log("Pressed?"); }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Guest List</Text>
                </TouchableOpacity>
            </View>
            <AttendingStatues />
            <LeaveOrDeleteTrip />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
}
const styles = StyleSheet.create({
  leaveButton: {
    backgroundColor: '#FACC15', // Soft Yellow
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  leaveButtonText: {
    color: '#1E3A8A', // Navy for contrast on yellow
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#EF4444', // Coral Red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary
  },
  button: {
    backgroundColor: Colors.accent, // Navy
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: Colors.secondary,           // Light background for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
  centeredWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
});



