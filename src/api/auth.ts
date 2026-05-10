import api from "./axios";

export const signup = async (data:any)=> {
    const response = await api.post("/auth/signup",data);
    return response.data; 
}

export const login = async (data:any) =>{
    const response = await api.post("/auth/login",data);
    return response.data; 
}

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
}

export const forgotPassword = async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
};