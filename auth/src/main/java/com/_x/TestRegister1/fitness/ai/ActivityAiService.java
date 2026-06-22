package com._x.TestRegister1.fitness.ai;

import com._x.TestRegister1.fitness.entity.Activity;
import com._x.TestRegister1.fitness.entity.Recommendation;
import com._x.TestRegister1.fitness.repository.RecommendationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class ActivityAiService {

    private static final Logger log = LoggerFactory.getLogger(ActivityAiService.class);

    private final GptService gptService;
    private final RecommendationRepository recommendationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ActivityAiService(GptService gptService, RecommendationRepository recommendationRepository) {
        this.gptService = gptService;
        this.recommendationRepository = recommendationRepository;
    }

     public void generateAndSave(Activity activity) {
        try {
            if (!gptService.hasApiKey()) {
                log.warn("API-ключ GigaChat не настроен — сохраняем базовую рекомендацию для активности {}", 
                        activity.getId());
                recommendationRepository.save(createDefaultRecommendation(activity));
                return;
            }

            String prompt = createPromptForActivity(activity);
            log.info("Запрос ИИ-анализа для активности {} (тип: {}, длительность: {} мин)", 
                    activity.getId(), activity.getType(), activity.getDuration());

            String aiResponse = gptService.getAnswer(prompt);
            Recommendation rec = processAiResponse(activity, aiResponse);
            recommendationRepository.save(rec);

            log.info("ИИ-рекомендация сохранена для активности {}", activity.getId());

       } catch (Exception e) {

        log.error("AI generation failed for activity {}", activity.getId(), e);

        recommendationRepository.save(createDefaultRecommendation(activity));

        }       
    }

    private Recommendation processAiResponse(Activity activity, String aiResponse) {

    try {

        log.info("RAW GIGACHAT RESPONSE: {}", aiResponse);

        JsonNode rootNode = objectMapper.readTree(aiResponse);

        JsonNode choicesNode = rootNode.path("choices");

        if (!choicesNode.isArray() || choicesNode.isEmpty()) {

            log.error("choices отсутствует в ответе");

            return createDefaultRecommendation(activity);
        }

        JsonNode messageNode = choicesNode.get(0).path("message");

        String content = messageNode.path("content").asText();

        log.info("AI CONTENT: {}", content);

        if (content == null || content.isBlank()) {

            log.error("AI вернул пустой content");

            return createDefaultRecommendation(activity);
        }

        String jsonContent = content
                .replaceAll("```json\\s*", "")
                .replaceAll("```", "")
                .trim();

        log.info("CLEANED JSON CONTENT: {}", jsonContent);

        if (!jsonContent.startsWith("{")) {

            log.error("AI вернул НЕ JSON: {}", jsonContent);

            return createDefaultRecommendation(activity);
        }

        return parseJsonContent(activity, jsonContent);

    } catch (Exception e) {

        log.error("Ошибка обработки AI ответа", e);

        return createDefaultRecommendation(activity);
    }
}

    private Recommendation parseJsonContent(Activity activity, String jsonContent) {
        try {
            JsonNode analysisJson = objectMapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");

            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Общее: ");
            addAnalysisSection(fullAnalysis, analysisNode, "pace", "Темп: ");
            addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Пульс: ");
            addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurned", "Калории: ");

            List<String> improvements = extractImprovements(analysisJson.path("improvements"));
            List<String> suggestions = extractSuggestions(analysisJson.path("suggestions"));
            List<String> safety = extractSafetyGuideLines(analysisJson.path("safety"));

            Recommendation r = new Recommendation();
            r.setActivityId(activity.getId());
            r.setUserId(activity.getUserId());
            r.setActivityType(activity.getType() != null ? activity.getType().name() : null);
            r.setRecommendation(fullAnalysis.toString().trim());
            r.setImprovements(improvements);
            r.setSuggestions(suggestions);
            r.setSafety(safety);
            return r;

        } catch (Exception e) {
            log.warn("Ошибка парсинга JSON от ИИ для активности {}: {}", activity.getId(), e.getMessage());
            return createDefaultRecommendation(activity);
        }
    }

     private Recommendation createDefaultRecommendation(Activity activity) {
        Recommendation r = new Recommendation();
        r.setActivityId(activity.getId());
        r.setUserId(activity.getUserId());
        r.setActivityType(activity.getType() != null ? activity.getType().name() : null);
        r.setRecommendation("Не удалось получить развёрнутый анализ. Проверьте ключ API или попробуйте позже.");
        r.setImprovements(Collections.singletonList("Продолжайте регулярные тренировки"));
        r.setSuggestions(Collections.singletonList("При необходимости обратитесь к специалисту"));
        r.setSafety(List.of("Разминка перед нагрузкой", "Следите за техникой и самочувствием"));
        return r;
    }

    private List<String> extractSafetyGuideLines(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();
        if (safetyNode.isArray()) {
            safetyNode.forEach(item -> safety.add(item.asText()));
        }
        return safety.isEmpty() ? Collections.singletonList("Соблюдайте общие правила безопасности") : safety;
    }

    private List<String> extractSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if (suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestion -> {
                String workout = suggestion.path("workout").asText();
                String description = suggestion.path("description").asText();
                suggestions.add(String.format("%s: %s", workout, description));
            });
        }
        return suggestions.isEmpty() ? Collections.singletonList("Дополнительных советов нет") : suggestions;
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();
        if (improvementsNode.isArray()) {
            improvementsNode.forEach(improvement -> {
                String area = improvement.path("area").asText();
                String detail = improvement.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, detail));
            });
        }
        return improvements.isEmpty() ? Collections.singletonList("Конкретных улучшений не указано") : improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if (!analysisNode.path(key).isMissingNode()) {
            fullAnalysis.append(prefix).append(analysisNode.path(key).asText()).append("\n\n");
        }
    }

    private String createPromptForActivity(Activity activity) {

    int dur = activity.getDuration() != null ? activity.getDuration() : 0;
    int cal = activity.getCaloriesBurned() != null ? activity.getCaloriesBurned() : 0;

    String type = activity.getType() != null
            ? activity.getType().name()
            : "UNKNOWN";

    return String.format("""
Ты AI фитнес-анализатор.

Верни ТОЛЬКО валидный JSON.

Запрещено:
- markdown
- ```json
- пояснения
- текст вне JSON

Формат ответа:

{
  "analysis": {
    "overall": "текст",
    "pace": "текст",
    "heartRate": "текст",
    "caloriesBurned": "текст"
  },
  "improvements": [
    {
      "area": "область",
      "recommendation": "совет"
    }
  ],
  "suggestions": [
    {
      "workout": "название",
      "description": "описание"
    }
  ],
  "safety": [
    "совет 1",
    "совет 2"
  ]
}

Данные тренировки:

Тип: %s
Длительность: %d минут
Калории: %d
Метрики: %s
""",
            type,
            dur,
            cal,
            String.valueOf(activity.getAdditionalMetrics()));
}
}
