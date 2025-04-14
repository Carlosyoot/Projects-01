const inputText = document.getElementById("inputText");
const addBTN = document.getElementById("addBTN");
const taskList = document.getElementById("taskList");
const modal = document.getElementById("modal");
const confirmBtn = document.getElementById("confirmTask");
const cancelBtn = document.getElementById("cancelTask");
const taskDetailsInput = document.getElementById("taskDetails");
const sendAlertCheckbox = document.getElementById('sendAlertCheckbox');
const alertTimeInput = document.getElementById('alertTimeInput');
const openOrgModalBtn = document.getElementById("openOrgModalBtn");
const orgModal = document.getElementById("orgModalCustom");
const closeOrgModal = document.getElementById("closeOrgModal");
const linkedOrgsContainer = document.getElementById("linkedOrgsCustom");
const createOrgBtn = document.getElementById("createOrg");
const orgNameInput = document.getElementById("orgNameInput");



const API_URL = 'http://localhost:8080/api/tasks';
const API_DISCORD_POST='http://localhost:8080/discord/post'
const USER_API_URL = 'http://localhost:8080/api/users/anon';
const API_ORG_VALIDATE ='http://localhost:8080/api/users/can-create-org'
const API_ORG_POST='http://localhost:8080/api/orgs'
const LOCAL_STORAGE_KEY = 'anonUserId';
const LOCAL_STORAGE_NAME_KEY = "anonUsername";




///////EVENTOS DE LOCALSTORAGE

let anonUserId = localStorage.getItem(LOCAL_STORAGE_KEY);
let anonUsername = localStorage.getItem(LOCAL_STORAGE_NAME_KEY);





////FUNCAO DO LOCALSTORAGE

if (!anonUserId) {
    anonUserId = 'user-' + crypto.randomUUID();
    localStorage.setItem(LOCAL_STORAGE_KEY, anonUserId);

    fetch(USER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: anonUserId })
    }).then(() => {
        console.log("Usuário anônimo criado no backend:", anonUserId);
    }).catch(err => {
        console.error("Erro ao criar usuário anônimo:", err);
    });
} else {
    console.log("Usuário anônimo recuperado:", anonUserId);
}


if (!anonUsername) {
    showUsernameModal();
}



//////////EVENTOS DE DOM


document.addEventListener("DOMContentLoaded", async () => {
    await loadList();
    await addDefaultTaskToDOM();
    updateClock();
    setInterval(updateClock, 1000);

});

//////////EVENTOS DE CLIQUE - CHANGE


/////CHECKBOX - CAMPO DE ENVIAR ALERTA - MODAL DE ADICIONAR TASK
sendAlertCheckbox.addEventListener('change', () => {
    if (sendAlertCheckbox.checked) {
        alertTimeInput.classList.remove('hidden');
    } else {
        alertTimeInput.classList.add('hidden');
    }
});


//////////ADICIONAR - TASK + VALIDAÇÃO DE CAMPOS
addBTN.addEventListener("click", (e) => {
    e.preventDefault();

    inputText.value.trim().split(/\s+/);
    if (inputText.value.length> 30 || inputText.value.length <=0) {
        alert("O título não pode ter mais que 30 palavras ou estar vazio.");

        return;
    }
    
    if (inputText.value !== "") {
        showTaskDetailsModal(inputText.value);
    }
});

//////CLIQUE NA TASK - FINALIZAÇÃO E MENSAGEM NO DISCORD - ADICIONAR AO BANCO
document.addEventListener("click", (e) => {
    const targetElement = e.target;

    if (targetElement.classList.contains("bx-trash")) {
        const taskId = targetElement.closest('.task').dataset.id;
        deleteTask(taskId);
    }

    if (targetElement.classList.contains("inputTaskItem")) {
        const taskElement = targetElement;
        const taskId = taskElement.closest('.task').dataset.id;

        const isFinished = taskElement.classList.contains("finish");

        updateTask(taskId, {
            message: taskElement.value,
            finished: !isFinished
        }).then(() => {
            taskElement.classList.toggle("finish");
            taskElement.classList.toggle("lthr");

            const dateElement = taskElement
                .closest(".task")
                .querySelector(".date");

            if (dateElement) {
                dateElement.classList.toggle("finish");
                dateElement.classList.toggle("lthr");
            }

            if (!isFinished) {
                sendDiscord(taskId);
            }
        });
    }
});



    

