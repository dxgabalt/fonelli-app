import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Share
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { getCurrentUser, getOrders, cancelOrder, canEditOrder } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

const StatusTabs = ({ activeTab, onTabChange }) => {
  const tabs = ['Todos', 'Capturado', 'Solicitado'];
  
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab
          ]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab && styles.activeTabText
          ]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const OrderItem = ({ order, onCancel, onEdit, onDownloadXLS, onDownloadPDF }) => {
  const getStatusColor = (status) => {
    return status === 'capturado' ? '#22C55E' : '#F59E0B';
  };

  const getDisplayStatus = (status) => {
    return status === 'capturado' ? 'Capturado' : 'Solicitado';
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderName}>{order.nombre_pedido}</Text>
        <Text style={[
          styles.orderStatus,
          { color: getStatusColor(order.estado) }
        ]}>
          {getDisplayStatus(order.estado)}
        </Text>
      </View>

      <View style={styles.orderActions}>
        {order.estado === 'capturado' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => onDownloadXLS(order)}
            >
              <Text style={styles.downloadButtonText}>Descargar XLS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton, styles.pdfButton]}
              onPress={() => onDownloadPDF(order)}
            >
              <Text style={[styles.downloadButtonText, styles.pdfButtonText]}>
                Descargar PDF
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onCancel(order.id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(order)}
            >
              <Text style={styles.editButtonText}>Editar pedido</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadOrders();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getOrders();
      setOrders(response);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    Alert.alert(
      'Cancelar Pedido',
      '¿Está seguro que desea cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId);
              loadOrders();
              Alert.alert('Éxito', 'Pedido cancelado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar el pedido');
            }
          }
        }
      ]
    );
  };

  const handleEdit = async (order) => {
    try {
      if (order.estado === 'capturado') {
        Alert.alert('Error', 'No se puede editar un pedido capturado');
        return;
      }
  
      const canEdit = await canEditOrder(order.id);
      
      if (!canEdit) {
        Alert.alert('Error', 'Este pedido no puede ser editado en este momento');
        return;
      }
  
      navigation.navigate('EditOrder', { 
        orderId: order.id,
        onOrderUpdated: loadOrders
      });
    } catch (error) {
      console.error('Error al intentar editar el pedido:', error);
      Alert.alert('Error', 'Hubo un problema al intentar editar el pedido');
    }
  };

  const generateXLSFile = async (order) => {
    try {
      const wb = XLSX.utils.book_new();
      
      const orderData = [
        ['Detalles del Pedido'],
        ['ID', order.id],
        ['Nombre', order.nombre_pedido],
        ['Estado', order.estado],
        ['Modelo', order.modelo],
        ['Número de Piezas', order.numero_piezas],
        ['Talla', order.talla],
        ['Kilataje', order.kilataje],
        ['Color', order.color],
        ['Inicial', order.inicial],
        ['Piedra', order.piedra],
        ['Largo', order.largo],
        ['Observaciones', order.observaciones],
        ['Fecha de Creación', new Date(order.created_at).toLocaleDateString()]
      ];

      const ws = XLSX.utils.aoa_to_sheet(orderData);
      XLSX.utils.book_append_sheet(wb, ws, 'Pedido');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      const fileName = `Pedido_${order.id}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      return filePath;
    } catch (error) {
      console.error('Error generando XLS:', error);
      throw error;
    }
  };

  const generatePDFContent = (order) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1E3A8A; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Detalles del Pedido</h1>
          <div class="detail">
            <span class="label">ID:</span> ${order.id}
          </div>
          <div class="detail">
            <span class="label">Nombre:</span> ${order.nombre_pedido}
          </div>
          <div class="detail">
            <span class="label">Estado:</span> ${order.estado}
          </div>
          <div class="detail">
            <span class="label">Modelo:</span> ${order.modelo}
          </div>
          <div class="detail">
            <span class="label">Número de Piezas:</span> ${order.numero_piezas}
          </div>
          <div class="detail">
            <span class="label">Talla:</span> ${order.talla}
          </div>
          <div class="detail">
            <span class="label">Kilataje:</span> ${order.kilataje}
          </div>
          <div class="detail">
            <span class="label">Color:</span> ${order.color}
          </div>
          <div class="detail">
            <span class="label">Inicial:</span> ${order.inicial}
          </div>
          <div class="detail">
            <span class="label">Piedra:</span> ${order.piedra}
          </div>
          <div class="detail">
            <span class="label">Largo:</span> ${order.largo}
          </div>
          <div class="detail">
            <span class="label">Observaciones:</span> ${order.observaciones || '-'}
          </div>
          <div class="detail">
            <span class="label">Fecha de Creación:</span> ${new Date(order.created_at).toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadXLS = async (order) => {
    try {
      const filePath = await generateXLSFile(order);
      
      if (Platform.OS === 'android') {
        const UTI = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        await Sharing.shareAsync(filePath, { UTI });
      } else {
        await Share.share({
          url: filePath,
          title: `Pedido_${order.id}.xlsx`
        });
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el archivo XLS');
    }
  };

  const handleDownloadPDF = async (order) => {
    try {
      const htmlContent = generatePDFContent(order);
      const fileName = `Pedido_${order.id}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, htmlContent);

      if (Platform.OS === 'android') {
        await Sharing.shareAsync(filePath, { UTI: 'application/pdf' });
      } else {
        await Share.share({
          url: filePath,
          title: fileName
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el archivo PDF');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Capturado') return order.estado === 'capturado';
    if (activeTab === 'Solicitado') return order.estado !== 'capturado';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <Text style={styles.headerTitle}>Historial de {userData?.nombre}</Text>
      </View>

      <StatusTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView style={styles.ordersList}>
        {filteredOrders.map((order) => (
          <OrderItem
            key={order.id}
            order={order}
            onCancel={handleCancel}
            onEdit={handleEdit}
            onDownloadXLS={handleDownloadXLS}
            onDownloadPDF={handleDownloadPDF}
          />
        ))}
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
    backgroundColor: '#FFFFFF',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileImagePlaceholder: {
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  ordersList: {
    flex: 1,
    padding: 20,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderStatus: {
    fontSize: 14,
    
    fontWeight: '500',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pdfButton: {
    backgroundColor: '#1E3A8A',
    borderWidth: 0,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
  },
  editButton: {
    backgroundColor: '#1E3A8A',
  },
  downloadButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  pdfButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OrderHistoryScreen;