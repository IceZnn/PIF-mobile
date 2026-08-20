import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import SplashScreen from "./src/screens/splash";
import LoginScreen from "./src/screens/login";
import CadastroUserScreen from "./src/screens/cadastro_user";
import HomeScreen from "./src/screens/home";
import TarefasScreen from "./src/screens/tarefas";
import colors from "./src/theme/colors";

export default function App() {
  const [screen, setScreen] = useState("splash");

  const renderScreen = () => {
    if (screen === "splash") {
      return <SplashScreen onFinish={() => setScreen("login")} />;
    }

    if (screen === "login") {
      return (
        <LoginScreen
          onLogin={() => setScreen("home")}
          onSignup={() => setScreen("cadastro")}
        />
      );
    }

    if (screen === "cadastro") {
      return (
        <CadastroUserScreen
          onRegister={() => setScreen("home")}
          onBack={() => setScreen("login")}
        />
      );
    }

    if (screen === "home") {
      return (
        <HomeScreen
          onNewTask={() => setScreen("tarefas")}
          onLogout={() => setScreen("login")}
        />
      );
    }

    return (
      <TarefasScreen
        onBack={() => setScreen("home")}
        onCreateTask={() => setScreen("home")}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
});
