import { addDoc, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Modal, TextInput, ActivityIndicator} from "react-native";
import {auth, db} from "../firebaseConfig"

type editProfile = {
    email: string,
    userName: string
}

const EditProfileModal = (props: editProfile) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState(props.userName);
    const [email, setEmail] = useState(props.email);
    const [display, setDisplay] = useState(false);
    const [loading, setLoading] = useState(false);
    const [redTextForUsername,setRedTextForUsername ] = useState(false);
  
  

     const handleEditProfile = async () =>  {
        if(!name || !email){
            setDisplay(true);
          }else{
            setLoading(true)
            setDisplay(false);
            
            const user = auth.currentUser?.uid;
            const checkForUserName = doc(db, "usernames", name);
            const isUser = await getDoc(checkForUserName);
            console.log("After check");
            console.log("Exists?", isUser.exists());
            if(isUser.exists()){
              setRedTextForUsername(true);
              return;
            }else{
              setRedTextForUsername(false)
            }

            if(user){
              try{
                await deleteDoc(doc(db,"usernames", props.userName.toLowerCase()));
                console.log("deleted username")
                await setDoc(doc(db, "usernames", name.toLowerCase()),{});
                console.log("added new username")
                const docRef = doc(db, "users", user);
                await updateDoc(docRef, {email: email, userName:name.toLowerCase()} )
                setModalVisible(!modalVisible);
              }catch(error){
                console.log(error);
              }
            }
          }
    }

    return(
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
                <Text style={styles.modalText}>Edit Profile</Text>

                <Text>User Name</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setName}
                    value={props.userName}
                />

                <Text>Email</Text>
                <TextInput
                    keyboardType='numeric'
                    style={styles.input}
                    onChangeText={setEmail}
                    value={props.email}
                />  

                <TouchableOpacity
                    style={[styles.button, styles.buttonClose]}
                    onPress={() =>  handleEditProfile()}>
                    <Text style={styles.textStyle}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonClose]}
                    onPress={() =>  {setModalVisible(false),
                    setDisplay(false);
                    setName(props.userName);
                    setEmail(props.email)
                    }}>
                    <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>
                {display && <Text style={styles.redText}>Fill In Both Boxes Before Submittings</Text>}
                {redTextForUsername && <Text style={styles.redText}>User Name Already in User</Text>}
                </View>
            </View>
            </Modal>

            {/* loading spinner overlay */}
          <Modal
            transparent={true}
            animationType="none"
            visible={loading}
            onRequestClose={() => {}}
          >
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          </Modal>


    
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
    </View>
    )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
    button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },buttonText: {
    color: '#fff',
    fontSize: 18,
  },redText:{
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
    backgroundColor: '#2196F3',
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

})

export default EditProfileModal;