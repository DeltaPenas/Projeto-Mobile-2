import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/api";

export default function NovaSenhaScreen({ navigation, route }) {
  const { email } = route.params;

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function alterarSenha() {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      await api.post("/usuarios/resetar-senha", { email, novaSenha });

      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      navigation.replace("Home");

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao redefinir senha.";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Definir Nova Senha</Text>

      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar nova senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity style={styles.button} onPress={alterarSenha}>
        <Text style={styles.buttonText}>Salvar nova senha</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#555" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
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
});
