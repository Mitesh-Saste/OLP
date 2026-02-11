CREATE TABLE certificate (
    id CHAR(36) PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    issue_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
