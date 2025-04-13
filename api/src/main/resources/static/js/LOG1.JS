const inputText = document.getElementById("inputText");
const addBTN = document.getElementById("addBTN");
const taskList = document.getElementById("taskList");
const modal = document.getElementById("modal");
const confirmBtn = document.getElementById("confirmTask");
const cancelBtn = document.getElementById("cancelTask");
const taskDetailsInput = document.getElementById("taskDetails");
const sendAlertCheckbox = document.getElementById('sendAlertCheckbox');
const alertTimeInput = document.getElementById('alertTimeInput');


const API_URL = 'http://localhost:8080/api/tasks';
const USER_API_URL = 'http://localhost:8080/api/users/anon';
const LOCAL_STORAGE_KEY = 'anonUserId';


///////EVENTOS DE LOCALSTORAGE

let anonUserId = localStorage.getItem(LOCAL_STORAGE_KEY);



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


////CRIAR ORGANIZAÇÃO 
document.addEventListener("DOMContentLoaded", () => {
    const openOrgModalBtn = document.getElementById("openOrgModalBtn");
    const orgModal = document.getElementById("orgModalCustom");
    const closeOrgModal = document.getElementById("closeOrgModal");
    const linkedOrgsContainer = document.getElementById("linkedOrgsCustom");
    const createOrgBtn = document.getElementById("createOrg");
    const orgNameInput = document.getElementById("orgNameInput");

    let orgs = ['ida328432'];

    const renderOrgs = () => {
        linkedOrgsContainer.innerHTML = "";
    
        orgs.forEach((orgId) => {

            const orgMembers = Math.floor(Math.random() * 5) + 1; 
    
            const orgDiv = document.createElement("div");
            orgDiv.className = "org-box";
            orgDiv.innerHTML = `
                <div class="orgI">
                    <div class="org-name">
                        <strong>Organização ${orgId}</strong>
                    </div>
    
                    <div class="org-members">
                        <i class='bx bx-user'></i>
                        <span>${orgMembers} membro${orgMembers > 1 ? "s" : ""} conectado${orgMembers > 1 ? "s" : ""}</span>
                    </div>
    
                    <div class="org-options">
                        <button onclick="copyOrgLink('${orgId}')">Obter Link</button>
                        <button onclick="removeOrg('${orgId}')">Sair</button>
                    </div>
                </div>
            `;
            linkedOrgsContainer.appendChild(orgDiv);
        });
    };

    createOrgBtn.addEventListener("click", () => {
        const orgName = orgNameInput.value.trim();
        if (!orgName) return alert("Digite um nome para a organização");

        const orgId = "org-1" + Math.random().toString(36).substring(2, 8);
        
        if (orgs.length >= 3) return alert("Você já está em 3 organizações");

        orgs.push(orgId);
        renderOrgs();
        alert("Organização criada! Link copiado.");
        copyOrgLink(orgId);
    });

    window.copyOrgLink = (orgId) => {
        const link = `${window.location.origin}${window.location.pathname}?org=${orgId}`;
        navigator.clipboard.writeText(link);
        alert("Link copiado: " + link);
    };

    window.removeOrg = (orgId) => {
        orgs = orgs.filter((org) => org !== orgId);
        renderOrgs();
    };

    const params = new URLSearchParams(window.location.search);
    const orgParam = params.get("org");
    if (orgParam) {
        if (!orgs.includes(orgParam) && orgs.length < 3) {
            orgs.push(orgParam);
            alert("Você foi adicionado à organização: " + orgParam);
            renderOrgs();
        }
    }

    renderOrgs();


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
        id: 543, // pode ser qualquer ID fictício
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

        const response = await fetch('/discord/post', {
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

///FUNCAO PADRAO DE ERRO HANDLE
const showError = (message) => {
    alert(message); // Pode ser substituído por um toast ou modal de erro
};




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