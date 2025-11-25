import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    
    baseURL: "http://10.0.2.2:3001/",
});


api.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Erro ao pegar token", error);
    }
    return config;
});

export default api;