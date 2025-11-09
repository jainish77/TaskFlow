package com.taskflow.taskflow.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Tells Spring to read our custom configuration classes.
 */
@Configuration
@EnableConfigurationProperties({JwtProperties.class})
public class ApplicationConfig {
}

