package com.example.demo.service;

import com.example.demo.domain.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public String registerUser(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);

        return tokenProvider.generateTokenFromEmail(email);
    }

    public String loginWithGoogle(String idTokenString, String clientId) throws Exception {
        com.google.api.client.http.HttpTransport transport = new com.google.api.client.http.javanet.NetHttpTransport();
        com.google.api.client.json.JsonFactory jsonFactory = com.google.api.client.json.gson.GsonFactory.getDefaultInstance();

        com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(java.util.Collections.singletonList(clientId))
                .build();

        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            
            // Upsert User
            User user = userRepository.findByEmail(email).orElse(new User());
            user.setEmail(email);
            if (user.getName() == null || user.getName().isEmpty()) {
                user.setName(name);
            }
            if (user.getPasswordHash() == null) {
                user.setPasswordHash("OAUTH_USER");
            }
            userRepository.save(user);

            return tokenProvider.generateTokenFromEmail(email);
        } else {
            throw new RuntimeException("Invalid ID token.");
        }
    }
}
