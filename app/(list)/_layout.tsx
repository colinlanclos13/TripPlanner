import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import CheckForLoginComp from "@/components/checkForLoginComp";
import { useNavigation } from '@react-navigation/native';


const _layout = () => {
    const navigation = useNavigation();
    return (
        //list for Groceris, Big Items, and Indvidual
        <CheckForLoginComp>
            <Tabs 
            screenOptions={{
                tabBarStyle: {
                    height: 10
                }
            }}     
            >
                <Tabs.Screen name="grocerylist" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}} />
                <Tabs.Screen name="ItemsList" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}} />
                <Tabs.Screen name="PersonItems" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}}/>
                <Tabs.Screen name="TripPeopleList" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}}/>
                <Tabs.Screen name="DefualtListEditorAndMaker" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}} />
                <Tabs.Screen name="EditDefaultList" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}} />
                <Tabs.Screen name="Itinerary" options={{headerShown: true,tabBarButton: () => null,headerLeft: () => (
                <Button title="Back" onPress={() => navigation.goBack()} />
                ),}} />
            </Tabs>
        </CheckForLoginComp>
    )
}

export default _layout;