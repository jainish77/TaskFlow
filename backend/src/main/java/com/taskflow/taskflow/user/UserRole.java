package com.taskflow.taskflow.user;

/**
 * Simple role enum used by Spring Security's role voter.
 * Values are stored as strings in the database thanks to JPA's @Enumerated on the owning entity field.
 */
public enum UserRole {
    ADMIN,
    MEMBER
}

