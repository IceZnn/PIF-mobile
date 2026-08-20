import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";

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
            <Text>Nenhuma tarefa </Text>
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
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  backText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  placeholder: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#fff", fontSize: 24, fontWeight: "700" },
});
