package structure.api.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import structure.api.model.HistoryTask;

@Service
public class HistoryTaskService {

    // Método que simula uma lista de tarefas
    public List<HistoryTask> exampleList() {
        // Inicializando a lista de tarefas
        List<HistoryTask> tasks = new ArrayList<>();

        // Adicionando algumas tarefas simuladas
        tasks.add(new HistoryTask("Tarefa 1", "Finalizada", "João", "2025-04-10", "08:44"));
        tasks.add(new HistoryTask("Tarefa 2", "Em progresso", "Maria", "2025-04-10", "09:30"));
        tasks.add(new HistoryTask("Tarefa 3", "Pendente", "Carlos", "2025-04-11", "10:00"));
        tasks.add(new HistoryTask("Tarefa 4", "Finalizada", "Ana", "2025-04-11", "11:45"));

        // Retornando a lista de tarefas
        return tasks;
    }
}
