import axios from "axios";


const api = axios.create({
    baseURL: "http://10.0.2.2:3001",
});

api.interceptors.request.use(async (config) => {
    const token = global.usuarioToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;