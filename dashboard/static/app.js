const authBtn = document.getElementById("auth-btn");
const startBtn = document.getElementById("start-btn");
const authStatus = document.getElementById("auth-status");
const agentStatus = document.getElementById("agent-status");
const historyList = document.getElementById("history-list");

authBtn.onclick = () => {
    fetch("/authenticate", {method:"POST"})
        .then(res => res.json())
        .then(data => alert("OAuth iniciado. Verifique o navegador!"));
};

startBtn.onclick = () => {
    fetch("/run", {method:"POST"})
        .then(res => res.json())
        .then(data => {
            if(data.status === "agent_started") agentStatus.textContent = "Rodando ✅";
            else if(data.status === "no_token") alert("Primeiro autentique!");
            else agentStatus.textContent = "Rodando ✅";
        });
};

// atualizar status e histórico a cada 5s
setInterval(() => {
    fetch("/status")
        .then(res => res.json())
        .then(data => {
            authStatus.textContent = data.authenticated ? "Autenticado ✅" : "Não autenticado ⚠️";
            agentStatus.textContent = data.running ? "Rodando ✅" : "Parado";
        });

    fetch("/history")
        .then(res => res.json())
        .then(data => {
            historyList.innerHTML = "";
            data.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `[${item.time}] ${item.comment} → ${item.response}`;
                historyList.appendChild(li);
            });
        });
}, 5000);
