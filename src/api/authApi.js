import api from "./axios";

export const loginUser = (credentials) => {
  return api.post("/auth/login", credentials);
};