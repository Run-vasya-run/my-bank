import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ ВАЖНО: Сюда вставь ссылку, которую даст друг (например: https://a1b2.ngrok-free.app)
// Пока друга нет, оставь localhost, но на телефоне это работать не будет без Ngrok
const BASE_URL = 'http://192.168.0.105:8000'; 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматическая подстановка токена (Bearer)
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_jwt_secure');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bankApi = {
  // 1. АВТОРИЗАЦИЯ (СТРОГО ПО ТЗ: Form Data)
  login: async (phone: string, password: string) => {
    // FastAPI ожидает x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', phone); 
    formData.append('password', password);

    return api.post('/auth/login', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/users/me'),

  // 2. СЧЕТА И КАРТЫ
  getCards: () => api.get('/accounts/'),
  createCard: (currency: string = 'KZT') => api.post('/accounts/create', { currency }),
  blockCard: (accountId: number) => api.patch(`/accounts/${accountId}/block`),
  unblockCard: (accountId: number) => api.patch(`/accounts/${accountId}/unblock`),

  // 3. ОПЕРАЦИИ
  getHistory: () => api.get('/transactions/'),
  transferP2P: (amount: number, to_phone?: string, to_card?: string) => 
    api.post('/transfers/p2p', { amount, to_phone, to_card }),
  
  // 4. СЕРВИСЫ
  payService: (service_name: string, amount: number) => 
    api.post('/services/pay', { service_name, amount }),

  // 5. ИИ ЧАТ
  chatWithAI: (message: string) => api.post('/ai/chat', { message }),

  // 6. КРЕДИТЫ
  applyLoan: (amount: number, term_months: number, income: number) => 
    api.post('/loans/apply', { amount, term_months, income }),
};