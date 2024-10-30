import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/api';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingrese email y contraseña');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(email, password);
      
      if (response.usuario && response.usuario.rol === 'cliente') {
        // Guardar los datos de autenticación
        await Promise.all([
          AsyncStorage.setItem('userToken', response.token),
          AsyncStorage.setItem('userId', response.usuario.id),
          AsyncStorage.setItem('userRole', response.usuario.rol),
          // Opcionalmente, guardar más datos del usuario si los necesitas
          AsyncStorage.setItem('userName', response.usuario.nombre || ''),
          AsyncStorage.setItem('userEmail', response.usuario.email)
        ]);
        
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', 'Solo los clientes pueden iniciar sesión en esta aplicación');
      }
    } catch (error) {
      console.error('Error detallado:', error);
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'Hubo un problema al iniciar sesión. Por favor, verifique sus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      <Image
        source={require('../../assets/fonelli-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.welcomeText}>Bienvenido de vuelta</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  logo: {
    width: '60%',
    height: '30%',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1E3A8A',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;