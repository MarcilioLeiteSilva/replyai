"use client";
import React from 'react';
import { HelpCircle, Plug, Settings, Bot, ListChecks, PlayCircle } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <HelpCircle className="text-indigo-400" />
                    Ajuda & Tutorial
                </h1>
                <p className="text-gray-400">Tudo o que você precisa saber para operar o ReplyAI com perfeição.</p>
            </div>

            <div className="space-y-6">

                {/* Passo 1 */}
                <div className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                            <Plug size={20} />
                        </div>
                        <h2 className="text-xl font-bold">1. Conectando sua Conta</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        A primeira etapa é avisar o sistema qual canal ele deve operar.
                    </p>
                    <ul className="list-decimal list-inside text-gray-400 space-y-2 ml-2">
                        <li>Acesse o menu <b>Integrações</b> na barra lateral.</li>
                        <li>Clique no botão <b>YouTube</b> e faça login com a conta Google dona do canal.</li>
                        <li>Assim que conectado, o canal aparecerá listado como "Ativo", porém o agente de inteligência artificial <b>nasce desligado por padrão</b> para que você possa configurá-lo antes.</li>
                    </ul>
                </div>

                {/* Passo 2 */}
                <div className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-xl font-bold">2. Configurando a Inteligência (Persona)</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Agora precisamos ensinar a Inteligência Artificial a como falar com os seus inscritos de maneira personalizada.
                    </p>
                    <ul className="list-decimal list-inside text-gray-400 space-y-2 ml-2">
                        <li>Acesse o menu <b>Agente</b>. Selecione o canal que você acabou de conectar na lateral.</li>
                        <li><b>Nome da Persona:</b> Como o robô chama a si mesmo. Ex: "Assistente da Empresa".</li>
                        <li><b>Tom de voz:</b> Escolha entre Amigável, Profissional, Engraçado, etc.</li>
                        <li><b>Prompt Extra (Briefing):</b> Aqui está o segredo! Escreva instruções cruciais para a IA. <i>Ex: "Sempre use emojis 🚀, chame o inscrito de 'amigo' e nunca debata sobre política."</i></li>
                        <li>Defina também <b>filtros inteligentes</b> (Pular ofensas, ignorar Spam, focar só em perguntas ou também elogios).</li>
                    </ul>
                </div>

                {/* Passo 3 */}
                <div className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                        <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                            <ListChecks size={20} />
                        </div>
                        <h2 className="text-xl font-bold">3. Piloto Automático vs Aprovação Manual</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Na parte inferior das Configurações do Agente, você encontra a cereja do bolo: O Modo de Automação.
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-4 ml-2">
                        <li>
                            <strong className="text-gray-200">Piloto Automático Integral (Auto-Mode):</strong> Quando a luz do piloto automático está ativada, o robô lê, escreve a resposta e manda direto pro YouTube sem te avisar. Ideal para quando você já confia no que ele escreve.
                        </li>
                        <li>
                            <strong className="text-gray-200">Revisão Humana (Aprovação Necessária):</strong> Caso você desligue o piloto automático, todas as respostas perfeitas criadas pela IA ficam <b>"presas" no painel Comentários</b> do seu dashboard. Você deve entrar lá, ler o que o robô sugeriu, e só então apertar <i>"Aprovar"</i> para postar no canal. Ideal para os primeiros dias de teste.
                        </li>
                    </ul>
                </div>

                {/* Passo 4 */}
                <div className="bg-gray-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                        <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg">
                            <PlayCircle size={20} />
                        </div>
                        <h2 className="text-xl font-bold">4. Dando o "Play" (Ligando o Serviço)</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Tudo configurado do seu gosto? Agora é a hora da verdade.
                    </p>
                    <p className="text-gray-400">
                        Volte ao topo da página <b>Agentes</b> e clique no botão grande escrito: <span className="text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded">Agente Desligado</span> para transformá-lo em <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Agente Ligado</span>.
                    </p>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mt-4">
                        <strong className="text-indigo-400 flex items-center gap-2 mb-2"><Bot size={16} /> E agora, o que eu faço?</strong>
                        <p className="text-sm text-gray-300">
                            <b>Absolutamente nada!</b> A partir do momento que você liga o agente pela primeira vez, os nossos servidores trabalharão o tempo todo por você em segundo plano. **A cada exatos 5 minutos**, nosso robô bate no seu YouTube, busca os novos comentários e os encaminha para a Inteligência Artificial. Sente-se, relaxe e observe as mágicas no menu "Comentários" subirem!
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
