import React, { useState, useRef, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Platform, Animated } from 'react-native';
import { firebase, auth } from './config';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); 
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 1000, 
          useNativeDriver: true,
        }
      ).start();
    }, [fadeAnim]);
  
    const handleLogin = async () => {
      try {
        // Pieslēgties izmantojot epastu un paroli
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        const userId = user.uid;
    
        // Pārbauda, vai lietotājs jau ir pieslēdzies šodien
        const currentDate = new Date().toISOString().split('T')[0];
        const loginEventRef = firebase.firestore().collection('loginEvents').doc(user.uid).collection('dates');
        const docSnapshot = await loginEventRef.doc(currentDate).get();
    
        // Saglabā lietotāja pieslēgšanās datumu
        if (!docSnapshot.exists) {
          await loginEventRef.doc(currentDate).set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
    
        // Pāriet uz sākuma ekrānu
        navigation.navigate('Sākumlapa');
      } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          Alert.alert('Nepareizs e-pasts vai parole');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Ievadiet korektu e-pasta adresi');
        } else if (error.code === 'auth/missing-email') {
          Alert.alert('Lūdzu ievadiet e-pasta adresi');
        } else if (error.code === 'auth/missing-password') {
          Alert.alert('Lūdzu ievadiet paroli');
        } else {
          Alert.alert('Radās kļūda autentifikācijā. Lūdzu, mēģiniet vēlreiz vēlāk.');
        }
      }
    };
  
    return (
      <ImageBackground
        source={require ('./background_image.jpg')}
        style={styles.background}
      >
      <Animated.View
       style={[
        styles.container,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Sveicināti atpakaļ!</Text>
        <TextInput
          style={styles.input}
          placeholder="E-pasts"
          placeholderTextColor="#36454F"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Parole"
          placeholderTextColor="#36454F"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Pieslēgties</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}  onPress={() => navigation.navigate('Reģistrēties')}>
          <Text style={styles.buttonText}>Reģistrēties</Text>
        </TouchableOpacity>
      </View>
      </Animated.View>
      </ImageBackground>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
    textAlign: 'center', 
    maxWidth: '80%', 
    textShadowColor: 'white', 
    textShadowOffset: { width: 1, height: 1}, 
    textShadowRadius: 1, 
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: 'black',
    backgroundColor: 'white',
  },
  placeholderText: {
    color: '#36454F',
  },
  button: {
    backgroundColor: 'white',
    width: '70%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 3, 
    borderColor: 'black', 
 ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#006A44',
      textShadowColor: 'white', 
      textShadowOffset: { width: 1, height: 1 }, 
      textShadowRadius: 0.5, 
    },
});

export default LoginScreen;