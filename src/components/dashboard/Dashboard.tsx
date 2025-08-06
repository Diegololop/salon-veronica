import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, List, Plus, Edit, Trash2, X, Eye, Search, Printer, StickyNote, Filter, Wrench, DollarSign, FileCheck,
  CheckCircle,
  Bell,
  XCircle
} from 'lucide-react';
import { FixedSizeList as VirtualList } from 'react-window';
import { debounce } from 'lodash';
import { getCurrentUser } from '../../lib/auth';
import { ServiceOrderForm } from './ServiceOrderForm';
import { supabase } from '../../lib/supabase';
import { notifyQuoteReady, notifyStatusChange } from '../../lib/notifications';
import type { User } from '../../types/auth';
import type { ServiceOrder, ServiceOrderFormData } from '../../types/orders';
import toast from 'react-hot-toast';

// El tipo de dato para la notificación ahora coincide con tu tabla de Supabase
type NotificationType = {
  id: string;
  created_at: string;
  message: string;
  type: 'quote_approved' | 'quote_rejected' | 'status_change';  
  is_read: boolean;
  order_id: string;
};

// --- AJUSTES DE DISEÑO ---
const ITEMS_PER_PAGE = 20;
// AHORA TENEMOS DOS ALTURAS DIFERENTES
const ROW_HEIGHT_MOBILE = 180; // Altura para las tarjetas en móvil
const ROW_HEIGHT_DESKTOP = 88;  // Altura más compacta para las filas de escritorio

// Helper para comparar strings de forma segura
const safeStringCompare = (value: any, searchTerm: string): boolean => {
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(searchTerm.toLowerCase());
};

// Hook para detectar si la vista es móvil. Es necesario para cambiar la lógica de la librería VirtualList.
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};


export function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // <-- CAMBIO CLAVE: Usamos el hook
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Función para obtener el nombre del rol
  const getRoleName = (role: User['role']) => {
    if (role === 'admin') return 'Admin';
    if (role === 'technician') return 'Técnico';
    if (role === 'receptionist') return 'Recepción';
    return 'Cliente';
  }

  // Estados combinados
  const [activeView, setActiveView] = useState<'orders' | 'users'>('orders');
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);


  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  const [showWarrantyPopup, setShowWarrantyPopup] = useState(false);


  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotingOrder, setQuotingOrder] = useState<ServiceOrder | null>(null);
  const [finalQuote, setFinalQuote] = useState<number | null>(null);
  const [quoteDescription, setQuoteDescription] = useState('');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<ServiceOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [notes, setNotes] = useState('');
  const [warrantyDays, setWarrantyDays] = useState<number | null>(null);

  type StaffRole = 'technician' | 'receptionist' | 'admin';
  const staffFormDataInitialState = {
      email: '', password: '', full_name: '', rut: '', phone: '', role: 'technician' as StaffRole
    };
  const [staffFormData, setStaffFormData] = useState<typeof staffFormDataInitialState>(staffFormDataInitialState);


  const [statusFilter, setStatusFilter] = useState<ServiceOrder['status'] | 'all'>('all');
  const [searchOption, setSearchOption] = useState<'all' | 'order_number' | 'customer_name' | 'customer_rut' | 'equipment_brand' | 'equipment_model'>('all');

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false }); 

    if (error) {
      console.error('Error al cargar notificaciones:', error);
    } else {
      setNotifications(data || []);
    }
  }, [supabase]);

  // Carga las notificaciones la primera vez que el componente se monta
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  const loadData = useCallback(async (user: User) => {
    try {
      setLoading(true);
      setError(null);

      // Función para obtener todos los registros paginados
      const fetchAllOrders = async () => {
        let allOrders: ServiceOrder[] = [];
        let currentPage = 0;
        const pageSize = 1000; // Máximo permitido por Supabase
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from('service_orders')
            .select('*')
            .order('created_at', { ascending: false })
            .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

          if (error) throw error;
          if (data && data.length > 0) {
            allOrders = [...allOrders, ...data];
            currentPage++;
          } else {
            hasMore = false;
          }
        }
        return allOrders;
      };

      // Obtener todas las órdenes paginadas
      const ordersData = await fetchAllOrders();
      setOrders(ordersData);

      if (user.role === 'admin') {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (usersError) throw usersError;
        setUsers(usersData || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  // Nos suscribimos a cualquier INSERT nuevo en la tabla 'notifications'
  const channel = supabase
    .channel('realtime-notifications')
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      },
      (payload) => {
        console.log('¡Nueva notificación recibida!', payload);
        // Cuando llega una, simplemente volvemos a cargar la lista de notificaciones.
        // Esto actualizará la campanita y la lista desplegable.
        toast.success("Tienes una nueva notificación.");
        fetchNotifications();
      }
    )
    .subscribe();

  // Función de limpieza para cerrar el canal al salir
  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, fetchNotifications]);

