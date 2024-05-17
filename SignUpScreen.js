import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Platform, Animated } from 'react-native';
import { firebase, db } from './config';
import { useNavigation } from '@react-navigation/native';


const SignUpScreen = () => {
    const [fullName, setFullName] = useState('');
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
  
    const handleSignUp = async () => {
      try {
        if (!fullName) {
          Alert.alert('Lūdzu ievadiet lietotājvārdu');
          return;
        }
    
        if (password.length < 8) {
          Alert.alert('Parolei ir jābūt vismaz astoņas rakstzīmes garai');
          return;
        }
        // Izveido lietotāju
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const { user } = userCredential;
    
        // Saglabā informāciju par lietotāju
        await db.collection('users').doc(user.uid).set({
          fullName: fullName,
          email: email,
          registrationDate: firebase.firestore.Timestamp.now(),
        });
    
        // Pēc veiksmīgas reģistrācijas, pāriet uz sākuma ekrānu
        navigation.navigate('Sākumlapa');
      } catch (error) {
        if (error.code === 'auth/invalid-email') {
          Alert.alert('Lūdzu ievadiet korektu e-pasta adresi');
        } else if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Šis e-pasts jau tiek izmantots');
        } else if (error.code === 'auth/missing-email') {
          Alert.alert('Lūdzu ievadiet e-pasta adresi');
        } else if (error.code === 'auth/network-request-failed') {
          Alert.alert('Tīkla kļūda. Lūdzu, pārbaudiet savu interneta savienojumu.');
        } else {
          console.error('Sign-up error:', error);
          Alert.alert('Radās kļūda reģistrējoties. Lūdzu, mēģiniet vēlreiz vēlāk.');
        }
      }
    };
    
  
    const handleLoginScreenNavigation = () => {
      navigation.navigate('Pieslēgties');
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
      <Text style={styles.title}>Reģistrēties</Text>
      <TextInput
        style={styles.input}
        placeholder="Vārds un uzvārds"
        placeholderTextColor="#36454F"
        value={fullName}
        onChangeText={setFullName}
      />
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
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Reģistrēties</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}  onPress={handleLoginScreenNavigation}>
        <Text style={styles.buttonText}>Man jau ir profils</Text>
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

export default SignUpScreen;