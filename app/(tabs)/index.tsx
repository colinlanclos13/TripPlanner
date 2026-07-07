import { Image,Text, StyleSheet, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListTripComp from '@/components/ListTripComp';
import NotificationPermissionModal from '@/components/NotificationPermision';
import { auth } from '@/firebaseConfig';
import { Colors } from '../styles /colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} >
          <ListTripComp />
          {auth.currentUser?.uid ? (
              <NotificationPermissionModal userId={auth.currentUser.uid} />
            ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  safeArea: {
    flexGrow: 1,
    backgroundColor: Colors.background, // soft white background
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
