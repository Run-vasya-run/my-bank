import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  useEffect(() => {
    SecureStore.setItemAsync('user_jwt_secure', 'demo-mode-enabled');
  }, []);

  return <></>;
}