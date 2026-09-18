package com.example.demo.repository;

import com.example.demo.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {
    @Query("SELECT p FROM Page p WHERE p.document.id = :documentId ORDER BY p.pageNumber ASC")
    List<Page> findByDocumentIdOrderByPageNumberAsc(@Param("documentId") Long documentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Page p WHERE p.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);

    @Query("SELECT COUNT(p) FROM Page p WHERE p.document.id = :documentId")
    long countByDocumentId(@Param("documentId") Long documentId);
}
