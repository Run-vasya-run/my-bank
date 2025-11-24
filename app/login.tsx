import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../src/stores/authStore';
import { useTranslation } from 'react-i18next';
import '../src/i18n';

export default function LoginScreen() {
  const [step, setStep] = useState(1); // 1 = Логин, 2 = СМС Код
  const [phone, setPhone] = useState('87471234567'); // Тестовый номер из ТЗ
  const [password, setPassword] = useState('pass');
  const [code, setCode] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLoginStep1 = () => {
    if (phone.length < 5) return alert('Введите номер');
    // Имитация отправки СМС
    Alert.alert("SMS Код", "Ваш код подтверждения: 1234");
    setStep(2);
  };

  const handleVerifyCode = () => {
    if (code === '1234') {
      login(phone, 'fake_jwt_token_for_demo');
    } else {
      Alert.alert("Ошибка", "Неверный код (попробуйте 1234)");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        {/* ВОТ ТУТ МЕНЯЕМ НАЗВАНИЕ */}
        <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
          BellyBank
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          {step === 1 ? 'Вход в экосистему' : 'Двухфакторная аутентификация'}
        </Text>

        <View style={styles.form}>
          {step === 1 ? (
            
            <>
              <TextInput
                label="Номер телефона"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />
              <TextInput
                label="Пароль"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              <Button mode="contained" onPress={handleLoginStep1} style={styles.button} contentStyle={{ height: 56 }}>
                Войти
              </Button>
            </>
          ) : (
            <>
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
                placeholder="1234"
              />
              <Button mode="contained" onPress={handleVerifyCode} loading={isLoading} style={styles.button} contentStyle={{ height: 56 }}>
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