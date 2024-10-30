import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import NewOrderScreen from './src/screens/NewOrderScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import EditOrderScreen from './src/screens/EditOrderScreen'; // Añadimos esta importación

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    } catch (error) {
      console.error('Error al verificar el estado de inicio de sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="NewOrder" component={NewOrderScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen 
          name="EditOrder" 
          component={EditOrderScreen}
          options={{
            gestureEnabled: true,
            gestureDirection: 'horizontal'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}