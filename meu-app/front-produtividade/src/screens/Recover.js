import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/api";

export default function RecoverScreen({ navigation }) {
  const [email, setEmail] = useState("");

  async function enviarRecuperacao() {
    if (!email) {
      Alert.alert("Erro", "Digite o seu e-mail.");
      return;
    }

    try {
      const response = await api.post("/usuarios/recuperar", { email });

      Alert.alert(
        "Sucesso",
        response.data.message || "Um link foi enviado para seu e-mail!"
      );

      navigation.goBack(); // volta para Login

    } catch (error) {
      console.error(error);
      const mensagem =
        error.response?.data?.message || "Erro ao enviar recuperação.";
      Alert.alert("Erro", mensagem);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>

      <Text style={styles.sub}>
        Digite seu e-mail para receber um link de redefinição.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={enviarRecuperacao}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  sub: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
  },
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
