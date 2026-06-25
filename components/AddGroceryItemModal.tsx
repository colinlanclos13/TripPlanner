import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet,Modal, View, TextInput } from 'react-native';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
import { db, auth } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { Colors } from '@/app/styles /colors';

const AddGroupItemButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [display, setDisplay] = useState(false);

  const handlePress = () => {
    console.log("Add Group Item Button Pressed");
    setModalVisible(true);
    // You can perform actions here, such as opening a modal or adding a group item to the list.
  };

  const addNewitem = async () => {
    if(!itemName || !amount){
      setDisplay(true);
    }else{
      setDisplay(false);
      setModalVisible(!modalVisible);
      try{
        const value = await AsyncStorage.getItem('tripId');
        console.log(value)
        const id = value as string;

        const docRef = doc(db, "trip", id, "Grocery", "List")
        await updateDoc(docRef, {
          [itemName]: [amount , false]
        });
      }catch(error){
        console.log(error)
      }
      console.log("Added New Item");
      setAmount("");
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
              <Text style={styles.modalText}>Add New Grocery</Text>

              <Text>Item Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={setItemName}
                value={itemName}
              />

              <Text>Amount</Text>
              <TextInput
                keyboardType='numeric'
                style={styles.input}
                onChangeText={setAmount}
                value={amount}
              />  

              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() =>  addNewitem()}>
                <Text style={styles.textStyle}>Add New Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() =>  {setModalVisible(false),
                  setDisplay(false);}}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              {display && <Text style={styles.redText}>Fill In Both Boxes Before Submittings</Text>}
            </View>
          </View>
        </Modal>

      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Text style={styles.buttonText}>Add Grocery Item</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  redText:{
    color: '#FF0000',
    fontSize: 25,
    textAlign: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: Colors.accent,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  centeredView: {
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
  },
  button: {
    backgroundColor: Colors.accent, // Green color to differentiate the button from Add Grocery
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default AddGroupItemButton;
