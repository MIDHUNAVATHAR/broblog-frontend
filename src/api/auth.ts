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

export const verifyOtp = async (data:{email:string;otp:string}) =>{
    const response = await api.post("/auth/verify-otp",data); 
    return response.data; 
}

export const resendOtp = async (email:string) =>{
    const response = await api.post("/auth/resend-otp",{email}); 
    return response.data; 
}

export const forgotPassword = async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
};

export const verifyResetOtp = async (data: { email: string; otp: string }) => {
    const response = await api.post("/auth/verify-reset-otp", data);
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
};