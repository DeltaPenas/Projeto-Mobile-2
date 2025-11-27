import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import api from "../api/api";
import { useNavigation } from "@react-navigation/native";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Usuário");

  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos"); 
  const [projetos, setProjetos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalProjetos: 0,
    concluidos: 0,
    andamento: 0,
  });

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function logout() {
        await AsyncStorage.multiRemove(['userToken', 'userName']);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }

  async function carregarDashboard() {
    try {
      setLoading(true);

      const projetosRes = await api.get("/projetos");
      const lista = projetosRes.data;

      const concluidos = lista.filter(p => p.concluido).length;
      const andamento = lista.length - concluidos;

      setProjetos(lista);
      setEstatisticas({
        totalProjetos: lista.length,
        concluidos,
        andamento,
      });

    } catch (err) {
      console.log("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  function filtrarProjetos() {
    if (filtro === "concluidos") return projetos.filter(p => p.concluido);
    if (filtro === "andamento") return projetos.filter(p => !p.concluido);
    return projetos;
  }

  const projetosFiltrados = filtrarProjetos().sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const porcentagem =
    estatisticas.totalProjetos === 0
      ? 0
      : (estatisticas.concluidos / estatisticas.totalProjetos) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      
      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{estatisticas.totalProjetos}</Text>
          <Text style={styles.cardLabel}>Projetos</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardValue, { color: "#28a745" }]}>
            {estatisticas.concluidos}
          </Text>
          <Text style={styles.cardLabel}>Concluídos</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardValue, { color: "#ffc107" }]}>
            {estatisticas.andamento}
          </Text>
          <Text style={styles.cardLabel}>Em Andamento</Text>
        </View>
      </View>

      
      <Text style={styles.subtitle}>Progresso Geral</Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${porcentagem}%` }]} />
      </View>

      <Text style={styles.progressText}>
        {Math.round(porcentagem)}% concluído
      </Text>

      
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setFiltro("todos")}
          style={[
            styles.filterButton,
            filtro === "todos" && styles.filterButtonActive,
          ]}
        >
          <Text style={styles.filterText}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFiltro("concluidos")}
          style={[
            styles.filterButton,
            filtro === "concluidos" && styles.filterButtonActive,
          ]}
        >
          <Text style={styles.filterText}>Concluídos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFiltro("andamento")}
          style={[
            styles.filterButton,
            filtro === "andamento" && styles.filterButtonActive,
          ]}
        >
          <Text style={styles.filterText}>Em andamento</Text>
        </TouchableOpacity>
      </View>

      
      <Text style={styles.subtitle}>Projetos</Text>

      {projetosFiltrados.length === 0 ? (
        <Text style={styles.empty}>Nenhum projeto encontrado.</Text>
      ) : (
        projetosFiltrados.map((proj) => (
          <TouchableOpacity
            key={proj._id}
            style={styles.listItem}
            onPress={() =>
              navigation.navigate("Tarefas", { projetoId: proj._id })
            }
          >
            <Text style={styles.listItemTitle}>{proj.nome}</Text>
            <Text style={styles.listItemSmall}>
              Atualizado em {new Date(proj.updatedAt).toLocaleDateString()}
            </Text>
            <Text
              style={[
                styles.badge,
                proj.concluido ? styles.badgeConcluido : styles.badgeAndamento,
              ]}
            >
              {proj.concluido ? "Concluído" : "Em andamento"}
            </Text>
          </TouchableOpacity>
        ))
      )}

     
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Projetos")}
      >
        <Text style={styles.buttonText}>Ver todos os projetos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={carregarDashboard}
      >
        <Text style={styles.buttonText}>Recarregar dados</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("Option")}
      >
        <Text style={styles.buttonText}>Opções</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.buttonSecondary}>
                <Text style={styles.backButtonText}>Sair</Text>
            </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },

  statsContainer: { flexDirection: "row", justifyContent: "space-between" },

  card: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  cardValue: { fontSize: 26, fontWeight: "bold", color: "#007bff" },
  cardLabel: { fontSize: 15, marginTop: 4 },

  subtitle: { fontSize: 20, marginTop: 25, marginBottom: 10, fontWeight: "600" },

  progressBar: {
    height: 18,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#28a745",
  },
  progressText: { marginTop: 8, fontSize: 15 },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#e6e6e6",
    marginHorizontal: 5,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#007bff",
  },
  filterText: {
    color: "#000",
  },

  listItem: {
    padding: 15,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    marginBottom: 10,
  },
  listItemTitle: { fontSize: 18, fontWeight: "600" },
  listItemSmall: { fontSize: 13, color: "#666" },

  badge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    borderRadius: 6,
    fontSize: 12,
    color: "#fff",
  },
  badgeConcluido: { backgroundColor: "#28a745" },
  badgeAndamento: { backgroundColor: "#ffc107" },

  empty: { color: "#666", marginTop: 10 },

  button: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonSecondary: {
    backgroundColor: "#17a2b8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 30,
  },
  buttonCreate: {
    backgroundColor: "#17a2b8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 30,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
