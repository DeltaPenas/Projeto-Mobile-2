import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/api";


export default function RecoverScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");

  async function enviarRecuperacao() {
    if (!email) {
      Alert.alert("Erro", "Digite o seu e-mail.");
      return;
    }

    try {
      const response = await api.post("/usuarios/recuperar", { email });

      Alert.alert(
        "Sucesso",
        response.data.message || "O código foi enviado para seu e-mail!"
      );

    } catch (error) {
      console.error(error);
      const mensagem =
        error.response?.data?.message || "Erro ao enviar recuperação.";
      Alert.alert("Erro", mensagem);
    }
  }

  async function validarCodigo() {
    if (!codigo) {
      Alert.alert("Erro", "Digite o código recebido.");
      return;
    }

    try {
      const response = await api.post("/usuarios/validar-codigo", {
        email,
        codigo
      });

      Alert.alert("Sucesso", "Código validado!");
      
      
      navigation.navigate("NovaSenha", { email });
      

    } catch (error) {
      
    console.log("ERRO AO VALIDAR >>", error.response?.data);
    console.log("STATUS >>", error.response?.status);
    console.log("BODY ENVIADO >>", { email, codigo });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>

      <Text style={styles.sub}>
        Digite seu e-mail para receber o código de recuperação.
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
        <Text style={styles.buttonText}>Enviar código</Text>
      </TouchableOpacity>

      {/* Campo de código */}
      <TextInput
        style={styles.input}
        placeholder="Código enviado por e-mail"
        value={codigo}
        onChangeText={setCodigo}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={validarCodigo}>
        <Text style={styles.buttonText}>Validar código</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Voltar</Text>
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
