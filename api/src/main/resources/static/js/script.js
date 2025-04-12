const inputText = document.getElementById("inputText");
const addBTN = document.getElementById("addBTN");
const taskList = document.getElementById("taskList");
const modal = document.getElementById("modal");
const confirmBtn = document.getElementById("confirmTask");
const cancelBtn = document.getElementById("cancelTask");
const taskDetailsInput = document.getElementById("taskDetails");


const API_URL = 'http://localhost:8080/api/tasks';



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

const renderTasks = (tasks) => {

    for (let task of tasks) {
        console.log(task); 
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="taskI">
            <div class="header-task">
                <div class="titleTask">Título</div>
                <div class="dateFinal">Data</div>
            </div>
            <div class="task hover-info" data-id="${task.id}" title="${task.details || 'Sem detalhes'}">
                <input type="text" value="${task.title}" readonly 
                       class="inputTaskItem${task.finished ? " finish lthr" : ""}">
                <div class="date${task.finished ? " finish lthr" : ""}" 
                     data-original-date="${task.createdAt}">  
                    ${formatDateTask(task.createdAt)}
                </div>
                <i class="bx bx-trash" id="lx"></i>
                <div class="task-details-tooltip">${task.details || "Sem detalhes"}</div>
            </div>
        </div>
        <div class="fancy-divider"></div>
    `).join('');
};

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

const closeModal = () => {
    modal.classList.add("hidden");
    inputText.value = "";
    taskDetailsInput.value = "";
    
   
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
};

const showError = (message) => {
    alert(message); // Pode ser substituído por um toast ou modal de erro
};
    


// Atualiza uma tarefa existente
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
    if (inputText.value.length> 30 || inputText.value.length <=0) {
        alert("O título não pode ter mais que 30 palavras ou estar vazio.");

        return;
    }
    
    if (inputText.value !== "") {
        showTaskDetailsModal(inputText.value);
    }
});

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

async function sendTaskCompletedNotification(taskId) {

    console.log("eba");

    //            const taskElement = targetElement.closest('.task');

    const title = taskElement.previousElementSibling.querySelector('.titleTask')?.textContent || "Sem título";
    const finalDate = new Date().toLocaleString("pt-BR");

    const mensagemDiscord = `📝 *${title}* foi finalizada em ${finalDate}`;
                
                try {
                    const response = await fetch('/discord/post', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            mensagem: mensagemDiscord
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    console.log("Mensagem enviada pro Discord 🚀");
                } catch (err) {
                    console.error("Erro ao enviar mensagem pro Discord:", err);
                    
                }

    //console.log("finalizado")
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
}

//document.addEventListener("dblclick", async (e) => {
//    const targetElement = e.target;
//
//    console.log("dblclick entrou")
//    
//    if (targetElement.classList.contains("inputTaskItem")) {
//        targetElement.classList.remove("lthr");
//        targetElement.readOnly = false;
//        
//        targetElement.addEventListener("blur", async () => {
//            const taskElement = targetElement.closest('.task');
//            const taskId = taskElement.dataset.id;
//        
//            const title = taskElement.previousElementSibling.querySelector('.titleTask')?.textContent || "Sem título";
//            const finalDate = new Date().toLocaleString("pt-BR");
//        
//            //await updateTask(taskId, {
//            //    message: targetElement.value,
//            //    finished: targetElement.classList.contains("finish")
//            //});
//        //
//            //if (targetElement.classList.contains("finish")) {
//            //    const mensagemDiscord = `📝 *${title}* foi finalizada em ${finalDate}`;
//            //    
//            //    try {
//            //        const response = await fetch('/discord/post', {
//            //            method: 'POST',
//            //            headers: {
//            //                'Content-Type': 'application/json'
//            //            },
//            //            body: JSON.stringify({
//            //                mensagem: mensagemDiscord
//            //            })
//            //        });
//            //        
//            //        if (!response.ok) {
//            //            throw new Error(`HTTP error! status: ${response.status}`);
//            //        }
//            //        console.log("Mensagem enviada pro Discord 🚀");
//            //    } catch (err) {
//            //        console.error("Erro ao enviar mensagem pro Discord:", err);
//            //        
//            //    }
//            //}
//
//            const mensagemDiscord = `📝 *${title}* foi finalizada em ${finalDate}`;
//                
//                try {
//                    const response = await fetch('/discord/post', {
//                        method: 'POST',
//                        headers: {
//                            'Content-Type': 'application/json'
//                        },
//                        body: JSON.stringify({
//                            mensagem: mensagemDiscord
//                        })
//                    });
//                    
//                    if (!response.ok) {
//                        throw new Error(`HTTP error! status: ${response.status}`);
//                    }
//                    console.log("Mensagem enviada pro Discord 🚀");
//                } catch (err) {
//                    console.error("Erro ao enviar mensagem pro Discord:", err);
//                    
//                }
//        }, { once: true });
//    }   
//});

const sendAlertCheckbox = document.getElementById('sendAlertCheckbox');
const alertTimeInput = document.getElementById('alertTimeInput');

sendAlertCheckbox.addEventListener('change', () => {
    if (sendAlertCheckbox.checked) {
        alertTimeInput.classList.remove('hidden');
    } else {
        alertTimeInput.classList.add('hidden');
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




////////////////////////////////FUNÇÃO DE FORMATAÇÃO

const formatDateTask= (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
};



// Atualiza o relógio imediatamente e a cada segundo
updateClock();
setInterval(updateClock, 1000);