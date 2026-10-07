package com.smartcanteen.repository;

import com.smartcanteen.entity.AppUser;
import com.smartcanteen.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
}
