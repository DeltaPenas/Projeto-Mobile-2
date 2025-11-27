
import React, { useEffect, useState, useCallback } from 'react';
import { 
    View, Text, FlatList, StyleSheet, ActivityIndicator, 
    Alert, TouchableOpacity, Modal, TextInput, Pressable, ScrollView
} from 'react-native';
import api from '../api/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';



export default function ProjetosScreen() {

   
    const [tarefasPendentes, setTarefasPendentes] = useState([]);
    const [projetosEmAndamento, setProjetosEmAndamento] = useState([]);
    const [projetosConcluidos, setProjetosConcluidos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Usuário");

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const navigation = useNavigation();



    // Carregamento inicial

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    // Atualiza sempre que voltar para a tela
    useFocusEffect(
        useCallback(() => {
            carregarTarefasPendentes();
            return () => {};
        }, [])
    );


    async function carregarDadosIniciais() {
        setLoading(true);

        try {
            const storedName = await AsyncStorage.getItem("userName");
            if (storedName) setUserName(storedName);
        } catch (e) {}

        await Promise.all([carregarProjetos(), carregarTarefasPendentes()]);

        setLoading(false);
    }


    
    async function carregarTarefasPendentes() {
        try {
            const response = await api.get('tarefas?concluido=false');
            setTarefasPendentes(response.data);
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
        }
    }

    async function carregarProjetos() {
        try {
            const response = await api.get('projetos/usuario');
            const all = response.data;

            setProjetosEmAndamento(all.filter(p => !p.concluido));
            setProjetosConcluidos(all.filter(p => p.concluido));

        } catch (error) {
            // Se o token expirou → volta para o login
            if (error.response?.status === 401) {
                await AsyncStorage.multiRemove(['userToken', 'userName']);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
        }
    }


    
    function acessarProjeto(id, nome) {
        navigation.navigate('Tarefas', { projetoId: id, projetoName: nome });
    }

    async function concluirProjeto(id, nome) {
        Alert.alert(
            "Concluir Projeto",
            `Marcar '${nome}' como concluído?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sim", 
                    onPress: async () => {
                        await api.put(`projetos/concluir/${id}`);
                        await carregarProjetos();
                    }
                },
            ]
        );
    }

    async function deletarProjeto(id, nome) {
        Alert.alert(
            "Confirmar",
            `Apagar o projeto '${nome}'?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Deletar",
                    style: "destructive",
                    onPress: async () => {
                        await api.delete(`projetos/${id}`);
                        carregarProjetos();
                    }
                }
            ]
        );
    }

    async function concluirTarefa(id, nome) {
        Alert.alert(
            "Concluir Tarefa",
            `Concluir '${nome}'?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sim",
                    onPress: async () => {
                        await api.put(`tarefas/concluir/${id}`);
                        await carregarTarefasPendentes();
                        await carregarProjetos();
                    }
                }
            ]
        );
    }

    async function deletarTarefa(id, nome) {
        Alert.alert(
            "Excluir Tarefa",
            `Deseja remover '${nome}'?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        await api.delete(`tarefas/${id}`);
                        await carregarTarefasPendentes();
                    }
                }
            ]
        );
    }


    async function criarProjeto() {

        if (!newProjectName.trim() || !newProjectDescription.trim()) {
            return Alert.alert("Erro", "Nome e descrição obrigatórios.");
        }

        await api.post('projetos', {
            nome: newProjectName,
            descricao: newProjectDescription
        });

        setNewProjectName('');
        setNewProjectDescription('');
        setShowModal(false);

        carregarProjetos();
    }

    async function logout() {
        await AsyncStorage.multiRemove(['userToken', 'userName']);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }


    const renderTarefaItem = ({ item }) => (
        <View style={[styles.projectItem, styles.tarefaItem]}>
            <View style={{ flex: 1 }}>
                <Text style={styles.projectName}>{item.nome}</Text>
                <Text style={styles.projectDescription}>Projeto: {item.projeto}</Text>
            </View>

            <TouchableOpacity 
                style={[styles.actionButton, styles.completeTaskButton]}
                onPress={() => concluirTarefa(item._id, item.nome)}
            >
                <Text style={styles.actionText}>Concluir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deletarTarefa(item._id, item.nome)}
            >
                <Text style={styles.actionText}>Excluir</Text>
            </TouchableOpacity>
        </View>
    );


    const renderProjectItem = ({ item, isCompleted }) => (
        <View style={[
            styles.projectItem,
            isCompleted && styles.completedProjectItem
        ]}>
            <Text style={styles.projectName}>{item.nome}</Text>
            <Text style={styles.projectDescription}>{item.descricao}</Text>
            <Text style={styles.projectStatus}>
                Status: {item.concluido ? 'Concluído' : 'Em Andamento'}
            </Text>

            <View style={styles.actionsContainer}>

                <TouchableOpacity 
                    style={[styles.actionButton, styles.accessButton]}
                    onPress={() => acessarProjeto(item._id, item.nome)}
                >
                    <Text style={styles.actionText}>Acessar</Text>
                </TouchableOpacity>

                {!item.concluido && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.completeProjectButton]}
                        onPress={() => concluirProjeto(item._id, item.nome)}
                    >
                        <Text style={styles.actionText}>Concluir</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deletarProjeto(item._id, item.nome)}
                >
                    <Text style={styles.actionText}>Deletar</Text>
                </TouchableOpacity>

            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Olá, {userName}!</Text>

            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.createButton}>
                <Text style={styles.createButtonText}>+ Criar Novo Projeto</Text>
            </TouchableOpacity>

            <ScrollView style={{ flex: 1 }}>

        
                <Text style={[styles.subtitle, styles.taskSubtitle]}>
                    Tarefas Pendentes ({tarefasPendentes.length})
                </Text>

                {tarefasPendentes.length === 0 ? (
                    <Text style={styles.emptyText}>Sem tarefas pendentes!</Text>
                ) : (
                    <FlatList
                        data={tarefasPendentes}
                        keyExtractor={item => item._id}
                        renderItem={renderTarefaItem}
                        scrollEnabled={false}
                    />
                )}

               
                <Text style={[styles.subtitle, styles.projectSubtitle]}>
                    Projetos em Andamento ({projetosEmAndamento.length})
                </Text>

                <FlatList
                    data={projetosEmAndamento}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) =>
                        renderProjectItem({ item, isCompleted: false })
                    }
                    scrollEnabled={false}
                />

            
                <Text style={[styles.subtitle, styles.completedSubtitle]}>
                    Projetos Concluídos ({projetosConcluidos.length})
                </Text>

                <FlatList
                    data={projetosConcluidos}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) =>
                        renderProjectItem({ item, isCompleted: true })
                    }
                    scrollEnabled={false}
                />

                <View style={{ height: 50 }} />
            </ScrollView>


            <Modal animationType="slide" visible={showModal} transparent>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>

                        <Text style={styles.modalTitle}>Criar Novo Projeto</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nome do Projeto"
                            value={newProjectName}
                            onChangeText={setNewProjectName}
                        />

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Descrição"
                            value={newProjectDescription}
                            onChangeText={setNewProjectDescription}
                            multiline
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
                                onPress={criarProjeto}
                            >
                                <Text style={styles.textStyle}>Criar</Text>
                            </Pressable>
                        </View>

                    </View>
                </View>
            </Modal>


           
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

        </View>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f4f4f4' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    title: { fontSize: 24, fontWeight: 'bold', marginVertical: 15 },

    subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
    taskSubtitle: { color: '#007BFF' },
    projectSubtitle: { color: '#ffc107' },
    completedSubtitle: { color: '#28a745' },

    emptyText: { textAlign: 'center', marginVertical: 10, color: '#666' },

    createButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 8, marginBottom: 10 },
    createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

    backButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#dc3545',
        paddingVertical: 15,
        alignItems: 'center'
    },
    backButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    projectItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007BFF'
    },
    tarefaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbf4',
        borderLeftColor: '#ffc107'
    },
    completedProjectItem: { borderLeftColor: '#28a745', opacity: 0.7 },

    projectName: { fontSize: 16, fontWeight: '600' },
    projectDescription: { fontSize: 14, color: '#555', marginVertical: 5 },
    projectStatus: { fontSize: 13, color: '#666' },

    actionsContainer: { flexDirection: 'row', marginTop: 10 },

    actionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginLeft: 10 },
    accessButton: { backgroundColor: '#007BFF' },
    completeProjectButton: { backgroundColor: '#28a745' },
    completeTaskButton: { backgroundColor: '#28a745' },
    deleteButton: { backgroundColor: '#dc3545' },

    actionText: { color: '#fff', fontWeight: 'bold' },

    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { backgroundColor: '#fff', padding: 25, borderRadius: 10, width: '85%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    modalButton: { padding: 10, borderRadius: 5, width: '45%', alignItems: 'center' },
    buttonOpen: { backgroundColor: '#28a745' },
    buttonClose: { backgroundColor: '#6c757d' },
    textStyle: { color: '#fff', fontWeight: 'bold' },
});
