import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function OptionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opções</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Voltar ao Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Projetos")}
      >
        <Text style={styles.buttonText}>Meus Projetos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Recover")}
      >
        <Text style={styles.buttonText}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, textAlign: "center", marginBottom: 30, fontWeight: "bold" },
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
