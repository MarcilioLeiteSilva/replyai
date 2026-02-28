"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ShieldCheck, Users, BarChart3, Settings,
    ArrowLeft, LogOut, MessageCircle, AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, fetchMe, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMe().then(() => {
            const currentUser = useAuth.getState().user;
            if (!currentUser) {
                router.push("/login");
            } else if (!currentUser.is_admin) {
                router.push("/dashboard");
            }
            setLoading(false);
        });
    }, []);

    if (loading) return null;

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Sidebar Admin */}
            <aside className="w-72 border-r border-white/5 bg-gray-950/50 backdrop-blur-3xl flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tighter uppercase italic">HQ ReplyAI</span>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {[
                            { href: "/admin", icon: BarChart3, label: "Visão Geral" },
                            { href: "/admin/users", icon: Users, label: "Usuários" },
                        ].map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                                        ${active
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                            : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1 p-8 space-y-6">
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 text-amber-500 mb-3">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Atenção</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            Você está na central de comando. Todas as ações aqui impactam usuários em produção.
                        </p>
                    </div>
                </div>

                <div className="p-8 border-t border-white/5 space-y-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10"
                    >
                        <ArrowLeft size={18} />
                        Voltar ao App
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10"
                    >
                        <LogOut size={18} />
                        Encerrar Sessão
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_50%)]">
                {children}
            </main>
        </div>
    );
}
