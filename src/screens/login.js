import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<View style={styles.placeholder}>
				<Text>Campos de login</Text>
			</View>
			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Entrar</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
		backgroundColor: '#f8fafc',
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 12,
	},
	placeholder: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
	},
	button: {
		backgroundColor: '#2563eb',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
	},
});

