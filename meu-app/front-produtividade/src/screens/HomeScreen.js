import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from "expo-router"; 
import api from '../api/api'; 

export default function HomeScreen() {
 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logado</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/projetos')}>
              <Text style={styles.buttonText}>Projetos</Text>
        </TouchableOpacity>
        {/*botão para tela de opções*/}
        <TouchableOpacity onPress={() => router.push("/options")}>
              <Text style={styles.link}>Opções</Text>
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