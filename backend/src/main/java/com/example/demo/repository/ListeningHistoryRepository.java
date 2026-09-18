package com.example.demo.repository;
import com.example.demo.domain.ListeningHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {
    List<ListeningHistory> findByUserId(Long userId);
    Optional<ListeningHistory> findByUserIdAndDocumentId(Long userId, Long documentId);
}
