import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updateOrder, canEditOrder, getOrderById } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

const EditOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    modelo: '',
    numero_piezas: '',
    talla: '',
    kilataje: '',
    color: '',
    inicial: '',
    nombre_pedido: '',
    piedra: '',
    largo: '',
    observaciones: ''
  });

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    try {
      const orderData = await getOrderById(orderId);
      setFormData({
        modelo: orderData.modelo || '',
        numero_piezas: orderData.numero_piezas?.toString() || '',
        talla: orderData.talla || '',
        kilataje: orderData.kilataje || '',
        color: orderData.color || '',
        inicial: orderData.inicial?.toString() || '',
        nombre_pedido: orderData.nombre_pedido || '',
        piedra: orderData.piedra || '',
        largo: orderData.largo?.toString() || '',
        observaciones: orderData.observaciones || ''
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del pedido');
      navigation.goBack();
    }
  };

  const checkEditPermission = async () => {
    try {
      const canEdit = await canEditOrder(orderId);
      if (!canEdit) {
        Alert.alert(
          'Error',
          'Este pedido no puede ser editado',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el permiso de edición');
      navigation.goBack();
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['modelo', 'numero_piezas', 'talla', 'kilataje', 'color', 'nombre_pedido'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    try {
      const orderData = {
        ...formData,
        numero_piezas: parseInt(formData.numero_piezas),
        inicial: parseFloat(formData.inicial) || 0,
        largo: parseFloat(formData.largo) || 0
      };

      await updateOrder(orderId, orderData);
      Alert.alert('Éxito', 'Pedido actualizado correctamente', [
        { text: 'OK', onPress: () => {
          if (route.params?.onOrderUpdated) {
            route.params.onOrderUpdated();
          }
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Pedido</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        {Object.keys(formData).map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
              {['modelo', 'numero_piezas', 'talla', 'kilataje', 'color', 'nombre_pedido'].includes(field) && 
                <Text style={styles.required}> *</Text>
              }
            </Text>
            <TextInput
              style={[
                styles.input,
                field === 'observaciones' && styles.textArea
              ]}
              value={formData[field]}
              onChangeText={(value) => handleChange(field, value)}
              placeholder={`Ingrese ${field.replace('_', ' ')}`}
              keyboardType={
                ['numero_piezas', 'inicial', 'largo'].includes(field) 
                  ? 'numeric' 
                  : 'default'
              }
              multiline={field === 'observaciones'}
              numberOfLines={field === 'observaciones' ? 4 : 1}
              editable={!isLoading}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Actualizando...' : 'Actualizar Pedido'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#1E3A8A',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1F2937',
    fontWeight: '500',
  },
  required: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default EditOrderScreen;