import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/fonelli-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10, // Añade espacio vertical
  },
  logo: {
    width: '100%',
    height: '30%', // Reduce la altura del logo
    marginTop: 150, // Añade margen superior
  },
  subtitle: {
    fontSize: 18,
    color: '#000',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1E3A8A',
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 100, // Aumenta el margen inferior
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;