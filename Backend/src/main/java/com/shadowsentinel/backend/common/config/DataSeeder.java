package com.shadowsentinel.backend.common.config;

import com.shadowsentinel.backend.policy.entity.Policy;
import com.shadowsentinel.backend.policy.repository.PolicyRepository;
import com.shadowsentinel.backend.user.entity.User;
import com.shadowsentinel.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PolicyRepository policyRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.policyRepository = policyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedPolicies();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@shadowsentinel.com")) {
            User admin = new User(
                    "admin@shadowsentinel.com",
                    passwordEncoder.encode("Admin@123456"),
                    "ADMIN",
                    "CORP_ORG"
            );
            userRepository.save(admin);
            log.info("Seeded default admin user: admin@shadowsentinel.com");
        }

        if (!userRepository.existsByEmail("user@shadowsentinel.com")) {
            User user = new User(
                    "user@shadowsentinel.com",
                    passwordEncoder.encode("User@123456"),
                    "USER",
                    "CORP_ORG"
            );
            userRepository.save(user);
            log.info("Seeded default standard user: user@shadowsentinel.com");
        }
    }

    private void seedPolicies() {
        if (!policyRepository.existsByName("Default Unapproved AI Policy")) {
            Policy policy = new Policy(
                    "Default Unapproved AI Policy",
                    "Demo policy: Alert on unapproved generative AI tool usage",
                    "*openai.com*",
                    "HIGH",
                    "ALERT",
                    true
            );
            policyRepository.save(policy);
            log.info("Seeded demo policy: Default Unapproved AI Policy");
        }
    }
}
