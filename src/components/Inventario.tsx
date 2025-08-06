import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { Link } from 'react-router-dom';
import { FixedSizeList as VirtualList } from 'react-window';

// --- Interfaces de Datos ---
interface Product {
  id: string;
  brand: string;
  model: string;
  quantity: number;
  cost_price: number;
  component_types: { id: number; name: string };
  suppliers: { id: number; name: string };
}

interface ComponentType {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

// --- Constantes de Diseño ---
const ROW_HEIGHT_MOBILE = 200;
const ROW_HEIGHT_DESKTOP = 72;
const ITEMS_PER_PAGE = 25;

// --- Hook de Detección de Móvil ---
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};

export function Inventario() {
  const [products, setProducts] = useState<Product[]>([]);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAddComponentPopup, setShowAddComponentPopup] = useState(false);
  const [showAddSupplierPopup, setShowAddSupplierPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [newProductData, setNewProductData] = useState({
    brand: '', model: '', quantity: '', costPrice: '', component_type_id: '', supplier_id: ''
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteData, setDeleteData] = useState({ quantity: '', serviceOrder: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterComponentType, setFilterComponentType] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComponentTypeName, setNewComponentTypeName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const marcaRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser || !['technician', 'admin', 'receptionist'].includes(currentUser.role)) {
        setError('Acceso no autorizado.');
        setLoading(false);
        return;
      }
      setUser(currentUser);
      await Promise.all([
        loadProducts(),
        loadComponentTypes(),
        loadSuppliers(),
      ]);
      setLoading(false);
    };
    initialize();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select(`id, brand, model, quantity, cost_price, component_types ( id, name ), suppliers ( id, name )`)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProducts(data as any[]);
  };

  const loadComponentTypes = async () => {
    const { data, error } = await supabase.from('component_types').select('id, name');
    if (error) setError(error.message);
    else setComponentTypes(data as ComponentType[]);
  };

  const loadSuppliers = async () => {
    const { data, error } = await supabase.from('suppliers').select('id, name');
    if (error) setError(error.message);
    else setSuppliers(data as Supplier[]);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (filterComponentType) {
      result = result.filter(p => p.component_types?.id === Number(filterComponentType));
    }
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.brand.toLowerCase().includes(lowercasedFilter) ||
        p.model.toLowerCase().includes(lowercasedFilter)
      );
    }
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [products, filterComponentType, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formSetter: Function) => {
    formSetter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProduct = async () => {
    const { brand, model, quantity, costPrice, component_type_id, supplier_id } = newProductData;
    if (!brand || !model || !quantity || !costPrice || !component_type_id || !supplier_id) return setError('Todos los campos son obligatorios.');
    try {
      await supabase.from('inventory').insert([{ brand, model, quantity, cost_price: costPrice, component_type_id, supplier_id }]).select().single();
      await loadProducts();
      setNewProductData({ brand: '', model: '', quantity: '', costPrice: '', component_type_id: '', supplier_id: '' });
      marcaRef.current?.focus();
    } catch (err: any) { setError(err.message); }
  };
  
  const handleEditProduct = async () => {
    if (!editingProduct) return;
    try {
        const {data: updatedProduct, error} = await supabase.from('inventory').update({
            brand: editingProduct.brand,
            model: editingProduct.model,
            quantity: editingProduct.quantity,
            cost_price: editingProduct.cost_price,
            component_type_id: editingProduct.component_types.id,
            supplier_id: editingProduct.suppliers.id,
        }).eq('id', editingProduct.id).select().single();

        if (error) throw error;
        
      await supabase.from('activity_logs').insert([{
          user_id: user.id, action_type: 'edit', product_id: updatedProduct.id, ...updatedProduct
      }]);
      await loadProducts();
      setShowEditPopup(false);
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteProduct = async () => {
    const { quantity, serviceOrder } = deleteData;
    if (!productToDelete || !quantity || Number(quantity) <= 0 || Number(quantity) > productToDelete.quantity || !serviceOrder) {
      return setError('La cantidad y el número de orden son obligatorios.');
    }
    
    try {
      const newQuantity = productToDelete.quantity - Number(quantity);
      await supabase.from('activity_logs').insert([{
          user_id: user.id, action_type: 'delete', product_id: productToDelete.id, 
          quantity_affected: Number(quantity), service_order: serviceOrder,
          brand: productToDelete.brand, model: productToDelete.model, 
          cost_price_affected: productToDelete.cost_price, component_type_id: productToDelete.component_types.id
      }]);

      if (newQuantity <= 0) {
        await supabase.from('inventory').delete().eq('id', productToDelete.id);
      } else {
        await supabase.from('inventory').update({ quantity: newQuantity }).eq('id', productToDelete.id);
      }
      await loadProducts();
      setShowDeletePopup(false);
    } catch (err: any) { setError(err.message); }
  };
  
  const handleAddGeneric = async (endpoint: string, name: string, stateSetter: Function, nameSetter: Function, popupSetter: Function) => {
    if (!name) return setError('El nombre es obligatorio.');
    try {
      const { data: newItem, error } = await supabase.from(endpoint).insert({ name }).select().single();
      if(error) throw error;
      stateSetter((prev: any[]) => [newItem, ...prev]);
      nameSetter('');
      popupSetter(false);
    } catch (err: any) { setError(err.message); }
  };
  
  const ProductRow = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const product = paginatedProducts[index];
    if (!product) return null;
    
    return (
      <div style={style} className="md:flex md:items-center">
        <div className="h-full w-full p-2 md:p-0">
          <div className="md:hidden flex flex-col h-full bg-white rounded-lg shadow p-3 border border-gray-200">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-gray-800 truncate">{product.brand} {product.model}</p>
                <p className="text-sm text-gray-500">{product.component_types?.name || 'N/A'}</p>
              </div>
              <p className="text-lg font-semibold text-gray-800 flex-shrink-0">
                <span className="text-sm font-normal text-gray-500">Stock:</span> {product.quantity}
              </p>
            </div>
            <div className="flex-grow my-2 pt-2 border-t text-sm">
              <p><span className="font-medium">Precio Cliente:</span> ${product.cost_price.toLocaleString('es-CL')}</p>
              <p><span className="font-medium">Proveedor:</span> {product.suppliers?.name || 'N/A'}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => { setEditingProduct(product); setShowEditPopup(true); }} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded">Editar</button>
              <button onClick={() => { setProductToDelete(product); setDeleteData({ quantity: '', serviceOrder: ''}); setShowDeletePopup(true); }} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded">Descontar</button>
            </div>
          </div>
          
          <div className="hidden md:grid grid-cols-12 gap-x-4 px-4 items-center h-full hover:bg-gray-50 border-b">
            <div className="col-span-2 truncate">{product.brand}</div>
            <div className="col-span-3 truncate">{product.model}</div>
            <div className="col-span-1 text-center">{product.quantity}</div>
            <div className="col-span-1">${product.cost_price.toLocaleString('es-CL')}</div>
            <div className="col-span-2 truncate">{product.component_types?.name || 'N/A'}</div>
            <div className="col-span-1 truncate">{product.suppliers?.name || 'N/A'}</div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button onClick={() => { setEditingProduct(product); setShowEditPopup(true); }} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded">Editar</button>
              <button onClick={() => { setProductToDelete(product); setDeleteData({ quantity: '', serviceOrder: ''}); setShowDeletePopup(true); }} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded">Descontar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [paginatedProducts]);


  if (loading) return <div className="p-4">Cargando inventario...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
  if (!user) return null;

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Inventario de Productos</h1>
      
      <div className="mb-8 bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Agregar Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="brand" placeholder="Marca" value={newProductData.brand} onChange={(e) => handleFormChange(e, setNewProductData)} ref={marcaRef} className="w-full p-2 border rounded-md" />
          <input name="model" placeholder="Modelo" value={newProductData.model} onChange={(e) => handleFormChange(e, setNewProductData)} className="w-full p-2 border rounded-md" />
          <input name="quantity" type="number" placeholder="Cantidad" value={newProductData.quantity} onChange={(e) => handleFormChange(e, setNewProductData)} className="w-full p-2 border rounded-md" />
          <input name="costPrice" type="number" placeholder="Precio Cliente" value={newProductData.costPrice} onChange={(e) => handleFormChange(e, setNewProductData)} className="w-full p-2 border rounded-md" />
          <select name="supplier_id" value={newProductData.supplier_id} onChange={(e) => handleFormChange(e, setNewProductData)} className="w-full p-2 border rounded-md bg-white">
            <option value="">Seleccione Proveedor</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select name="component_type_id" value={newProductData.component_type_id} onChange={(e) => handleFormChange(e, setNewProductData)} className="w-full p-2 border rounded-md bg-white">
            <option value="">Seleccione Tipo</option>
            {componentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
        </div>
        <button onClick={handleAddProduct} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Agregar Producto</button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center">
        <input type="text" placeholder="Buscar por marca o modelo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 p-2 border rounded-md" />
        <select value={filterComponentType} onChange={e => setFilterComponentType(e.target.value)} className="w-full md:w-1/3 p-2 border rounded-md bg-white">
          <option value="">Filtrar por Tipo</option>
          {componentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
        </select>
        <div className="flex-grow flex justify-end gap-2">
            <button onClick={() => setShowAddComponentPopup(true)} className="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Agregar Tipo</button>
            <button onClick={() => setShowAddSupplierPopup(true)} className="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Agregar Proveedor</button>
            <Link to="/activity-logs" className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 text-center">Ver Registros</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-x-4 px-4 py-3 bg-gray-100 font-semibold text-sm text-gray-700 border-b">
          <div onClick={() => handleSort('brand')} className="col-span-2 cursor-pointer">Marca</div>
          <div onClick={() => handleSort('model')} className="col-span-3 cursor-pointer">Modelo</div>
          <div onClick={() => handleSort('quantity')} className="col-span-1 text-center cursor-pointer">Cantidad</div>
          <div onClick={() => handleSort('cost_price')} className="col-span-1 cursor-pointer">Precio</div>
          <div onClick={() => handleSort('component_types')} className="col-span-2 cursor-pointer">Tipo</div>
          <div onClick={() => handleSort('suppliers')} className="col-span-1 cursor-pointer">Proveedor</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>
        <VirtualList
          height={600}
          itemCount={paginatedProducts.length}
          itemSize={isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT_DESKTOP}
          width="100%"
        >
          {ProductRow}
        </VirtualList>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:opacity-50">Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:opacity-50">Siguiente</button>
      </div>

      {showEditPopup && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
            <div className="grid grid-cols-1 gap-4">
              <input name="brand" placeholder="Marca" value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full p-2 border rounded-md" />
              <input name="model" placeholder="Modelo" value={editingProduct.model} onChange={e => setEditingProduct({...editingProduct, model: e.target.value})} className="w-full p-2 border rounded-md" />
              <input name="quantity" type="number" placeholder="Cantidad" value={editingProduct.quantity} onChange={e => setEditingProduct({...editingProduct, quantity: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              <input name="cost_price" type="number" placeholder="Precio Cliente" value={editingProduct.cost_price} onChange={e => setEditingProduct({...editingProduct, cost_price: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              <select name="supplier_id" value={editingProduct.suppliers.id} onChange={e => setEditingProduct({...editingProduct, suppliers: {id: Number(e.target.value), name: suppliers.find(s => s.id === Number(e.target.value))?.name || '' }})} className="w-full p-2 border rounded-md bg-white">
                <option value="">Seleccione Proveedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select name="component_type_id" value={editingProduct.component_types.id} onChange={e => setEditingProduct({...editingProduct, component_types: {id: Number(e.target.value), name: componentTypes.find(ct => ct.id === Number(e.target.value))?.name || '' }})} className="w-full p-2 border rounded-md bg-white">
                <option value="">Seleccione Tipo</option>
                {componentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowEditPopup(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md">Cancelar</button>
              <button onClick={handleEditProduct} className="px-4 py-2 bg-blue-500 text-white rounded-md">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Descontar de Inventario</h2>
            <p className="mb-4">Descontar unidades de <strong>{productToDelete.brand} {productToDelete.model}</strong>.</p>
            <input name="quantity" type="number" placeholder="Cantidad a descontar" value={deleteData.quantity} onChange={e => handleFormChange(e, setDeleteData)} min="1" max={productToDelete.quantity} className="w-full p-2 border rounded-md mb-4" />
            <input name="serviceOrder" placeholder="Nº Orden de Servicio (Ej: 12345)" value={deleteData.serviceOrder} onChange={e => handleFormChange(e, setDeleteData)} className="w-full p-2 border rounded-md" />
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowDeletePopup(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md">Cancelar</button>
              <button onClick={handleDeleteProduct} className="px-4 py-2 bg-red-500 text-white rounded-md">Confirmar Descuento</button>
            </div>
          </div>
        </div>
      )}

      {(showAddComponentPopup || showAddSupplierPopup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">
                    {showAddComponentPopup ? 'Agregar Tipo de Componente' : 'Agregar Proveedor'}
                </h2>
                <input 
                    type="text"
                    placeholder={showAddComponentPopup ? 'Ej: Pantalla' : 'Ej: Fixsell'}
                    className="w-full p-2 border rounded-md"
                    value={showAddComponentPopup ? newComponentTypeName : newSupplierName}
                    onChange={(e) => showAddComponentPopup ? setNewComponentTypeName(e.target.value) : setNewSupplierName(e.target.value)}
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => { setShowAddComponentPopup(false); setShowAddSupplierPopup(false); }} className="px-4 py-2 bg-gray-500 text-white rounded-md">Cancelar</button>
                    <button onClick={() => showAddComponentPopup ? handleAddGeneric('component_types', newComponentTypeName, setComponentTypes, setNewComponentTypeName, setShowAddComponentPopup) : handleAddGeneric('suppliers', newSupplierName, setSuppliers, setNewSupplierName, setShowAddSupplierPopup)} className="px-4 py-2 bg-green-500 text-white rounded-md">Agregar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}