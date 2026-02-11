-- Create sections table
CREATE TABLE sections (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Add section_id column to lessons table
ALTER TABLE lessons ADD COLUMN section_id CHAR(36);
ALTER TABLE lessons ADD FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;