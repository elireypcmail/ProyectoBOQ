import { instanceApp } from './axios'

export const loginRequest = (user) => instanceApp.post(`/auth/login`, user)

export const verifyTokenRequest = () => instanceApp.get(`/auth/verify`)

// -------------------- Usuarios --------------------
export const getAllUsers = () => instanceApp.get("/auth/usuarios");
export const getUserById = (id) => instanceApp.get(`/auth/usuarios/${id}`);
export const createUser = (data) => instanceApp.post("/auth/register", data);
export const updateUser = (id, data) => instanceApp.put(`/auth/usuarios/${id}`, data);
export const deleteUser = (id) => instanceApp.delete(`/auth/usuarios/${id}`);

// -------------------- Roles --------------------
export const getAllRoles = () => instanceApp.get("/auth/roles");
export const getRoleById = (id) => instanceApp.get(`/auth/roles/${id}`);
export const createRole = (data) => instanceApp.post("/auth/roles", data);
export const updateRole = (id, data) => instanceApp.put(`/auth/roles/${id}`, data);
export const deleteRole = (id) => instanceApp.delete(`/auth/roles/${id}`);

