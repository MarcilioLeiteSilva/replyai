"use client";
import { create } from "zustand";
import { authApi } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    is_admin: boolean;
    plan_id?: string;
    trial_ends_at?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        const { data } = await authApi.login({ email, password });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        const me = await authApi.me();
        set({ user: me.data, loading: false });
    },

    register: async (name, email, password) => {
        set({ loading: true });
        const { data } = await authApi.register({ name, email, password });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        const me = await authApi.me();
        set({ user: me.data, loading: false });
    },

    logout: () => {
        localStorage.clear();
        set({ user: null });
        window.location.href = "/login";
    },

    fetchMe: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        if (!token) return;
        try {
            const me = await authApi.me();
            set({ user: me.data });
        } catch {
            localStorage.clear();
            set({ user: null });
        }
    },
}));
