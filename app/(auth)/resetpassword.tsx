import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth } from "../../firebaseConfig"
import { Colors } from '../styles /colors';

const resetpassword = () => {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {

    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => {
        router.push("/(auth)/login")
      }}>
        <Text style={styles.buttonText}>To Login</Text>
      </TouchableOpacity>
    </View>
  );
  
}

export default resetpassword;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.secondary
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: Colors.secondary
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  buttonText: {
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
});


