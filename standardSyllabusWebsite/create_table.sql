CREATE TABLE IF NOT EXISTS syllabi (
    course_id VARCHAR(50) PRIMARY KEY,
    syllabus_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_id (course_id)
);
