import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth , db} from "../firebaseConfig"
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';

type ItemData = {
  id: string;
  title: string;
  address: string; // Add location for fetching background image
  dates: ["" , ""]
  seen: boolean
};
const DATA: ItemData[] = [
];

type ItemProps = {
  item: ItemData;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
};

//item component
const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => {
  // Google Static Maps API URL for background image
  let googleMapsAPI = `https://maps.googleapis.com/maps/api/streetview?location=${item.address}&size=600x400&key=AIzaSyAdpb_QNAlmoL30L8bFm91HBidOmXm1OIw`

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.itemContainer, { backgroundColor }]}
    >
      <ImageBackground
        source={{ uri: googleMapsAPI }}
        style={styles.itemBackground}
        imageStyle={{ borderRadius: 8 }}
      >
        <View style={[
              styles.itemTextContainer,
              { backgroundColor: item.seen ? '#ffffff' : '#2c3e50' }, // light blue for unseen
            ]}>
          <Text style={[styles.title, { color: item.seen ? '#000000' : '#ffffff' }]}>{item.title}</Text>
          
          {/* Display Dates */}
          <Text style={[styles.dates, { color: item.seen ? '#000000' : '#ffffff' }]}>
            Dates: {item.dates[0]} - {item.dates[1]}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const ListTripComp = () => {
  const [DATA, setDATA] = useState<ItemData[]>()
  

  useEffect( () => {
    {/* grab userid*/}
    const userId = auth.currentUser?.uid
    if(!userId){
      console.log("User Not Found");
      return;
    }
  
    const colRef = collection(db, "users", userId, "trips")
    try {
      const unsubscribe = onSnapshot(
        colRef,
        (querySnapshot) => {
          const seenTrips: any[] = [];
          const unseenTrips: any[] = [];
          querySnapshot.forEach((doc) => {
            const trip = { id: doc.id, ...doc.data() };
            if (doc.data().seen) {
              seenTrips.push(trip);
            } else {
              unseenTrips.push(trip);
            }
          });

          const  sortedTrips = [...unseenTrips, ...seenTrips]
          
          setDATA(sortedTrips);
          console.log('Trips:', sortedTrips);
        },
        (error) => {
          // 🔴 Catch real-time listener errors here
          console.error('onSnapshot error:', error);
        }
      );
    
      // ✅ Cleanup on unmount
      return () => unsubscribe();
    } catch (error) {
      // 🔴 This only catches synchronous errors (rare here)
      console.error('Error setting up listener:', error);
    }
  }, [])



  const [selectedId, setSelectedId] = useState<string>();
  const [howToSort, setHowtoSort] = useState<string>("Regular");

  const renderItem = ({ item }: { item: ItemData }) => {
    const backgroundColor = item.id === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item.id === selectedId ? 'white' : 'white';

    const updateSeen =  async (id: string ) => {
      const userId = auth.currentUser?.uid;
      if(!userId){
        return
      }
      const seenRefDoc = doc(db,"users", userId, "trips", id)
      await updateDoc(seenRefDoc,{
        seen: true
      })
    }

    return (
      <Item
        item={item}
        onPress={async () => {
          setSelectedId(item.id);
          await updateSeen(item.id)
          await removeValue();
          await storeData(item.id);
          router.push('/(tabs)/trippage');
        }}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };
  const sort = ['Regular', 'Seen', 'Unseen'];
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Choose a Trip</Text>
        <SelectDropdown
        data={sort}
        onSelect={(selectedItem, index) => {
          setHowtoSort(selectedItem);
        }}
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>
                {selectedItem || 'Sort'}
              </Text>
            </View>
          );
        }}
        renderItem={(item, index, isSelected) => {
          return (
            <View style={{...styles.dropdownItem, backgroundColor: isSelected ? '#E5E5E5' : '#FFF'}}>
              <Text style={styles.dropdownItemText}>{item}</Text>
            </View>
          );
        }}
      />

        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={selectedId}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No trips found. Start a new trip!</Text>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden', // Ensures the rounded corners
    height: 250, // Set height for the items
  },
  itemBackground: {
    flex: 1,
    justifyContent: 'flex-end', // Align text at the bottom of the background
    padding: 20,
  },
  itemTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for text
    padding: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  dates: {
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  dropdownButton: { 
    width: 200, height: 50, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center', borderRadius: 8
   },
  dropdownButtonText: {
     fontSize: 16, color: '#333'
     },
  dropdownItem: {
     padding: 15, justifyContent: 'center' 
    },
  dropdownItemText: { 
    fontSize: 16
   },
});

const storeData = async (value: string) => {
  try {
    console.log('Stored item here');
    await AsyncStorage.setItem('tripId', value);
  } catch (e) {
    console.log(e);
  }
};

const removeValue = async () => {
  try {
    await AsyncStorage.removeItem('tripId');
    console.log('Deleted Old Id');
  } catch (e) {
    console.log(e);
  }
  console.log('Done.');
};

export default ListTripComp;