useEffect(() => {
  // Esta función se ejecutará cada 30 segundos para buscar notificaciones nuevas.
  const intervalId = setInterval(() => {
    console.log("Buscando nuevas notificaciones...");
    fetchNotifications();
  }, 30000); // 30000 milisegundos = 30 segundos

  // Es importante limpiar el intervalo cuando el usuario navega a otra página
  // para evitar que se siga ejecutando en el fondo.
  return () => clearInterval(intervalId);
}, [fetchNotifications]);


  // Efecto para obtener el usuario actual y cargar datos iniciales
  useEffect(() => {
    const fetchUserAndData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUser(user);
      if (user.role !== 'admin') {
        setSearchOption('order_number'); 
      }
      await loadData(user);
    };
    fetchUserAndData();
  }, [navigate, loadData]);

  // Búsqueda con debounce
  const debouncedSearch = useRef(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    }, 300)
  ).current;

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);
  
  // Memoización de datos filtrados
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(order => {
        if (searchOption === 'all' && currentUser?.role === 'admin') {
          return [order.order_number?.toString(), order.customer_name, order.customer_rut, order.equipment_brand, order.equipment_model].some(field => safeStringCompare(field, searchTerm));
        }
        if (searchOption === 'order_number') {
            return order.order_number?.toString() === searchTerm;
        }
        const key = searchOption as keyof ServiceOrder;
        return safeStringCompare(order[key], searchTerm);
      });
    }
    return result;
  }, [orders, searchTerm, statusFilter, searchOption, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm || currentUser?.role !== 'admin') return users;
    return users.filter(user => [user.full_name, user.email, user.rut, user.phone].some(field => safeStringCompare(field, searchTerm)));
  }, [searchTerm, users, currentUser]);

  const paginatedData = useMemo(() => {
    const data = activeView === 'orders' ? filteredOrders : filteredUsers;
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredOrders, filteredUsers, currentPage, activeView]);

  const totalPages = useMemo(() => {
    const totalItems = activeView === 'orders' ? filteredOrders.length : filteredUsers.length;
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  }, [filteredOrders, filteredUsers, activeView]);

  // === MANEJADORES DE EVENTOS ===

  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: ServiceOrder['status']) => {
    if (!currentUser) return;

    if (newStatus === 'quoted' && (currentUser.role === 'admin' || currentUser.role === 'technician' || currentUser.role === 'receptionist')) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setQuotingOrder(order);
            setFinalQuote(order.total_amount || null); // Pre-rellena con el valor actual si existe
            setShowQuoteModal(true);
        }
        return;
    }

    if (newStatus === 'cancelled' && (currentUser.role === 'admin' || currentUser.role === 'technician')) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setOrderToCancel(order);
        setShowCancelModal(true);
      }
      return;
    }
    
    if (newStatus === 'delivered' && currentUser.role === 'receptionist') {
      setSelectedOrder(orders.find(order => order.id === orderId) || null);
      setShowWarrantyPopup(true);
      return;
    }

    const toastId = toast.loading('Actualizando estado...');
    try {
      setUpdateLoading(orderId);
      const updates: Partial<ServiceOrder> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      
      if (currentUser.role === 'technician' || currentUser.role === 'admin') {
        updates.technician_id = newStatus === 'pending' ? undefined : currentUser.id;
      }

      const { data, error } = await supabase.from('service_orders').update(updates).eq('id', orderId).select().single();
      if (error) throw error;
      
      if (data) {
        toast.loading('Enviando notificación...', { id: toastId });
        const notificationSent = await notifyStatusChange(data.customer_phone, data.order_number.toString().padStart(6, '0'), newStatus);
        
        setOrders(prev => prev.map(order => order.id === orderId ? { ...order, ...data } : order));

        if (notificationSent) {
          toast.success('Estado actualizado y notificado.', { id: toastId });
        } else {
          toast.error('Estado actualizado, pero la notificación falló.', { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error('Error al actualizar el estado.', { id: toastId });
      setError(err.message);
    } finally {
      setUpdateLoading(null);
    }
  }, [orders, currentUser]);
  
  const handleNotesSave = useCallback(async () => {
    if (!selectedOrder) return;
    const toastId = toast.loading('Guardando notas...');
    try {
      const { error } = await supabase.from('service_orders').update({ notes }).eq('id', selectedOrder.id);
      if (error) throw error;
      setOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, notes } : order));
      toast.success('Notas actualizadas', { id: toastId });
      setShowNotesPopup(false);
    } catch (err: any) {
      toast.error('Error al guardar las notas.', { id: toastId });
      setError(err.message);
    }
  }, [selectedOrder, notes]);

  const handleCancelConfirm = useCallback(async () => {
    if (!orderToCancel || !cancelReason.trim()) return;
    setUpdateLoading(orderToCancel.id);
    const toastId = toast.loading('Cancelando orden...');
    try {
      const updates = {
        status: 'cancelled' as const,
        notes: `${orderToCancel.notes || ''}\n\nMotivo de cancelación: ${cancelReason}`,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('service_orders').update(updates).eq('id', orderToCancel.id).select().single();
      if (error) throw error;
      if (data) await notifyStatusChange(data.customer_phone, data.order_number.toString().padStart(6, '0'), 'cancelled', cancelReason);

      setOrders(prev => prev.map(order => order.id === orderToCancel.id ? { ...order, ...data } : order));
      toast.success('Orden cancelada', { id: toastId });
      setShowCancelModal(false);
    } catch (err: any) {
      toast.error('Error al cancelar la orden', { id: toastId });
      setError(err.message);
    } finally {
      setUpdateLoading(null);
      setCancelReason('');
      setOrderToCancel(null);
    }
  }, [orderToCancel, cancelReason]);
  
  const handleCreateOrder = useCallback(async (data: ServiceOrderFormData) => {
    if (!currentUser) return;
    const toastId = toast.loading('Creando orden...');
    setError(null);
    try {
      const { data: newOrder, error: orderError } = await supabase
        .from('service_orders')
        .insert([{
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          customer_address: data.customerAddress,
          customer_rut: data.customerRut,
          equipment_type: data.equipmentType,
          equipment_brand: data.brand,
          equipment_model: data.model,
          imei: data.imei,
          equipment_condition: data.condition,
          work_description: data.description,
          technical_work: data.technicalWork,
          technician_id: data.technicianId || null,
          quote: data.quote,
          advance_payment: data.advancePayment,
          total_amount: data.quote, 
          status: 'pending',
          receptionist_id: currentUser.id,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      if (newOrder) {
        await notifyStatusChange(
          newOrder.customer_phone,
          newOrder.order_number.toString().padStart(6, '0'),
          'pending'
        );
        setOrders(prev => [newOrder, ...prev]);
      }
      setShowOrderForm(false);
      toast.success('Orden creada y notificada.', { id: toastId });
    } catch (err: any) {
      toast.error('Error al crear la orden.', { id: toastId });
      setError(err.message);
    }
  }, [currentUser]);

  const handleDeleteOrder = useCallback(async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta orden permanentemente? Esta acción no se puede deshacer.')) return;
    const toastId = toast.loading('Eliminando orden...');
    try {
      const { error } = await supabase.from('service_orders').delete().eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Orden eliminada', { id: toastId });
    } catch (err: any) {
      toast.error('Error al eliminar la orden.', { id: toastId });
      setError(err.message);
    }
  }, []);

  const handleViewOrder = useCallback((orderId: string) => navigate(`/orders/view/${orderId}`), [navigate]);
  const handleEditOrder = useCallback((orderId: string) => navigate(`/orders/${orderId}`), [navigate]);
  const handlePrintOrder = useCallback((orderId: string) => navigate(`/print-select/${orderId}`), [navigate]);
  const handleNotesOpen = useCallback((order: ServiceOrder) => {
    setSelectedOrder(order);
    setNotes(order.notes || '');
    setShowNotesPopup(true);
  }, []);

  const handleStaffSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingUser ? 'Actualizando usuario...' : 'Creando usuario...');
    try {
      if (editingUser) {
        const { error } = await supabase.from('profiles').update({
          full_name: staffFormData.full_name,
          phone: staffFormData.phone,
          role: staffFormData.role,
        }).eq('id', editingUser.id);
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email: staffFormData.email, password: staffFormData.password });
        if (authError) throw authError;
        if (!authData.user) throw new Error('No se pudo crear el usuario');
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id, email: staffFormData.email, full_name: staffFormData.full_name, rut: staffFormData.rut, phone: staffFormData.phone, role: staffFormData.role,
        }]);
        if (profileError) throw profileError;
      }
      if (currentUser) await loadData(currentUser);
      setShowStaffForm(false);
      toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setEditingUser(null);
      setStaffFormData(staffFormDataInitialState);
    }
  }, [editingUser, staffFormData, currentUser, loadData]);

  const handleEditUser = useCallback((user: User) => {
      setEditingUser(user);
      const validRoles: StaffRole[] = ['technician', 'receptionist', 'admin'];
      setStaffFormData({
        email: user.email,
        password: '',
        full_name: user.full_name,
        rut: user.rut,
        phone: user.phone,
        role: validRoles.includes(user.role as StaffRole) ? (user.role as StaffRole) : 'technician'
      });
      setShowStaffForm(true);
    }, []);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    const toastId = toast.loading('Eliminando usuario...');
    try {
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileError) throw profileError;
      if(currentUser) await loadData(currentUser);
      toast.success('Usuario eliminado', { id: toastId });
    } catch (err: any) {
      toast.error('Error al eliminar usuario.', { id: toastId });
    }
  }, [currentUser, loadData]);

  const handlePriceUpdate = useCallback(async (orderId: string, newPrice: number) => {
    setUpdateLoading(orderId);
    try {
      const { data, error } = await supabase.from('service_orders').update({ total_amount: newPrice }).eq('id', orderId).select().single();
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? data : o));
      toast.success('Precio actualizado');
    } catch (err: any) {
      toast.error('Error al actualizar precio');
    } finally {
      setUpdateLoading(null);
    }
  }, []);

  const handleWarrantySubmit = useCallback(async () => {
    if (!selectedOrder || warrantyDays === null || warrantyDays < 0) {
        toast.error("Por favor, ingrese un número válido de días de garantía.");
        return;
    }
    const toastId = toast.loading('Entregando orden...');
    try {
      const updates = { status: 'delivered' as const, warranty_days: warrantyDays, delivered_at: new Date().toISOString() };
      const { error } = await supabase.from('service_orders').update(updates).eq('id', selectedOrder.id);
      if (error) throw error;
      await notifyStatusChange(selectedOrder.customer_phone, selectedOrder.order_number.toString().padStart(6, '0'), 'delivered', `${warrantyDays} días de garantía`);
      if(currentUser) await loadData(currentUser);
      setShowWarrantyPopup(false);
      toast.success('Orden entregada con garantía', { id: toastId });
    } catch (err: any) {
      toast.error('Error al entregar la orden.', { id: toastId });
    } finally {
      setWarrantyDays(null);
    }
  }, [selectedOrder, warrantyDays, currentUser, loadData]);

  const handleQuoteOpen = useCallback((order: ServiceOrder) => {
    setQuotingOrder(order);
    setFinalQuote(order.total_amount || null);
    setQuoteDescription(order.technical_work || '');
    setShowQuoteModal(true);
  }, []);

  const handleQuoteSubmit = useCallback(async () => {
    if (!quotingOrder || finalQuote === null || finalQuote < 0) {
      toast.error("Por favor, ingrese un monto válido para el presupuesto.");
      return;
    }

    const toastId = toast.loading('Enviando presupuesto...');
    setUpdateLoading(quotingOrder.id);
    
    try {
      const updates = {
        status: 'quoted' as const,
        total_amount: finalQuote,
        technical_work: quoteDescription,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', quotingOrder.id)
        .select()
        .single();
      
      if (error) throw error;

      if (data) {
        toast.loading('Enviando notificación al cliente...', { id: toastId });
        const decisionLink = `https://servtec.cl/decision-presupuesto/${data.id}`;
        
        await notifyQuoteReady(
          data.customer_phone,
          data.order_number.toString().padStart(6, '0'),
          data.technical_work || 'Reparación general',
          data.total_amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }),
          decisionLink
        );

        setOrders(prev => prev.map(order => (order.id === quotingOrder.id ? { ...order, ...data } : order)));
        toast.success('Presupuesto enviado y notificado.', { id: toastId });
      }
      
      setShowQuoteModal(false);
      setQuotingOrder(null);
      setFinalQuote(null);
      setQuoteDescription('');
      
    } catch (err: any) {
      toast.error('Error al enviar el presupuesto.', { id: toastId });
      setError(err.message);
    } finally {
      setUpdateLoading(null);
    }
  }, [quotingOrder, finalQuote, quoteDescription]);

  // === COMPONENTES DE RENDERIZADO ===

  const OrderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const order = paginatedData[index] as ServiceOrder;
    if (!order || !currentUser) return null;

    const canShowQuoteButton = ['pending', 'in_progress'].includes(order.status);
    
    return (
      <div style={style} className="md:flex md:items-center"> {/* Contenedor que recibe el style de react-window */}
        <div className="h-full w-full p-2 md:p-0">
          {/* --- VISTA MÓVIL (TARJETA) --- */}
          <div className="md:hidden flex flex-col h-full bg-white rounded-lg shadow p-3 border border-gray-200">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-gray-800">#{order.order_number?.toString().padStart(6, '0')}</p>
                <p className="text-sm text-gray-600 truncate">{order.equipment_brand || ''} {order.equipment_model || ''}</p>
              </div>
              <select
                className={`text-xs border rounded-md p-1 shadow-sm focus:outline-none focus:ring-1 transition text-right w-28 ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : order.status === 'quoted' ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                  : order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200'
                  : order.status === 'delivered' ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : 'bg-red-100 text-red-800 border-red-200'
                }`}
                value={order.status}
                onChange={(e) => handleStatusUpdate(order.id, e.target.value as ServiceOrder['status'])}
                disabled={updateLoading === order.id}
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="quoted">Presupuestado</option>
                <option value="completed">Completado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="flex-grow my-2 pt-2 border-t">
              <p className="text-sm truncate"><span className="font-medium">Cliente:</span> {order.customer_name || 'N/A'}</p>
              <p className="text-sm font-semibold"><span className="font-medium">Total:</span> ${order.total_amount?.toLocaleString() || '0'}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              {canShowQuoteButton && (
                <button onClick={() => handleQuoteOpen(order)} title="Presupuesto Listo" className="p-1.5 rounded-md hover:bg-cyan-100">
                  <FileCheck size={16} className="text-cyan-600" />
                </button>
              )}
              <button onClick={() => handleViewOrder(order.id)} title="Ver" className="p-1.5 rounded-md hover:bg-blue-100"><Eye size={16} className="text-blue-600" /></button>
              {(currentUser.role === 'admin' || currentUser.role === 'receptionist') && (
                <>
                  <button onClick={() => handleEditOrder(order.id)} title="Editar" className="p-1.5 rounded-md hover:bg-yellow-100"><Edit size={16} className="text-yellow-600" /></button>
                  <button onClick={() => handlePrintOrder(order.id)} title="Imprimir" className="p-1.5 rounded-md hover:bg-green-100"><Printer size={16} className="text-green-600" /></button>
                </>
              )}
              <button onClick={() => handleNotesOpen(order)} title="Notas" className="p-1.5 rounded-md hover:bg-indigo-100"><StickyNote size={16} className="text-indigo-600" /></button>
              {(currentUser.role === 'admin') && (
                <button onClick={() => handleDeleteOrder(order.id)} title="Eliminar" className="p-1.5 rounded-md hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>
              )}
            </div>
          </div>
      
          {/* --- VISTA DE ESCRITORIO (FILA) --- */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 items-center h-full hover:bg-gray-50 border-b">
            <div className="col-span-1 font-semibold text-sm text-gray-800">#{order.order_number?.toString().padStart(6, '0')}</div>
            <div className="col-span-2">
              <div className="font-medium text-sm text-gray-900 truncate">{order.customer_name || 'N/A'}</div><div className="text-xs text-gray-500">{order.customer_rut || 'N/A'}</div></div>
            <div className="col-span-3"><div className="font-medium text-sm text-gray-900 truncate">{order.equipment_brand || ''} {order.equipment_model || ''}</div><div className="text-xs text-gray-500">{order.equipment_type || 'N/A'}</div></div>
            <div className="col-span-2">
              <select
                className={`text-sm border rounded-md p-1.5 w-full shadow-sm focus:outline-none focus:ring-1 transition ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' 
                  : order.status === 'in_progress' ? 'bg-blue-100 text-blue-800'
                  : order.status === 'quoted' ? 'bg-cyan-100 text-cyan-800'
                  : order.status === 'completed' ? 'bg-green-100 text-green-800' 
                  : order.status === 'delivered' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                }`}
                value={order.status}
                onChange={(e) => handleStatusUpdate(order.id, e.target.value as ServiceOrder['status'])} disabled={updateLoading === order.id}
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="quoted">Presupuestado</option>
                <option value="completed">Completado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="col-span-1 text-right">
              {currentUser.role === 'technician' || currentUser.role === 'admin' ? (
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <input type="number" className="w-20 text-sm px-2 py-1 border rounded-md shadow-sm text-right" defaultValue={order.total_amount || 0} onBlur={(e) => handlePriceUpdate(order.id, Number(e.target.value))} disabled={updateLoading === order.id} />
                </div>
              ) : (<span className="font-semibold text-gray-800">${order.total_amount?.toLocaleString() || '0'}</span>)}
            </div>
            <div className="col-span-3 flex justify-end gap-1">
              {canShowQuoteButton && (
                <button onClick={() => handleQuoteOpen(order)} title="Presupuesto Listo" className="p-1.5 rounded-md hover:bg-cyan-100">
                  <FileCheck size={16} className="text-cyan-600" />
                </button>
              )}
              <button onClick={() => handleViewOrder(order.id)} title="Ver" className="p-1.5 rounded-md hover:bg-blue-100"><Eye size={16} className="text-blue-600" /></button>
              {(currentUser.role === 'admin' || currentUser.role === 'receptionist') && (<><button onClick={() => handleEditOrder(order.id)} title="Editar" className="p-1.5 rounded-md hover:bg-yellow-100"><Edit size={16} className="text-yellow-600" /></button><button onClick={() => handlePrintOrder(order.id)} title="Imprimir" className="p-1.5 rounded-md hover:bg-green-100"><Printer size={16} className="text-green-600" /></button></>)}
              <button onClick={() => handleNotesOpen(order)} title="Notas" className="p-1.5 rounded-md hover:bg-indigo-100"><StickyNote size={16} className="text-indigo-600" /></button>
              {(currentUser.role === 'admin') && (<button onClick={() => handleDeleteOrder(order.id)} title="Eliminar" className="p-1.5 rounded-md hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>)}
            </div>
          </div>
        </div>
      </div>
    );
  }, [paginatedData, currentUser, updateLoading, handleStatusUpdate, handleViewOrder, handleEditOrder, handlePrintOrder, handleDeleteOrder, handleNotesOpen, handlePriceUpdate, handleQuoteOpen]);

  // --- RENDERIZADO PRINCIPAL ---

  if (loading || !currentUser) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Cargando panel...</div>;
  }

  // --- El manejador para ABRIR y MARCAR COMO LEÍDAS ---
  const handleOpenNotifications = async () => {
    setShowNotifications(true);

    // Encuentra los IDs de las notificaciones no leídas
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);

    // Si no hay nada que marcar, no hagas nada
    if (unreadIds.length === 0) return;
    
    // Actualiza el estado local para que el cambio sea instantáneo en la UI
    setNotifications(current =>
      current.map(n => ({ ...n, is_read: true }))
    );

    // Actualiza la base de datos
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) {
      console.error("Error al marcar notificaciones como leídas:", error);
      // Opcional: si falla la BD, revierte el cambio en la UI volviendo a cargar los datos.
      fetchNotifications();
    }
  };

  // Calcula las no leídas desde el estado actual
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Función para hacer el tiempo más legible
  const formatTimeAgo = (dateString: string | Date) => {
    if (!dateString) return 'hace un momento';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'fecha inválida';

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} min`;
    return `hace segundos`;
  };
  
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
      {/* --- Cabecera y Navegación Responsiva --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Panel de {getRoleName(currentUser.role)}</h1>
        </div>

        {/* Este es el contenedor de todos los botones de la derecha */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Botones condicionales que ya tenías */}
          {currentUser.role === 'admin' && (
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveView('orders')} 
                className={`w-full sm:w-auto px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition 
                ${activeView === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  <List size={16}/>Órdenes
              </button>

              <button onClick={() => setActiveView('users')} 
                className={`w-full sm:w-auto px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition 
                ${activeView === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  <Users size={16}/>Usuarios
              </button>
            </div>
          )}
          {activeView === 'orders' && (currentUser.role === 'admin' || currentUser.role === 'receptionist') && (
            <button onClick={() => setShowOrderForm(true)} className="bg-blue-600 text-white px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition">
              <Plus size={16}/>Nueva Orden
            </button>
          )}
          {activeView === 'users' && currentUser.role === 'admin' && (
            <button onClick={() => { setEditingUser(null); setStaffFormData(staffFormDataInitialState); setShowStaffForm(true); }} className="bg-blue-600 text-white px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition">
              <Plus size={16}/>Agregar Usuario
            </button>
          )}

          {/* --- ¡AQUÍ VA EL BOTÓN DE NOTIFICACIONES! --- */}
          <div className="relative ml-auto md:ml-2">
            <button 
              onClick={handleOpenNotifications}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={22} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* --- PANEL DE NOTIFICACIONES (POPOP) --- */}
      {showNotifications && (
        <div className="absolute top-24 right-4 sm:right-8 lg:right-12 w-80 max-w-sm bg-white rounded-lg shadow-xl border z-50">
          <div className="p-3 flex items-center justify-between border-b">
            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
            <button onClick={() => setShowNotifications(false)} className="p-1 rounded-full hover:bg-gray-200">
              <X size={18} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
              <div key={notification.id} className="p-3 border-b hover:bg-gray-50 flex items-start gap-3">
                {/* --- ÍCONO CONDICIONAL --- */}
                <div>
                  {notification.type === 'quote_approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.created_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-gray-500">No hay notificaciones.</p>
          )}
          </div>
        </div>
      )}

      {/* --- Alertas --- */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
      
      {/* --- Contenedor Principal con Sombra --- */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* --- Filtros --- */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder={`Buscar...`} className="w-full pl-9 p-2 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500" onChange={(e) => debouncedSearch(e.target.value)} />
          </div>
          {activeView === 'orders' && (
            <>
              <select className="border p-2 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500" value={searchOption} onChange={(e) => setSearchOption(e.target.value as any)}>
                {currentUser.role === 'admin' && <option value="all">Todos los campos</option>}
                <option value="order_number">N° Orden</option>
                <option value="customer_name">Nombre</option>
                <option value="customer_rut">RUT</option>
                <option value="equipment_brand">Marca</option>
                <option value="equipment_model">Modelo</option>
              </select>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select className="w-full pl-9 p-2 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="quoted">Presupuestado</option>
                  <option value="completed">Completado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </>
          )}
        </div>
      
        {/* --- Vistas de Órdenes o Usuarios --- */}
        {activeView === 'orders' ? (
          paginatedData.length === 0 ? (
            <div className="p-8 text-center text-gray-500"><Wrench className="h-10 w-10 mx-auto mb-2" /><h3 className="font-medium">No se encontraron órdenes</h3><p className="text-sm">Intenta cambiar los filtros de búsqueda.</p></div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-bold text-xs text-gray-500 uppercase border-b">
                <div className="col-span-1">N° Orden</div><div className="col-span-2">Cliente</div><div className="col-span-3">Equipo</div><div className="col-span-2">Estado</div><div className="col-span-1 text-right">Total</div><div className="col-span-3 text-right">Acciones</div>
              </div>
              <div className="bg-gray-50 md:bg-white">
                <VirtualList 
                    height={600} 
                    itemCount={paginatedData.length} 
                    width="100%"
                    // Asignamos la altura de fila correcta según el dispositivo
                    itemSize={isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT_DESKTOP}
                >
                    {OrderRow}
                </VirtualList>
              </div>
            </>
          )
        ) : ( // Vista de Usuarios
          paginatedData.length === 0 ? (
            <div className="p-8 text-center text-gray-500"><Users className="h-10 w-10 mx-auto mb-2" /><h3 className="font-medium">No se encontraron usuarios</h3></div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(paginatedData as User[]).map((user) => (
                <div key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="md:hidden text-sm text-gray-500">RUT: {user.rut || 'N/A'}</p>
                  </div>
                  <div className="hidden md:block flex-1 text-sm text-gray-500">{user.rut || 'N/A'}</div>
                  <div className="flex items-center justify-between mt-2 md:mt-0">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'technician' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{getRoleName(user.role)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditUser(user)} title="Editar" className="p-1.5 rounded-md hover:bg-yellow-100"><Edit size={16} className="text-yellow-600" /></button>
                      <button onClick={() => handleDeleteUser(user.id)} title="Eliminar" className="p-1.5 rounded-md hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        
        {/* --- Paginación --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50 text-sm">
          <div>Mostrando <strong>{paginatedData.length}</strong> de <strong>{activeView === 'orders' ? filteredOrders.length : filteredUsers.length}</strong></div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 bg-white">Anterior</button>
            <span>Página <strong>{currentPage}</strong> de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50 bg-white">Siguiente</button>
          </div>
        </div>
      </div>
      
      {/* --- MODALES --- */}
      {showOrderForm && <ServiceOrderForm onSubmit={handleCreateOrder} onClose={() => setShowOrderForm(false)} loading={loading} />}

      {showQuoteModal && quotingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Enviar Presupuesto - Orden #{quotingOrder.order_number.toString().padStart(6, '0')}</h3>
                <button onClick={() => setShowQuoteModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <label htmlFor="quote-description" className="block text-sm font-medium mb-1">Descripción del trabajo a realizar</label>
                    <textarea 
                        id="quote-description"
                        rows={4}
                        className="w-full p-2 border rounded-md" 
                        value={quoteDescription} 
                        onChange={(e) => setQuoteDescription(e.target.value)} 
                        placeholder="Ej: Cambio de pantalla, mantención de software, etc."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Monto Final del Presupuesto (CLP)</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input 
                            type="number" 
                            className="w-full p-2 pl-7 border rounded-md" 
                            value={finalQuote ?? ''} 
                            onChange={(e) => setFinalQuote(parseInt(e.target.value) || null)} 
                            placeholder="Ej: 25000"
                            autoFocus
                        />
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowQuoteModal(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">Cancelar</button>
                <button 
                    onClick={handleQuoteSubmit} 
                    disabled={updateLoading === quotingOrder.id || finalQuote === null || finalQuote < 0} 
                    className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm disabled:bg-cyan-400"
                >
                    Enviar Presupuesto
                </button>
            </div>
          </div>
        </div>
      )}

      {showNotesPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Notas - Orden #{selectedOrder.order_number.toString().padStart(6, '0')}</h3><button onClick={() => setShowNotesPopup(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button></div>
            <div className="p-4"><textarea rows={5} className="w-full p-2 border rounded-md mb-4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agregar notas internas..."/></div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3"><button onClick={() => setShowNotesPopup(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">Cancelar</button><button onClick={handleNotesSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-blue-400">Guardar</button></div>
          </div>
        </div>
      )}

      {showStaffForm && currentUser?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full"><div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h3><button onClick={() => setShowStaffForm(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button></div>
            <form onSubmit={handleStaffSubmit} className="p-4 space-y-3">
              {!editingUser && (<><div><label className="block text-sm font-medium">Email</label><input type="email" required className="w-full p-2 border rounded mt-1" value={staffFormData.email} onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}/></div><div><label className="block text-sm font-medium">Contraseña</label><input type="password" required={!editingUser} minLength={6} className="w-full p-2 border rounded mt-1" value={staffFormData.password} onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}/></div></>)}
              <div><label className="block text-sm font-medium">Nombre Completo</label><input type="text" required className="w-full p-2 border rounded mt-1" value={staffFormData.full_name} onChange={(e) => setStaffFormData({ ...staffFormData, full_name: e.target.value })}/></div>
              <div><label className="block text-sm font-medium">RUT</label><input type="text" required pattern="^[0-9]{7,8}-[0-9kK]$" placeholder="12345678-9" className="w-full p-2 border rounded mt-1" value={staffFormData.rut} onChange={(e) => setStaffFormData({ ...staffFormData, rut: e.target.value })}/></div>
              <div><label className="block text-sm font-medium">Teléfono</label><input type="tel" className="w-full p-2 border rounded mt-1" value={staffFormData.phone} onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}/></div>
              <div><label className="block text-sm font-medium">Rol</label><select required className="w-full p-2 border rounded bg-white mt-1" value={staffFormData.role} onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as any })}><option value="technician">Técnico</option><option value="receptionist">Recepcionista</option><option value="admin">Administrador</option></select></div>
              <div className="pt-2 flex justify-end gap-3"><button type="button" onClick={() => setShowStaffForm(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">Cancelar</button><button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-blue-400">{editingUser ? 'Actualizar' : 'Crear'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full"><div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold text-red-600">Cancelar Orden #{orderToCancel.order_number.toString().padStart(6, '0')}</h3><button onClick={() => setShowCancelModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button></div>
            <div className="p-4"><label className="block text-sm font-medium">Motivo de la cancelación (obligatorio)</label><textarea rows={4} className="w-full p-2 border rounded mt-1" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="El cliente se arrepintió, no hay repuesto, etc." required/></div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3"><button onClick={() => setShowCancelModal(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">Cerrar</button><button onClick={handleCancelConfirm} disabled={!cancelReason.trim() || updateLoading === orderToCancel.id} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:bg-red-400">Confirmar Cancelación</button></div>
          </div>
        </div>
      )}

      {showWarrantyPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full"><div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">Entregar Orden #{selectedOrder.order_number.toString().padStart(6, '0')}</h3><button onClick={() => setShowWarrantyPopup(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button></div>
            <div className="p-4"><label className="block text-sm font-medium mb-1">Días de Garantía</label><input type="number" className="w-full p-2 border rounded-md" value={warrantyDays ?? ''} onChange={(e) => setWarrantyDays(parseInt(e.target.value) || null)} placeholder="Ej: 90"/></div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3"><button onClick={() => setShowWarrantyPopup(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">Cancelar</button><button onClick={handleWarrantySubmit} disabled={loading || warrantyDays === null} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-blue-400">Entregar y Notificar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}