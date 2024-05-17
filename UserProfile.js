import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { firebase, db} from './config';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

function UserProfile() {
  const [fullName, setFullName] = useState(null);
  const [totalDaysUsed, setTotalDaysUsed] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [registrationDate, setRegistrationDate] = useState(null);
  const [uniqueQuestionCount, setUniqueQuestionCount] = useState(0);
  const [learnedWordsCount, setLearnedWordsCount] = useState(0);
  const navigation = useNavigation();
  

  useEffect(() => {
    console.log('chartData:', chartData);
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const uid = user.uid;
          const loginEventsRef = db.collection('loginEvents').doc(uid).collection('dates');

          const loginEventsSnapshot = await loginEventsRef.get();
          const totalDays = loginEventsSnapshot.docs.length;
          setTotalDaysUsed(totalDays);

          const userRef = db.collection('users').doc(uid);
          const userDoc = await userRef.get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setFullName(userData.fullName);
            
            if (userData.registrationDate) {
              setRegistrationDate(userData.registrationDate.toDate().toLocaleDateString('en-GB'));
            } else if (loginEventsSnapshot.docs.length > 0) {
              const firstLoginDate = loginEventsSnapshot.docs[0].id;
              setRegistrationDate(new Date(firstLoginDate).toLocaleDateString('en-GB'));
            }
          } else {
            console.log('No such document!');
            setFullName(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setFullName(null);
        setTotalDaysUsed(null);
        setChartData([]);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchLearnedWordsCount = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const uid = user.uid;
          const userRef = db.collection('users').doc(uid);
  
          const userDoc = await userRef.get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setLearnedWordsCount(userData.learnedWordsCount || 0);
          } else {
            console.log('User document does not exist.');
          }
        } else {
          console.log('User is not logged in.');
        }
      } catch (error) {
        console.error('Error fetching learned words count:', error);
      }
    };
  
    fetchLearnedWordsCount();
  
    return () => {
    };
  }, []);
  

  const promptForCredentials = async () => {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        'Ievadiet savu paroli',
        null,
        [
          {
            text: 'Cancel',
            onPress: () => reject('User canceled'),
            style: 'cancel',
          },
          {
            text: 'Submit',
            onPress: password => resolve(password),
          },
        ],
        'secure-text' 
      );
    });
  };

  const handleSignOut = () => {
    firebase.auth().signOut();
    navigation.navigate('Welcome');
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Dzēst profilu',
      'Vai jūs tiešām vēlaties dzēst savu profilu?',
      [
        {
          text: 'Nē',
          style: 'cancel',
        },
        {
          text: 'Jā',
          onPress: async () => {
            const user = firebase.auth().currentUser;

            try {
              const password = await promptForCredentials();
              const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
              await user.reauthenticateWithCredential(credential);

              await user.delete();

              console.log('User profile deleted successfully');
              navigation.navigate('Welcome');
            } catch (error) {
              Alert.alert(
                'Kļūda',
                'Profils netika izdzēsts'
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const navigateToSettings  = () => {
    navigation.navigate('Iestatījumi', { showBottomNav: false, updateName: updateName}); 
  };
  const updateName = (newName) => {
    setFullName(newName);
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
      <Icon name="settings" size={30} color="black" />
      </TouchableOpacity>
      <View style={styles.profileContainer}>
      <Text style={styles.welcomeText}>Sveiki, {fullName || 'User'}!</Text>
      {totalDaysUsed !== null && (
    <View style={styles.daysCountContainer}>
      <Text style={styles.daysCountLabel}>
        Valoda apguvei veltītās dienas:
      </Text>
      <Text style={styles.daysCountValue}>
        {totalDaysUsed} 
      </Text>
    </View>
  )}
  {learnedWordsCount !== null && (
    <View style={styles.daysCountContainer}>
      <Text style={styles.daysCountLabel}>
        Apgūtie vārdi:
      </Text>
      <Text style={styles.daysCountValue}>
        {learnedWordsCount}
      </Text>
    </View>
  )}
  {registrationDate && (
    <View style={styles.daysCountContainer}>
      <Text style={styles.daysCountLabel}>
        Esat reģistrējies kopš:
      </Text>
      <Text style={styles.daysCountValue}>
        {registrationDate}
      </Text>
    </View>
  )}
    </View>
      <View style={styles.bottomContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Iziet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteAccountButton]} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>Dzēst profilu</Text>
          </TouchableOpacity>
        </View>   
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDB913',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20, 
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 115,
    marginBottom: 20,
    justifyContent: 'center',
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    padding: 40, 
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 350, 
    paddingVertical: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  daysCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  daysCountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#000', 
  },
  daysCountValue: {
    fontSize: 16,
    color: '#000', 
  },
  bottomContainer: {
    marginTop: 20, 
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column', 
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 20, 
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#006A44',
    width: 350,
    height: 60, 
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: '#FDB913',
    padding: 10,
    borderRadius: 10,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#fff', 
  },
});


export default UserProfile;
