<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Logger.php';

$user_data = validateToken();

// Only Super Admin can view logs
if($user_data->role !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access Denied"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$logger = new Logger($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $logger->readAll();
    $logs = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        array_push($logs, $row);
    }
    echo json_encode($logs);
}
?>