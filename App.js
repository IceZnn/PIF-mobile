import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import CadastroUserScreen from "./src/screens/cadastro_user";
import HomeScreen from "./src/screens/home";
import LoginScreen from "./src/screens/login";
import SplashScreen from "./src/screens/splash";
import { api, ApiError, SessionExpiredError } from "./src/services/api";
import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from "./src/services/session";
import colors from "./src/theme/colors";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    let active = true;

    getSessionToken()
      .then((savedToken) => {
        if (!active) {
          return;
        }
        setToken(savedToken);
        setScreen(savedToken ? "home" : "login");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setLoginError(
          "Não foi possível acessar a sessão salva. Tente entrar novamente.",
        );
        setScreen("login");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async ({ cpf, senha }) => {
    setLoginError("");
    setLoginNotice("");
    try {
      const data = await api.login({ cpf, senha });
      await saveSessionToken(data.token);
      setToken(data.token);
      setScreen("home");
    } catch (error) {
      setLoginError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar a sessão com segurança. Tente novamente.",
      );
    }
  };

  const handleRegister = async (form) => {
    setRegisterError("");
    try {
      await api.register(form);
      setLoginNotice("Cadastro realizado. Entre com seu CPF e sua senha.");
      setScreen("login");
    } catch (error) {
      setRegisterError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível concluir o cadastro. Tente novamente.",
      );
    }
  };

  const handleSessionExpired = useCallback(async () => {
    let message = "Sua sessão expirou. Entre novamente.";
    try {
      await clearSessionToken();
    } catch {
      message += " Não foi possível remover a sessão salva do dispositivo.";
    }
    setToken(null);
    setLoginError(message);
    setLoginNotice("");
    setScreen("login");
  }, []);

  const handleLogout = useCallback(async () => {
    let notice = "Sessão encerrada.";
    try {
      await api.logout(token);
    } catch (error) {
      if (!(error instanceof SessionExpiredError)) {
        notice =
          "A sessão foi encerrada neste dispositivo, mas não foi possível avisar o servidor. Verifique a rede.";
      }
    }

    let error = "";
    try {
      await clearSessionToken();
    } catch {
      error =
        "Não foi possível apagar a sessão salva com segurança. Reinicie o aplicativo ou tente sair novamente.";
    }

    setToken(null);
    setLoginError(error);
    setLoginNotice(error ? "" : notice);
    setScreen("login");
  }, [token]);

  const renderScreen = () => {
    if (screen === "splash") {
      return <SplashScreen onFinish={() => setScreen("login")} />;
    }

    if (screen === "login") {
      return (
        <LoginScreen
          onLogin={handleLogin}
          onSignup={() => {
            setLoginError("");
            setRegisterError("");
            setScreen("cadastro");
          }}
          externalError={loginError}
          notice={loginNotice}
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

    if (screen === "home" && token) {
      return (
        <HomeScreen
          token={token}
          onLogout={handleLogout}
          onSessionExpired={handleSessionExpired}
        />
      );
    }

    return <LoginScreen onLogin={handleLogin} onSignup={() => setScreen("cadastro")} />;
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        screen === "splash" ? styles.splashBackground : styles.screenBackground,
      ]}
    >
      <StatusBar style={screen === "splash" ? "light" : "dark"} />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  splashBackground: { backgroundColor: colors.primary },
  screenBackground: { backgroundColor: colors.background },
});
