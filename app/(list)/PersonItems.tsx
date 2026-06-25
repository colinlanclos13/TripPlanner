import AddPersonalItemButton from "@/components/AddPersonalItem";
import AddPersonalItemModal from "@/components/AddPersonalItemModal";
import { auth, db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { collection, deleteField, doc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import { Ionicons } from '@expo/vector-icons';

type ItemData = {
  id: string;
  name: string;
  isChecked: boolean;
};






const ItemChecklist = () => {
  const [items, setItems] = useState<ItemData[]>();
  const [tripId, setTripId] = useState("");
  const [defaultListList, setDefaultListList] = useState<any>([]);

  useEffect(() => {
    const getData = async () => {
    const value = await AsyncStorage.getItem('tripId');
    console.log(value)
    const id = value as string;
    setTripId(id)
    const personalId = auth.currentUser?.uid
    if(!personalId){
      router.push("/(auth)/login");
      return;
    }
    const docRef = doc(db, "trip", tripId, "PersonalList", personalId)
    const unsubscribe = onSnapshot(
      docRef,
       async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log("Personal list data:", data);
          const items: ItemData[] = Object.entries(data).map(([key, value]) => ({
            id: key,
            name: key,
            isChecked: value,
          })).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));;
          setItems(items); // or transform it into a list if needed

          if(items.length === 0 || items === undefined){
            console.log("got here")
            console.log(personalId)
            const listRef = collection(db, "users", personalId, "Default_List");
            try {
            const docs =  await getDocs(listRef);
              
            const hopeData = docs.docs.map((doc) => ({
              id: doc.id,
              items: doc.data().items || []
            }));
            console.log(hopeData)
            setDefaultListList(hopeData);
            
            } catch (error) {
              console.log(error)
            }
          }
        } else {
          console.log("No personal list found");
          const listRef = collection(db, "users", personalId, "Default_List");
            try {
            const docs =  await getDocs(listRef);
              
            const hopeData = docs.docs.map((doc) => ({
              id: doc.id,
              items: doc.data().items || []
            }));
            console.log(hopeData)
            setDefaultListList(hopeData);
            
            } catch (error) {
              console.log(error)
            }
        }
      },

      (error) => {
        console.error("Error reading personal list:", error);
        setItems([]); // optional error fallback
      }
    );
    return () => unsubscribe();
    }
    getData();
  },[tripId])

  const handleDelete = async (name: string) => {
  try{
    const userId = auth.currentUser?.uid
    if(!userId){
      router.push("/(auth)/login");
      return
    }
    const docRef = doc(db, "trip", tripId,"PersonalList", userId)
    await updateDoc(docRef, {
      [name]: deleteField()
    })

  }catch(error){
    console.log(error)
  }
}

  const toggleCheck  = async (name: string, isChecked: boolean) => {
    const userId = auth.currentUser?.uid
    if(!userId){
      router.push("/(auth)/login");
      return
    }
    const docRef = doc(db, "trip", tripId,"PersonalList", userId)
    await updateDoc(docRef, {
      [name]: !(isChecked)
    })
  };

  const renderItem = ({ item }: { item: ItemData }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={[styles.checkbox, item.isChecked && styles.checked]}
        onPress={() => toggleCheck(item.id, item.isChecked)}
      >
        {item.isChecked && (
          <Ionicons
            name="checkmark"
            size={20}
            color="white"
          />
        )}
      </TouchableOpacity>
      <Text style={styles.itemText}>{item.name}</Text>

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.trashIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const handlePressToPickDefaultList = async (id: any, items: any) => {
    console.log(items)
    const userId = auth.currentUser?.uid
    if(!userId){
      return;
    }
    const docRef = doc(db, "trip", tripId, "PersonalList", userId);
    const obj: Record<string, boolean> = items.reduce((acc:any, item:any) => {
      acc[item] = false;
      return acc;
    }, {} as Record<string, boolean>);
    await setDoc(docRef, obj);
  }

  return (
    <View style={styles.container}>
      <AddPersonalItemModal />
      <Text style={styles.header}>Item Checklist</Text>
      {items?.length === 0 || items === undefined ? <><Text style={{ fontSize: 16, textAlign: 'center', marginVertical: 10 }}>
        Add a new item or pick one from your default list.
      </Text>
        <Text  style={{  fontWeight: 'bold', textAlign: 'center',fontSize: 16,marginVertical: 10}}>
         Choose from Default List
        </Text>
        <FlatList
        data={defaultListList}
        keyExtractor={(item , index) =>  item + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tripButton}
            onPress={() => handlePressToPickDefaultList(item.id, item.items)}
          >
            <Text style={styles.tripText}>{item.id}</Text>
          </TouchableOpacity>
        )}
        />
        </>
      :
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    }
    </View>
  );
};

const styles = StyleSheet.create({
  tripButton: {
    padding: 16,
    backgroundColor: '#dce7ff',
    borderRadius: 12,
    marginBottom: 10,
  },
  tripText: {
    fontSize: 18,
  },
  trashIcon: {
    fontSize: 20,
    marginLeft: 10,
    color: "red",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    justifyContent: "space-between", 
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  checked: {
    backgroundColor: "#4CAF50", // Green background when checked
    borderColor: "#4CAF50",
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
  itemText: {
    fontSize: 18,
    color: "#333",
  },
});

export default ItemChecklist;


