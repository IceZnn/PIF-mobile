import React, { useEffect, useState } from 'react';
import SplashScreen from '../screens/splash';
import HomeScreen from '../screens/home';

export default function AppRouter() {
  const [screen, setScreen] = useState('splash');

  useEffect(() => {
    if (screen !== 'splash') {
      return;
    }

    const timer = setTimeout(() => {
      setScreen('home');
    }, 1500);

    return () => clearTimeout(timer);
  }, [screen]);

  if (screen === 'splash') {
    return <SplashScreen onFinish={() => setScreen('home')} />;
  }

  return <HomeScreen />;
}
