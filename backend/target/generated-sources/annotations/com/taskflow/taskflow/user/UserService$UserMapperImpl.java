package com.taskflow.taskflow.user;

import com.taskflow.taskflow.user.dto.UserDto;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-09T16:07:09-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Homebrew)"
)
@Component
public class UserService$UserMapperImpl implements UserService.UserMapper {

    @Override
    public UserDto toDto(UserAccount user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String email = null;
        String fullName = null;

        id = user.getId();
        email = user.getEmail();
        fullName = user.getFullName();

        Set<String> roles = user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet());

        UserDto userDto = new UserDto( id, email, fullName, roles );

        return userDto;
    }
}
