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
const orgTaskModal = document.getElementById('modal-org-task');
const orgTitle = document.getElementById('title-org-task');
const orgTaskDetailsInput = document.getElementById('taskDetails-org');
const orgConfirmBtn = document.getElementById('confirmTask-org');
const orgCancelBtn = document.getElementById('cancelTask-org');
const openOrgTasksModalBtn = document.getElementById('openOrgTasksModalBtn');


const API_URL = 'http://localhost:8080/api/tasks';
const API_DISCORD_POST='http://localhost:8080/discord/post'
const USER_API_URL = 'http://localhost:8080/api/users/anon';
const API_ORG_VALIDATE ='http://localhost:8080/api/users/can-create-org'
const API_ORG_POST='http://localhost:8080/api/orgs'
const API_GET_OWNER_ORGS = 'http://localhost:8080/api/orgs/created-by/${userId}'
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
        loadAllTasks(anonUserId);
    }).catch(err => {
        console.error("Erro ao criar usuário anônimo:", err);
    });
} else {
    console.log("Usuário anônimo recuperado:", anonUserId);
}

/////VALIDAR USERNAME
if (!anonUsername) {
    showUsernameModal();
}



//////////EVENTOS DE DOM


document.addEventListener("DOMContentLoaded", async () => {
    await loadAllTasks(anonUserId);
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


////////////////////////
if (openOrgTasksModalBtn) {
    openOrgTasksModalBtn.addEventListener('click', () => {
       

        showOrgTaskModal();
    });
} else {
    console.warn('Botão openOrgTasksModalBtn não encontrado no DOM');
}


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
const loadAllTasks = async (userId) => {

   
    if (!localStorage.getItem('hasAccessedBefore')) {
  
        localStorage.setItem('hasAccessedBefore', 'true');
        console.log("Primeiro acesso - nenhuma tarefa carregada.");
        return;
    }

    try {
        const response = await fetch(`/api/tasks/user-and-org/${userId}`);
        let tasks = await response.json();

        const uniqueTasks = Array.from(
            new Map(tasks.map(task => [task.id, task])).values()
        );

        renderTasks(uniqueTasks);
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        showError("Não foi possível carregar as tarefas");
    }
};

//RENDERIZAR AS TAREFAS DO BANCO
const renderTasks = (tasks) => {
    if (!tasks.length) {
        console.log("Nenhuma tarefa encontrada")
        return;
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
        const user = localStorage.getItem('discordId');
        const details = taskElement.getAttribute('title') || 'Sem detalhes';
        const dateElement = taskElement.querySelector('.date').textContent;
        const originalDate = taskElement.querySelector('.date').getAttribute('data-original-date');


        const discordPayload = {
            usuario: user,
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

/////////////FUNCAO-ORGS-DONO
async function carregarOrgsCriadas(userId) {
    try {
      const response = await fetch(`/api/orgs/created-by/${userId}`);
      const orgs = await response.json();
  
      const orgSelect = document.getElementById('orgSelect');
      orgSelect.innerHTML = "";
  
      if (!orgs || orgs.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.selected = true;
        option.textContent = "Você não tem nenhuma organização";
        orgSelect.appendChild(option);
        orgSelect.disabled = true;
      } else {
        const placeholder = document.createElement('option');
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = "Selecione uma organização";
        orgSelect.appendChild(placeholder);
  
        orgs.forEach(org => {
          const option = document.createElement('option');
          option.value = org.id;
          option.textContent = org.name;
          orgSelect.appendChild(option);
        });
  
        orgSelect.disabled = false;
      }
  
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
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

function ShowToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const offset = document.querySelectorAll(".toast").length * 60; 
    toast.style.top = `${20 + offset}px`;

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

    const owner = localStorage.getItem("anonUserId");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: taskText, 
                owner: owner,    
                details: details,
                finished: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        await loadAllTasks(anonUserId);
        return await response.json();
    } catch (error) {
        console.error("Erro detalhado ao adicionar tarefa:", error);
        showError(error.message || "Não foi possível adicionar a tarefa");
        throw error;
    }
};

//////ADICIONAR
const addOrgTask = async (taskText, details) => {
    const orgId = document.getElementById("orgSelect").value;
    const owner = localStorage.getItem("anonUserId");

    if (!orgId || orgId === "Selecione uma organização") {
        showError("Você precisa selecionar uma organização.");
        return;
    }

    const payload = {
        title: taskText,
        details: details,
        finished: false,
        owner: owner,
        organizationId: orgId
    };

    console.log("🔍 Enviando tarefa organizacional:", payload);

    try {
        const response = await fetch("/api/tasks/org", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Resposta com erro:", errorData);
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        await loadAllTasks(owner);
        return await response.json();
    } catch (error) {
        console.error("Erro ao adicionar task organizacional:", error);
        showError(error.message || "Erro ao adicionar a task organizacional");
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
            loadAllTasks(anonUserId);
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

////////////UPDATE TASK
async function updateTask(id, updatedTask) {

    console.log("update")
        //try {
        //    const response = await fetch(`${API_URL}/${id}`, {
        //        method: 'PUT',
        //        headers: {
        //            'Content-Type': 'application/json',
        //        },
        //        body: JSON.stringify(updatedTask)
        //    });
        //    
        //    if (response.ok) {
        //        loadList();
        //    }
        //} catch (error) {
        //    console.error("Erro ao atualizar tarefa:", error);
        //}
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
    modal.classList.remove("hidden-username");

    document.getElementById("confirmUsername").addEventListener("click", () => {
        const name = document.getElementById("usernameInput").value.trim();
        if (name.length <= 0) {
            ShowToastError("Nome vazio");
            return;
        }
        else if(name.length < 5){
            ShowToast("Nome muito curto", "error");
            ShowToast("Crie um nome com no mínimo", "error");
            ShowToast("6 letras", "error");
            return
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


        ShowToast("Nome definido com sucesso", "sucess");
        ShowToast("Esse será o nome exibido nas notificações", "sucess");
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

const showOrgTaskModal = (taskText) => {
    orgTaskModal.classList.remove("hidden");
   

    orgConfirmBtn.onclick = handleOrgConfirm;
    orgCancelBtn.onclick = handleOrgCancel;
};

// Função para fechar o modal organizacional
const closeOrgTaskModal = () => {
orgTaskModal.classList.add("hidden");
orgTaskDetailsInput.value = "";

// Remover os event listeners para evitar vazamentos de memória
orgConfirmBtn.onclick = null;
orgCancelBtn.onclick = null;
};

//////////////////////  
const handleOrgConfirm = () => {
    try {
        const titleInput = document.getElementById("title-org-task");
        
        if (!titleInput) {
            throw new Error("Elemento title-org-task não encontrado");
        }

        const title = titleInput.value.trim();
        const details = orgTaskDetailsInput.value.trim();

        if (!title) {
            showError("O título da tarefa é obrigatório");
            titleInput.focus();
            return;
        }

        if (!details) {
            showError("Os detalhes da tarefa são obrigatórios");
            orgTaskDetailsInput.focus();
            return;
        }

        addOrgTask(title, details);
        closeOrgTaskModal();
        
        // Reset dos campos
        titleInput.value = "";
        orgTaskDetailsInput.value = "";

    } catch (error) {
        console.error("Erro ao confirmar tarefa organizacional:", error);
        showError("Ocorreu um erro ao criar a tarefa");
    }
};

const handleOrgCancel = () => {
    closeOrgTaskModal();
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


    carregarOrgsCriadas(anonUserId);


    const sendAlertCheckboxOrg = document.getElementById('sendAlertCheckbox-org');
    const alertTimeInputOrg = document.getElementById('alertTimeInput-org');
    
    if (sendAlertCheckboxOrg && alertTimeInputOrg) {
        sendAlertCheckboxOrg.addEventListener('change', () => {
            if (sendAlertCheckboxOrg.checked) {
                alertTimeInputOrg.classList.remove('hidden');
            } else {
                alertTimeInputOrg.classList.add('hidden');
            }
        });
    } else {
        console.warn('Elementos do checkbox de alerta organizacional não encontrados');
    }
    if (openOrgTasksModalBtn) {
        openOrgTasksModalBtn.addEventListener('click', () => {
            const defaultTaskText = "";
            if (sendAlertCheckboxOrg && alertTimeInputOrg) {
                sendAlertCheckboxOrg.checked = false;
                alertTimeInputOrg.classList.add('hidden');
            }
            showOrgTaskModal(defaultTaskText);
        });
    } else {
        console.warn('Botão openOrgTasksModalBtn não encontrado no DOM');
    }