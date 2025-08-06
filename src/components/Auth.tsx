import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserCircle2, Mail, Lock, Phone, FileText } from 'lucide-react';
import { register, login, getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(!searchParams.get('register'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    rut: '',
    phone: '',
  });

  useEffect(() => {
    setIsLogin(!searchParams.get('register'));
  }, [searchParams]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/dashboard', { replace: true });
        } else {
          setError(result.message);
        }
      } else {
        // Lógica de registro
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              rut: formData.rut,
              phone: formData.phone,
            },
          },
        });
  
        if (error) {
          console.error(error);
          setError(error.message);
        } else {
          setSuccessMessage('Registro exitoso. Por favor, verifica tu correo electrónico.');
          setFormData({
            email: '',
            password: '',
            fullName: '',
            rut: '',
            phone: '',
          });
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Iniciar Sesión' : 'Registro'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    <UserCircle2 className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    className="pl-10 w-full p-2 border rounded-md"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT (formato: 12345678-9)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    <FileText className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    pattern="^[0-9]{7,8}-[0-9kK]$"
                    title="Formato: 12345678-9"
                    className="pl-10 w-full p-2 border rounded-md"
                    value={formData.rut}
                    onChange={(e) =>
                      setFormData({ ...formData, rut: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    <Phone className="h-5 w-5" />
                  </span>
                  <input
                    type="tel"
                    required
                    className="pl-10 w-full p-2 border rounded-md"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                className="pl-10 w-full p-2 border rounded-md"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                className="pl-10 w-full p-2 border rounded-md"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            {isLogin && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading
              ? 'Procesando...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Registrarse'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccessMessage(null);
            navigate(isLogin ? '/auth?register=true' : '/auth', { replace: true });
          }}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
        >
          {isLogin
            ? '¿No tienes una cuenta? Regístrate'
            : '¿Ya tienes una cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}