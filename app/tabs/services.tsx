import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Linking, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Card, Button, Avatar, IconButton, Title, ProgressBar, Snackbar, Paragraph, Chip, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bankApi } from '../../src/api';

export default function Services() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  // --- STATE ДЛЯ SNACKBAR (Уведомления) ---
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackColor, setSnackColor] = useState(theme.colors.inverseSurface);

  const showSnack = (msg: string, isError = false) => {
    setSnackMessage(msg);
    setSnackColor(isError ? theme.colors.error : '#333');
    setSnackVisible(true);
  };
  
  // --- МОДАЛКИ ---
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [ecoModalVisible, setEcoModalVisible] = useState(false);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [linkBillModalVisible, setLinkBillModalVisible] = useState(false);
  const [p2pModalVisible, setP2pModalVisible] = useState(false);
  const [ghostCardModalVisible, setGhostCardModalVisible] = useState(false);
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ФОРМЫ
  const [payAmount, setPayAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [income, setIncome] = useState('');
  
  // --- P2P LENDING STATE ---
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pPurpose, setP2pPurpose] = useState('');
  const [p2pTerm, setP2pTerm] = useState('6');
  const [selectedLenders, setSelectedLenders] = useState<number[]>([]);
  
  // --- ORTAK (SPLIT BILL) STATE ---
  const [splitAmount, setSplitAmount] = useState('');
  const [splitDescription, setSplitDescription] = useState('');
  const [splitMode, setSplitMode] = useState<'auto' | 'manual'>('auto');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [manualSplits, setManualSplits] = useState<{[key: number]: string}>({});
  
  // --- ECO LIFE STATE ---
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelType, setFuelType] = useState<'gas' | 'petrol'>('petrol');
  
  // --- GHOST CARD STATE ---
  const [ghostCards, setGhostCards] = useState([
    { id: 1, number: '4400 **** **** 1234', limit: 50000, spent: 12500, merchant: 'Amazon', active: true },
    { id: 2, number: '5200 **** **** 5678', limit: 30000, spent: 0, merchant: 'AliExpress', active: false }
  ]);
  const [newCardLimit, setNewCardLimit] = useState('');
  
  // --- БЮДЖЕТ (СЕЙФ) ---
  const [freeBalance, setFreeBalance] = useState(250000); 
  const [envelopes, setEnvelopes] = useState([
    { id: 1, name: 'Аренда', amount: 0, icon: 'home', color: '#673ab7', inputValue: '', linkedBill: '' },
    { id: 2, name: 'Продукты', amount: 0, icon: 'cart', color: '#4caf50', inputValue: '', linkedBill: '' },
  ]);

  const [newEnvelopeName, setNewEnvelopeName] = useState('');
  const [isCreatingEnvelope, setIsCreatingEnvelope] = useState(false);
  const [billInput, setBillInput] = useState('');
  const [currentEnvId, setCurrentEnvId] = useState<number | null>(null);

  const studentData = { name: 'Нурбек', id: '210107', gpa: '3.8', tuitionTotal: 600000, tuitionPaid: 60000 };
  
  const trustCircle = [
    { id: 1, name: 'Алибек', avatar: 'face-man', trustScore: 95, recent: 'Вчера', loanHistory: 3 },
    { id: 2, name: 'Айжан', avatar: 'face-woman', trustScore: 88, recent: '3 дня', loanHistory: 5 },
    { id: 3, name: 'Данияр', avatar: 'account', trustScore: 92, recent: 'Неделю', loanHistory: 2 },
  ];

  const frequentContacts = [
    { id: 1, name: 'Алибек', avatar: 'face-man', recent: 'Вчера' },
    { id: 2, name: 'Айжан', avatar: 'face-woman', recent: '3 дня назад' },
    { id: 3, name: 'Данияр', avatar: 'account', recent: 'Неделю назад' },
    { id: 4, name: 'Асель', avatar: 'face-woman', recent: '2 недели' },
  ];

  // === ОБНОВЛЕННЫЙ СПИСОК СЕРВИСОВ ===
  const services = [
    { id: 9, title: 'Мой Бюджет', icon: 'piggy-bank', color: '#3f51b5', badge: 'NEW', desc: 'Сейф расходов' },
    { id: 10, title: 'Trust Круг', icon: 'account-heart', color: '#e91e63', badge: 'HOT', desc: 'Займы друзьям' },
    { id: 5, title: 'ITU Campus', icon: 'school', color: '#6200ee', badge: null, desc: 'Университет' },
    { id: 6, title: 'Digital Taraz', icon: 'bus', color: '#03dac6', badge: null, desc: 'Транспорт' },
    { id: 8, title: 'Такси', icon: 'taxi', color: '#ffc107', badge: null, desc: 'Заказ поездки' },
    { id: 1, title: 'Ortak', icon: 'account-group', color: '#f4511e', badge: 'HOT', desc: 'Скинуться с друзьями' },
    { id: 2, title: 'Eco Life', icon: 'leaf', color: '#4caf50', badge: 'ESG', desc: 'Компенсация CO₂' },
    { id: 7, title: 'Кредит', icon: 'cash-fast', color: '#ff9800', badge: 'NEW', desc: 'Онлайн за 1 мин' },
    { id: 3, title: 'Ghost Card', icon: 'credit-card-outline', color: '#607d8b', badge: 'SAFE', desc: 'Виртуальные карты' },
  ];

  const handlePress = (serviceItem: any) => {
    if (serviceItem.title === 'Trust Круг') setP2pModalVisible(true);
    else if (serviceItem.title === 'Ortak') setSplitModalVisible(true);
    else if (serviceItem.title === 'ITU Campus') setStudentModalVisible(true);
    else if (serviceItem.title === 'Eco Life') setEcoModalVisible(true);
    else if (serviceItem.title === 'Кредит') setLoanModalVisible(true);
    else if (serviceItem.title === 'Мой Бюджет') setBudgetModalVisible(true);
    else if (serviceItem.title === 'Ghost Card') setGhostCardModalVisible(true);
    else if (serviceItem.title === 'Такси') Linking.openURL('https://go.yandex.kz');
    else { setSelectedService(serviceItem); setInfoModalVisible(true); }
  };

  // --- ЛОГИКА P2P ---
  const toggleLender = (id: number) => {
    if (selectedLenders.includes(id)) {
      setSelectedLenders(selectedLenders.filter(l => l !== id));
    } else {
      setSelectedLenders([...selectedLenders, id]);
    }
  };

  const handleP2PRequest = () => {
    if (!p2pAmount || selectedLenders.length === 0) {
      showSnack('Укажите сумму и выберите кредиторов', true);
      return;
    }
    showSnack(`Запрос на ${p2pAmount}₸ отправлен ${selectedLenders.length} людям`);
    setP2pModalVisible(false);
    setP2pAmount('');
    setP2pPurpose('');
    setSelectedLenders([]);
  };

  // --- ЛОГИКА ORTAK (SPLIT) ---
  const toggleFriend = (id: number) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter(f => f !== id));
      const newSplits = {...manualSplits};
      delete newSplits[id];
      setManualSplits(newSplits);
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const updateManualSplit = (id: number, amount: string) => {
    setManualSplits({...manualSplits, [id]: amount});
  };

  const handleSplitRequest = () => {
    if (!splitAmount || selectedFriends.length === 0) {
      showSnack('Укажите сумму и выберите друзей', true);
      return;
    }
    
    if (splitMode === 'manual') {
      const total = Object.values(manualSplits).reduce((sum, val) => sum + Number(val || 0), 0);
      if (total !== Number(splitAmount)) {
        showSnack('Сумма распределения не совпадает с общей суммой', true);
        return;
      }
    }
    
    showSnack(`Запрос на оплату отправлен ${selectedFriends.length} друзьям`);
    setSplitModalVisible(false);
    setSplitAmount('');
    setSplitDescription('');
    setSelectedFriends([]);
    setManualSplits({});
  };

  // --- ЛОГИКА ECO LIFE ---
  const calculateCO2 = () => {
    const amount = Number(fuelAmount);
    if (amount <= 0) return 0;
    // Примерно 2.3 кг CO₂ на литр бензина, 1.8 кг на литр газа
    const co2PerLiter = fuelType === 'petrol' ? 2.3 : 1.8;
    const liters = amount / (fuelType === 'petrol' ? 250 : 150); // примерная цена за литр
    return (liters * co2PerLiter).toFixed(1);
  };

  const handlePlantTree = async () => {
    const co2 = calculateCO2();
    setLoading(true);
    try { 
      await bankApi.payService("Eco Tree", 500); 
      showSnack(`🌳 Дерево посажено! Компенсация: ${co2} кг CO₂`); 
      setEcoModalVisible(false);
      setFuelAmount('');
    } 
    catch (e) { showSnack("Ошибка оплаты", true); } 
    finally { setLoading(false); }
  };

  // --- ЛОГИКА GHOST CARD ---
  const toggleGhostCard = (id: number) => {
    setGhostCards(cards => cards.map(c => 
      c.id === id ? {...c, active: !c.active} : c
    ));
    showSnack(ghostCards.find(c => c.id === id)?.active ? 'Карта заморожена' : 'Карта активирована');
  };

  const createGhostCard = () => {
    if (!newCardLimit || Number(newCardLimit) <= 0) {
      showSnack('Укажите лимит карты', true);
      return;
    }
    
    const newCard = {
      id: Date.now(),
      number: `4400 **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      limit: Number(newCardLimit),
      spent: 0,
      merchant: 'Новый магазин',
      active: true
    };
    
    setGhostCards([...ghostCards, newCard]);
    setNewCardLimit('');
    showSnack('Виртуальная карта создана!');
  };

  const deleteGhostCard = (id: number) => {
    setGhostCards(cards => cards.filter(c => c.id !== id));
    showSnack('Карта удалена');
  };

  // --- ЛОГИКА БЮДЖЕТА ---
  const updateEnvelopeInput = (id: number, text: string) => {
    setEnvelopes(prev => prev.map(env => env.id === id ? { ...env, inputValue: text } : env));
  };

  const freezeMoney = (id: number) => {
    const env = envelopes.find(e => e.id === id);
    if (!env || !env.inputValue) return;
    const val = Number(env.inputValue);
    if (val <= 0) return;
    
    if (val > freeBalance) { showSnack("Недостаточно свободных средств", true); return; }
    
    setFreeBalance(prev => prev - val);
    setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, amount: e.amount + val, inputValue: '' } : e));
    showSnack(`Отложено ${val} ₸ в "${env.name}"`);
  };

  const unfreezeMoney = (id: number) => {
    const env = envelopes.find(e => e.id === id);
    if (!env || env.amount <= 0) { showSnack("Ячейка пуста", true); return; }
    
    setFreeBalance(prev => prev + env.amount);
    setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, amount: 0 } : e));
    showSnack(`Деньги возвращены на карту`);
  };

  const handleCreateEnvelope = () => {
    if (!newEnvelopeName.trim()) return;
    const newId = Date.now();
    const colors = ['#e91e63', '#9c27b0', '#2196f3', '#00bcd4', '#009688', '#ffc107', '#ff5722'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newEnv = { 
      id: newId, 
      name: newEnvelopeName, 
      amount: 0, 
      icon: 'folder-star', 
      color: randomColor, 
      inputValue: '', 
      linkedBill: '' 
    };
    
    setEnvelopes([...envelopes, newEnv]);
    setNewEnvelopeName('');
    setIsCreatingEnvelope(false);
    showSnack("Новая ячейка создана");
  };

  const openLinkBillModal = (id: number) => {
    setCurrentEnvId(id);
    setLinkBillModalVisible(true);
  };

  const saveLinkedBill = () => {
    if (!billInput || currentEnvId === null) return;
    setEnvelopes(prev => prev.map(e => e.id === currentEnvId ? { ...e, linkedBill: billInput } : e));
    setBillInput('');
    setLinkBillModalVisible(false);
    showSnack("Счет успешно привязан!");
  };

  const payFromEnvelope = (id: number) => {
    const env = envelopes.find(e => e.id === id);
    if (!env || env.amount <= 0) { showSnack("Нет денег для оплаты", true); return; }
    
    setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, amount: 0 } : e));
    showSnack(`Оплачено: ${env.amount} ₸`);
  };

  // --- API ---
  const handleTuitionPayment = async () => {
    if (!payAmount) return;
    setLoading(true);
    try { 
      await bankApi.payService("ITU Tuition", Number(payAmount)); 
      showSnack(`Оплата принята`); 
      setPayAmount(''); 
      setStudentModalVisible(false); 
    } 
    catch (e) { showSnack("Ошибка оплаты", true); } 
    finally { setLoading(false); }
  };

  const handleLoanApply = async () => {
    if (!loanAmount || !income) return;
    setLoading(true);
    try { 
      const res = await bankApi.applyLoan(Number(loanAmount), 12, Number(income));
      if (res.data.status === 'approved') showSnack(`🎉 ОДОБРЕНО! Ставка: ${res.data.rate}`);
      else showSnack("Отказ. Недостаточный доход.", true);
      setLoanModalVisible(false);
    } catch (e) { showSnack("Ошибка соединения", true); } finally { setLoading(false); }
  };

  const progress = studentData.tuitionPaid / studentData.tuitionTotal;

  const MySnackbar = () => (
    <Snackbar
      visible={snackVisible}
      onDismiss={() => setSnackVisible(false)}
      duration={3000}
      style={{ backgroundColor: snackColor, marginBottom: 20 }}
      action={{ label: 'OK', onPress: () => setSnackVisible(false), textColor: '#fff' }}
    >
      {snackMessage}
    </Snackbar>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>{t('services')}</Text>
          <Text style={{ color: theme.colors.secondary, marginTop: 5 }}>Суперприложение</Text>
        </View>
        <View style={styles.grid}>
          {services.map((item: any) => (
            <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} onPress={() => handlePress(item)}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
              {item.badge && <View style={[styles.badge, { backgroundColor: item.color }]}><Text style={styles.badgeText}>{item.badge}</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* === МОДАЛКИ === */}
      
      {/* 1. P2P LENDING (TRUST КРУГ) */}
      <Modal animationType="slide" transparent={true} visible={p2pModalVisible} onRequestClose={() => setP2pModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '90%' }]}>
            <View style={styles.modalHeader}>
              <Title style={{fontWeight:'bold', fontSize: 22}}>💰 Trust Круг</Title>
              <IconButton icon="close" onPress={() => setP2pModalVisible(false)} />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{backgroundColor: '#fce4ec', padding: 20, borderRadius: 16, marginBottom: 20}}>
          <Text style={{color: '#c2185b', fontSize: 12, marginBottom: 5}}>Запрос займа</Text>
          <Title style={{fontSize: 28, fontWeight:'bold', color: '#e91e63'}}>Займ от друзей под 5-10%</Title>
          <Text style={{color: '#888', fontSize: 12, marginTop: 5}}>Быстрее МФО, дешевле банка</Text>
              </View>

              <TextInput 
          style={styles.input} 
          placeholder="Сумма займа (₸)" 
          keyboardType="numeric" 
          value={p2pAmount} 
          onChangeText={setP2pAmount} 
              />

              <View style={{marginBottom: 15}}>
                <Text style={{marginBottom: 10, fontWeight: 'bold'}}>Срок</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  {['3', '6', '12', '24'].map(term => (
                    <TouchableOpacity 
                      key={term}
                      onPress={() => setP2pTerm(term)}
                      style={[
                        styles.termButton, 
                        p2pTerm === term && {backgroundColor: '#e91e63', borderColor: '#e91e63'}
                      ]}
                    >
                      <Text style={[styles.termText, p2pTerm === term && {color: '#fff'}]}>{term} мес</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput 
                style={[styles.input, {height: 80}]} 
                placeholder="Цель займа (опционально)" 
                multiline
                value={p2pPurpose} 
                onChangeText={setP2pPurpose} 
              />

              <Text style={{marginBottom: 10, fontWeight: 'bold', fontSize: 16}}>Выберите кредиторов</Text>
              
              {trustCircle.map(person => (
                <TouchableOpacity 
                  key={person.id} 
                  style={[
                    styles.personCard, 
                    selectedLenders.includes(person.id) && styles.personCardSelected
                  ]}
                  onPress={() => toggleLender(person.id)}
                >
                  <Avatar.Icon size={50} icon={person.avatar} style={{backgroundColor: '#e91e63'}} />
                  <View style={{flex: 1, marginLeft: 15}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <Text style={{fontWeight: 'bold', fontSize: 16}}>{person.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MaterialCommunityIcons name="shield-check" size={16} color="#4caf50" />
                        <Text style={{color: '#4caf50', marginLeft: 3, fontWeight: 'bold'}}>{person.trustScore}</Text>
                      </View>
                    </View>
                    <Text style={{color: '#888', fontSize: 12}}>Займов закрыто: {person.loanHistory}</Text>
                    <Text style={{color: '#888', fontSize: 11}}>Активен: {person.recent}</Text>
                  </View>
                  {selectedLenders.includes(person.id) && (
                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#e91e63" />
                  )}
                </TouchableOpacity>
              ))}

              {p2pAmount && selectedLenders.length > 0 && (
                <View style={{backgroundColor: '#e8f5e9', padding: 15, borderRadius: 12, marginTop: 15}}>
                  <Text style={{color: '#2e7d32', fontWeight: 'bold'}}>Расчет платежа</Text>
                  <Text style={{color: '#2e7d32', marginTop: 5}}>
                    Ежемесячно: ~{Math.ceil(Number(p2pAmount) * 1.08 / Number(p2pTerm)).toLocaleString()} ₸
                  </Text>
                  <Text style={{color: '#666', fontSize: 11, marginTop: 3}}>
                    Процент: 8% годовых
                  </Text>
                </View>
              )}

              <Button 
                mode="contained" 
                onPress={handleP2PRequest}
                style={{marginTop: 20, marginBottom: 20, backgroundColor: '#e91e63'}}
                contentStyle={{height: 50}}
                disabled={!p2pAmount || selectedLenders.length === 0}
              >
                Отправить запрос {selectedLenders.length > 0 && `(${selectedLenders.length})`}
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. ORTAK (SPLIT BILL) */}
      <Modal animationType="slide" transparent={true} visible={splitModalVisible} onRequestClose={() => setSplitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '90%' }]}>
            <View style={styles.modalHeader}>
              <Title style={{fontWeight:'bold', fontSize: 22}}>🤝 Ortak</Title>
              <IconButton icon="close" onPress={() => setSplitModalVisible(false)} />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{backgroundColor: '#fff3e0', padding: 20, borderRadius: 16, marginBottom: 20}}>
                <Title style={{fontSize: 18, fontWeight:'bold', color: '#f57c00'}}>Скиньтесь с друзьями</Title>
                <Text style={{color: '#888', fontSize: 12, marginTop: 5}}>Разделите счет автоматически или вручную</Text>
              </View>

              <TextInput 
                style={styles.input} 
                placeholder="Общая сумма (₸)" 
                keyboardType="numeric" 
                value={splitAmount} 
                onChangeText={setSplitAmount} 
              />

              <TextInput 
                style={styles.input} 
                placeholder="Описание (ресторан, подарок...)" 
                value={splitDescription} 
                onChangeText={setSplitDescription} 
              />

              <View style={{marginBottom: 20}}>
                <Text style={{marginBottom: 10, fontWeight: 'bold'}}>Режим разделения</Text>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <Button 
                    mode={splitMode === 'auto' ? 'contained' : 'outlined'}
                    onPress={() => setSplitMode('auto')}
                    style={{flex: 1}}
                    icon="equal"
                  >
                    Поровну
                  </Button>
                  <Button 
                    mode={splitMode === 'manual' ? 'contained' : 'outlined'}
                    onPress={() => setSplitMode('manual')}
                    style={{flex: 1}}
                    icon="pencil"
                  >
                    Вручную
                  </Button>
                </View>
              </View>

              <Text style={{marginBottom: 10, fontWeight: 'bold', fontSize: 16}}>Частые друзья</Text>
              
              {frequentContacts.slice(0, 2).map(person => (
                <TouchableOpacity 
                  key={person.id} 
                  style={[
                    styles.personCard, 
                    selectedFriends.includes(person.id) && styles.personCardSelected
                  ]}
                  onPress={() => toggleFriend(person.id)}
                >
                  <Avatar.Icon size={50} icon={person.avatar} style={{backgroundColor: '#f4511e'}} />
                  <View style={{flex: 1, marginLeft: 15}}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>{person.name}</Text>
                    <Text style={{color: '#888', fontSize: 12}}>Последний раз: {person.recent}</Text>
                  </View>
                  {selectedFriends.includes(person.id) && (
                    <View>
                      <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#f4511e" />
                      {splitMode === 'auto' && splitAmount && (
                        <Text style={{fontSize: 11, color: '#f4511e', marginTop: 3}}>
                          {Math.ceil(Number(splitAmount) / (selectedFriends.length + 1)).toLocaleString()}₸
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <Divider style={{marginVertical: 15}} />
              
              <Text style={{marginBottom: 10, fontWeight: 'bold', fontSize: 16}}>Все контакты</Text>
              
                            {frequentContacts.slice(2).map(person => (
                              <TouchableOpacity 
                                key={person.id} 
                                style={[
                                  styles.personCard, 
                                  selectedFriends.includes(person.id) && styles.personCardSelected
                                ]}
                                onPress={() => toggleFriend(person.id)}
                              >
                                <Avatar.Icon size={50} icon={person.avatar} style={{backgroundColor: '#f4511e'}} />
                                <View style={{flex: 1, marginLeft: 15}}>
                                  <Text style={{fontWeight: 'bold', fontSize: 16}}>{person.name}</Text>
                                  <Text style={{color: '#888', fontSize: 12}}>Последний раз: {person.recent}</Text>
                                </View>
                                {selectedFriends.includes(person.id) && (
                                  <View>
                                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#f4511e" />
                                    {splitMode === 'auto' && splitAmount && (
                                      <Text style={{fontSize: 11, color: '#f4511e', marginTop: 3}}>
                                        {Math.ceil(Number(splitAmount) / (selectedFriends.length + 1)).toLocaleString()}₸
                                      </Text>
                                    )}
                                  </View>
                                )}
                              </TouchableOpacity>
                            ))}
              
                            {splitMode === 'manual' && selectedFriends.length > 0 && (
                              <View style={{marginTop: 15}}>
                                <Text style={{marginBottom: 10, fontWeight: 'bold'}}>Распределение сумм</Text>
                                {selectedFriends.map(friendId => {
                                  const friend = frequentContacts.find(f => f.id === friendId);
                                  return (
                                    <View key={friendId} style={{marginBottom: 10}}>
                                      <Text style={{fontSize: 12, color: '#888', marginBottom: 5}}>{friend?.name}</Text>
                                      <TextInput 
                                        style={styles.input}
                                        placeholder="Сумма"
                                        keyboardType="numeric"
                                        value={manualSplits[friendId] || ''}
                                        onChangeText={(val) => updateManualSplit(friendId, val)}
                                      />
                                    </View>
                                  );
                                })}
                              </View>
                            )}
              
                            <Button 
                              mode="contained" 
                              onPress={handleSplitRequest}
                              style={{marginTop: 20, marginBottom: 20, backgroundColor: '#f4511e'}}
                              contentStyle={{height: 50}}
                              disabled={!splitAmount || selectedFriends.length === 0}
                            >
                              Отправить запрос {selectedFriends.length > 0 && `(${selectedFriends.length})`}
                            </Button>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 3. STUDENT (ITU CAMPUS) */}
                    <Modal animationType="slide" transparent={true} visible={studentModalVisible} onRequestClose={() => setStudentModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '85%' }]}>
                          <View style={styles.modalHeader}>
                            <Title style={{fontWeight:'bold', fontSize: 22}}>🎓 ITU Campus</Title>
                            <IconButton icon="close" onPress={() => setStudentModalVisible(false)} />
                          </View>
                          
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <Card style={{marginBottom: 20, backgroundColor: '#6200ee20'}}>
                              <Card.Content>
                                <Text style={{color: '#6200ee', fontWeight: 'bold'}}>Студент: {studentData.name}</Text>
                                <Text style={{color: '#888', fontSize: 12}}>ID: {studentData.id} | GPA: {studentData.gpa}</Text>
                              </Card.Content>
                            </Card>
              
                            <Text style={{fontWeight: 'bold', marginBottom: 10}}>Оплата обучения</Text>
                            <ProgressBar progress={progress} style={{marginBottom: 10, height: 8}} color="#6200ee" />
                            <Text style={{color: '#888', fontSize: 12, marginBottom: 15}}>
                              Оплачено: {studentData.tuitionPaid.toLocaleString()} / {studentData.tuitionTotal.toLocaleString()} ₸
                            </Text>
              
                            <TextInput 
                              style={styles.input}
                              placeholder="Сумма оплаты (₸)"
                              keyboardType="numeric"
                              value={payAmount}
                              onChangeText={setPayAmount}
                            />
              
                            <Button 
                              mode="contained"
                              onPress={handleTuitionPayment}
                              loading={loading}
                              style={{marginTop: 20, backgroundColor: '#6200ee'}}
                              contentStyle={{height: 50}}
                            >
                              Оплатить
                            </Button>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 4. ECO LIFE */}
                    <Modal animationType="slide" transparent={true} visible={ecoModalVisible} onRequestClose={() => setEcoModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '80%' }]}>
                          <View style={styles.modalHeader}>
                            <Title style={{fontWeight:'bold', fontSize: 22}}>🌳 Eco Life</Title>
                            <IconButton icon="close" onPress={() => setEcoModalVisible(false)} />
                          </View>
                          
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{backgroundColor: '#e8f5e9', padding: 20, borderRadius: 16, marginBottom: 20}}>
                              <Title style={{fontSize: 18, fontWeight:'bold', color: '#2e7d32'}}>Компенсируй CO₂ выбросы</Title>
                              <Text style={{color: '#555', fontSize: 12, marginTop: 5}}>Каждая посаженная ель компенсирует 20 кг выбросов</Text>
                            </View>
              
                            <Text style={{marginBottom: 10, fontWeight: 'bold'}}>Расход топлива</Text>
                            <TextInput 
                              style={styles.input}
                              placeholder="Сумма потрачена на топливо (₸)"
                              keyboardType="numeric"
                              value={fuelAmount}
                              onChangeText={setFuelAmount}
                            />
              
                            <View style={{marginBottom: 20}}>
                              <Text style={{marginBottom: 10, fontWeight: 'bold'}}>Тип топлива</Text>
                              <View style={{flexDirection: 'row', gap: 10}}>
                                <Button 
                                  mode={fuelType === 'petrol' ? 'contained' : 'outlined'}
                                  onPress={() => setFuelType('petrol')}
                                  style={{flex: 1}}
                                >
                                  95 Бензин
                                </Button>
                                <Button 
                                  mode={fuelType === 'gas' ? 'contained' : 'outlined'}
                                  onPress={() => setFuelType('gas')}
                                  style={{flex: 1}}
                                >
                                  ГБО Газ
                                </Button>
                              </View>
                            </View>
              
                            {fuelAmount && (
                              <Card style={{backgroundColor: '#f1f8e9', marginBottom: 20}}>
                                <Card.Content>
                                  <Text style={{color: '#558b2f', fontWeight: 'bold'}}>CO₂ выброс: {calculateCO2()} кг</Text>
                                  <Text style={{color: '#7cb342', fontSize: 12, marginTop: 5}}>Деревьев для компенсации: {Math.ceil(Number(calculateCO2()) / 20)}</Text>
                                </Card.Content>
                              </Card>
                            )}
              
                            <Button 
                              mode="contained"
                              onPress={handlePlantTree}
                              loading={loading}
                              style={{backgroundColor: '#4caf50'}}
                              contentStyle={{height: 50}}
                            >
                              Посадить дерево (500 ₸)
                            </Button>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 5. LOAN */}
                    <Modal animationType="slide" transparent={true} visible={loanModalVisible} onRequestClose={() => setLoanModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '80%' }]}>
                          <View style={styles.modalHeader}>
                            <Title style={{fontWeight:'bold', fontSize: 22}}>💳 Кредит</Title>
                            <IconButton icon="close" onPress={() => setLoanModalVisible(false)} />
                          </View>
                          
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{backgroundColor: '#fff3e0', padding: 20, borderRadius: 16, marginBottom: 20}}>
                              <Title style={{fontSize: 18, fontWeight:'bold', color: '#e65100'}}>Онлайн кредит за 1 минуту</Title>
                              <Text style={{color: '#555', fontSize: 12, marginTop: 5}}>Ставка от 12% до 36%</Text>
                            </View>
              
                            <TextInput 
                              style={styles.input}
                              placeholder="Сумма кредита (₸)"
                              keyboardType="numeric"
                              value={loanAmount}
                              onChangeText={setLoanAmount}
                            />
              
                            <TextInput 
                              style={styles.input}
                              placeholder="Ежемесячный доход (₸)"
                              keyboardType="numeric"
                              value={income}
                              onChangeText={setIncome}
                            />
              
                            <Button 
                              mode="contained"
                              onPress={handleLoanApply}
                              loading={loading}
                              style={{marginTop: 20, backgroundColor: '#ff9800'}}
                              contentStyle={{height: 50}}
                            >
                              Подать заявку
                            </Button>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 6. BUDGET (SAFE) */}
                    <Modal animationType="slide" transparent={true} visible={budgetModalVisible} onRequestClose={() => setBudgetModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '90%' }]}>
                          <View style={styles.modalHeader}>
                            <Title style={{fontWeight:'bold', fontSize: 22}}>🏦 Мой Бюджет</Title>
                            <IconButton icon="close" onPress={() => setBudgetModalVisible(false)} />
                          </View>
                          
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <Card style={{marginBottom: 20, backgroundColor: '#3f51b520'}}>
                              <Card.Content>
                                <Text style={{color: '#3f51b5', fontWeight: 'bold', fontSize: 18}}>Свободные средства</Text>
                                <Text style={{fontSize: 24, fontWeight: 'bold', color: '#3f51b5', marginTop: 10}}>
                                  {freeBalance.toLocaleString()} ₸
                                </Text>
                              </Card.Content>
                            </Card>
              
                            <Text style={{fontWeight: 'bold', marginBottom: 15, fontSize: 16}}>Ячейки</Text>
                            
                            {envelopes.map(env => (
                              <Card key={env.id} style={{marginBottom: 15, backgroundColor: env.color + '20'}}>
                                <Card.Content>
                                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                    <View style={{width: 40, height: 40, borderRadius: 8, backgroundColor: env.color, justifyContent: 'center', alignItems: 'center'}}>
                                      <MaterialCommunityIcons name={env.icon} size={20} color="#fff" />
                                    </View>
                                    <View style={{flex: 1, marginLeft: 15}}>
                                      <Text style={{fontWeight: 'bold', fontSize: 16}}>{env.name}</Text>
                                      <Text style={{color: '#888', fontSize: 12}}>Накоплено: {env.amount.toLocaleString()} ₸</Text>
                                    </View>
                                  </View>
              
                                  <View style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
                                    <TextInput 
                                      style={[styles.input, {flex: 1, height: 40}]}
                                      placeholder="Сумма"
                                      keyboardType="numeric"
                                      value={env.inputValue}
                                      onChangeText={(text) => updateEnvelopeInput(env.id, text)}
                                    />
                                    <Button 
                                      mode="outlined"
                                      onPress={() => freezeMoney(env.id)}
                                      style={{justifyContent: 'center'}}
                                    >
                                      +
                                    </Button>
                                  </View>
              
                                  <View style={{flexDirection: 'row', gap: 10}}>
                                    <Button 
                                      mode="outlined"
                                      onPress={() => unfreezeMoney(env.id)}
                                      style={{flex: 1}}
                                    >
                                      Вернуть
                                    </Button>
                                    <Button 
                                      mode="outlined"
                                      onPress={() => payFromEnvelope(env.id)}
                                      style={{flex: 1}}
                                    >
                                      Оплатить
                                    </Button>
                                    <Button 
                                      mode="outlined"
                                      onPress={() => openLinkBillModal(env.id)}
                                      style={{flex: 1}}
                                    >
                                      Связать
                                    </Button>
                                  </View>
              
                                  {env.linkedBill && (
                                    <Text style={{color: '#4caf50', fontSize: 11, marginTop: 10}}>✓ Счет: {env.linkedBill}</Text>
                                  )}
                                </Card.Content>
                              </Card>
                            ))}
              
                            {!isCreatingEnvelope ? (
                              <Button 
                                mode="outlined"
                                onPress={() => setIsCreatingEnvelope(true)}
                                style={{marginTop: 15}}
                              >
                                Создать ячейку
                              </Button>
                            ) : (
                              <View style={{marginTop: 15}}>
                                <TextInput 
                                  style={styles.input}
                                  placeholder="Название ячейки"
                                  value={newEnvelopeName}
                                  onChangeText={setNewEnvelopeName}
                                />
                                <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
                                  <Button 
                                    mode="contained"
                                    onPress={handleCreateEnvelope}
                                    style={{flex: 1}}
                                  >
                                    Создать
                                  </Button>
                                  <Button 
                                    mode="outlined"
                                    onPress={() => { setIsCreatingEnvelope(false); setNewEnvelopeName(''); }}
                                    style={{flex: 1}}
                                  >
                                    Отмена
                                  </Button>
                                </View>
                              </View>
                            )}
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 7. LINK BILL MODAL */}
                    <Modal animationType="fade" transparent={true} visible={linkBillModalVisible} onRequestClose={() => setLinkBillModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '40%', justifyContent: 'center' }]}>
                          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Привязать счет</Text>
                          <TextInput 
                            style={styles.input}
                            placeholder="Номер счета или организация"
                            value={billInput}
                            onChangeText={setBillInput}
                          />
                          <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
                            <Button 
                              mode="contained"
                              onPress={saveLinkedBill}
                              style={{flex: 1}}
                            >
                              Сохранить
                            </Button>
                            <Button 
                              mode="outlined"
                              onPress={() => setLinkBillModalVisible(false)}
                              style={{flex: 1}}
                            >
                              Отмена
                            </Button>
                          </View>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 8. GHOST CARD */}
                    <Modal animationType="slide" transparent={true} visible={ghostCardModalVisible} onRequestClose={() => setGhostCardModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '90%' }]}>
                          <View style={styles.modalHeader}>
                            <Title style={{fontWeight:'bold', fontSize: 22}}>🔒 Ghost Card</Title>
                            <IconButton icon="close" onPress={() => setGhostCardModalVisible(false)} />
                          </View>
                          
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{fontWeight: 'bold', marginBottom: 15, fontSize: 16}}>Виртуальные карты</Text>
                            
                            {ghostCards.map(card => (
                              <Card key={card.id} style={{marginBottom: 15, backgroundColor: '#607d8b20'}}>
                                <Card.Content>
                                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                                    <Text style={{fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16}}>{card.number}</Text>
                                    <Chip 
                                      style={{backgroundColor: card.active ? '#4caf50' : '#f44336'}}
                                      textStyle={{color: '#fff'}}
                                    >
                                      {card.active ? 'Активна' : 'Заморожена'}
                                    </Chip>
                                  </View>
              
                                  <View style={{marginBottom: 15}}>
                                    <Text style={{color: '#888', fontSize: 12}}>Магазин</Text>
                                    <Text style={{fontWeight: 'bold', fontSize: 14}}>{card.merchant}</Text>
                                  </View>
              
                                  <View style={{marginBottom: 15}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                                      <Text style={{color: '#888', fontSize: 12}}>Лимит</Text>
                                      <Text style={{color: '#888', fontSize: 12}}>{card.spent.toLocaleString()} / {card.limit.toLocaleString()} ₸</Text>
                                    </View>
                                    <ProgressBar progress={card.spent / card.limit} color="#607d8b" />
                                  </View>
              
                                  <View style={{flexDirection: 'row', gap: 10}}>
                                    <Button 
                                      mode="outlined"
                                      onPress={() => toggleGhostCard(card.id)}
                                      style={{flex: 1}}
                                    >
                                      {card.active ? 'Заморозить' : 'Активировать'}
                                    </Button>
                                    <Button 
                                      mode="outlined"
                                      onPress={() => deleteGhostCard(card.id)}
                                      style={{flex: 1}}
                                    >
                                      Удалить
                                    </Button>
                                  </View>
                                </Card.Content>
                              </Card>
                            ))}
              
                            <Divider style={{marginVertical: 20}} />
              
                            <Text style={{fontWeight: 'bold', marginBottom: 15, fontSize: 16}}>Создать новую карту</Text>
                            
                            <TextInput 
                              style={styles.input}
                              placeholder="Лимит карты (₸)"
                              keyboardType="numeric"
                              value={newCardLimit}
                              onChangeText={setNewCardLimit}
                            />
              
                            <Button 
                              mode="contained"
                              onPress={createGhostCard}
                              style={{backgroundColor: '#607d8b'}}
                              contentStyle={{height: 50}}
                            >
                              Создать виртуальную карту
                            </Button>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    {/* 9. INFO MODAL (for other services) */}
                    <Modal animationType="fade" transparent={true} visible={infoModalVisible} onRequestClose={() => setInfoModalVisible(false)}>
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.background, height: '50%' }]}>
                          <View style={styles.modalHeader}>
                            <Title style={{fontWeight:'bold', fontSize: 22}}>{selectedService?.title}</Title>
                            <IconButton icon="close" onPress={() => setInfoModalVisible(false)} />
                          </View>
                          
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{color: '#888', marginBottom: 20}}>{selectedService?.desc}</Text>
                            <Button 
                              mode="contained"
                              onPress={() => setInfoModalVisible(false)}
                              style={{marginTop: 20}}
                            >
                              Закрыть
                            </Button>
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
              
                    <MySnackbar />
                  </View>
                );
              }
              
              // --- STYLES ---
              const styles = StyleSheet.create({
                container: {
                  flex: 1,
                },
                scrollContent: {
                  paddingBottom: 20,
                },
                header: {
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                },
                headerTitle: {
                  fontSize: 28,
                  fontWeight: 'bold',
                },
                grid: {
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                },
                card: {
                  width: '48%',
                  borderRadius: 16,
                  padding: 15,
                  marginBottom: 15,
                  elevation: 2,
                },
                iconContainer: {
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                },
                cardTitle: {
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 5,
                },
                cardDesc: {
                  fontSize: 12,
                  color: '#888',
                  marginBottom: 10,
                },
                badge: {
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                },
                badgeText: {
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 'bold',
                },
                modalOverlay: {
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'flex-end',
                },
                modalContent: {
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingHorizontal: 20,
                  paddingTop: 15,
                },
                modalHeader: {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                },
                input: {
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 15,
                  fontSize: 14,
                },
                termButton: {
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  alignItems: 'center',
                },
                termText: {
                  fontSize: 12,
                  color: '#666',
                },
                personCard: {
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 12,
                  marginBottom: 12,
                },
                personCardSelected: {
                  backgroundColor: '#fff3e0',
                  borderWidth: 2,
                  borderColor: '#f4511e',
                },
              });