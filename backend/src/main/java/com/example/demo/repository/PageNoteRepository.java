package com.example.demo.repository;
import com.example.demo.domain.PageNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface PageNoteRepository extends JpaRepository<PageNote, Long> {
    List<PageNote> findByDocumentId(Long documentId);
}
