package structure.api.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class UpdateService {

    private final List<SseEmitter> emmiters = new ArrayList<>();

    public SseEmitter subscribe(){
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitter.onCompletion(() -> emmiters.remove(emitter));
        emitter.onTimeout(() -> emmiters.remove(emitter));
        emmiters.add(emitter);
        return emitter;
    }

    public void notificar(){
        List<SseEmitter> emittersMortos = new ArrayList<>();
        emmiters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().data("Finalizou uma tarefa"));
            } catch (IOException e) {
                emittersMortos.add(emitter);
            }
        });
        emmiters.removeAll(emittersMortos);
    }
}
    
