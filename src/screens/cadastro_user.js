import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function CadastroUserScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Cadastro de Usuário</Text>
			<View style={styles.placeholder}>
				<Text>Campos de cadastro </Text>
			</View>
			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Cadastrar</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 24, backgroundColor: '#f8fafc', justifyContent: 'center' },
	title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
	placeholder: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
	button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
	buttonText: { color: '#fff', fontWeight: '600' },
});

