import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (routeName) => {
    // Considera NewOrder como la pantalla "inicio"
    if (routeName === 'NewOrder') {
      return route.name === 'NewOrder' || route.name === 'Dashboard';
    }
    return route.name === routeName;
  };

  const getIconColor = (routeName) => {
    return isActive(routeName) ? '#24b1e7' : '#ffffff';
  };

  const getTextColor = (routeName) => {
    return isActive(routeName) ? '#24b1e7' : '#ffffff';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('NewOrder')}
        >
          <Ionicons 
            name={isActive('NewOrder') ? 'home' : 'home-outline'} 
            size={24} 
            color={getIconColor('NewOrder')} 
          />
          <Text style={[styles.navText, { color: getTextColor('NewOrder') }]}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Contact')}
        >
          <Ionicons 
            name={isActive('Contact') ? 'logo-whatsapp' : 'logo-whatsapp'} 
            size={24} 
            color={getIconColor('Contact')} 
          />
          <Text style={[styles.navText, { color: getTextColor('Contact') }]}>
            Contacto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Ionicons 
            name={isActive('OrderHistory') ? 'time' : 'time-outline'} 
            size={24} 
            color={getIconColor('OrderHistory')} 
          />
          <Text style={[styles.navText, { color: getTextColor('OrderHistory') }]}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1E3A8A',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNavBar;