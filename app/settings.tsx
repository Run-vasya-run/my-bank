import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Button, Avatar, useTheme, Divider, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useTranslation } from 'react-i18next'; // Импорт

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();
  
  // ВАЖНО: Достаем t (функцию перевода) и i18n
  const { t, i18n } = useTranslation();

  const [isBiometrics, setIsBiometrics] = useState(false);
  const [language, setLanguage] = useState(i18n.language); // Убрал || 'ru', i18n сам знает текущий язык

  const changeLang = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang); // Эта команда заставляет React перерисовать экран с новым языком
  };

  const handleLogout = () => {
    Alert.alert(t('settings_logout'), t('settings_logout_confirm'), [
      { text: t('settings_cancel'), style: "cancel" },
      { text: t('settings_logout'), style: "destructive", onPress: logout }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Image size={80} source={{ uri: 'https://i.pravatar.cc/150?img=11' }} />
        <Text style={[styles.name, { color: theme.colors.onBackground }]}>Нурбек</Text>
        <Text style={{ color: '#888' }}>+7 747 123 45 67</Text>
      </View>

      <List.Section>
        {/* Используем t() для перевода */}
        <List.Subheader>{t('settings_security')}</List.Subheader>
        
        <List.Item
          title={t('settings_faceid')}
          left={props => <List.Icon {...props} icon="face-recognition" />}
          right={() => <Switch value={isBiometrics} onValueChange={setIsBiometrics} color={theme.colors.primary} />}
        />
        <List.Item
          title={t('settings_password')}
          left={props => <List.Icon {...props} icon="lock-reset" />}
          onPress={() => Alert.alert("Пароль", "Функция смены пароля")}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>{t('settings_lang')}</List.Subheader>
        <View style={{ paddingHorizontal: 20 }}>
            <SegmentedButtons
                value={language}
                onValueChange={changeLang}
                buttons={[
                  { value: 'kz', label: 'QAZ' },
                  { value: 'ru', label: 'РУС' },
                  { value: 'en', label: 'ENG' },
                ]}
            />
        </View>
      </List.Section>

      <View style={{ padding: 20, marginTop: 20 }}>
        <Button mode="outlined" icon="logout" onPress={handleLogout} textColor="red" style={{ borderColor: 'red' }}>
          {t('settings_logout')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 30 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
});