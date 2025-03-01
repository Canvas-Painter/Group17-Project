<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once('db-connector.php');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get course ID from query parameters
        $courseId = isset($_GET['courseId']) ? $_GET['courseId'] : null;
        
        if (!$courseId) {
            throw new Exception('Course ID is required');
        }

        // Prepare and execute query to get syllabus data
        $stmt = $db->prepare("SELECT syllabus_data FROM syllabi WHERE course_id = ?");
        $stmt->execute([$courseId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            echo $result['syllabus_data']; // Already in JSON format
        } else {
            // Return default structure if no data exists
            echo json_encode([
                'version' => '0.1.1',
                'categories' => [
                    [
                        'name' => 'Course Information',
                        'items' => [
                            ['type' => 'Course Title', 'text' => ''],
                            ['type' => 'Professor', 'text' => ''],
                            ['type' => 'Email', 'text' => ''],
                            ['type' => 'Office Hours', 'text' => '']
                        ]
                    ]
                ]
            ]);
        }
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get POST data
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['courseId']) || !isset($input['data'])) {
            throw new Exception('Course ID and data are required');
        }

        $courseId = $input['courseId'];
        $syllabusData = json_encode($input['data']); // Convert to JSON string for storage

        // Try to update existing record first
        $stmt = $db->prepare("
            INSERT INTO syllabi (course_id, syllabus_data, updated_at) 
            VALUES (?, ?, NOW()) 
            ON DUPLICATE KEY UPDATE 
                syllabus_data = VALUES(syllabus_data),
                updated_at = VALUES(updated_at)
        ");

        $stmt->execute([$courseId, $syllabusData]);

        echo json_encode(['status' => 'success', 'message' => 'Syllabus data saved successfully']);
    }
    else {
        throw new Exception('Invalid request method');
    }
} 
catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
