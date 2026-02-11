CREATE TABLE section_quiz (
    id CHAR(36) PRIMARY KEY,
    section_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    pass_percentage INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE quiz_question (
    id CHAR(36) PRIMARY KEY,
    quiz_id CHAR(36) NOT NULL,
    question TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES section_quiz(id) ON DELETE CASCADE
);

CREATE TABLE quiz_option (
    id CHAR(36) PRIMARY KEY,
    question_id CHAR(36) NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES quiz_question(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempt (
    id CHAR(36) PRIMARY KEY,
    quiz_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    passed BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES section_quiz(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);