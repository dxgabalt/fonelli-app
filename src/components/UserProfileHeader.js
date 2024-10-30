import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getCurrentUser } from '../services/api';

const UserProfileHeader = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserData(user);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  if (!userData) return null;

  return (
    <View style={styles.userInfoContainer}>
      {userData?.imagen_url ? (
        <Image
          source={{ uri: userData.imagen_url }}
          style={styles.profileImage}
        />
      ) : (
        <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
          <Text style={styles.profileImagePlaceholderText}>
            {userData?.nombre?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.userTextContainer}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
        <Text style={styles.userName}>{userData?.nombre || 'Usuario'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileImagePlaceholder: {
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontWeight: 'bold',

  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default UserProfileHeader;