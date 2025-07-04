import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // ✅ dynamic for dev & prod
  withCredentials: true, // ✅ if your backend uses cookies (optional)
});

export default API;