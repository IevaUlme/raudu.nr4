import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebase, db,  auth } from './config';
import { reauthenticateWithCredential } from "firebase/auth";

const SettingsPage = ({ route }) => {
  const [name, setName] = useState('');
  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigation = useNavigation();

  const handleChangeName = (text) => {
    setName(text);
  };

  const handleChangeExistingPassword = (text) => {
    setExistingPassword(text);
  };

  const handleChangeNewPassword = (text) => {
    setNewPassword(text);
  };

  const saveSettings = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
  
        const updatedSettings = {};
  
        //Pārbauda, vai vārds ir nomainīts
        if (name !== '' && name !== currentUser.displayName) {
          updatedSettings.fullName = name;
        }
  
        if (existingPassword !== '' || newPassword !== '') {
          const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email, existingPassword);
          await reauthenticateWithCredential(currentUser, credentials);
  
          // Fiksē jauno paroli, ja tā nomainīta
          if (newPassword !== '') {
            await currentUser.updatePassword(newPassword);
            console.log("Password updated successfully.");
            setExistingPassword('');
            setNewPassword('');
          }
        }
  
        // Firebase saglabā nomainīto informāciju
        if (Object.keys(updatedSettings).length > 0) {
          await db.collection('users').doc(userId).update(updatedSettings);
           route.params.updateName(name);
        }
  
        navigation.goBack();
      } 
    } catch (error) {
      Alert.alert('Kļūda', 'Izmaiņas saglabāt neizdevās. Lūdzu mēģiniet vēlreiz.');
    }
  };
  

  useFocusEffect(
    React.useCallback(() => {
      const hideNavBar = navigation.addListener('focus', () => {
        navigation.setOptions({
          tabBarVisible: false
        });
      });

      return hideNavBar;
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Lietotāja profils</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Mainīt lietotājvārdu</Text>
            <TextInput
              value={name}
              onChangeText={handleChangeName}
              placeholder="Ievadiet jauno lietotājvārdu"
              style={styles.input}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mainīt paroli</Text>
            <TextInput
              value={existingPassword}
              onChangeText={handleChangeExistingPassword}
              placeholder="Ievadiet esošo paroli"
              secureTextEntry={true}
              style={styles.input}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              value={newPassword}
              onChangeText={handleChangeNewPassword}
              placeholder="Ievadiet jauno paroli"
              secureTextEntry={true}
              style={styles.input}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={saveSettings}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDB913',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#FDB913',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF', 
    marginBottom: 20,
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
  row: {
    marginBottom: 5,
  },
  label: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  input: {
    width: 200,
    height: 50,
    borderWidth: 3,
    borderColor: '#006A44',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#808080',
    backgroundColor: 'white',
  },
  Switch:{
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#006A44',
    width: '100%',
    height: 50,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsPage;
