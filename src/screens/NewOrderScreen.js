import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { createOrder } from '../services/api';
import UserProfileHeader from '../components/UserProfileHeader';
import BottomNavBar from '../components/BottomNavBar';

const NewOrderScreen = () => {
  const navigation = useNavigation();
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

  const [errors, setErrors] = useState({});

  const fieldValidations = {
    modelo: {
      required: true,
      maxLength: 50,
      helper: "Ingrese el modelo de la joya (máximo 50 caracteres)"
    },
    numero_piezas: {
      required: true,
      type: "number",
      min: 1,
      max: 1000,
      helper: "Ingrese la cantidad de piezas (1-1000)"
    },
    talla: {
      required: true,
      maxLength: 10,
      helper: "Ingrese la talla (ejemplo: 7, 8½)"
    },
    kilataje: {
      required: true,
      helper: "Ingrese el kilataje (ejemplo: 14k, 18k, 24k)"
    },
    color: {
      required: true,
      maxLength: 20,
      helper: "Ingrese el color del material"
    },
    inicial: {
      type: "text",
      maxLength: 5,
      helper: "Ingrese las iniciales (opcional)"
    },
    nombre_pedido: {
      required: true,
      maxLength: 100,
      helper: "Ingrese un nombre para identificar el pedido"
    },
    piedra: {
      maxLength: 50,
      helper: "Ingrese el tipo de piedra (opcional)"
    },
    largo: {
      type: "decimal",
      min: 0,
      max: 100,
      helper: "Ingrese el largo en centímetros (opcional)"
    },
    observaciones: {
      maxLength: 500,
      helper: "Ingrese observaciones adicionales (opcional)"
    }
  };

  const validateField = (name, value) => {
    const validation = fieldValidations[name];
    if (!validation) return '';

    if (validation.required && !value) {
      return 'Este campo es requerido';
    }

    if (validation.type === 'number') {
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        return 'Debe ingresar un número válido';
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return `El valor mínimo es ${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `El valor máximo es ${validation.max}`;
      }
    }

    if (validation.type === 'decimal') {
      const numValue = parseFloat(value);
      if (value && isNaN(numValue)) {
        return 'Debe ingresar un número decimal válido';
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return `El valor mínimo es ${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `El valor máximo es ${validation.max}`;
      }
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return `Máximo ${validation.maxLength} caracteres`;
    }

    return '';
  };

  const handleChange = (name, value) => {
    // Validación específica por tipo de campo
    if (fieldValidations[name].type === 'number') {
      // Solo permitir números
      value = value.replace(/[^0-9]/g, '');
    } else if (fieldValidations[name].type === 'decimal') {
      // Permitir números y un punto decimal
      value = value.replace(/[^0-9.]/g, '');
      // Evitar múltiples puntos decimales
      const parts = value.split('.');
      if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isLoading) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('No se encontró información del usuario');

      const orderData = {
        ...formData,
        numero_piezas: parseInt(formData.numero_piezas),
        inicial: formData.inicial || null,
        largo: formData.largo ? parseFloat(formData.largo) : null,
        observaciones: formData.observaciones || null
      };

      await createOrder(orderData);
      Alert.alert('Éxito', 'Pedido creado correctamente', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Pedido</Text>
      </View>

      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={styles.formContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(formData).map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
              {fieldValidations[field].required && 
                <Text style={styles.required}> *</Text>
              }
            </Text>
            <TextInput
              style={[
                styles.input,
                errors[field] ? styles.inputError : null,
                field === 'observaciones' ? styles.textArea : null
              ]}
              value={formData[field]}
              onChangeText={(value) => handleChange(field, value)}
              placeholder={fieldValidations[field].helper}
              keyboardType={
                fieldValidations[field].type === 'number' || 
                fieldValidations[field].type === 'decimal'
                  ? 'numeric' 
                  : 'default'
              }
              multiline={field === 'observaciones'}
              numberOfLines={field === 'observaciones' ? 4 : 1}
              editable={!isLoading}
            />
            {errors[field] ? (
              <Text style={styles.errorText}>{errors[field]}</Text>
            ) : (
              <Text style={styles.helperText}>
                {fieldValidations[field].helper}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Creando pedido...' : 'Crear Pedido'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomNavSpacer} />
      </ScrollView>

      <BottomNavBar />
    </KeyboardAvoidingView>
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
  },
  formContentContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  inputError: {
    borderColor: '#DC2626',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
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
  bottomNavSpacer: {
    height: 80,
  }
});

export default NewOrderScreen;