"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, Link2, MessageSquare, Settings,
    CreditCard, LogOut, MessageCircle, Menu, X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/agents", icon: MessageSquare, label: "Agente" },
    { href: "/dashboard/integrations", icon: Link2, label: "Integrações" },
    { href: "/dashboard/comments", icon: MessageCircle, label: "Comentários" },
    { href: "/dashboard/billing", icon: CreditCard, label: "Plano & Billing" },
    { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, fetchMe, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchMe().then(() => {
            if (!useAuth.getState().user) router.push("/login");
        });
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-950">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative top-0 left-0 h-full w-64 flex flex-col z-30 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        border-r`}
                style={{ background: "rgba(17,24,39,0.95)", borderColor: "rgba(255,255,255,0.06)" }}>

                {/* Logo */}
                <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <MessageCircle size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg">ReplyAI</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                                        ? "text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                style={active ? {
                                    background: "rgba(99,102,241,0.15)",
                                    color: "#a5b4fc",
                                    border: "1px solid rgba(99,102,241,0.3)"
                                } : {}}
                            >
                                <Icon size={18} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    {user && (
                        <div className="flex items-center gap-3 mb-3 px-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar (mobile) */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <MessageCircle size={14} className="text-white" />
                        </div>
                        <span className="font-bold">ReplyAI</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400">
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Content */}
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 overflow-auto p-6"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}
