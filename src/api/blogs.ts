import axiosInstance from "./axios";

export const getBlogs = async (search?: string) => {
    const response = await axiosInstance.get("/blogs", { params: { search } });
    return response.data;
};

export const getMyBlogs = async () => {
    const response = await axiosInstance.get("/blogs/my-blogs");
    return response.data;
};

export const createBlog = async (data: { title: string; content: string; image?: string; imagePublicId?: string; readingTime?: string }) => {
    const response = await axiosInstance.post("/blogs", data);
    return response.data;
};

export const updateBlog = async (id: string, data: { title: string; content: string; readingTime?: string }) => {
    const response = await axiosInstance.put(`/blogs/${id}`, data);
    return response.data;
};

export const deleteBlog = async (id: string) => {
    const response = await axiosInstance.delete(`/blogs/${id}`);
    return response.data;
};

export const toggleLike = async (id: string) => {
    const response = await axiosInstance.post(`/blogs/${id}/like`);
    return response.data;
};

export const getBlogById = async (id: string) => {
    const response = await axiosInstance.get(`/blogs/${id}`);
    return response.data;
};

export const uploadImage = async (file: Blob) => {
    const formData = new FormData();
    formData.append('image', file, 'blog-image.jpg');
    const response = await axiosInstance.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
