import { useState, useEffect} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { push } from 'expo-router/build/global-state/routing';
import EditProfileModal from '@/components/EditProfileModal';
import CheckForLoginComp from '@/components/checkForLoginComp';
import ChangePassword from '@/components/ChangePassword';
import { collection, onSnapshot, doc, getFirestore, updateDoc, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { signOut } from '@firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getExpoPushTokenAsync } from 'expo-notifications';
import Constants from "expo-constants";
import { Colors } from '../styles /colors';


interface UserData {
  email: string;
  userName:string;
  profilePic: string
};



const ProfilePage = () => {
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not logged in.");
        return;
      }
    
      const userDocRef = doc(db, "users", uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data as UserData);
          console.log("User doc data from snapshot:", data); // fresh data from Firestore
        } else {
          console.log("No such document!");
        }
      }, (error) => {
        console.error("onSnapshot error:", error);
      });
    
      return () => unsubscribe(); // clean up listener on unmount
    }, []);
    
    useEffect(() => {
      if (profileData) {
        console.log("Profile data:", profileData.email, profileData.userName);
      }
      setLoading(false)
    }, [profileData]);

  const [showModal, setShowModal] = useState(false);




  const handleLogout = async () => {

      const dbf = getFirestore();
      const userId = auth.currentUser?.uid
      const expoPushToken = await getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      if(!userId)
        return;
      const docRef = doc(dbf, "users", userId)
      await updateDoc(docRef,{
        expoPushTokens: arrayRemove(expoPushToken.data)
      })

      const user = auth.currentUser;
      if(!user){
        console.log("yay");
      }else{
        signOut(auth).then(() => console.log("signed out"));
      }
  };

  const handleEditProfile = () => {
    console.log('Edit Profile button pressed!');
    // Add navigation or logic for editing the profile
  };

  const handleChangePassword = () => {
    console.log('Change Password button pressed!');
    // Add navigation or logic for changing the password
  };

  const handleMakeDefaultList = () => {
    router.push('../(list)/DefualtListEditorAndMaker');
  };

  return (
    <View style={styles.container}>
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
      {/* Profile Picture */}
      <MaterialCommunityIcons
      name={profileData?.profilePic as any} // TypeScript might complain, but iconName matches icon strings
      size={100}
      color={Colors.secondary}
    />

      {/* Name */}
      <Text style={styles.name}>{profileData?.userName}</Text>

      {/* Phone Number */}
      <Text style={styles.phone}>{profileData?.email}</Text>

      {/* Make Default List Button */}
      <TouchableOpacity style={styles.button} onPress={handleMakeDefaultList}>
        <Text style={styles.buttonText}>Edit/Create Default List</Text>
      </TouchableOpacity>

      {/* Edit Profile Button */}
      <EditProfileModal userName={profileData?.userName ?? "Error"} email={profileData?.email ??"Error"} />

      {/* Change Password Button */}
      <ChangePassword
          visible={showModal}
          onClose={() => setShowModal(false)}
        />
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.secondary,
    fontSize: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.primary
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.secondary,
  },
  phone: {
    fontSize: 18,
    color: Colors.secondary,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.accent ,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 18,
  },
});

export default ProfilePage;
