import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native'; 
import { TextInput, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper'; 
import { useAuthStore } from '../src/stores/authStore';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router'; 
import { bankApi } from '../src/api'; 
import '../src/i18n';

export default function Login() {
  const theme = useTheme();
  const router = useRouter();

  const [step, setStep] = useState(1); 
  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [code, setCode] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const [loadingStep, setLoadingStep] = useState(false);

  const handleLoginStep1 = async () => {
    if (phone.length < 5 || password.length < 1) {
      Alert.alert(t('error'), "Введите данные");
      return;
    }
    
    setLoadingStep(true);
    try {
        const cleanPhone = phone.replace(/\D/g, '');

        // 1. Вызываем API для генерации кода (POST /mfa/generate)
        await bankApi.generateMFA(); 
        
        // По ТЗ, код будет напечатан в консоли Бэкенда
        Alert.alert(t('settings_security'), "Код отправлен на сервер! (Ищите в консоли Python)");

        // 2. Переход на шаг 2
        setStep(2);
    } catch(e: any) { // <--- ИСПРАВЛЕНИЕ: :any для e
        // e.response?.data?.detail - будет работать, потому что e теперь :any
        const errorMessage = e.response?.data?.detail || "Ошибка при запросе кода. Сервер недоступен.";
        
        console.error("MFA Generate Error:", errorMessage);
        Alert.alert(t('error'), errorMessage);
    } finally {
        setLoadingStep(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 4) {
        Alert.alert(t('error'), "Введите код");
        return;
    }

    setLoadingStep(true);
    try {
        // 1. Вызываем API для проверки кода (POST /mfa/verify)
        await bankApi.verifyMFA(code); 
        
        // 2. Если верификация успешна — пытаемся залогиниться (получаем токен)
        await login(phone.replace(/\D/g, ''), password); 
        
    } catch (e: any) { // <--- ИСПРАВЛЕНИЕ: :any для e
        // e.response?.data?.detail - будет работать, потому что e теперь :any
        const errorMessage = e.response?.data?.detail || "Неверный код или ошибка сервера.";
        
        console.error("Verification Error:", errorMessage);
        Alert.alert(t('error'), errorMessage);
    } finally {

        setLoadingStep(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
          BellyBank
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          {step === 1 ? 'Вход в экосистему' : 'Двухфакторная аутентификация'}
        </Text>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              {/* ШАГ 1: Логин и Пароль */}
              <TextInput
                label={t('phone_label')}
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />
              <TextInput
                label={t('password_label')}
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              <Button mode="contained" onPress={handleLoginStep1} loading={isLoading || loadingStep} style={styles.button} contentStyle={{ height: 56 }}>
                {t('login_button')}
              </Button>
              
              {/* КНОПКА РЕГИСТРАЦИИ */}
              <Button mode="text" onPress={() => router.push('/register')} style={{marginTop: 10}}>
                Нет аккаунта? Регистрация
              </Button>

            </>
          ) : (
            <>
              {/* ШАГ 2: Ввод Кода (MFA) */}
              <Text style={{textAlign: 'center', marginBottom: 10, color: '#666'}}>
                Мы отправили код на {phone}
              </Text>
              <TextInput
                label="Код из SMS"
                value={code}
                onChangeText={setCode}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                left={<TextInput.Icon icon="message-processing" />}
                placeholder="0000"
              />
              <Button mode="contained" onPress={handleVerifyCode} loading={isLoading || loadingStep} style={styles.button} contentStyle={{ height: 56 }}>
                Подтвердить
              </Button>
              <Button mode="text" onPress={() => setStep(1)} style={{marginTop: 10}}>
                Назад
              </Button>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  content: { paddingHorizontal: 10, paddingBottom: 50 },
  title: { fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#666', marginBottom: 30 },
  form: { width: '100%', marginTop: 20 },
  input: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8 },
  button: { marginTop: 20, borderRadius: 12 },
});