package com.example.demo.repository;

import com.example.demo.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);
    List<Document> findByStatusAndUploadDateBefore(String status, java.time.LocalDateTime date);
    List<Document> findByStatusIn(List<String> statuses);
}
