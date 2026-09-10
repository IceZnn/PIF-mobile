import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import SplashScreen from "./src/screens/splash";
import LoginScreen from "./src/screens/login";
import CadastroUserScreen from "./src/screens/cadastro_user";
import HomeScreen from "./src/screens/home";
import colors from "./src/theme/colors";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://127.0.0.1:8080";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const handleLogin = async ({ cpf, senha }) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf, senha }),
      });
      const data = await response.json();

      if (response.status === 419) {
        setLoginError("A sessão do login expirou (erro 419). Ajuste a rota da API.");
        return;
      }

      if (!response.ok) {
        setLoginError(data.mensagem || "Erro ao realizar login.");
        return;
      }

      if (data.erro !== "n") {
        setLoginError(data.mensagem || "CPF ou senha inválidos.");
        return;
      }

      console.log("Token recebido:", data.token);
      setLoginError("");
      setScreen("home");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setLoginError("Não foi possível conectar ao servidor.");
    }
  };

  const handleRegister = async (form) => {
    try {
      const response = await fetch(`${API_URL}/api/cadastro_usuario`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || data.erro === "s") {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : "Não foi possível realizar o cadastro.";
        setRegisterError(data.mensagem || validationErrors);
        return;
      }

      setRegisterError("");
      setScreen("login");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setRegisterError("Não foi possível conectar ao servidor.");
    }
  };

  const renderScreen = () => {
    if (screen === "splash") {
      return <SplashScreen onFinish={() => setScreen("login")} />;
    }

    if (screen === "login") {
      return (
        <LoginScreen
          onLogin={handleLogin}
          onSignup={() => setScreen("cadastro")}
          externalError={loginError}
        />
      );
    }

    if (screen === "cadastro") {
      return (
        <CadastroUserScreen
          onRegister={handleRegister}
          onBack={() => setScreen("login")}
          externalError={registerError}
        />
      );
    }

    if (screen === "home") {
      return <HomeScreen onLogout={() => setScreen("login")} />;
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignup={() => setScreen("cadastro")}
        externalError={loginError}
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
