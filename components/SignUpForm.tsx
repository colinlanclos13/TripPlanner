import { router } from 'expo-router';
import {useState} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet, TextInput, Text, TouchableOpacity, View, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { IconSelector, AvatarIcon } from './IconSelector';
import * as Notifications from "expo-notifications";
import { Colors } from '@/app/styles /colors';





const SignUpForm = () => {
  const [userName, onChangeUsername] = useState('');
  const [emailInput, onChangeEmail] = useState('');
  const [confirmEmailInput, onChangeConfirmEmail] = useState('');
  const [passwordInput, onChangePassword] = useState('');
  const [confirmPassword, onChangeNumberConfirmPassword] = useState('');
  const [redTextForAll, setRedTextForAll] = useState(false);
  const [redTextNonUnqueUserName, setRedTextForNonUnqueUserName] = useState(false);
  const [redTextForUnvalidUserNamer, setRedTextForUnvalidUserNamer ] = useState(false);
  const [redTextForEmail, setRedTextForEmail] = useState(false);
  const [redTextForPassword, setRedTextForPassword] = useState(false);
  const [redTextForConfirmPassword, setRedTextForConfirmPassword] = useState(false);
  const [peepPassword, setPeepPassword] = useState(true);
  const [redTextForEmailAlreadyUsed, setRedTextForEmailAlreadyUsed] = useState(false);
  const [confirmEmailRedText, setConfirmEmailRedText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<AvatarIcon>('account');
  

  async function onSubmit() {
    setLoading(true);

    
    function showErrorAlert(message: string) {
      Alert.alert(
        "Error",
        message,
        [
          { text: "OK" }
        ],
        { cancelable: true }
      );
    }


    const signThemUp = async () => {
      try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        console.log("User Created")
        const user = userCredential.user;
  
        // Store user info in Firestore
        await setDoc(doc(db, "usernames", userName.toLowerCase()),{ "id": user.uid, "profilePic": selectedIcon
        }); 
        console.log("usernamed Logged")

        const token = await Notifications.getExpoPushTokenAsync();
        console.log("getting expo token")

        await setDoc(doc(db, "users", user.uid), {
          userName: userName.toLowerCase(),
          email: emailInput,
          profilePic: selectedIcon,
          expoPushTokens: arrayUnion(token.data)
        });
        console.log("data stored ✅");
        setLoading(false);
        router.push("/(tabs)")
        // Submit your form here (e.g., navigate or update state
      } catch (error: any) {
        // Handle Firebase Auth errors
        if (error.code === 'auth/email-already-in-use') {
          setRedTextForEmailAlreadyUsed(true);
          showErrorAlert("Email Already Used")
        }
        if (error.code === 'auth/invalid-email') {
          setRedTextForEmail(true);
          showErrorAlert("Invalid Email")
        }
        setLoading(false);
        showErrorAlert(error)
       
      }
    }
    
    let hasError = false;
  
    // Basic empty field check
    if (!userName || !emailInput || !passwordInput || !confirmPassword) {
      setRedTextForAll(true);
      hasError = true;
    } else {
      setRedTextForAll(false);
    }
  
    // Username validation
    const usernameRegex = /^[a-zA-Z0-9]{5,15}$/;
    if (!usernameRegex.test(userName)) {
      setRedTextForUnvalidUserNamer(true);
      hasError = true;
    } else {
      setRedTextForUnvalidUserNamer(false);
  
      //check for unque userName
      try {
        console.log("Checking username:", userName);
        const checkForUserName = doc(db, "usernames", userName);
        const isUser = await getDoc(checkForUserName);
        console.log("After check");
        console.log("Exists?", isUser.exists());
      
        if (isUser.exists()) {
          setRedTextForNonUnqueUserName(true);
          showErrorAlert("Username is Already in Use")
          hasError = true;
        } else {
          setRedTextForNonUnqueUserName(false);
          hasError = false;
        }
      } catch (error) {
        console.error("Error checking for username:", error);
        setRedTextForNonUnqueUserName(true);
        hasError = true;
      }
      
    }
  
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailInput)) {
      setRedTextForEmail(true);
      hasError = true;
    } else {
      setRedTextForEmail(false);
      setConfirmEmailRedText(false);
      if(confirmEmailInput != emailInput){
        setConfirmEmailRedText(true);
        hasError = true;
      } else {
        setConfirmEmailRedText(false);
        setRedTextForEmail(false);
        setRedTextForEmailAlreadyUsed(false);
      }
    }
  
    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(passwordInput)) {
      setRedTextForPassword(true);
      hasError = true;
    } else {
      setRedTextForPassword(false);
      if (passwordInput !== confirmPassword) {
        setRedTextForConfirmPassword(true);
        hasError = true;
      } else {
        setRedTextForConfirmPassword(false);
      }
    }


  
    // Final check
    if (!hasError) {
      console.log("here")
      //firebase things
      await signThemUp();
      // Submit your form here
    }else{
      setLoading(false);
      console.log("Damm")
    }
  }
  
  
  return (
    <SafeAreaProvider>
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.primary}}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
      >
          <Text style={styles.header}>Sign Up</Text>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeUsername}
              placeholder="Enter your username"
              value={userName}
              keyboardType="default"
              autoComplete="off"
            />
          </View>
          {redTextNonUnqueUserName && <Text style={styles.redText}>User Name Already Taken</Text>}
          {redTextForUnvalidUserNamer && <Text style={styles.redText}>User Name has to be between 5-15 Characters and No Spaces and No Upper Case</Text>}

            {/* Avatar Icon Selector */}
            <Text style={styles.label}>Select Your Avatar Icon</Text>
            <IconSelector selectedIcon={selectedIcon} onSelect={setSelectedIcon} />

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeEmail}
              placeholder="Enter your email"
              value={emailInput}
              keyboardType="email-address"
              autoComplete="off"
            />
          </View>
          {redTextForEmail && <Text style={styles.redText}>Not A Valid Email</Text>}
          {redTextForEmailAlreadyUsed && <Text style={styles.redText}>Email Already Used</Text>}

          {/*Confirm Email */}
          <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={onChangeConfirmEmail}
                placeholder="Enter your email"
                value={confirmEmailInput}
                keyboardType="email-address"
                autoComplete="off"
              />
          </View>
          {confirmEmailRedText && <Text style={styles.redText}>Emails do not match.</Text>}

          
          {/* Password Input */}
          <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => setPeepPassword(!peepPassword)} style={{ padding: 10 }}>
              <Icon name={!peepPassword ? 'visibility' : 'visibility-off'} size={24} />
            </TouchableOpacity>
          </View>
            <TextInput
              style={styles.input}
              onChangeText={onChangePassword}
              value={passwordInput}
              placeholder="Enter your password"
              secureTextEntry={peepPassword}
            />
          </View>
          {redTextForPassword && (
          <Text style={styles.redText}>
            Password must be at least 8 characters long, include at least 1 uppercase letter, and contain at least 1 special character (e.g. !@#$%^&*).
          </Text>
        )}

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.label}>Confirm Password</Text>
            <TouchableOpacity onPress={() => setPeepPassword(!peepPassword)} style={{ padding: 10 }}>
              <Icon name={!peepPassword ? 'visibility' : 'visibility-off'} size={24} />
            </TouchableOpacity>
          </View>
            <TextInput
              style={styles.input}
              onChangeText={onChangeNumberConfirmPassword}
              placeholder="Confirm your password"
              value={confirmPassword}
              secureTextEntry={peepPassword}
              autoComplete="off"
            />
          </View>
          {redTextForConfirmPassword && (
          <Text style={styles.redText}>
            Passwords Do Not Match
          </Text>
        )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={ async () => onSubmit()}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {redTextForAll && <Text style={styles.redText}>Please Fill in All Boxes</Text>}

          {/* Login Link */}
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>

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
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.secondary,
    fontSize: 16,
  },
redText: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'flex-start', // better for forms
    flexGrow: 1, // allows ScrollView content to stretch and scroll
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    color: Colors.secondary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: Colors.accent,
    borderWidth: 3,
    borderRadius: 6,
    paddingLeft: 10,
    fontSize: 16,
    color: Colors.secondary,
    backgroundColor: Colors.secondary
  },
  submitButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SignUpForm;