createOrgBtn.addEventListener("click", async () => {
    const orgName = orgNameInput.value.trim();
    if (!orgName) return alert("Digite um nome para a organização");

    const userId = localStorage.getItem(LOCAL_STORAGE_KEY);
    const orgId = generateOrgId(orgName);

    try {
        await createOrgInBackend(orgName, orgId, userId);

        const link = generateOrgLink(orgName, orgId);
        copyToClipboard(link);
        alert("Organização criada! Link copiado: " + link);
        ShowToastSucess("Organização criada com sucesso");

        renderOrgs();
        orgNameInput.value = "";
    } catch (err) {
        alert(err.message || "Erro ao criar organização");
    }
});







/////////////// FUNCÕES




//CARREGAR LISTA DO BANCO
const loadList = async () => {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        showError("Não foi possível carregar as tarefas");
    }
};


//RENDERIZAR AS TAREFAS DO BANCO
const renderTasks = (tasks) => {

    for (let task of tasks) {
        console.log(task); 
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="taskI">
            <div class="header-task">
                <div class="titleTask">Título</div>
                <div class="dateFinal">Data</div>
                <div class="progress">Progresso: ${task.progress || '0%'}</div>

            </div>
            <div class="task hover-info" data-id="${task.id}" title="${task.details || 'Sem detalhes'}">
                <input type="text" value="${task.title}" readonly 
                       class="inputTaskItem${task.finished ? " finish lthr" : ""}">
                <div class="date${task.finished ? " finish lthr" : ""}" 
                     data-original-date="${task.createdAt}">  
                    ${formatDateTask(task.createdAt)}
                </div>
                <i class="bx bx-edit edit-btn" data-id="${task.id}" id="edit"></i>
                <i class="bx bx-trash" id="lx"></i>
                <div class="task-details-tooltip">${task.details || "Sem detalhes"}</div>
            </div>
        </div>
        <div class="fancy-divider"></div>
    `).join('');
};

//TAREFA PADRÃO + 1 AO INICIAR
const addDefaultTaskToDOM = () => {

    console.log("detalhe task dom")

    const task = {
        id: 543, 
        title: "Implementação Default",
        details: "Criar endpoints para tasks",
        createdAt: new Date().toISOString(),
        finished: false
    };

    const taskHTML = `
        <div class="taskI">
            <div class="header-task">
                <div class="titleTask">Título</div>
                <div class="dateFinal">Data</div>
                <div class="progress">Progresso: ${task.progress || '0%'}</div>

            </div>
            <div class="task hover-info" data-id="${task.id}" title="${task.details || 'Sem detalhes'}">
                <input type="text" value="${task.title}" readonly 
                       class="inputTaskItem${task.finished ? " finish lthr" : ""}">
                <div class="date${task.finished ? " finish lthr" : ""}" 
                     data-original-date="${task.createdAt}">  
                    ${formatDateTask(task.createdAt)}
                </div>
                <i class="bx bx-edit edit-btn" data-id="${task.id}" id="edit"></i>
                <i class="bx bx-trash" id="lx"></i>
                <div class="task-details-tooltip">${task.details || "Sem detalhes"}</div>
            </div>
        </div>
        <div class="fancy-divider"></div>
    `;

    taskList.insertAdjacentHTML('afterbegin', taskHTML);
};

////RENDERIZAR ORGANIZAÇÕES
const renderOrgs = async () => {
    try {
        const userId = localStorage.getItem(LOCAL_STORAGE_KEY);
        const orgs = await fetchUserOrgs(userId);
        
        linkedOrgsContainer.innerHTML = "";
        
        if (orgs.length === 0) {
            const noOrgsMessage = document.createElement("div");
            noOrgsMessage.className = "no-orgs-message";
            noOrgsMessage.textContent = "Você não participa de nenhuma organização no momento...";
            linkedOrgsContainer.appendChild(noOrgsMessage);
        } else {
            orgs.forEach(org => {
                const isOwner = org.creator.id === userId;
                const orgDiv = document.createElement("div");
                orgDiv.className = "org-box";
                orgDiv.dataset.isOwner = isOwner;
                
                orgDiv.innerHTML = `
                    <div class="orgI">
                        <div class="org-info">
                            <div class="org-name">
                                <strong>${org.name}</strong>
                            </div>
                            <div class="org-members">
                                <i class='bx bx-user'></i>
                                <span>${org.members} membro${org.members !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div class="org-options">
                            <button class="btn-link" onclick="copyOrgLink('${org.id}')"> Obter Link
                            </button>
                            ${isOwner 
                                ? `<button class="btn-danger" onclick="deleteOrg('${org.id}')">
                                   Excluir
                                </button>`
                                : `<button class="btn-danger" onclick="leaveOrg('${org.id}')">
                                    Sair
                                </button>`}
                        </div>
                    </div>
                    <div class="fancy-divider"></div>
                `;
                linkedOrgsContainer.appendChild(orgDiv);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar orgs:", error);
        showError("Falha ao carregar organizações");
    }
};

/////ENVIAR MENSAGEM NO DISCORD
async function sendDiscord(taskId) {

    const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);


    try {
        if (!taskElement) {
            console.warn("Task não encontrada com ID:", taskId);
            return;
        }

        const title = taskElement.querySelector('input[type="text"]').value;
        const details = taskElement.getAttribute('title') || 'Sem detalhes';
        const dateElement = taskElement.querySelector('.date').textContent;
        const originalDate = taskElement.querySelector('.date').getAttribute('data-original-date');


        const discordPayload = {
            usuario: "123456789012345678", 
            titulo: title,
            detalhe: details,
            tipo: "finalizou",
            dataHora:originalDate
        };

        console.log("Enviando para Discord:", discordPayload);

        const response = await fetch(API_DISCORD_POST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(discordPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Mensagem enviada pro Discord com sucesso 🚀");

    } catch (err) {
        console.error("Erro ao enviar mensagem pro Discord:", err);
    }
}

async function checkOrgLimit(userId) {
    const response = await fetch(API_ORG_VALIDATE, {
        headers: { 'X-User-Id': userId }
    });
    return response.ok && (await response.json());
}

function generateOrgId(orgName) {
    const normalized = orgName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, '-');
    
    const randomId = Math.random().toString(36).substring(2, 6);
    return `${normalized}-${randomId}`;
}

function copyOrgLink(orgId) {
    const fullLink = generateOrgLink("ignored", orgId); 
    copyToClipboard(fullLink);
    alert("Link copiado para a área de transferência!");
}


function generateOrgLink(orgName, orgId) {
    return `${window.location.origin}/join/${encodeURIComponent(orgId)}`;
}

async function fetchUserOrgs(userId) {
    const response = await fetch(`/api/users/${userId}/orgs`);
    if (!response.ok) throw new Error("Falha ao carregar organizações");
    return response.json();
}


///FUNCAO PADRAO DE ERRO HANDLE
const showError = (message) => {
    alert(message); // Pode ser substituído por um toast ou modal de erro
};

function ShowToastError(message) {
    const toast = document.createElement("div");
    toast.className = "toast error";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}


function ShowToastSucess(message) {
    const toast = document.createElement("div");
    toast.className = "toast success";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}




////FUNCAO PARA COPIAR PARA O CAMPO DE TRANSF
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => console.log("Link copiado!" + text))
        .catch(err => console.error("Falha ao copiar:", err));
}





/////FUNCAO DE HORARIO 

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    
    // Formata a hora (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}





    
///////////////////////////FUNCAO CRUD

//ADICIONAR
const addTask = async (taskText, details = "") => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: taskText,  
                details: details,
                finished: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        await loadList();
        return await response.json();
    } catch (error) {
        console.error("Erro detalhado ao adicionar tarefa:", error);
        showError(error.message || "Não foi possível adicionar a tarefa");
        throw error;
    }
};


//REMOVER
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadList();
        }
    } catch (error) {
        console.error("Erro ao remover tarefa:", error);
    }
}


//////////////ADICIONAR ORGANIZAÇÃO
async function createOrgInBackend(orgName, orgId, userId) {
    try {
        const response = await fetch('/api/orgs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId
            },
            body: JSON.stringify({
                orgId: orgId,
                name: orgName
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Falha ao criar organização");
        }


        
        return await response.json();
    } catch (error) {
        console.error("Erro ao criar organização:", error);
        throw error; 
    }
}






/////////////////POPUP - MODAIS/////////////


///////MODAIS DE ORGANIZAÇÃO


///EXIBIR MODAL DE GERENCIAR ORGANIZAÇÕES
openOrgModalBtn.addEventListener("click", () => {
    console.log("clicou")
    orgModal.classList.remove("hidden-org");
    renderOrgs();
});

/////FECHAR MODAL DE GERENCIAR
closeOrgModal.addEventListener("click", () => {
    orgModal.classList.add("hidden-org");
});


/////USERNAMEMODAL
function showUsernameModal() {
    const modal = document.getElementById("usernameModal");
    modal.classList.remove("hidden");

    document.getElementById("confirmUsername").addEventListener("click", () => {
        const name = document.getElementById("usernameInput").value.trim();
        if (name.length < 2) {
            alert("Nome muito curto!");
            return;
        }

        localStorage.setItem(LOCAL_STORAGE_NAME_KEY, name);
        anonUsername = name;

        //// Opcional: enviar para backend se quiser salvar junto ao user
        //fetch(USER_API_URL, {
        //    method: 'POST',
        //    headers: { 'Content-Type': 'application/json' },
        //    body: JSON.stringify({ userId: anonUserId, username: anonUsername })
        //}).catch(err => {
        //    console.error("Erro ao salvar nome no backend:", err);
        //});

        modal.classList.add("hidden-username");
    });
}



///EXIBIR MODAL DE ADICIONAR TAREFAS
const showTaskDetailsModal = (taskText) => {
    modal.classList.remove("hidden");
    
    const handleConfirm = () => {
        const details = taskDetailsInput.value.trim();
        
        if (!details) {
            showError("Adicione detalhes antes de criar a tarefa");
            return;
        }

        addTask(taskText, details);
        closeModal();
    };

    const handleCancel = () => {
        closeModal();
    };

    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = handleCancel;
};

////FECHAR O MODAL DE ADICIONAR TAREFAS
const closeModal = () => {
    modal.classList.add("hidden");
    inputText.value = "";
    taskDetailsInput.value = "";
    
   
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
};








///FORMATAÇÃO DE DADOS/TEXTO


//FORMATAR DATA
const formatDateTask= (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
};


////ENVIAR NOTIFICAÇÃO
 //try {
    //    const response = await fetch('http://localhost:8080/api/tasks/notify', {
    //        method: 'POST',
    //        headers: { 'Content-Type': 'application/json' },
    //        body: JSON.stringify({ taskId })
    //    });
    //    
    //    if (!response.ok) {
    //        console.error("Falha ao enviar notificação");
    //    }
    //} catch (error) {
    //    console.error("Erro ao enviar notificação:", error);
    //}

    window.deleteOrg = async (orgId) => {
        if (!confirm("Tem certeza que deseja EXCLUIR PERMANENTEMENTE esta organização?")) return;
        
        try {
            const userId = localStorage.getItem(LOCAL_STORAGE_KEY);
            const response = await fetch(`/api/orgs/${orgId}`, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': userId
                }
            });
            
            if (!response.ok) throw new Error();
            
            await renderOrgs();
            ShowToastSucess("Organização excluída com sucesso!");
        } catch (error) {
            ShowToastError("Falha ao excluir organização" + error);
        }
    };
    
    window.leaveOrg = async (orgId) => {
        if (!confirm("Tem certeza que deseja sair desta organização?")) return;
        
        try {
            const userId = localStorage.getItem(LOCAL_STORAGE_KEY);
            const response = await fetch(`/api/orgs/${orgId}/leave`, {
                method: 'POST',
                headers: {
                    'X-User-Id': userId
                }
            });
            
            if (!response.ok) throw new Error();
            
            await renderOrgs();
            ShowToastSucess("Você saiu da organização");
        } catch (error) {
            ShowToastError(error.message || "Falha ao sair da organização");
        }
    };