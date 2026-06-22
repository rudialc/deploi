package com._x.TestRegister1.fitness.service;

import com._x.TestRegister1.Models.Role;
import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.Repository.UserRepository;
import com._x.TestRegister1.fitness.dto.AddStudentRequest;
import com._x.TestRegister1.fitness.dto.CoachStudentFullResponse;
import com._x.TestRegister1.fitness.entity.CoachStudentLink;
import com._x.TestRegister1.fitness.entity.UserProfile;
import com._x.TestRegister1.fitness.repository.CoachStudentLinkRepository;
import com._x.TestRegister1.fitness.repository.UserProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CoachService {

    private final UserRepository userRepository;
    private final CoachStudentLinkRepository coachStudentLinkRepository;
    private final UserProfileRepository profileRepository;   // имя поля исправлено

    public CoachService(UserRepository userRepository,
                        CoachStudentLinkRepository coachStudentLinkRepository,
                        UserProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.coachStudentLinkRepository = coachStudentLinkRepository;
        this.profileRepository = profileRepository;
    }

    // Поиск пользователей по строке (только роль USER)
    public List<CoachStudentFullResponse> searchStudents(String query) {
        List<User> users = userRepository
            .findByRoleAndUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                Role.USER, query, query);
        return users.stream()
                .map(this::toFullResponse)
                .collect(Collectors.toList());
    }

    // Список моих учеников с аватарами
    public List<CoachStudentFullResponse> getMyStudents(User coach) {
        List<CoachStudentLink> links = coachStudentLinkRepository.findByTrainerId(coach.getId());
        List<Long> studentIds = links.stream()
                .map(CoachStudentLink::getStudentId)
                .collect(Collectors.toList());
        if (studentIds.isEmpty()) return List.of();
        List<User> students = userRepository.findAllById(studentIds);
        return students.stream()
                .map(this::toFullResponse)
                .collect(Collectors.toList());
    }

    // Добавление ученика (основной метод, используется в контроллере)
    @Transactional
    public CoachStudentFullResponse addStudent(User trainer, AddStudentRequest request) {
        requireTrainer(trainer);
        User student = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));

        if (student.getId().equals(trainer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Нельзя добавить себя");
        }
        if (student.getRole() != Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Учеником может быть только спортсмен");
        }

        Optional<CoachStudentLink> existingLink = coachStudentLinkRepository.findByStudentId(student.getId());
        if (existingLink.isPresent()) {
            if (existingLink.get().getTrainerId().equals(trainer.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ученик уже привязан к вам");
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ученик уже привязан к другому тренеру");
            }
        }

        CoachStudentLink link = new CoachStudentLink();
        link.setTrainerId(trainer.getId());
        link.setStudentId(student.getId());
        coachStudentLinkRepository.save(link);

        return toFullResponse(student);
    }

    // Удаление ученика
    @Transactional
    public void removeStudent(User trainer, Long studentUserId) {
        requireTrainer(trainer);
        coachStudentLinkRepository.deleteByTrainerIdAndStudentId(trainer.getId(), studentUserId);
    }

    private void requireTrainer(User user) {
        if (user.getRole() != Role.TRAINER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Доступно только тренерам");
        }
    }

    private CoachStudentFullResponse toFullResponse(User user) {
        String avatarUrl = profileRepository.findByUser(user)
                .map(UserProfile::getAvatarUrl)
                .orElse(null);
        return new CoachStudentFullResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                avatarUrl
        );
    }
}