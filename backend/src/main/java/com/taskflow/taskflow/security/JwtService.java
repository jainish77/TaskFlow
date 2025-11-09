package com.taskflow.taskflow.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.taskflow.taskflow.config.JwtProperties;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

/**
 * Helper class wrapping token creation/verification logic.
 * Centralising it makes swapping to a different JWT provider easy.
 */
@Component
public class JwtService {

    private final JwtProperties properties;
    private final Algorithm algorithm;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.algorithm = Algorithm.HMAC256(properties.getSecret());
    }

    public String createAccessToken(String subject, Map<String, String> claims) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(properties.getIssuer())
                .withSubject(subject)
                .withIssuedAt(now)
                .withExpiresAt(now.plus(properties.getAccessTokenTtl()))
                .withClaim("type", "ACCESS")
                .withPayload(claims)
                .sign(algorithm);
    }

    public String createRefreshToken(String subject) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(properties.getIssuer())
                .withSubject(subject)
                .withIssuedAt(now)
                .withExpiresAt(now.plus(properties.getRefreshTokenTtl()))
                .withClaim("type", "REFRESH")
                .sign(algorithm);
    }

    public DecodedJWT verify(String token) {
        return JWT.require(algorithm)
                .withIssuer(properties.getIssuer())
                .build()
                .verify(token);
    }
}

