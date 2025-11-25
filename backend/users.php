<?php
// backend/users.php

// Debugging Lines (Remove these after fixing!)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/User.php';

$user_data = validateToken();

// Only Super Admin can manage users
if($user_data->role !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admin only."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    $stmt = $user->read();
    $users_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        array_push($users_arr, $row);
    }
    echo json_encode($users_arr);
} 

// POST
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->full_name) && !empty($data->email) && !empty($data->password)) {
        $user->full_name = $data->full_name;
        $user->email = $data->email;
        $user->password = $data->password;
        $user->role = $data->role;

        if($user->emailExists()) {
            http_response_code(400);
            echo json_encode(["message" => "Email exists"]);
        } else {
            if($user->create()) {
                http_response_code(201);
                echo json_encode(["message" => "User created"]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error creating"]);
            }
        }
    } else {
        echo json_encode(["message" => "Incomplete data"]);
    }
} 

// DELETE
elseif ($method === 'DELETE') {
    if(isset($_GET['id'])) {
        $target = intval($_GET['id']);
        if($target === 1 || $target === intval($user_data->user_id)) {
            http_response_code(403);
            echo json_encode(["message" => "Cannot delete Root/Self"]);
            exit();
        }
        $user->id = $target;
        if($user->delete()) echo json_encode(["message" => "Deleted"]);
        else echo json_encode(["message" => "Failed"]);
    }
}
?>