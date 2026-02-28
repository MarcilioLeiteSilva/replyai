import axios from "axios";

const raw_api_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
let API_URL = raw_api_url.trim().replace(/\/$/, "");

// Auto-upgrade para HTTPS se o frontend estiver em HTTPS e a API em HTTP
if (typeof window !== "undefined" && window.location.protocol === "https:" && API_URL.startsWith("http://")) {
    API_URL = API_URL.replace("http://", "https://");
}



export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    });
                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);
                    original.headers.Authorization = `Bearer ${data.access_token}`;
                    return api(original);
                } catch {
                    localStorage.clear();
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth helpers
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data),
    me: () => api.get("/auth/me"),
};

// Users
export const usersApi = {
    me: () => api.get("/users/me"),
    update: (data: Record<string, string>) => api.patch("/users/me", data),
    plans: () => api.get("/users/plans"),
};

// Integrations
export const integrationsApi = {
    list: () => api.get("/integrations/"),
    delete: (id: string) => api.delete(`/integrations/${id}`),
    youtubeConnect: () => api.get("/integrations/youtube/connect"),
    getConfig: (id: string) => api.get(`/integrations/${id}/config`),
    updateConfig: (id: string, data: Record<string, unknown>) =>
        api.patch(`/integrations/${id}/config`, data),
};

// Comments
export const commentsApi = {
    list: (params?: Record<string, string | number>) =>
        api.get("/comments/", { params }),
    stats: () => api.get("/comments/stats"),
    approve: (id: string) => api.patch(`/comments/${id}/approve`),
    reject: (id: string) => api.patch(`/comments/${id}/reject`),
};

// Agents
export const agentsApi = {
    run: (integrationId: string) => api.post(`/agents/run/${integrationId}`),
    status: (taskId: string) => api.get(`/agents/status/${taskId}`),
    stop: (taskId: string) => api.post(`/agents/stop/${taskId}`),
};

// Billing
export const billingApi = {
    plans: () => api.get("/billing/plans"),
    subscription: () => api.get("/billing/subscription"),
    checkout: (data: { plan_slug: string; gateway: string; payment_method?: string }) =>
        api.post("/billing/checkout", data),
    cancel: () => api.post("/billing/cancel"),
};
