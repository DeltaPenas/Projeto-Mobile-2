import React, { useEffect, useState } from 'react';
import { 
    View, Text, FlatList, StyleSheet, ActivityIndicator, 
    Alert, TouchableOpacity, Modal, TextInput, Pressable 
} from 'react-native';
import api from '../api/api'; 
import { useRoute } from '@react-navigation/native'; 
import { CommonActions, useNavigation } from '@react-navigation/native'; 

export default function TarefasScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    
    const { projetoId, projetoName } = route.params;

    const [tarefas, setTarefas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); 
    const [newTarefaName, setNewTarefaName] = useState(''); 
    const [newTarefaDescription, setNewTarefaDescription] = useState(''); 
    
    useEffect(() => {
        carregarTarefas(); 
    }, [projetoId]); 

    

    async function carregarTarefas() {
        setLoading(true);
        try {
            
            const response = await api.get(`tarefas/projeto?projetoId=${projetoId}`); 
            setTarefas(response.data);

        } catch (error) {
            console.error("Erro ao carregar tarefas:", error.response?.data || error.message);
            Alert.alert("Erro", "Não foi possível carregar as tarefas.");
        } finally {
            setLoading(false);
        }
    }
    
   

    async function handleCreateTarefa() {
        if (!newTarefaName.trim()) {
            Alert.alert("Erro", "O nome da tarefa não pode estar vazio.");
            return;
        }

        try {
            
            await api.post('tarefas', { 
                nome: newTarefaName,
                descricao: newTarefaDescription,
                projetoId: projetoId // Associação da tarefa ao projeto
            });
            
            Alert.alert("Sucesso", `Tarefa '${newTarefaName}' criada!`);
            
            setNewTarefaName('');
            setNewTarefaDescription('');
            setShowModal(false);
            carregarTarefas(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao criar tarefa:", error.response?.data || error.message);
            Alert.alert("Erro", `Não foi possível criar a tarefa.`); 
        }
    }
    
    

    const renderTarefaItem = ({ item }) => (
        <View style={styles.tarefaItem}>
            <View>
                <Text style={styles.tarefaName}>{item.nome}</Text>
                {item.descricao && (
                    <Text style={styles.tarefaDescription}>{item.descricao}</Text>
                )}
            </View>
            <Text style={[
                styles.tarefaStatus, 
                item.concluido ? styles.statusConcluido : styles.statusPendente
            ]}>
                {item.concluido ? ' Concluída' : 'Pendente'}
            </Text>
            
            
        </View>
    );

    

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text>Carregando Tarefas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            
            <Text style={styles.projectTitle}>Tarefas do Projeto:</Text> 
            <Text style={styles.projectNameText}>{projetoName}</Text>
            
            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.createButton}>
                 <Text style={styles.createButtonText}>+ Adicionar Nova Tarefa</Text>
            </TouchableOpacity>

            {tarefas.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma tarefa neste projeto.</Text>
            ) : (
                <FlatList
                    data={tarefas}
                    keyExtractor={(item) => String(item._id || item.id)}
                    renderItem={renderTarefaItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Voltar aos Projetos</Text>
            </TouchableOpacity>

            

            
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nova Tarefa em "{projetoName}"</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nome da Tarefa (Obrigatório)"
                            value={newTarefaName}
                            onChangeText={setNewTarefaName}
                        />

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Descrição da Tarefa (Opcional)"
                            value={newTarefaDescription}
                            onChangeText={setNewTarefaDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.buttonClose]}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.textStyle}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.buttonOpen]}
                                onPress={handleCreateTarefa}
                            >
                                <Text style={styles.textStyle}>Criar Tarefa</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f4f4f4' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    projectTitle: { fontSize: 16, color: '#555', marginTop: 10 },
    projectNameText: { fontSize: 22, fontWeight: 'bold', color: '#007BFF', marginBottom: 20 },
    
    createButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute', 
        bottom: 0,            
        left: 0,
        right: 0,
        backgroundColor: '#dc3545', 
        paddingVertical: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingHorizontal: 20, 
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    
    tarefaItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007BFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tarefaName: { fontSize: 16, fontWeight: '600', color: '#333' },
    tarefaDescription: { fontSize: 14, color: '#888', marginTop: 3 }, 
    tarefaStatus: { fontSize: 12, fontWeight: 'bold', padding: 5, borderRadius: 5 },
    statusPendente: { backgroundColor: '#ffc107', color: '#333' },
    statusConcluido: { backgroundColor: '#28a745', color: '#fff' },

    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },

    
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 20, backgroundColor: "white", borderRadius: 15, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { marginBottom: 15, textAlign: "center", fontSize: 20, fontWeight: 'bold' },
    modalInput: { width: 280, marginBottom: 15, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    modalButton: { borderRadius: 5, padding: 10, elevation: 2, minWidth: 120, alignItems: 'center' },
    buttonOpen: { backgroundColor: "#28a745" },
    buttonClose: { backgroundColor: "#6c757d" },
    textStyle: { color: "white", fontWeight: "bold", textAlign: "center" }
});