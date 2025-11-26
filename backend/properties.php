<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Property.php';
validateToken();

$database = new Database();
$db = $database->getConnection();
$property = new Property($db);
$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    $stmt = $property->read();
    $arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) array_push($arr, $row);
    echo json_encode($arr);
}

// POST (Create)
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if(!empty($data->name) && !empty($data->address)) {
        $property->name = $data->name;
        $property->address = $data->address;
        $property->type = $data->type ?? 'Hotel';
        if($property->create()) echo json_encode(["message" => "Property created"]);
        else { http_response_code(503); echo json_encode(["message" => "Failed"]); }
    } else { http_response_code(400); echo json_encode(["message" => "Incomplete data"]); }
}

// PUT (Update)
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if(!empty($data->id) && !empty($data->name)) {
        $property->id = $data->id;
        $property->name = $data->name;
        $property->address = $data->address;
        $property->type = $data->type ?? 'Hotel';
        
        if($property->update()) echo json_encode(["message" => "Property updated"]);
        else { http_response_code(503); echo json_encode(["message" => "Update failed"]); }
    }
}

// DELETE
elseif ($method === 'DELETE' && isset($_GET['id'])) {
    $property->id = $_GET['id'];
    if($property->delete()) echo json_encode(["message" => "Property deleted"]);
    else echo json_encode(["message" => "Delete failed"]);
}
?>