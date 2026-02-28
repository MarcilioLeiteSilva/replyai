"use client";
import { useState } from "react";
import {
    Link2, Globe, ShieldCheck,
    RefreshCw, Power, Save,
    AlertCircle, Info, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

export default function GatewaysConfigPage() {
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState({
        stripe: { enabled: true, mode: 'test', key: 'sk_test_••••••••••••' },
        asaas: { enabled: false, mode: 'production', key: '••••••••••••' },
        mercado_pago: { enabled: false, mode: 'test', key: '••••••••••••' }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold mb-1 italic tracking-tighter uppercase">Gateways de Pagamento</h1>
                <p className="text-gray-400">Integração com APIs financeiras e Webhooks</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Stripe */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#635BFF]/10 text-[#635BFF] rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#635BFF]/10 border border-[#635BFF]/20">
                                S
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Stripe Payments</h3>
                                <p className="text-xs text-gray-500 font-medium">Recomendado para cartões globais e Apple/Google Pay</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${configs.stripe.enabled ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-gray-700'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{configs.stripe.enabled ? 'Ativo' : 'Inativo'}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Modo de Operação</label>
                                <select className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#635BFF]/30 transition-all">
                                    <option value="test">Sandbox (Desenvolvimento)</option>
                                    <option value="production">Produção (Live)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Webhook Status</label>
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-3 px-4 flex items-center gap-2">
                                    <RefreshCw size={14} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-400">Conectado</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chave Privada (API Secret)</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={configs.stripe.key}
                                    disabled
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-gray-500 focus:ring-2 focus:ring-[#635BFF]/30 outline-none transition-all pr-32"
                                />
                                <button className="absolute right-2 top-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-white/5 transition-all">
                                    Alterar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                        <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="flex items-center gap-2 text-xs font-bold text-[#635BFF] hover:text-[#7C74FF] transition-colors">
                            <ExternalLink size={14} /> Abrir Dashboard Stripe
                        </a>
                        <button className="flex items-center gap-2 bg-[#635BFF] hover:bg-[#7C74FF] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#635BFF]/20">
                            <Save size={14} /> Salvar Configurações
                        </button>
                    </div>
                </motion.div>

                {/* Asaas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-900/30 border border-white/5 rounded-3xl p-8 group relative opacity-60"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center font-black text-xl border border-blue-500/20">
                                A
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Asaas ERP</h3>
                                <p className="text-xs text-gray-500 font-medium">Focado no mercado brasileiro (PIX e Boleto)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-700" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Desativado</span>
                        </div>
                    </div>

                    <button className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-2xl text-xs font-bold border border-white/5 transition-all">
                        Configurar Integração Asaas
                    </button>
                </motion.div>
            </div>

            {/* Alerta de Segurança */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-red-500 mb-1">Criptografia de Chaves</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Todas as chaves de API carregadas aqui são criptografadas no nível do banco de dados (AES-256). Nunca compartilhe sua URL de Webhook ou Secret Token com terceiros.
                    </p>
                </div>
            </div>
        </div>
    );
}
