import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TextInput, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { auth, db } from "../firebaseConfig";
import {addDoc, doc, getDoc, setDoc, collection, writeBatch } from "firebase/firestore";
import {getAuth} from "firebase/auth";
import * as Notifications from "expo-notifications";

const CreateNewTripForm = () => {
  const [TripTitle, onChangeTripTitle] = React.useState('');
  const [destination, onChangeDestination] = React.useState('');
  const [startDate, setStartDate] = React.useState('Date 1');
  const [endDate, setEndDate] = React.useState('Date 2');
  const [showDatePickerStart, setShowDatePickerStart] = React.useState(false);
  const [showDatePickerEnd, setShowDatePickerEnd] = React.useState(false);
  const [discription, onChangeDiscription] = React.useState('');
  const [redTextTitle, setRedTextTitle] = React.useState(false);
  const [redTextAddress, setRedAddress] = React.useState(false);
  const [redTextDate, setRedTextDate] = React.useState(false);
  const [redTextDescritions, setRedTextDescritions] = React.useState(false);
  const [tripId, setTripId] = React.useState("");

  const putIntoOnwerTripList = async (tripId: string, username:string, userId: string) => {

    try {
      await setDoc(doc(db, "users", userId, "trips",tripId), {
        title: TripTitle,
        address: destination,
        dates: [startDate, endDate],
        description: discription,
        owner: username,
        seen: true
      });

      
      //Make Grocery List
      await setDoc(doc(db,"trip", tripId, "Grocery", "List"),{
      }); 
      console.log("Grocery List is made")
      

      //Group Item List
      await setDoc(doc(db, "trip", tripId, "Group", "List"),{
      });
      console.log("Group List is made")

      //Persnal Item List
      await setDoc(doc(db, "trip", tripId, "PersonalList", username ),{
      });
      console.log("Persnal List is made")

      //Guest List with host
      await setDoc(doc(db,"trip", tripId, "Guest","List"),{
        [username]: ["maybe","crown",userId]
      });
      console.log("Guest List is made")

      //make plain Itenererary
      await createPlainItenerary(tripId);
      console.log("Itenererary Made")

      console.log("Trip document successfully written.");
      router.push("/(tabs)")
    } catch (error) {
      console.error("Error while adding trip document:", error);
    }


  }

  const createPlainItenerary =  async (tripId:string) =>{
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const itineraryDates: string[] = [];
  
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      itineraryDates.push(
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      ); // "YYYY-MM-DD"
    }

    try {
      const batch = writeBatch(db);

      itineraryDates.forEach((dateStr) => {
        const docRef = doc(db,"trip", tripId, "Itinerary", dateStr);
        batch.set(docRef, { // or any default data structure you want
        });
      });

    await batch.commit();


      
    } catch (error) {
      console.log(error)
    }

  
    console.log("Generated dates:", itineraryDates);
  }




  

  function handleConfirmStart(date: Date): void {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');

    setStartDate(`${year}-${month}-${day}`);
    setShowDatePickerStart(false);
    
  }

  function handleConfirmEnd(date: Date): void {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    
    setEndDate(`${year}-${month}-${day}`);
    setShowDatePickerEnd(false);
  }

  const onSubmit = async () => {
    let hasError = false;

    if (TripTitle === '') {
      setRedTextTitle(true);
      hasError = true;
    } else {
      setRedTextTitle(false);
    }
  
    if (destination === '') {
      setRedAddress(true);
      hasError = true;
    } else {
      setRedAddress(false);
    }
  
    if (startDate === 'Date 1' || endDate === 'Date 2') {
      setRedTextDate(true);
      hasError = true;
    } else {
      setRedTextDate(false);
    }
  
    if (discription === '') {
      setRedTextDescritions(true);
      hasError = true;
    } else {
      setRedTextDescritions(false);
    }

    if(!hasError){
      //grabbing user name
      const userId = auth.currentUser?.uid;

      if(userId){
      const userDoc = await getDoc(doc(db ,'users' , userId ));
      const userNameData: any = userDoc.data();
      const username: string = userNameData.userName; 

      //creating trip
      try {
        const docRef = await addDoc(collection(db, "trip"), {
          title: TripTitle,
          address: destination,
          dates: [startDate, endDate],
          description: discription,
          owner: username,
        });
        putIntoOnwerTripList(docRef.id, username, userId )
        console.log("Trip created with ID:", docRef.id);
      } catch (error) {
        console.error("Error while adding trip document:", error);
      }
      //setting trip within users trip list
      console.log(tripId);
      }
    }else{
      console.log("Something is not right");
    }


  }

  

  return (
      <SafeAreaView style={styles.safeArea}>
        {/* start date picker */}
        <DateTimePickerModal
                date={new Date()}
                display="spinner"
                  isVisible={showDatePickerStart}
                  mode="date"
                  onConfirm={handleConfirmStart}
                  onCancel={() => setShowDatePickerStart(false)}
                  pickerComponentStyleIOS={{height: 300}}
                />
                
        {/* end date picker */}
        <DateTimePickerModal
                date={new Date()}
                display="spinner"
                  isVisible={showDatePickerEnd}
                  mode="date"
                  onConfirm={handleConfirmEnd}
                  onCancel={() => setShowDatePickerEnd(false)}
                  pickerComponentStyleIOS={{height: 300}}
                />
        

        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.header}>Create New Trip</Text>

          {/* Trip Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trip Title</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeTripTitle}
              placeholder="Trip Title"
              value={TripTitle}
              autoComplete="off"
            />
          </View>
          {redTextTitle && <Text style={styles.redText}>Enter In a Title</Text>}
          

          {/* Destination */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeDestination}
              value={destination}
              placeholder="Adress"
            />
          </View>
          {redTextAddress && <Text style={styles.redText}>Please Enter in Address</Text>}

          {/* Dates */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dates: {startDate} to {endDate}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setShowDatePickerStart(true)} style={styles.button}>
                <Text style={styles.buttonToChooseDates}>Choose Start Date</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowDatePickerEnd(true)} style={styles.button}>
                <Text style={styles.buttonToChooseDates}>Choose End Date</Text>
              </TouchableOpacity>
            </View>
          </View>
          {redTextDate && <Text style={styles.redText}>Please Enter in both dates</Text>}


          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.inputDescription}
              onChangeText={onChangeDiscription}
              value={discription}
              placeholder="Description"
              multiline={true}
              numberOfLines={4}
              maxLength={400}
            />
          </View>
          {redTextDescritions && <Text style={styles.redText}>Enter In a Discrition</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={() => onSubmit()}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  redText: {
    color: '#EF4444', // alert red
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputDescription: {
    borderWidth: 1,
    borderColor: '#9CA3AF', // light gray
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#374151', // slate text
  },
  safeArea: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB', // soft white background
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1E3A8A', // navy heading
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151', // softer text
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#1E3A8A', // primary navy button
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#F9FAFB', // soft white on navy
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#FACC15', // cheerful yellow for secondary actions
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonToChooseDates: {
    color: '#1E3A8A', // navy text on yellow button
    fontSize: 16,
    fontWeight: '600',
  },
});


export default CreateNewTripForm;
