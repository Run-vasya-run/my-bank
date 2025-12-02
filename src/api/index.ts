import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ ВАЖНО: Эту ссылку нужно менять КАЖДЫЙ РАЗ, когда перезапускаешь ngrok
// Ссылка должна быть вида https://xxxx.ngrok-free.app (без /api/v1 и т.д., если в Django так не настроено)
const BASE_URL = 'https://mixolydian-sau-causeless.ngrok-free.dev/'; 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматическая подстановка токена (Bearer) во все запросы
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_jwt_secure');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // [cite: 140]
  }
  return config;
});

export const bankApi = {
  // 1. АВТОРИЗАЦИЯ
  // Login: отправляем как форму (x-www-form-urlencoded), поле телефона = username [cite: 134, 135]
  login: async (phone: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', phone); 
    formData.append('password', password);

    return api.post('/auth/login', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  // Register: отправляем JSON. Я добавил явные типы, чтобы вы не ошиблись с названиями полей.
  // Бэкенд ждет именно: phone, password, full_name [cite: 147-150]
  register: (data: { phone: string; password: string; full_name: string }) => 
    api.post('/auth/register', data),

  getMe: () => api.get('/auth/users/me'), // [cite: 165]

  // 2. СЧЕТА И КАРТЫ
  getCards: () => api.get('/accounts/'), // [cite: 179]
  createCard: (currency: string = 'KZT') => api.post('/accounts/create', { currency }), // [cite: 170]
  
  // Блокировка: accountId - это ID счета (1, 2...), а не номер карты на пластике! 
  blockCard: (accountId: number) => api.patch(`/accounts/${accountId}/block`), // [cite: 51]
  unblockCard: (accountId: number) => api.patch(`/accounts/${accountId}/unblock`), // [cite: 55]

  // 3. ОПЕРАЦИИ
  getHistory: () => api.get('/transactions/'), // [cite: 89]
  
  // P2P: Можно передать или телефон, или номер карты [cite: 186-191]
  transferP2P: (amount: number, to_phone?: string, to_card?: string) => 
    api.post('/transfers/p2p', { amount, to_phone, to_card }),
  
  // 4. СЕРВИСЫ
  payService: (service_name: string, amount: number) => 
    api.post('/services/pay', { service_name, amount }), // [cite: 86, 204]

  // 5. ИИ ЧАТ (Groq)
  chatWithAI: (message: string) => api.post('/ai/chat', { message }), // [cite: 35, 251]

  // 6. КРЕДИТЫ (Новая функция для Хакатона)
  applyLoan: (amount: number, term_months: number, income: number) => 
    api.post('/loans/apply', { amount, term_months, income }), // [cite: 58, 268]

  // 7. MFA (Двухфакторная аутентификация) <--- НОВЫЕ МЕТОДЫ, КОТОРЫХ НЕ ХВАТАЛО
  // Посылает запрос на генерацию кода на сервере (POST /mfa/generate)
  generateMFA: () => api.post('/mfa/generate'), 
  
  // Посылает код на проверку (POST /mfa/verify)
  verifyMFA: (code: string) => api.post('/mfa/verify', { code }), 
};