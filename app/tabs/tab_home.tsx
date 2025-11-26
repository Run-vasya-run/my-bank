import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useTheme, Avatar, Button, Modal, Portal, PaperProvider, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { bankApi } from '../../src/api'; 
import { useAuthStore } from '../../src/stores/authStore'; // <-- ИМПОРТ ДЛЯ ИМЕНИ ПОЛЬЗОВАТЕЛЯ

const { width } = Dimensions.get('window');

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  // Получаем имя пользователя из хранилища
  const { user } = useAuthStore(); 
  const userName = user?.full_name || "Пользователь";

  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Для модалки управления картой
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- ХЕЛПЕР ДЛЯ ИКОНОК (ИЗ ВТОРОГО КОДА) ---
  const getTransactionIcon = (title: string, category?: string) => {
    const text = (title + " " + (category || "")).toLowerCase();
    
    if (text.includes('taxi') || text.includes('яндекс') || text.includes('uber')) return 'taxi';
    if (text.includes('bus') || text.includes('transport') || text.includes('proezd')) return 'bus';
    if (text.includes('itu') || text.includes('univer') || text.includes('tuition')) return 'school';
    if (text.includes('eco') || text.includes('tree')) return 'tree';
    if (text.includes('magnum') || text.includes('market') || text.includes('shop')) return 'cart';
    if (text.includes('starbucks') || text.includes('coffee')) return 'coffee';
    
    return 'credit-card-outline'; // Дефолтная
  };

  // --- 1. ЗАГРУЗКА ДАННЫХ ---
  const fetchData = async () => {
    try {
      // Получаем карты
      const cardsRes = await bankApi.getCards();
      setCards(cardsRes.data);

      // Считаем баланс
      const total = cardsRes.data.reduce((acc: number, card: any) => acc + Number(card.balance), 0);
      setTotalBalance(total);

      // Получаем историю
      try {
        const historyRes = await bankApi.getHistory();
        
        // ОБРАБОТКА ДАННЫХ ДЛЯ ИКОНОК
        const enrichedHistory = historyRes.data.map((t: any) => ({
            ...t,
            // Определяем иконку на основе заголовка или категории
            icon: getTransactionIcon(t.title || t.category || "")
        }));
        
        setTransactions(enrichedHistory);
      } catch (err) {
        console.log("История пока пуста или недоступна", err);
        setTransactions([]);
      }

    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      // Демо-данные, если API недоступен
      setCards([
        { id: 1, card_number: '4000 1234 5678 9010', balance: 150000, currency: 'KZT', is_blocked: false },
        { id: 2, card_number: '5100 9876 5432 1098', balance: 450, currency: 'USD', is_blocked: true }
      ]);
      setTotalBalance(350000);
      setTransactions([
        { id: 101, title: 'Magnum', amount: -12400, date: 'Сегодня', icon: getTransactionIcon('Magnum') },
        { id: 102, title: 'Yandex Taxi', amount: -2500, date: 'Сегодня', icon: getTransactionIcon('taxi') }, 
        { id: 103, title: 'ITU Tuition', amount: -60000, date: 'Вчера', icon: getTransactionIcon('ITU') },
        { id: 104, title: 'Starbucks', amount: -1800, date: 'Вчера', icon: getTransactionIcon('coffee') }
      ]);
      Alert.alert("Ошибка", "Не удалось загрузить данные. Проверьте соединение.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // --- 2. СОЗДАНИЕ КАРТЫ ---
  const handleCreateCard = async () => {
    try {
      setLoading(true); 
      await bankApi.createCard('KZT'); 
      Alert.alert("Успешно", "Новая карта создана! 🎉");
      onRefresh(); 
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось открыть карту");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. БЛОКИРОВКА / РАЗБЛОКИРОВКА ---
  const toggleBlockCard = async () => {
    if (!selectedCard) return;

    setActionLoading(true);
    try {
      if (selectedCard.is_blocked) {
        await bankApi.unblockCard(selectedCard.id);
        Alert.alert("Успешно", "Карта разблокирована ✅");
      } else {
        await bankApi.blockCard(selectedCard.id);
        Alert.alert("Блокировка", "Карта временно заблокирована 🔒");
      }
      setCardModalVisible(false);
      onRefresh();
    } catch (e) {
      console.error("Card Action Error:", e);
      Alert.alert("Ошибка", "Не удалось изменить статус карты");
    } finally {
      setActionLoading(false);
    }
  };

  const quickActions = [
    { icon: 'swap-horizontal', label: 'Переводы', color: '#6200ee', route: '/tabs/payments' },
    { icon: 'qrcode', label: 'QR', color: '#03dac6', route: '/qr' },
    { icon: 'clock-outline', label: 'История', color: '#f4511e', route: '/history' },
    { icon: 'robot', label: 'AI Чат', color: '#e91e63', route: '/chat' },
  ];

  if (loading && !refreshing) return <ActivityIndicator style={{marginTop: 50}} size="large" color={theme.colors.primary} />;

  return (
    <PaperProvider>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
            <View>
            <Text style={{ color: '#888', fontSize: 14 }}>Добрый день,</Text>
            {/* Динамическое имя пользователя */}
            <Text style={{ color: theme.colors.onBackground, fontSize: 24, fontWeight: 'bold' }}>{userName} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')}>
                {/* Аватарка (используем заглушку, пока не будет фото) */}
                <Avatar.Icon size={45} icon="account-circle" style={{backgroundColor: theme.colors.primaryContainer}} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={styles.totalBalance}>
            <Text style={{ color: '#888' }}>Общий баланс</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.colors.onBackground }}>{totalBalance.toLocaleString()} ₸</Text>
            </View>

            {/* ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ КАРТ */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {cards.map((card) => (
                <TouchableOpacity key={card.id} activeOpacity={0.9} onPress={() => { setSelectedCard(card); setCardModalVisible(true); }}>
                    <View style={[styles.card, { backgroundColor: card.is_blocked ? '#424242' : (card.type === 'Visa' ? '#1a1a1a' : '#283593') }]}>
                        <View style={styles.cardTop}>
                            <Text style={styles.cardName}>{card.is_blocked ? 'ЗАБЛОКИРОВАНА 🔒' : 'Belly Card'}</Text>
                            <MaterialCommunityIcons name="credit-card-chip" size={30} color="#fff" />
                        </View>
                        <View style={styles.cardMiddle}>
                            <Text style={styles.cardNumber}>
                                {card.card_number ? card.card_number.toString().replace(/(\d{4})/g, '$1 ').trim() : '****'}
                            </Text>
                        </View>
                        <View style={styles.cardBottom}>
                            <Text style={styles.cardBalanceLabel}>Баланс</Text>
                            <Text style={styles.cardBalance}>{Number(card.balance).toLocaleString()} {card.currency}</Text>
                        </View>
                        {card.is_blocked && <View style={styles.blockedOverlay}><MaterialCommunityIcons name="lock" size={50} color="rgba(255,255,255,0.5)" /></View>}
                    </View>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addCardBtn} onPress={handleCreateCard}>
                <MaterialCommunityIcons name="plus" size={30} color={theme.colors.onSurface} />
                <Text style={{ color: theme.colors.onSurface, marginTop: 5 }}>Открыть</Text>
            </TouchableOpacity>
            </ScrollView>

            <View style={styles.actionsContainer}>
            {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={styles.actionBtn} onPress={() => router.push(action.route as any)}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                    <MaterialCommunityIcons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.onBackground }]}>{action.label}</Text>
                </TouchableOpacity>
            ))}
            </View>

            <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Последние операции</Text>
            {transactions.length === 0 && (
                <Text style={{color: '#888', fontStyle: 'italic'}}>Операций пока нет</Text>
            )}
            {/* ТУТ ИСПОЛЬЗУЕМ ДАННЫЕ С ИКОНКАМИ */}
            {transactions.map((t) => (
                <View key={t.id} style={[styles.transaction, { backgroundColor: theme.colors.elevation.level1 }]}>
                    {/* Динамическая иконка */}
                    <Avatar.Icon 
                        size={40} 
                        icon={t.icon || 'credit-card-outline'} 
                        style={{ backgroundColor: theme.colors.elevation.level3 }} 
                        color={theme.colors.primary} 
                    />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        {/* Динамическое название */}
                        <Text style={[styles.tName, { color: theme.colors.onBackground }]}>
                            {t.title || t.category || "Транзакция"}
                        </Text>
                        <Text style={{ color: '#888', fontSize: 12 }}>
                            {t.created_at ? t.created_at.slice(0,10) : t.date}
                        </Text>
                    </View>
                    {/* Сумма с цветом (зеленый для плюса) */}
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: t.amount > 0 ? '#4caf50' : theme.colors.onBackground }}>
                        {t.amount > 0 ? '+' : ''} {t.amount} ₸
                    </Text>
                </View>
            ))}
            </View>
        </ScrollView>

        {/* МОДАЛКА УПРАВЛЕНИЯ */}
        <Portal>
            <Modal visible={cardModalVisible} onDismiss={() => setCardModalVisible(false)} contentContainerStyle={[styles.modalContent, {backgroundColor: theme.colors.background}]}>
                <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: theme.colors.onSurface}}>
                    Карта *{selectedCard?.card_number?.slice(-4)}
                </Text>

                <Button
                    mode="contained"
                    icon={selectedCard?.is_blocked ? "lock-open" : "lock"}
                    buttonColor={selectedCard?.is_blocked ? "#4caf50" : "#f44336"}
                    onPress={toggleBlockCard}
                    loading={actionLoading}
                    style={{marginBottom: 10}}
                    contentStyle={{height: 50}}
                >
                    {selectedCard?.is_blocked ? "Разблокировать" : "Заблокировать карту"}
                </Button>

                <Button mode="outlined" onPress={() => setCardModalVisible(false)}>Закрыть</Button>
            </Modal>
        </Portal>
        </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  totalBalance: { paddingHorizontal: 20, marginBottom: 20 },
  cardsScroll: { paddingLeft: 20, paddingRight: 20 },
  card: { width: width * 0.8, height: 180, borderRadius: 20, padding: 20, marginRight: 15, justifyContent: 'space-between', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8, overflow: 'hidden' },
  blockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textTransform: 'uppercase' },
  cardMiddle: { alignItems: 'flex-start' },
  cardNumber: { color: '#fff', fontSize: 22, letterSpacing: 2, fontFamily: 'monospace' },
  cardBottom: {},
  cardBalanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  cardBalance: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  addCardBtn: { width: 80, height: 180, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#888', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 30, marginBottom: 20 },
  actionBtn: { alignItems: 'center', width: '22%' },
  actionIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  transaction: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10 },
  tName: { fontSize: 16, fontWeight: '600' },
  modalContent: { padding: 20, margin: 20, borderRadius: 20 }
});