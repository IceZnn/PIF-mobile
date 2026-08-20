import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function EditaTarefaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Tarefa</Text>
      <View style={styles.placeholder}>
        <Text style={typography.body}>Formulário de edição </Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: { ...typography.h2, marginBottom: 12 },
  placeholder: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { ...typography.button, color: colors.onPrimary },
});
