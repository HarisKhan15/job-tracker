package com.haris.jobtracker.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Single-user app: one username/password taken from environment variables
 * (APP_USERNAME / APP_PASSWORD). The Angular app sends them as HTTP Basic on
 * every /api call, so nothing breaks when the free server restarts.
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll())
            // Plain 401 without the WWW-Authenticate header, so the browser never shows its own popup
            .httpBasic(basic -> basic.authenticationEntryPoint(
                (request, response, ex) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
            .headers(h -> h.frameOptions(f -> f.sameOrigin()));
        return http.build();
    }

    @Bean
    UserDetailsService userDetailsService(
            @Value("${app.username}") String username,
            @Value("${app.password}") String password) {
        return new InMemoryUserDetailsManager(
            User.withUsername(username)
                .password("{noop}" + password)
                .roles("USER")
                .build());
    }
}
