import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function TarefasScreen({ onBack, onCreateTask }) {
  const data = [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, idx) => String(idx)}
        ListEmptyComponent={() => (
          <View style={styles.placeholder}>
            <Text style={typography.body}>Nenhuma tarefa </Text>
          </View>
        )}
        renderItem={() => null}
      />
      <TouchableOpacity style={styles.fab} onPress={onCreateTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    ...typography.h2,
  },
  backText: {
    color: colors.primary,
    ...typography.button,
  },
  placeholder: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { ...typography.h2, color: colors.onPrimary },
});
