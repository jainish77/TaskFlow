package com.taskflow.taskflow.user;

import com.taskflow.taskflow.user.dto.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for user management. In bigger apps, you'd split enrolment vs admin features.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        // Constructor injection simplifies testing and makes dependencies explicit.
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    public UserAccount createMember(String email, String fullName, String rawPassword) {
        // Hash the raw password before persisting the user record.
        UserAccount user = UserAccount.builder()
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .build();
        user.getRoles().add(UserRole.MEMBER);
        return userRepository.save(user);
    }

    public boolean emailTaken(String email) {
        // Used during registration to show a friendly "already exists" message.
        return userRepository.existsByEmailIgnoreCase(email);
    }

    public UserAccount getByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    public List<UserDto> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .toList();
    }

    /**
     * MapStruct mapper converts between entity and DTO by convention.
     * It runs at compile-time, generating the implementation under the hood.
     */
    @Mapper(componentModel = "spring")
    public interface UserMapper {
        @Mapping(target = "roles", expression = "java(user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet()))")
        UserDto toDto(UserAccount user);
    }
}

