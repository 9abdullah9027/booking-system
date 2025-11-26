<?php
// backend/units.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Unit.php';

// 1. Security Check
$user_data = validateToken();

$database = new Database();
$db = $database->getConnection();
$unit = new Unit($db);

$method = $_SERVER['REQUEST_METHOD'];

// ------------------------------------------------
// GET: LIST UNITS
// ------------------------------------------------
if($method === 'GET') {
    $stmt = $unit->read();
    $units_arr = [];

    if($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            // Ensure numeric values are numbers for JS
            $row['base_price'] = floatval($row['base_price']);
            $row['property_name'] = $row['property_name'] ?? 'Unknown Property';
            array_push($units_arr, $row);
        }
    }
    // Return [] if empty, so frontend doesn't crash
    echo json_encode($units_arr);
}

// ------------------------------------------------
// POST: ADD UNIT
// ------------------------------------------------
elseif($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->property_id) && !empty($data->unit_name)) {
        $unit->property_id = $data->property_id;
        $unit->unit_name = $data->unit_name;
        $unit->base_price = $data->base_price ?? 0;
        $unit->status = 'clean'; 

        if($unit->create()) {
            http_response_code(201);
            echo json_encode(["message" => "Unit created."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create unit."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Data incomplete."]);
    }
}

// ------------------------------------------------
// PUT: UPDATE STATUS (HOUSEKEEPING)
// ------------------------------------------------
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->id) && !empty($data->status)) {
        $unit->id = $data->id;
        
        $valid = ['clean', 'dirty', 'maintenance', 'needs_cleaning'];
        
        if(in_array($data->status, $valid)) {
            if($unit->updateStatus($data->status)) {
                echo json_encode(["message" => "Status updated"]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Update failed"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid status"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "ID/Status required"]);
    }
}

// ------------------------------------------------
// DELETE: REMOVE UNIT
// ------------------------------------------------
elseif($method === 'DELETE') {
    if(isset($_GET['id'])) {
        $unit->id = $_GET['id'];
        if($unit->delete()) {
            echo json_encode(["message" => "Unit deleted."]);
        } else {
            echo json_encode(["message" => "Unable to delete."]);
        }
    }
}
?>