import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

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
      <Text style={styles.title}>Task App</Text>
      <Text style={styles.subtitle}>Organize sua vida de forma simples</Text>
      <ActivityIndicator size="large" color="#f8fafc" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#dbeafe",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  loader: {
    marginTop: 12,
  },
});
