package structure.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import structure.api.service.UpdateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;



@RestController
@RequestMapping("/notify")
public class UpdateController {

  @Autowired
  private UpdateService service;

  public UpdateController(UpdateService service){
    this.service = service;
  }

  @GetMapping("/subscribe")
  public SseEmitter subscribe() {
      return service.subscribe();
  }

  @PostMapping("/send")
  public void Sender(){
    service.notificar();
  }
  

}