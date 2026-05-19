import api from "./axios";
import { API_PATHS } from "../constants/apiPaths";

export const signup = async (data: any) => {
    const response = await api.post(API_PATHS.AUTH.SIGNUP, data);
    return response.data; 
}

export const login = async (data: any) => {
    const response = await api.post(API_PATHS.AUTH.LOGIN, data);
    return response.data; 
}

export const logout = async () => {
    const response = await api.post(API_PATHS.AUTH.LOGOUT);
    return response.data;
}



