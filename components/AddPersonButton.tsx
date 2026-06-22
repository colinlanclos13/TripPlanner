import { db } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection,doc, endAt, getDoc, getDocs, limit, orderBy, query, setDoc, startAt } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, TextInput, View, Modal, FlatList } from 'react-native';

const AddPersonButton = () => {

  const [userNames, setUserNames] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState("");
  const [display, setDisplay] = useState(false);



  useEffect(() => {
    if (!modalVisible || itemName.length === 0) {
      setUserNames([]);
      return;
    }
  
    //getting usernames for search bar
    const fetchMatchingUsernames = async () => {
      try {
        const docRef = collection(db, "usernames");
  
        const usernamesQuery = query(
          docRef,
          orderBy("__name__"),
          startAt(itemName.toLocaleLowerCase()),
          endAt(itemName.toLocaleLowerCase() + "\uf8ff"),
          limit(5)
        );
  
        const snapshot = await getDocs(usernamesQuery);
        const names = snapshot.docs.map((document) => document.id);
        setUserNames(names);
        console.log(userNames);
      } catch (error) {
        console.log("Error fetching usernames:", error);
      }
    };
  
    fetchMatchingUsernames();
  }, [itemName]);
  
  const handleAddPerson = async () => {
    console.log('Add Person button pressed!');
    setModalVisible(true);
  };
  
  
  async function addNewitem() {
    let userId = "";
    let profilePic = "";
    if(!itemName){
      setDisplay(true);
    }else{
      try{
        const docSnap = await getDoc(doc(db ,"usernames", itemName));
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
    
          // To get a field named "id" inside the document (if it exists)
          const idField = docSnap.data().id;
          
          
          console.log("Field 'id':", idField);
          userId = idField;
          profilePic = docSnap.data().profilePic;
        } else {
          console.log("No such document!");
          return null;
        }

        //adding person to trip guest list
        console.log("Getting Trip Id");
        const tripId = await AsyncStorage.getItem('tripId');
        if(!tripId){
          return;
        }
       const docRef = doc(db,"trip", tripId, "Guest", "List");
       console.log(itemName)
       await setDoc(docRef,{[itemName]:["maybe", profilePic, userId]},{merge:true})
        
        //add trip to user trip list 
        const tripDocRef = doc(db,"trip", tripId)
        const tripData : any = await (await getDoc(tripDocRef)).data();
        console.log("trip data to put into persos's stuff")
        console.log(tripData);
      

        const userDocRef = doc(db, "users", userId, "trips", tripId)
        await setDoc(userDocRef, {...tripData, seen:false});



      }catch(error){
        console.log(error)
      }
      setDisplay(false);
      setModalVisible(!modalVisible);
      //add to defualt List
      console.log("Added New Person");
      let tempVar = itemName;
      //router.push()
      setItemName("");
    }
  }

  return (
    <View>
    <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setDisplay(false);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Add New Guest</Text>

              <Text>Enter Username</Text>
              <TextInput
                style={styles.input}
                onChangeText={setItemName}
                value={itemName}
              />
              
              <FlatList
              data={userNames}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => setItemName(item)}
                >
                  <Text style={styles.resultText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                userNames.length == 0 ? (
                  <Text style={styles.noResultsText}>No results found.</Text>
                ) : null
              }
            />



              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() =>  addNewitem()}>
                <Text style={styles.textStyle}>Send Invite</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() =>  {setModalVisible(false),
                  setDisplay(false);}}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              {display && <Text style={styles.redText}>Fill In Box Before Submittings</Text>}
            </View>
          </View>
        </Modal>

    <TouchableOpacity style={styles.button} onPress={handleAddPerson}>
      <Text style={styles.buttonText}>Add Person</Text>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  noResultsText: {
    padding: 10,
    color: "gray",
    fontStyle: "italic",
  },
  resultItem: {
    paddingVertical: 16,             // More height for touch target
    paddingHorizontal: 12,           // Add side padding for spacing
    backgroundColor: '#F9FAFB',      // Optional: soft background for clarity
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',        // Ensures content is centered vertically
  },resultText: {
    fontSize: 18,              // Bigger text
    color: '#1E3A8A',          // Navy blue to match your theme
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  redText:{
    color: '#FF0000',
    fontSize: 25,
    textAlign: 'center',
  },input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },buttonOpen: {
    backgroundColor: '#F194FF',
  }, buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }, centeredView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AddPersonButton;
