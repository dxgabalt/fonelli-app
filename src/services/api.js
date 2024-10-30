import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://back-joyeria.onrender.com';

// Función auxiliar para manejar errores
const handleError = (error) => {
  console.error('Error detallado:', error);
  
  if (error.response) {
    console.error('Datos del error:', error.response.data);
    console.error('Estado:', error.response.status);
    
    switch (error.response.status) {
      case 401:
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      case 403:
        throw new Error('No tiene permisos para realizar esta acción.');
      case 404:
        throw new Error('Recurso no encontrado.');
      default:
        throw new Error(error.response.data.message || 'Error en el servidor.');
    }
  } else if (error.request) {
    throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
  }
  throw new Error('Error en la solicitud.');
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/usuarios/login`, { email, password });
    
    if (!response.data?.token || !response.data?.usuario?.id) {
      throw new Error('Respuesta del servidor inválida');
    }

    // Guardar toda la información del usuario
    await Promise.all([
      AsyncStorage.setItem('userToken', response.data.token),
      AsyncStorage.setItem('userId', response.data.usuario.id),
      AsyncStorage.setItem('userRole', response.data.usuario.rol),
      AsyncStorage.setItem('userName', response.data.usuario.nombre || ''),
      AsyncStorage.setItem('userEmail', response.data.usuario.email),
      AsyncStorage.setItem('userImage', response.data.usuario.imagen_url || '')
    ]);
    
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createOrder = async (orderData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');

    if (!token || !userId) {
      throw new Error('No se encontró información de autenticación');
    }

    // Asegurarse de que el pedido tenga el cliente_id
    const completeOrderData = {
      ...orderData,
      cliente_id: userId
    };

    const response = await axios.post(
      `${API_URL}/pedidos`,
      completeOrderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getOrders = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');
    
    if (!token || !userId) {
      throw new Error('No se encontró información de autenticación');
    }

    const response = await axios.get(
      `${API_URL}/pedidos?cliente_id=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Función para obtener la información del usuario actual
export const getCurrentUser = async () => {
  try {
    const [token, userId, userRole, userName, userEmail, userImage] = await Promise.all([
      AsyncStorage.getItem('userToken'),
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('userRole'),
      AsyncStorage.getItem('userName'),
      AsyncStorage.getItem('userEmail'),
      AsyncStorage.getItem('userImage')
    ]);

    if (!token || !userId) {
      throw new Error('No se encontró información de autenticación');
    }

    return {
      id: userId,
      nombre: userName,
      email: userEmail,
      rol: userRole,
      imagen_url: userImage
    };
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    throw new Error('Error al obtener información del usuario');
  }
};

// Función para verificar la autenticación
export const checkAuth = async () => {
  try {
    const [token, userRole] = await Promise.all([
      AsyncStorage.getItem('userToken'),
      AsyncStorage.getItem('userRole')
    ]);

    if (!token || userRole !== 'cliente') {
      throw new Error('No autorizado');
    }

    return true;
  } catch (error) {
    throw new Error('No autorizado');
  }
};

// Función para limpiar los datos de la sesión
export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'userToken',
      'userId',
      'userRole',
      'userName',
      'userEmail',
      'userImage'
    ]);
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw new Error('Error al cerrar sesión');
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await axios.put(
      `${API_URL}/pedidos/${orderId}/cancelar`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Función para actualizar un pedido
export const updateOrder = async (orderId, orderData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    // Verificar que el pedido pertenezca al usuario actual
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('No se encontró información del usuario');
    }

    const response = await axios.put(
      `${API_URL}/pedidos/${orderId}`,
      {
        ...orderData,
        cliente_id: userId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Función para obtener un pedido específico
export const getOrderById = async (orderId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');
    
    if (!token || !userId) {
      throw new Error('No se encontró información de autenticación');
    }

    const response = await axios.get(
      `${API_URL}/pedidos/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Verificar que el pedido pertenezca al usuario actual
    if (response.data.cliente_id !== userId) {
      throw new Error('No tiene permisos para ver este pedido');
    }

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Función para obtener pedidos filtrados por estado
export const getOrdersByStatus = async (status) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');
    
    if (!token || !userId) {
      throw new Error('No se encontró información de autenticación');
    }

    let url = `${API_URL}/pedidos?cliente_id=${userId}`;
    if (status && status !== 'Todos') {
      url += `&estado=${status.toLowerCase()}`;
    }

    const response = await axios.get(
      url,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Función para verificar si un pedido puede ser editado
export const canEditOrder = async (orderId) => {
  try {
    const order = await getOrderById(orderId);
    return order.estado === 'solicitado';
  } catch (error) {
    console.error('Error al verificar si el pedido puede ser editado:', error);
    return false;
  }
};

// Función para verificar si un pedido puede ser cancelado
export const canCancelOrder = async (orderId) => {
  try {
    const order = await getOrderById(orderId);
    return order.estado === 'solicitado' && !order.cancelado;
  } catch (error) {
    console.error('Error al verificar si el pedido puede ser cancelado:', error);
    return false;
  }
};