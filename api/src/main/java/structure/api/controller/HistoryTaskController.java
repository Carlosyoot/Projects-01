package structure.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import structure.api.model.HistoryTask;
import structure.api.service.HistoryTaskService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/HistoryTasks")
public class HistoryTaskController {

    @Autowired
    private HistoryTaskService service;

    @GetMapping
    public List<HistoryTask> RetornarTasks(){

        return service.exampleList();

    }
    
    
}
