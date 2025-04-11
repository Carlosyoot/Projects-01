function getRandomLegoImage() {
    const randomNum = Math.floor(Math.random() * 9) + 1;
    return `https://randomuser.me/api/portraits/lego/${randomNum}.jpg`;
}
const API_URL = 'http://localhost:8080/HistoryTasks'; 
async function NotificationBuilder() {
    try {
        // Simulando a chamada da API com um URL (substitua com o seu URL real)
        const response = await fetch(API_URL);
        const itemNotify = await response.json();  
        
        const taskList = document.querySelector('.taskList');  // A lista de tarefas
        
        taskList.innerHTML = "";  // Limpar a lista antes de adicionar novos itens

        // Iterando sobre os itens recebidos e construindo os elementos
        itemNotify.forEach(notify => {
            const legoImage = getRandomLegoImage();  // Gerar imagem LEGO aleatória
            
            const taskElement = `
                <div class="ItemLi">
                    <div class="StatusAlert">
                        <span class="statusDot"></span>
                        <span class="statusText">${notify.status || 'Status desconhecido'}</span>
                    </div>
                    <div class="task">
                        <div class="startLeft">
                            <div class="randomIconUser">
                                <img src="${legoImage}" alt="Lego User" />  <!-- Imagem Lego do usuário -->
                            </div>
                            <div class="nameUser">${notify.Usern || 'Usuário desconhecido'}</div>
                        </div>
                        <div class="startMid">                                  
                            ${notify.message || 'Mensagem não disponível'}  <!-- Mensagem do usuário -->
                        </div>
                        <div class="startEnd">
                            <div class="dateTime">
                                <div class="date">${notify.date || 'Data não disponível'}</div>
                                <div class="time">${notify.hour || 'Hora não disponível'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="fancy-divider"></div>
                </div>
            `;
            
            taskList.innerHTML += taskElement;  // Adicionar a tarefa à lista
        });
    } catch (exception) {
        console.log("Erro ao buscar dados:", exception);
        return;
    }
}

