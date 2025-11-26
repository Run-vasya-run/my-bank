import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { bankApi } from '../api'; // Импорт API для загрузки профиля

// Тип данных пользователя
interface User {
  id: number;
  username: string;
  full_name: string;
  phone: string;
}

interface AuthState {
  user: User | null; // <--- ДОБАВЛЕНО: Хранение данных пользователя
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const TOKEN_KEY = 'user_jwt_secure';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, // Начальное состояние
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Вход в систему
  login: async (phone: string, token: string) => {
    try {
      set({ isLoading: true });
      
      // 1. Сохраняем токен (Шифрование)
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      
      // 2. Загружаем данные профиля (чтобы на Главной было имя, а не "Пользователь")
      let userData = null;
      try {
          // Ждем чуть-чуть, чтобы SecureStore успел записать токен для интерцептора
          const res = await bankApi.getMe();
          userData = res.data;
      } catch (e) {
          console.log("Ошибка загрузки профиля, используем локальные данные");
          // Если сервер профиля лежит, создаем временный объект из телефона
          userData = { id: 0, username: phone, full_name: "Пользователь", phone: phone };
      }

      // 3. Обновляем состояние и переходим на главную
      set({ token, user: userData, isAuthenticated: true, isLoading: false });
      router.replace('/(tabs)/home'); 
      
    } catch (error) {
      console.error('Ошибка входа:', error);
      set({ isLoading: false });
    }
  },

  // Выход
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false }); // Очищаем user
    router.replace('/login');
  },

  // Проверка при запуске
  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // Если есть токен, пробуем обновить профиль
        try {
            const res = await bankApi.getMe();
            set({ token, user: res.data, isAuthenticated: true });
        } catch (e) {
            // Если токен старый - просто удаляем его
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            set({ token: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));