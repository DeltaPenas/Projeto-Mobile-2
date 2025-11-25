import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import api from '../api/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native'; 

export default function ProjetosScreen() {
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Usuário"); 
    
    
    const navigation = useNavigation();

    useEffect(() => {
        carregarDadosIniciais(); 
    }, []);

    async function carregarDadosIniciais() {
        try {
            const storedName = await AsyncStorage.getItem("userName");
            if (storedName) {
                setUserName(storedName);
            }
        } catch (e) {
            console.error("Erro ao carregar nome do usuário:", e);
        }

        carregarProjetos();
    }

    async function carregarProjetos() {
        try {
            const response = await api.get('/projeto/usuario'); 
            
            setProjetos(response.data);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                Alert.alert("Sessão Expirada", "Sua sessão expirou. Faça login novamente.");
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userName'); 
                
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
                
            } else {
                 Alert.alert("Erro", "Não foi possível carregar os projetos.");
            }
        } finally {
            setLoading(false);
        }
    }
    
    
    async function handleLogout() {
        // Limpa os dados de sessão
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userName');
        
        // 🎯 CORREÇÃO: Usamos navigation.reset para ir para 'Login'
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    }


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text>Carregando Projetos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <Text style={styles.title}>Olá, {userName}!</Text> 
                
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>Seus Projetos Ativos</Text>
            
            
            {projetos.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum projeto encontrado, Mãos na massa!</Text>
            ) : (
                <FlatList
                    data={projetos}
                    keyExtractor={(item) => String(item._id || item.id)}
                    renderItem={({ item }) => (
                        <View style={styles.projectItem}>
                            <Text style={styles.projectName}>{item.nome}</Text>
                            <Text style={styles.projectStatus}>Status: {item.concluido ? 'Concluído' : 'Em Andamento'}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#f4f4f4' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: {
        fontSize: 18, 
        fontWeight: '600', 
        marginBottom: 15,
        color: '#555'
    },
    logoutButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
    logoutText: { color: '#fff', fontWeight: 'bold' },
    projectItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007BFF'
    },
    projectName: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
    projectStatus: { fontSize: 14, color: '#666' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }
});