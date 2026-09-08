import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

//peguei essa splash de um projeto do react mesmo

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SESI</Text>
      <Text style={styles.subtitle}>Sistema de Controle de Desperdício Alimentar</Text>
      <ActivityIndicator size="large" color={colors.background} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.background,
    ...typography.h1,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.primaryLight,
    ...typography.body,
    textAlign: "center",
    marginBottom: 20,
  },
  loader: {
    marginTop: 12,
  },
});
