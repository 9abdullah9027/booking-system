<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Service.php';

$user_data = validateToken();
$database = new Database();
$db = $database->getConnection();
$service = new Service($db);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $service->read();
    $arr = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['price'] = floatval($row['price']); // Ensure number type
        array_push($arr, $row);
    }
    echo json_encode($arr);
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $service->name = $data->name;
    $service->price = $data->price;
    $service->category = $data->category ?? 'General';
    if($service->create()) echo json_encode(["message"=>"Service added"]);
    else { http_response_code(503); echo json_encode(["message"=>"Failed"]); }
}
// NEW: PUT (Edit Service)
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if(!empty($data->id) && !empty($data->name) && !empty($data->price)) {
        $sql = "UPDATE services SET name = ?, price = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        if($stmt->execute([$data->name, $data->price, $data->id])) {
            echo json_encode(["message" => "Service updated"]);
        } else {
            http_response_code(503); echo json_encode(["message" => "Update failed"]);
        }
    }
}
elseif ($method === 'DELETE' && isset($_GET['id'])) {
    if($user_data->role !== 'super_admin') { http_response_code(403); exit(); }
    $service->id = $_GET['id'];
    $service->delete();
    echo json_encode(["message"=>"Deleted"]);
}
?>