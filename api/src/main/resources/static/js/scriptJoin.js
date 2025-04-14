const orgId = window.location.pathname.split('/').pop();
const userId = localStorage.getItem('anonUserId'); 
const orgNameElement = document.getElementById('orgName');
const msg = document.getElementById('msg');
const joinBtn = document.getElementById('joinBtn');
const discordCheckbox = document.getElementById('discordLinkedCheckbox');
const discordAuth = localStorage.getItem('discordAuth');


const API_GET_MEMBERS = `http://localhost:8080/api/orgs/${orgId}/members`;
const API_JOIN_ORG = `http://localhost:8080/api/orgs/join/${orgId}`;


document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
        if (params.get('discordLinked') === 'true') {
            localStorage.setItem('discordAuth', 'true');
        }

    try {
        const response = await fetch(API_GET_MEMBERS);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        orgNameElement.textContent = `${orgId}`;
    } catch (error) {
        console.error("Erro detalhado:", error);
        orgNameElement.textContent = error.message || "Organização não encontrada.";
    }

    joinBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(API_JOIN_ORG, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userId
                },
                body: JSON.stringify({ orgId }) 
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Erro ${response.status}`);
            }

            msg.textContent = data.message || "Você entrou com sucesso na organização!";
            msg.className = "message success";
            
        } catch (error) {
            console.error("Erro detalhado:", error);
            msg.textContent = error.message || "Erro ao conectar com o servidor";
            msg.className = "message error";
        }
    });

    if (discordAuth === 'true') {
        discordCheckbox.checked = true;
    }
});
