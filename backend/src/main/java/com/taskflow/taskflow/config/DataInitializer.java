package com.taskflow.taskflow.config;

import com.taskflow.taskflow.project.Project;
import com.taskflow.taskflow.project.ProjectRepository;
import com.taskflow.taskflow.task.TaskItem;
import com.taskflow.taskflow.task.TaskRepository;
import com.taskflow.taskflow.task.TaskStatus;
import com.taskflow.taskflow.user.UserAccount;
import com.taskflow.taskflow.user.UserRepository;
import com.taskflow.taskflow.user.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds a couple of users/projects for local exploration.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner loadSampleData(UserRepository userRepository,
                                     ProjectRepository projectRepository,
                                     TaskRepository taskRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            UserAccount admin = UserAccount.builder()
                    .email("admin@taskflow.dev")
                    .fullName("Admin User")
                    .passwordHash(passwordEncoder.encode("changeme"))
                    .build();
            admin.getRoles().add(UserRole.ADMIN);
            userRepository.save(admin);

            UserAccount member = UserAccount.builder()
                    .email("member@taskflow.dev")
                    .fullName("Member User")
                    .passwordHash(passwordEncoder.encode("changeme"))
                    .build();
            member.getRoles().add(UserRole.MEMBER);
            userRepository.save(member);

            Project project = Project.builder()
                    .name("Launch Website")
                    .description("Prepare marketing site launch")
                    .owner(admin)
                    .build();
            projectRepository.save(project);

            TaskItem task = TaskItem.builder()
                    .title("Write landing page copy")
                    .description("Draft hero section and feature blurbs")
                    .status(TaskStatus.IN_PROGRESS)
                    .project(project)
                    .assignee(member)
                    .build();
            taskRepository.save(task);
        };
    }
}

