import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, Animated, ImageBackground, Platform } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 2000, 
        useNativeDriver: true,
      }
    ).start();
  }, [fadeAnim]);

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
      <Text style={styles.title}>Mācies lietuviešu valodu!</Text>
      <TouchableOpacity
        style={[styles.button, styles.signUpButton]}
        onPress={() => navigation.navigate('Reģistrēties')}
      >
        <Text style={styles.buttonText}>Reģistrēties</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.logInButton]}
        onPress={() => navigation.navigate('Pieslēgties')}
      >
        <Text style={styles.buttonText}>Pieslēgties</Text>
      </TouchableOpacity>
    </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '20%',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: 'white',
    textAlign: 'center', 
    maxWidth: '80%', 
    textShadowColor: '#006A44', 
    textShadowOffset: { width: 3, height: 3 }, 
    textShadowRadius: 4, 
  },
  button: {
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
  signUpButton: {
    backgroundColor: 'white',
  },
  logInButton: {
    backgroundColor: 'white',
  },
});

export default WelcomeScreen;