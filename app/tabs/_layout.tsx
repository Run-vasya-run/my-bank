import { Tabs } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.primary, headerShown: false, tabBarStyle: { height: 60, paddingBottom: 5 } }}>
      
      {/* Кнопка Главная -> ищет файл tab_home.tsx */}
      <Tabs.Screen 
        name="tab_home" 
        options={{ 
          title: 'Главная', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-account" size={26} color={color} /> 
        }} 
      />

      {/* Кнопка Платежи -> ищет файл payments.tsx (Создай его, если нет!) */}
      <Tabs.Screen 
        name="payments" 
        options={{ 
          title: 'Платежи', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="arrow-left-right-bold" size={26} color={color} /> 
        }} 
      />

      {/* Кнопка Сервисы -> ищет файл services.tsx */}
      <Tabs.Screen 
        name="services" 
        options={{ 
          title: 'Сервисы', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="apps" size={26} color={color} /> 
        }} 
      />
    </Tabs>
  );
}