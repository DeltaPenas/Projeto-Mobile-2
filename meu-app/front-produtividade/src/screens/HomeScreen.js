import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  
  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userName');
      
     
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }); 
    } catch (error) {
      Alert.alert("Erro ao Sair", "Não foi possível limpar a sessão.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>Seu Painel Principal</Text>
      
  
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Projetos')}
      >
        <Text style={styles.buttonText}>Ir para Meus Projetos</Text>
      </TouchableOpacity>
        
      
      <TouchableOpacity onPress={() => navigation.navigate("Option")}>
        <Text style={styles.link}>Configurações e Opções</Text>
      </TouchableOpacity>

     
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#ffffffff" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: '#333' },
  subtitle: { fontSize: 18, marginBottom: 40, textAlign: "center", color: '#666' },
  button: {
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  link: { 
    marginTop: 25, 
    textAlign: "center", 
    color: "#007BFF", 
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 50,
  }
});