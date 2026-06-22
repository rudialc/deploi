package com._x.TestRegister1.fitness.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;

@Service
public class GptService {

    private static final Logger log = LoggerFactory.getLogger(GptService.class);

    private final WebClient client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.gpt.api.key:}")
    private String gptKey;   

    @Value("${spring.gpt.api.uri:https://gigachat.devices.sberbank.ru/api/v1}")
    private String gptUri;

    private volatile String cachedAccessToken;
    private volatile long tokenExpiryTime = 0;

    public GptService(WebClient.Builder builder) {
        this.client = builder.build();
    }

    public boolean hasApiKey() {
        return gptKey != null && !gptKey.isBlank();
    }

    private String getAccessToken() {
        if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpiryTime - 60_000) {
            return cachedAccessToken;
        }

        log.info("Запрос нового access‑токена у GigaChat OAuth...");
        try {
            String response = client.post()
                    .uri("https://ngw.devices.sberbank.ru:9443/api/v2/oauth")
                    .header("Authorization", gptKey)          // Basic‑ключ
                    .header("RqUID", java.util.UUID.randomUUID().toString())
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .bodyValue("scope=GIGACHAT_API_PERS")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> tokenData = objectMapper.readValue(response, Map.class);
            cachedAccessToken = (String) tokenData.get("access_token");

            Object exp = tokenData.get("exp");
            if (exp instanceof Number) {
                tokenExpiryTime = ((Number) exp).longValue() * 1000; // в миллисекундах
            } else {
                tokenExpiryTime = System.currentTimeMillis() + 30 * 60 * 1000; // 30 минут по умолчанию
            }

            log.info("Токен получен, действителен до {}", Instant.ofEpochMilli(tokenExpiryTime));
            return cachedAccessToken;

        } catch (Exception e) {
            log.error("Ошибка получения access‑токена: {}", e.getMessage());
            throw new RuntimeException("Не удалось авторизоваться в GigaChat", e);
        }
    }

    public String getAnswer(String question) {
        try {

        String accessToken = getAccessToken();

        log.info("Access token получен");

        Map<String, Object> body = Map.of(
        "model", "GigaChat",
        "messages", new Object[]{
                Map.of("role", "user", "content", question)
        },
        "temperature", 0.7
        );

        log.info("Отправляем запрос в GigaChat");
        log.info("Request body: {}", body);

        String response = client.post()
                .uri(gptUri + "/chat/completions")
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.info("GigaChat response: {}", response);

        return response;

    } catch (Exception e) {

        log.error("ОШИБКА GIGACHAT REQUEST", e);

        throw e;
    }
}
}