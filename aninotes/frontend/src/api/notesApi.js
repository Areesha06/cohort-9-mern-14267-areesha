import axiosClient from './axiosClient';

export const getNotesRequest = (search) => axiosClient.get('/notes', { params: search ? { search } : {} });
export const getNoteRequest = (id) => axiosClient.get(`/notes/${id}`);
export const createNoteRequest = (data) => axiosClient.post('/notes', data);
export const updateNoteRequest = (id, data) => axiosClient.put(`/notes/${id}`, data);
export const deleteNoteRequest = (id) => axiosClient.delete(`/notes/${id}`);
