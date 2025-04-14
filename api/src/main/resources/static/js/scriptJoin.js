const orgId = window.location.pathname.split('/').pop();
const orgNameElement = document.getElementById('orgName');
const msg = document.getElementById('msg');
const joinBtn = document.getElementById('joinBtn');
const discordCheckbox = document.getElementById('discordLinkedCheckbox');
const userGreetingStrong = document.querySelector('.user-greeting strong');

const API_GET_MEMBERS = `http://localhost:8080/api/orgs/${orgId}/members`;
const API_JOIN_ORG = `http://localhost:8080/api/orgs/join/${orgId}`;
const userName = localStorage.getItem('anonUsername');


document.getElementById("linkDiscord").addEventListener("click", (e) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    const discordAuthUrl = `/auth/discord/connect?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = discordAuthUrl;
});

document.addEventListener("DOMContentLoaded", async () => {

    if (userName) {
        userGreetingStrong.textContent = userName; 
    } else {
        userGreetingStrong.textContent = 'Usuário'; 
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get('discordLinked') === 'true') {
        localStorage.setItem('discordAuth', 'true');
    }

    const discordId = params.get('discordId');
    if (discordId) {
        localStorage.setItem('discordId', discordId);
    }

    const discordAuth = localStorage.getItem('discordAuth');
    const userId = localStorage.getItem('anonUserId');

    if (discordAuth === 'true') {
        discordCheckbox.checked = true;
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
        const discordAuth = localStorage.getItem('discordAuth');
    
        if (discordAuth !== 'true') {
            msg.textContent = "Você precisa vincular sua conta do Discord antes de entrar.";
            msg.className = "message error";
            return; 
        }
    
        try {
            const response = await fetch(API_JOIN_ORG, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userId
                },
                body: JSON.stringify({ orgId }) 
            });
    
            const text = await response.text();
    
            console.log(text)
    
            let data = {};
    
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn("Resposta não era JSON válido:", text);
            }
    
            if (!response.ok) {
                throw new Error(data.message || `Erro ${response.status}`);
            }
    
            msg.textContent = data.message || "Você entrou com sucesso na organização!";
            msg.className = "message success";
    
            
            window.location.href = "http://localhost:8080/Todolist";
    
        } catch (error) {
            console.error("Erro detalhado:", error);
            msg.textContent = error.message || "Erro ao conectar com o servidor";
            msg.className = "message error";
        }
    });
});
