package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "pages")
@Data
public class Page {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Document document;

    private Integer pageNumber;

    @Column(columnDefinition = "TEXT")
    private String originalText;

    @Column(columnDefinition = "TEXT")
    private String summaryText;

    private java.time.LocalDateTime summaryCachedAt;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Translation> translations;

    public void setDocumentId(Long documentId) {
        if (this.document == null) {
            this.document = new Document();
        }
        this.document.setId(documentId);
    }

    public Long getDocumentId() {
        return this.document != null ? this.document.getId() : null;
    }
}
