import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useTheme, Avatar, Button, Modal, Portal, PaperProvider, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { bankApi } from '../../src/api';

const { width } = Dimensions.get('window');

export default function Home() {
  const theme = useTheme();
  const router = useRouter();

  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  // Функция для подбора иконки по названию (Связь с Сервисами)
  const getTransactionIcon = (title: string, category?: string) => {
    const text = (title + " " + (category || "")).toLowerCase();
    
    if (text.includes('taxi') || text.includes('яндекс') || text.includes('uber')) return 'taxi'; // [Image of Иконка такси]
    if (text.includes('bus') || text.includes('transport') || text.includes('proezd')) return 'bus'; // 
    if (text.includes('itu') || text.includes('univer') || text.includes('tuition')) return 'school'; // 
    if (text.includes('eco') || text.includes('tree')) return 'tree'; // [Image of Иконка дерева]
    if (text.includes('magnum') || text.includes('market') || text.includes('shop')) return 'cart'; // [Image of Иконка корзины]
    if (text.includes('starbucks') || text.includes('coffee')) return 'coffee'; // [Image of Иконка кофе]
    
    return 'credit-card-outline'; // Дефолтная
  };

  const fetchData = async () => {
    try {
      const cardsRes = await bankApi.getCards(); 
      setCards(cardsRes.data);
      const total = cardsRes.data.reduce((acc: number, card: any) => acc + Number(card.balance), 0);
      setTotalBalance(total);
      
      const historyRes = await bankApi.getHistory();
      // Добавляем иконки к реальным данным
      const enrichedHistory = historyRes.data.map((t: any) => ({
          ...t,
          icon: getTransactionIcon(t.title || t.category || "")
      }));
      setTransactions(enrichedHistory);

    } catch (error) {
      // ДЕМО ДАННЫЕ (Показываем красивые иконки)
      setCards([
        { id: 1, type: 'Visa', number: '4000 1234 5678 9010', balance: 150000, currency: 'KZT', is_blocked: false },
        { id: 2, type: 'Mastercard', number: '5100 9876 5432 1098', balance: 450, currency: 'USD', is_blocked: true }
      ]);
      setTotalBalance(350000);
      setTransactions([
        { id: 101, title: 'Magnum', amount: -12400, date: 'Сегодня', icon: 'cart' },
        { id: 102, title: 'Yandex Taxi', amount: -2500, date: 'Сегодня', icon: 'taxi' }, // Иконка из сервисов
        { id: 103, title: 'ITU Campus', amount: -60000, date: 'Вчера', icon: 'school' }, // Иконка из сервисов
        { id: 104, title: 'Starbucks', amount: -1800, date: 'Вчера', icon: 'coffee' }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const toggleBlockCard = async () => {
    if (!selectedCard) return;
    try {
      if (selectedCard.is_blocked) {
        await bankApi.unblockCard(selectedCard.id);
        Alert.alert("Успешно", "Карта разблокирована");
      } else {
        await bankApi.blockCard(selectedCard.id);
        Alert.alert("Успешно", "Карта заблокирована 🔒");
      }
      setCardModalVisible(false);
      onRefresh();
    } catch (e) {
      Alert.alert("Демо режим", `Статус изменен для ${selectedCard.number}`);
      setCardModalVisible(false);
      setCards(cards.map(c => c.id === selectedCard.id ? {...c, is_blocked: !c.is_blocked} : c));
    }
  };

  // Обновил иконки на более современные и соответствующие сервисам
  const quickActions = [
    { icon: 'swap-horizontal', label: 'Переводы', color: '#6200ee', route: '/tabs/payments' },
    { icon: 'qrcode', label: 'QR', color: '#03dac6', route: '/qr' },
    { icon: 'clock-outline', label: 'История', color: '#f4511e', route: '/history' },
    { icon: 'robot', label: 'AI Чат', color: '#e91e63', route: '/chat' }, // Теперь ROBOT
  ];

  if (loading) return <ActivityIndicator style={{marginTop: 50}} size="large" color={theme.colors.primary} />;

  return (
    <PaperProvider>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
            <View>
            <Text style={{ color: '#888', fontSize: 14 }}>Добрый день,</Text>
            <Text style={{ color: theme.colors.onBackground, fontSize: 24, fontWeight: 'bold' }}>Нурбек 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')}>
                <Avatar.Image size={45} source={{ uri: 'https://i.pravatar.cc/150?img=11' }} />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={styles.totalBalance}>
            <Text style={{ color: '#888' }}>Общий баланс</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.colors.onBackground }}>{totalBalance.toLocaleString()} ₸</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {cards.map((card) => (
                <TouchableOpacity key={card.id} activeOpacity={0.9} onPress={() => { setSelectedCard(card); setCardModalVisible(true); }}>
                    <View style={[styles.card, { backgroundColor: card.is_blocked ? '#424242' : (card.type === 'Visa' ? '#1a1a1a' : '#283593') }]}>
                        <View style={styles.cardTop}>
                            <Text style={styles.cardName}>{card.is_blocked ? 'ЗАБЛОКИРОВАНА 🔒' : 'Основная карта'}</Text>
                            <MaterialCommunityIcons name={card.type === 'Visa' ? 'credit-card' : 'credit-card-chip'} size={30} color="#fff" />
                        </View>
                        <View style={styles.cardMiddle}>
                            <Text style={styles.cardNumber}>{card.number ? card.number.toString().replace(/(\d{4})/g, '$1 ').trim() : '****'}</Text>
                        </View>
                        <View style={styles.cardBottom}>
                            <Text style={styles.cardBalanceLabel}>Баланс</Text>
                            <Text style={styles.cardBalance}>{Number(card.balance).toLocaleString()} {card.currency}</Text>
                        </View>
                        {card.is_blocked && <View style={styles.blockedOverlay}><MaterialCommunityIcons name="lock" size={50} color="rgba(255,255,255,0.5)" /></View>}
                    </View>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addCardBtn} onPress={() => Alert.alert('Новая карта', 'Запрос отправлен')}><MaterialCommunityIcons name="plus" size={30} color={theme.colors.onSurface} /><Text style={{ color: theme.colors.onSurface, marginTop: 5 }}>Открыть</Text></TouchableOpacity>
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
            {transactions.map((t) => (
                <View key={t.id} style={[styles.transaction, { backgroundColor: theme.colors.elevation.level1 }]}>
                    <Avatar.Icon size={40} icon={t.icon || 'credit-card-outline'} style={{ backgroundColor: theme.colors.elevation.level3 }} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={[styles.tName, { color: theme.colors.onBackground }]}>{t.title || t.category}</Text>
                        <Text style={{ color: '#888', fontSize: 12 }}>{t.date || t.created_at?.slice(0,10)}</Text>
                    </View>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: t.amount > 0 ? '#4caf50' : theme.colors.onBackground }}>{t.amount > 0 ? '+' : ''} {t.amount} ₸</Text>
                </View>
            ))}
            </View>
        </ScrollView>

        <Portal>
            <Modal visible={cardModalVisible} onDismiss={() => setCardModalVisible(false)} contentContainerStyle={[styles.modalContent, {backgroundColor: theme.colors.background}]}>
                <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: theme.colors.onSurface}}>Управление картой</Text>
                <Button mode="contained" icon={selectedCard?.is_blocked ? "lock-open" : "lock"} buttonColor={selectedCard?.is_blocked ? "#4caf50" : "#f44336"} onPress={toggleBlockCard} style={{marginBottom: 10}}>
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