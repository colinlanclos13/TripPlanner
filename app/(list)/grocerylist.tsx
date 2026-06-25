import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddGroceryItemModal from "@/components/AddGroceryItemModal";
import {db } from "../../firebaseConfig"
import { deleteField, doc, onSnapshot, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../styles /colors";



const GroceryList = () => {
  type GroceryItem = { label: string; count: number; bought: boolean };
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [tripId , setTripId] = useState("");

  useEffect(() => {
    const grabGroceries = async () =>{
    const value = await AsyncStorage.getItem('tripId');
    const id = value as string;
    setTripId(id)
    

    {/*Grabbing default list*/}
    const listRef = doc(db, "trip", id, "Grocery", "List");
    const unsubscribe = onSnapshot(listRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Record<string, [number, boolean]>;
        const items = Object.entries(data).map(([label, [count, bought]]) => ({
          label,
          count,
          bought
        }));
        items.sort((a, b) => a.label.localeCompare(b.label));
        setGroceries(items)
      } else {
        console.warn("Document does not exist");
        setGroceries([]);
      }
    }, (error) => {
      console.error("Snapshot error:", error);
    });

    console.log(groceries)
    return () => unsubscribe();
  }
  grabGroceries();
  }, [])

  const toggleChecked = async (id: string, count: number, bought: boolean) => {
    const docRef = doc(db, "trip", tripId, "Grocery", "List");
    try{
    await updateDoc(docRef, {
      [id]: [count , !bought]
    })
  }catch(error){
    console.log(error)
  }
  };

  //increase numbe of items
  const increaseQuantity = async (id: string, count: number) => {
    const docRef = doc(db, "trip", tripId, "Grocery", "List");
    try{
    await updateDoc(docRef, {
      [id]: [count , false]
    })
  }catch(error){
    console.log(error)
  }
  };

  //decrease number of items
  const decreaseQuantity = async (id: string, count: number) => {
    const docRef = doc(db, "trip", tripId, "Grocery", "List");
      try{
        if(count > 0){
          await updateDoc(docRef, {
            [id]: [count , false]
          })
        }else{
          await updateDoc(docRef, {
            [id]: deleteField()
          });
        }
    }catch(error){
      console.log(error)
    }
  };

  return (
    <View style={styles.container}>
      <AddGroceryItemModal />

      {groceries.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Your grocery list is empty. Add your first item!
        </Text>
      ) : <FlatList
        scrollEnabled={true} 
        data={groceries}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.label}</Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantity}>Qty: {item.count}</Text>
                <View style={styles.quantityButtons}>
                  <TouchableOpacity onPress={() => increaseQuantity(item.label,(Number(item.count) + 1))} style={styles.quantityButton}>
                    <Ionicons name="add-circle-outline" size={24} color="#007bff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => decreaseQuantity(item.label, (Number(item.count) - 1))} style={styles.quantityButton}>
                    <Ionicons name="remove-circle-outline" size={24} color="#007bff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleChecked(item.label, item.count, item.bought)} style={{ padding: 4 }}>
              <Ionicons
                name={item.bought ? "checkbox" : "square-outline"}
                size={28}
                color="#007bff"
              />
            </TouchableOpacity>
          </View>
        )}
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.secondary,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flexDirection: "column",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    color: "#555",
    marginRight: 10,
  },
  quantityButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    marginHorizontal: 8,
    padding: 4,
  },
});

export default GroceryList;
