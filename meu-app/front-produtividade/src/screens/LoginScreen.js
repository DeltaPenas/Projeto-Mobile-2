import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router"; 
import api from '../api/api'; 

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  async function handleLogin() {
    try {
      const response = await api.post("/usuarios/login", { 
        email, 
        senha 
      });

      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);

      const userResponse = await api.get('/usuarios/me');
      const userName = userResponse.data.nome;

      await AsyncStorage.setItem("userName", userName);

      router.replace("/home"); 
      
    } catch (error) {
      console.error(error);
      const mensagem = error.response?.data?.message || "Erro ao conectar com o servidor";
      Alert.alert("Erro no Login", mensagem);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none" 
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>

      {/* Botão de recuperar senha */}
      <TouchableOpacity onPress={() => router.push("/recover")}>
        <Text style={styles.link}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#ffffffff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { marginTop: 16, textAlign: "center", color: "#007BFF", fontSize: 16 }
});
