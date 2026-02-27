"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres"); return; }
        setLoading(true);
        setError("");
        try {
            await register(name, email, password);
            router.push("/dashboard");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setError(msg || "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animated-gradient min-h-screen flex items-center justify-center px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <MessageSquare size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-2xl">ReplyAI</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Criar conta grátis</h1>
                    <p className="text-gray-400">14 dias de trial sem cartão de crédito</p>
                </div>

                {/* Benefits */}
                <div className="flex justify-center gap-6 text-xs text-gray-400 mb-6">
                    {["✅ 14 dias grátis", "✅ Sem cartão", "✅ Cancele quando quiser"].map((b) => (
                        <span key={b}>{b}</span>
                    ))}
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
                            <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-field pr-12"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">{error}</div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {loading ? "Criando conta..." : "Criar conta e começar grátis"}
                        </button>
                    </form>
                    <p className="text-center text-gray-400 text-sm mt-6">
                        Já tem conta?{" "}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Entrar</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
