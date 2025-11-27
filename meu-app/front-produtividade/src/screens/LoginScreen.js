import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    
    
    if (!email.trim() || !senha.trim()) {
      return Alert.alert("Campos obrigatórios", "Preencha seu email e sua senha.");
    }

    try {
      const response = await api.post("/usuarios/login", {
        email,
        senha,
      });

      const { token, usuario } = response.data;

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userName", usuario.nome);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error.response?.data || error.message);

      
      const mensagem =
        error.response?.data?.erro ||  
        error.response?.data?.message ||
        "Erro ao conectar com o servidor";

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

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Recover")}>
        <Text style={styles.link}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#ffffff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { marginTop: 16, textAlign: "center", color: "#007BFF", fontSize: 16 },
});