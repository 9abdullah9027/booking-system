<?php
// backend/properties.php

// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Authentication Middleware
include_once 'middleware.php';
// This line halts execution if no valid token is found
$user_data = validateToken(); 

// 3. Database
include_once 'models/Property.php';
$database = new Database();
$db = $database->getConnection();
$property = new Property($db);

$method = $_SERVER['REQUEST_METHOD'];

// 4. Handle Actions
switch($method) {
    case 'GET':
        // List properties
        $stmt = $property->read();
        $num = $stmt->rowCount();
        $properties_arr = [];

        if($num > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                extract($row);
                $item = [
                    "id" => $id,
                    "name" => $name,
                    "address" => $address,
                    "type" => $type
                ];
                array_push($properties_arr, $item);
            }
        }
        echo json_encode($properties_arr);
        break;

    case 'POST':
        // Create Property
        $data = json_decode(file_get_contents("php://input"));
        
        // Basic Validation
        if(!empty($data->name) && !empty($data->address)) {
            $property->name = $data->name;
            $property->address = $data->address;
            $property->type = $data->type ?? 'Hotel'; // Default to Hotel

            if($property->create()) {
                http_response_code(201);
                echo json_encode(["message" => "Property created."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create property."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Data is incomplete."]);
        }
        break;
        
    case 'DELETE':
        // Delete Property
        // Get ID from URL query ?id=12
        if(isset($_GET['id'])) {
            $property->id = $_GET['id'];
            if($property->delete()) {
                echo json_encode(["message" => "Property deleted."]);
            } else {
                echo json_encode(["message" => "Unable to delete."]);
            }
        }
        break;
}
?>