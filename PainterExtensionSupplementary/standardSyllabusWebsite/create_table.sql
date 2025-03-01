CREATE TABLE IF NOT EXISTS syllabi (
    course_id VARCHAR(50) PRIMARY KEY,
    syllabus_data JSON,
    INDEX idx_course_id (course_id)
);
