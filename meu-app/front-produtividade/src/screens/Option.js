import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function OptionsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opções</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/home")}
      >
        <Text style={styles.buttonText}>Voltar ao Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/projetos")}
      >
        <Text style={styles.buttonText}>Meus Projetos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/recover")}
      >
        <Text style={styles.buttonText}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    marginTop: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
