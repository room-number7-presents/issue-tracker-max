package org.presents.issuetracker.label.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class LabelRepositoryTest {

    @Mock
    private LabelRepository labelRepository;

    @BeforeEach
    void setup() {

    }

    @DisplayName("Label 엔티티가 주어지면 DB에 저장된다")
    @Test
    void saveLabel() {

    }
}