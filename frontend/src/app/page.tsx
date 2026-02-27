"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    MessageSquare, Youtube, Instagram, Zap, Shield, BarChart3,
    ArrowRight, CheckCircle, Star
} from "lucide-react";

const features = [
    { icon: Zap, title: "IA Avançada", desc: "GPT-4o responde com personalidade e tom personalizados para cada canal." },
    { icon: Shield, title: "100% Seguro", desc: "Tokens OAuth criptografados. Nunca publicamos sem sua autorização." },
    { icon: BarChart3, title: "Analytics completo", desc: "Volume, categorias, taxa de resposta e muito mais em tempo real." },
    { icon: MessageSquare, title: "Multi-plataforma", desc: "YouTube, Instagram, TikTok e Facebook em um único painel." },
];

const plans = [
    { name: "Gratuito", price: "R$0", period: "/mês", features: ["1 integração", "20 respostas/dia", "YouTube", "Analytics básico"], cta: "Começar grátis", highlight: false },
    { name: "Starter", price: "R$49", period: "/mês", features: ["2 integrações", "200 respostas/dia", "YT + Instagram", "Export CSV", "Suporte por email"], cta: "14 dias grátis", highlight: false },
    { name: "Pro", price: "R$149", period: "/mês", features: ["5 integrações", "1.000 respostas/dia", "4 plataformas", "Analytics avançado", "3 personas de IA"], cta: "14 dias grátis", highlight: true },
    { name: "Agency", price: "R$449", period: "/mês", features: ["Ilimitado", "10.000 respostas/dia", "Todas as plataformas", "API Access", "Suporte dedicado"], cta: "14 dias grátis", highlight: false },
];

export default function LandingPage() {
    return (
        <div className="animated-gradient min-h-screen">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <MessageSquare size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">ReplyAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Preços</Link>
                        <Link href="/login" className="btn-secondary text-sm py-2 px-4">Entrar</Link>
                        <Link href="/register" className="btn-primary text-sm py-2 px-4">Começar grátis</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium text-indigo-300"
                        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
                        <Star size={14} className="text-yellow-400" />
                        Mais de 1.000 criadores já usam o ReplyAI
                    </div>
                    <h1 className="text-6xl font-black mb-6 leading-tight">
                        Nunca perca um{" "}
                        <span className="gradient-text">comentário</span> nas suas{" "}
                        <span className="gradient-text">redes sociais</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Automatize 100% das respostas com IA personalizada. Economize horas, aumente engajamento e fidelize sua audiência.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/register" className="btn-primary text-lg px-8 py-4">
                            Começar grátis — 14 dias sem cartão
                            <ArrowRight size={20} />
                        </Link>
                        <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                            Ver como funciona
                        </Link>
                    </div>
                </motion.div>

                {/* Platform badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex justify-center gap-4 mt-14 flex-wrap"
                >
                    {[
                        { label: "YouTube", color: "#ff0000", Icon: Youtube },
                        { label: "Instagram", color: "#e1306c", Icon: MessageSquare },
                        { label: "TikTok", color: "#69c9d0", Icon: MessageSquare },
                        { label: "Facebook", color: "#1877f2", Icon: MessageSquare },
                    ].map(({ label, color, Icon }) => (
                        <div key={label} className="glass-card px-5 py-3 flex items-center gap-2 text-sm font-medium" style={{ borderColor: `${color}33` }}>
                            <Icon size={18} style={{ color }} />
                            {label}
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4">Tudo que você precisa</h2>
                    <p className="text-gray-400 text-center mb-14 text-lg">Uma plataforma completa para gerenciar comentários em todas as redes.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                                    style={{ background: "rgba(99,102,241,0.15)" }}>
                                    <f.icon size={22} className="text-indigo-400" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4">Planos simples e transparentes</h2>
                    <p className="text-gray-400 text-center mb-14 text-lg">Todos os planos incluem 14 dias de trial gratuito. PIX, Boleto ou Cartão.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-card p-6 flex flex-col relative ${plan.highlight ? "glow border-indigo-500/40" : ""}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                                        style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
                                        ⭐ Mais popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black gradient-text">{plan.price}</span>
                                        <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                                    </div>
                                </div>
                                <ul className="flex-1 space-y-3 mb-6">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle size={16} className="text-indigo-400 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register"
                                    className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${plan.highlight
                                            ? "btn-primary"
                                            : "btn-secondary"
                                        }`}>
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto glass-card p-12 glow"
                >
                    <h2 className="text-4xl font-bold mb-4">Pronto para automatizar?</h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Junte-se a criadores que já economizam mais de 10 horas por semana com o ReplyAI.
                    </p>
                    <Link href="/register" className="btn-primary text-lg px-10 py-4">
                        Começar agora — grátis
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
                <p>© 2026 ReplyAI. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
