<?php
// backend/index.php

// Handle CORS (Cross-Origin Resource Sharing)
// This allows your React App (frontend) to communicate with this PHP Backend
header("Access-Control-Allow-Origin: *"); // In production, replace * with your specific domain
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request for security options
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Basic Response
echo json_encode(array("message" => "Welcome to Hotel Booking API", "status" => "Running"));
?>