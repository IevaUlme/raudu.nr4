import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import HomeScreen from './HomeScreen';
import Quizz from './Quizz';
import UserProfile from './UserProfile';
import DictionaryPage from './dictionary';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import WelcomeScreen from './WelcomeScreen';
import SettingsPage from './Settings';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { auth } from './config'; 
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['The action \'NAVIGATE\' with payload {"name":"Sākumlapa"} was not handled by any navigator.']);
LogBox.ignoreLogs(['The action \'NAVIGATE\' with payload {"name":"Welcome"} was not handled by any navigator.']);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Quizz" component={Quizz} options={{ headerShown: false, gestureEnabled: false}}/>
    </Stack.Navigator>
  );
}

function Vocabulary() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Vārdnīca" component={DictionaryPage} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}

function ProfileStack({route}) {

  return (
    <Stack.Navigator initialRouteName="Lietotājs">
      <Stack.Screen 
        name="Lietotājs" 
        component={UserProfile} 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Iestatījumi" 
        component={SettingsPage} 
        options={{
          headerShown: false,
          tabBarVisible: getIsTabBarVisible(route),
        }}
      />
    </Stack.Navigator>
  );
}

//nelikt sito
function getIsTabBarVisible(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  return routeName !== 'Iestatījumi';
}


function AuthStack({ navigation }) {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Pieslēgties" component={LoginScreen} options={{gestureEnabled: false, headerShown: false }} />
      <Stack.Screen name="Reģistrēties" options={{ gestureEnabled: false, headerShown: false }}>
        {(props) => <SignUpScreen {...props} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);
  

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Uzdevumi') {
              iconName = 'list';
            } else if (route.name === 'Iztulko nepieciešamo') {
              iconName = 'book'; 
            } else if (route.name === 'Profils') {
              iconName = 'person';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
            },
              tabBarActiveTintColor: 'tomato',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                display: 'flex',
              },
            })}
        >
          <Tab.Screen name="Uzdevumi" component={HomeStack} options={{ headerShown: false }} />
          <Tab.Screen name="Iztulko nepieciešamo" component={Vocabulary} options={{ headerShown: false }} />
          <Tab.Screen 
            name="Profils" 
            component={ProfileStack} 
            options={({ route }) => ({
              headerShown: false,
              tabBarVisible: route.state?.index === 0, 
            })} 
          />
        </Tab.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default App;