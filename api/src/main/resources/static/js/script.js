const inputText = document.getElementById("inputText");
const addBTN = document.getElementById("addBTN");
const taskList = document.getElementById("taskList");

const API_URL = 'http://localhost:8080/api/tasks';

async function loadList() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        
        taskList.innerHTML = "";
            
        tasks.forEach(task => {
            const taskElement = `

    <div class="taskI">
    <div class="header-task">
        <div class="titleTask">Título</div>
        <div class="dateFinal">Data</div>
    </div>
    <div class="task hover-info" data-id="${task.id}" title="${task.details || 'Sem detalhes'}">
        <input type="text" value="${task.message}" readonly class="inputTaskItem ${task.finished ? "finish lthr" : ""}">
        <div id="inputTool" class="date ${task.finished ? "finish lthr" : ""}">${new Date(task.createdAt).toLocaleDateString()}</div>
        <i class="bx bx-trash" id="lx"></i>
        <div class="task-details-tooltip">${task.details || "Sem detalhes"}</div>
    </div>
    </div>
`;
            
            taskList.innerHTML += taskElement;
        });
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
    }
}

function showTaskDetailsModal(taskText) {
    document.getElementById("modal").classList.remove("hidden");

    const confirmBtn = document.getElementById("confirmTask");
    const cancelBtn = document.getElementById("cancelTask");

    confirmBtn.onclick = () => {
        const details = document.getElementById("taskDetails").value.trim();
        if (details === "") {
            alert("Adicione detalhes antes de criar a tarefa.");
            return;
        }

        addTask(taskText, details);
        document.getElementById("modal").classList.add("hidden");
        inputText.value = "";
        document.getElementById("taskDetails").value = "";
    };

    cancelBtn.onclick = () => {
        document.getElementById("modal").classList.add("hidden");
        document.getElementById("taskDetails").value = "";
    };
}

// Atualize a função addTask
async function addTask(taskText, details = "") {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: taskText,
                details: details,
                finished: false
            })
        });

        if (response.ok) {
            loadList();
        }
    } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);
    }
}

// Atualiza uma tarefa existente
async function updateTask(id, updatedTask) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        });
        
        if (response.ok) {
            loadList();
        }
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
    }
}

// Remove uma tarefa
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

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    loadList();
});

addBTN.addEventListener("click", (e) => {
    e.preventDefault();

    inputText.value.trim().split(/\s+/);
    if (inputText.value.length> 18 || inputText.value.length <=0) {
        alert("O título não pode ter mais que 18 palavras ou estar vazio.");

        return;
    }
    
    if (inputText.value !== "") {
        showTaskDetailsModal(inputText.value); // Novo modal para descrição
    }
});

document.addEventListener("click", (e) => {
    const targetElement = e.target;
    
    if (targetElement.classList.contains("bx-trash")) {
        const taskId = targetElement.closest('.task').dataset.id;
        deleteTask(taskId);
    }
    
    if (targetElement.classList.contains("inputTaskItem")) {
        if (targetElement.readOnly) {
            const taskId = targetElement.closest('.task').dataset.id;
            const isFinished = targetElement.classList.contains("finish");
            
            updateTask(taskId, {
                message: targetElement.value,
                finished: !isFinished
            }).then(() => {
                if (!isFinished) {
                    sendTaskCompletedNotification(taskId);
                }
            });
        }
    }
});

async function sendTaskCompletedNotification(taskId) {
    try {
        const response = await fetch('http://localhost:8080/api/tasks/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId })
        });
        
        if (!response.ok) {
            console.error("Falha ao enviar notificação");
        }
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
    }
}

document.addEventListener("dblclick", (e) => {
    const targetElement = e.target;
    
    if (targetElement.classList.contains("inputTaskItem")) {
        targetElement.classList.remove("lthr");
        targetElement.readOnly = false;
        
        targetElement.addEventListener("blur", () => {
            const taskId = targetElement.closest('.task').dataset.id;
            updateTask(taskId, {
                message: targetElement.value,
                finished: targetElement.classList.contains("finish")
            });
        }, { once: true }); // O listener será removido após ser executado uma vez
    }
});

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    
    // Formata a hora (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Atualiza o relógio imediatamente e a cada segundo
updateClock();
setInterval(updateClock, 1000);