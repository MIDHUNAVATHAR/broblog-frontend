import axiosInstance from "./axios";
import { API_PATHS } from "../constants/apiPaths";

export const getBlogs = async (search?: string) => {
    const response = await axiosInstance.get(API_PATHS.BLOGS.BASE, { params: { search } });
    return response.data;
};

export const getMyBlogs = async () => {
    const response = await axiosInstance.get(API_PATHS.BLOGS.MY_BLOGS);
    return response.data;
};

export const createBlog = async (data: { title: string; content: string; image?: string; imagePublicId?: string; readingTime?: string }) => {
    const response = await axiosInstance.post(API_PATHS.BLOGS.BASE, data);
    return response.data;
};

export const updateBlog = async (id: string, data: { title: string; content: string; readingTime?: string }) => {
    const response = await axiosInstance.put(API_PATHS.BLOGS.BY_ID(id), data);
    return response.data;
};

export const deleteBlog = async (id: string) => {
    const response = await axiosInstance.delete(API_PATHS.BLOGS.BY_ID(id));
    return response.data;
};

export const toggleLike = async (id: string) => {
    const response = await axiosInstance.post(API_PATHS.BLOGS.LIKE(id));
    return response.data;
};

export const getBlogById = async (id: string) => {
    const response = await axiosInstance.get(API_PATHS.BLOGS.BY_ID(id));
    return response.data;
};

export const uploadImage = async (file: Blob) => {
    const formData = new FormData();
    formData.append('image', file, 'blog-image.jpg');
    const response = await axiosInstance.post(API_PATHS.UPLOAD, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
