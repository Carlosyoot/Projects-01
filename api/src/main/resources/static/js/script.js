const inputText = document.getElementById("inputText");
const addBTN = document.getElementById("addBTN");
const taskList = document.getElementById("taskList");
let finished = false;
let list = JSON.parse(localStorage.getItem("DB"))??[{menssage: "Exemple Task! :)", finished: false}];

console.log(JSON.parse(localStorage.getItem("DB")))

function loadList(){
    if(list.length > 0){
        localStorage.setItem("DB", JSON.stringify(list));
    }
    
    taskList.innerHTML = "";
    
    for(let i = 0; i < list.length; i++){
        let task = null;
        
        task = `
            <div class="header-task">
                <div class="titleTask">nome</div>
                <div class="dateFinal">Finalizada</div>
            </div>
            <div class="task" id="${i}">
            <input type="text" value="${list[i].menssage}" readonly class="inputTaskItem ${list[i].finished?"finish lthr": ""}"
            onchange="changed(this)">
            <div class="date">09/04/2025</div>
            <i class="bx bx-trash"></i>
            </div>
        `; 
        
        taskList.innerHTML+= task;
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    loadList();
})

addBTN.addEventListener("click", (e)=>{
    e.preventDefault();
    
    if(inputText.value !== ""){
        
        list.push({menssage: inputText.value, finished: false});
        
        loadList();
        inputText.value = "";
        
        e.stopPropagation();
    }
    
})

document.addEventListener("click", (e)=>{
    const targetElement = e.target;
    
    if(targetElement.classList.contains("bx-trash")){
        list.splice(targetElement.parentElement.id, 1);

        if(list.length == 0){
            localStorage.clear();
        }

        loadList();
    }
    
    if(targetElement.classList.contains("inputTaskItem")){
        if(targetElement.readOnly){
            //se o elemento da lista que esta com o mesmo id do pai do elemento input estiver com a propriedade true, troca pra false e vice-versa
            if(list[targetElement.parentElement.id].finished){list[targetElement.parentElement.id].finished = false}
            else {list[targetElement.parentElement.id].finished = true}

            localStorage.setItem("DB", JSON.stringify(list));
            
            targetElement.classList.toggle("finish");
            targetElement.classList.toggle("lthr");
        }
    }
})

document.addEventListener("dblclick", (e)=>{
    const targetElement = e.target;
    
    //se o elemento target for o input de uma task.
    if(targetElement.classList.contains("inputTaskItem")){

        targetElement.classList.remove("lthr");
        targetElement.readOnly = false;
        
        targetElement.addEventListener("blur", ()=>{
            list[e.target.parentElement.id].menssage = e.target.value;
            localStorage.setItem("DB", JSON.stringify(list));
            
            targetElement.readOnly = true;
            
            if(targetElement.classList.contains("finish")){
                targetElement.classList.add("lthr")
            }
        })
    }
});

function changed(val){
    list[val.parentElement.id].menssage = val.value;
}