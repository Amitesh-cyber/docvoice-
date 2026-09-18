package com.example.demo.repository;

import com.example.demo.domain.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    Optional<Translation> findByPageIdAndLanguageCode(Long pageId, String languageCode);
}
