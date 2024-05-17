import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Text, Platform } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const handleButtonPress = (screenName, params) => {
    navigation.navigate(screenName, params);
  };


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Quizz', { category: 'Pieklājības frāzes'})}
        >
          <Text style={styles.buttonText}>Pieklājības frāzes</Text>
        </TouchableOpacity>
        <View style={styles.buttonGap} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Quizz',  { category: 'Sasveicināšanās'})}
        >
          <Text style={styles.buttonText}>Sasveicināšanās</Text>
        </TouchableOpacity>
        <View style={styles.buttonGap} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Quizz', { category: 'Ikdienas jautājumi'})}
        >
          <Text style={styles.buttonText}>Ikdienas jautājumi</Text>
        </TouchableOpacity>
        <View style={styles.buttonGap} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('Quizz', { category: 'Skaitļi'})}
        >
          <Text style={styles.buttonText}>Skaitļi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDB913',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '10%',
    backgroundColor: '#FDB913',
  },
  button: {
    backgroundColor: 'white',
    width: 350,
    paddingVertical: 70,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: 'black',
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonText: {
    color: '#006A44',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGap: {
    height: '0.2%', 
  },
});

export default HomeScreen;