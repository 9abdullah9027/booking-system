<?php
// backend/units.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'middleware.php';
$user_data = validateToken(); 

include_once 'models/Unit.php';
$database = new Database();
$db = $database->getConnection();
$unit = new Unit($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $unit->read();
        $num = $stmt->rowCount();
        $units_arr = [];

        if($num > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                array_push($units_arr, $row);
            }
        }
        echo json_encode($units_arr);
        break;

    case 'POST':
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
        break;
        
    case 'DELETE':
        if(isset($_GET['id'])) {
            $unit->id = $_GET['id'];
            if($unit->delete()) {
                echo json_encode(["message" => "Unit deleted."]);
            } else {
                echo json_encode(["message" => "Unable to delete."]);
            }
        }
        break;
}
?>