import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, useTheme, IconButton, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { bankApi } from '../src/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, text: 'Салем! Я ИИ-ассистент. Чем помочь?', isMe: false }]);

  const sendMsg = async () => {
    if(!msg.trim()) return;
    const userMsg = { id: Date.now(), text: msg, isMe: true };
    setMessages(prev => [...prev, userMsg]);
    const txt = msg; setMsg(''); setLoading(true);
    try {
      const res = await bankApi.chatWithAI(txt);
      setMessages(prev => [...prev, { id: Date.now()+1, text: res.data || "Ответ получен", isMe: false }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now()+1, text: "Ошибка связи с ИИ", isMe: false }]);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor: theme.colors.background}}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text style={styles.title}>AI Support (Groq)</Text>
      </View>
      <ScrollView contentContainerStyle={{padding: 20}}>
        {messages.map(m => (
          <View key={m.id} style={[styles.bubble, { alignSelf: m.isMe ? 'flex-end' : 'flex-start', backgroundColor: m.isMe ? theme.colors.primary : theme.colors.elevation.level2 }]}>
             <Text style={{color: m.isMe ? 'white' : theme.colors.onSurface}}>{m.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator />}
      </ScrollView>
      <View style={styles.inputContainer}>
         <TextInput style={styles.input} placeholder="Сообщение..." value={msg} onChangeText={setMsg} />
         <IconButton icon="send" iconColor={theme.colors.primary} onPress={sendMsg} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 15, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', backgroundColor: '#fff' },
  input: { flex: 1, padding: 10, fontSize: 16 }
});