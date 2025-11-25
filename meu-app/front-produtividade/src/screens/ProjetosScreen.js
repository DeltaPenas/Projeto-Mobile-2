import React, { useEffect, useState } from 'react';
import { 
    View, Text, FlatList, StyleSheet, ActivityIndicator, 
    Alert, TouchableOpacity, Modal, TextInput, Pressable,
    ScrollView 
} from 'react-native';
import api from '../api/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; 

export default function ProjetosScreen() {
    
    const [tarefasPendentes, setTarefasPendentes] = useState([]);
    const [projetosEmAndamento, setProjetosEmAndamento] = useState([]);
    const [projetosConcluidos, setProjetosConcluidos] = useState([]);
    
    const [loading, setLoading] = useState(true); 

    const [userName, setUserName] = useState("Usuário"); 
    const [showModal, setShowModal] = useState(false); 
    const [newProjectName, setNewProjectName] = useState(''); 
    const [newProjectDescription, setNewProjectDescription] = useState(''); 
    
    const navigation = useNavigation();

    useEffect(() => {
        carregarDadosIniciais(); 
    }, []);

    

    async function carregarDadosIniciais() {
        setLoading(true);
        try {
            const storedName = await AsyncStorage.getItem("userName");
            if (storedName) {
                setUserName(storedName);
            }
        } catch (e) {
            console.error("Erro ao carregar nome do usuário:", e);
        }
        
       
        await Promise.all([
            carregarProjetos(),
            carregarTarefasPendentes()
        ]);

        setLoading(false);
    }
    
    async function carregarTarefasPendentes() {
        try {
           
            const response = await api.get('tarefas?concluido=false');
            setTarefasPendentes(response.data);
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error.response?.data || error.message);
           
        }
    }

    async function carregarProjetos() {
        try {
            
            const response = await api.get('projetos/usuario'); 
            const todosProjetos = response.data;
            
            
            const emAndamento = todosProjetos.filter(p => !p.concluido);
            const concluidos = todosProjetos.filter(p => p.concluido);

            setProjetosEmAndamento(emAndamento);
            setProjetosConcluidos(concluidos);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                Alert.alert("Sessão Expirada", "Sua sessão expirou. Faça login novamente.");
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userName'); 
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } else {
                console.error("Erro ao carregar projetos:", error.response?.data || error.message);
                Alert.alert("Erro", "Não foi possível carregar os projetos.");
            }
        }
    }

    
    
    async function handleLogout() {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userName');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }

   

    async function handleCreateProject() {
        if (!newProjectName.trim() || !newProjectDescription.trim()) {
            Alert.alert("Erro", "O nome e a descrição do projeto não podem estar vazios.");
            return;
        }

        try {
            await api.post('projetos', { 
                nome: newProjectName,
                descricao: newProjectDescription 
            });
            
            Alert.alert("Sucesso", `Projeto '${newProjectName}' criado!`);
            
            setNewProjectName('');
            setNewProjectDescription('');
            setShowModal(false);
            carregarProjetos();
            carregarTarefasPendentes();
        } catch (error) {
            console.error("Erro ao criar projeto:", error);
            Alert.alert("Erro", `Não foi possível criar o projeto. Detalhe: ${error.message}`); 
        }
    }

    function handleAccessProject(projectId, projectName) {
       
        //Alert.alert("Acessar Projeto", `Navegando para detalhes do projeto ${projectName} (ID: ${projectId}).`);
        navigation.navigate('Tarefas', { projetoId: projectId, projetoName: projectName });
    }

    async function handleCompleteProject(projectId, projectName) {
        Alert.alert(
            "Concluir Projeto",
            `Tem certeza que deseja marcar o projeto '${projectName}' como concluído?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sim", 
                    onPress: async () => {
                        try {
                            
                            await api.put(`projetos/concluir/${projectId}`); 
                            
                            Alert.alert("Sucesso", `Projeto '${projectName}' concluído!`);
                            
                            
                            await carregarProjetos();

                        } catch (error) {
                            console.error("Erro ao concluir projeto:", error.response?.data || error.message);
                            Alert.alert("Erro", "Não foi possível concluir o projeto. Verifique a rota no backend.");
                        }
                    } 
                }
            ]
        );
    }

    async function handleDeleteProject(projectId, projectName) {
        Alert.alert(
            "Confirmação",
            `Tem certeza que deseja deletar o projeto '${projectName}'?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Deletar", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await api.delete(`projetos/${projectId}`);
                            Alert.alert("Sucesso", `Projeto '${projectName}' deletado!`);
                            carregarProjetos();
                        } catch (error) {
                            console.error("Erro ao deletar projeto:", error);
                            Alert.alert("Erro", "Não foi possível deletar o projeto.");
                        }
                    } 
                }
            ]
        );
    }

    async function handleCompleteTask(taskId, taskName) {
        Alert.alert(
            "Concluir Tarefa",
            `Deseja realmente marcar a tarefa '${taskName}' como concluída?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sim", 
                    onPress: async () => {
                        try {
                            await api.put(`tarefas/concluir/${taskId}`);
                            Alert.alert("Sucesso", `Tarefa '${taskName}' concluída!`);
                            
                            
                            await carregarProjetos();
                            await carregarTarefasPendentes();

                        } catch (error) {
                            console.error("Erro ao concluir tarefa:", error.response?.data || error.message);
                            Alert.alert("Erro", "Não foi possível concluir a tarefa.");
                        }
                    } 
                }
            ]
        );
    }
    
    const renderTarefaItem = ({ item }) => (
        <View style={[styles.projectItem, styles.tarefaItem]}>
            <View style={{ flex: 1 }}>
                <Text style={styles.projectName}>{item.nome}</Text>
                <Text style={styles.projectDescription}>Projeto ID: {item.projeto}</Text>
            </View>
            
            
            <TouchableOpacity 
                style={[styles.actionButton, styles.completeTaskButton]}
                onPress={() => handleCompleteTask(item._id, item.nome)} 
            >
                <Text style={styles.actionText}>Concluir</Text>
            </TouchableOpacity>
        </View>
    );

    
    const renderProjectItem = ({ item, isCompleted = false }) => (
        <View style={[
            styles.projectItem, 
            isCompleted && styles.completedProjectItem
        ]}>
            <Text style={styles.projectName}>{item.nome}</Text>
            <Text style={styles.projectDescription}>{item.descricao}</Text> 
            <Text style={styles.projectStatus}>Status: {item.concluido ? 'Concluído' : 'Em Andamento'}</Text>
            
            <View style={styles.actionsContainer}>
               
                <TouchableOpacity 
                    style={[styles.actionButton, styles.accessButton]}
                    onPress={() => handleAccessProject(item._id, item.nome)}
                >
                    <Text style={styles.actionText}>Acessar</Text>
                </TouchableOpacity>

               
                {!item.concluido && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.completeProjectButton]}
                        onPress={() => handleCompleteProject(item._id, item.nome)}
                    >
                        <Text style={styles.actionText}>Concluir</Text>
                    </TouchableOpacity>
                )}

                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteProject(item._id, item.nome)}
                >
                    <Text style={styles.actionText}>Deletar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );



    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text>Carregando Dados...</Text>
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
            
            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.createButton}>
                 <Text style={styles.createButtonText}>+ Criar Novo Projeto</Text>
            </TouchableOpacity>
            
           
            <ScrollView style={{ flex: 1 }}>

               
                <Text style={[styles.subtitle, styles.taskSubtitle]}>Tarefas Pendentes ({tarefasPendentes.length})</Text>
                {tarefasPendentes.length === 0 ? (
                    <Text style={styles.emptyText}>Sem tarefas pendentes!</Text>
                ) : (
                    <FlatList
                        data={tarefasPendentes}
                        keyExtractor={(item) => String(item._id)}
                        renderItem={renderTarefaItem}
                        scrollEnabled={false} 
                    />
                )}

                
                <Text style={[styles.subtitle, styles.projectSubtitle]}> Projetos em Andamento ({projetosEmAndamento.length})</Text>
                {projetosEmAndamento.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum projeto ativo. Comece um!</Text>
                ) : (
                    <FlatList
                        data={projetosEmAndamento}
                        keyExtractor={(item) => String(item._id)}
                        renderItem={({ item }) => renderProjectItem({ item, isCompleted: false })}
                        scrollEnabled={false}
                    />
                )}
                
                
                <Text style={[styles.subtitle, styles.completedSubtitle]}> Projetos Concluídos ({projetosConcluidos.length})</Text>
                {projetosConcluidos.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum projeto concluído ainda.</Text>
                ) : (
                    <FlatList
                        data={projetosConcluidos}
                        keyExtractor={(item) => String(item._id)}
                        renderItem={({ item }) => renderProjectItem({ item, isCompleted: true })}
                        scrollEnabled={false}
                    />
                )}
                <View style={{ height: 50 }} />
            </ScrollView>

            
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Criar Novo Projeto</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nome do Projeto (Obrigatório)"
                            value={newProjectName}
                            onChangeText={setNewProjectName}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Descrição do Projeto (Obrigatório)"
                            value={newProjectDescription}
                            onChangeText={setNewProjectDescription}
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
                                onPress={handleCreateProject}
                            >
                                <Text style={styles.textStyle}>Criar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#f4f4f4' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    
    
    subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, paddingLeft: 5 },
    taskSubtitle: { color: '#007BFF' },
    projectSubtitle: { color: '#ffc107' },
    completedSubtitle: { color: '#28a745' },

    logoutButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
    logoutText: { color: '#fff', fontWeight: 'bold' },
    
    createButton: {
        backgroundColor: '#007BFF', // Mudado para azul
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    
    projectItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007BFF'
    },
    
    tarefaItem: {
        borderLeftColor: '#ffc107', 
        backgroundColor: '#fffbf4',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    completedProjectItem: {
        borderLeftColor: '#28a745', 
        opacity: 0.7,
    },

    projectName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
    projectDescription: { fontSize: 14, color: '#888', marginBottom: 8 }, 
    projectStatus: { fontSize: 14, color: '#666', marginBottom: 10 },
    
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 5,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    accessButton: {
        backgroundColor: '#007BFF',
        marginLeft: 0, 
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    
    completeTaskButton: {
        backgroundColor: '#28a745',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginLeft: 10,
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: { textAlign: 'center', marginTop: 10, marginBottom: 20, fontSize: 14, color: '#666' },

    
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 20, backgroundColor: "white", borderRadius: 15, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { marginBottom: 15, textAlign: "center", fontSize: 20, fontWeight: 'bold' },
    modalInput: { width: 280, marginBottom: 15, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    modalButton: { borderRadius: 5, padding: 10, elevation: 2, minWidth: 120, alignItems: 'center' },
    buttonOpen: { backgroundColor: "#28a745" },
    buttonClose: { backgroundColor: "#6c757d" },
    textStyle: { color: "white", fontWeight: "bold", textAlign: "center" },
    completeProjectButton: {
        backgroundColor: '#28a745', 
        marginLeft: 10,
    }
});