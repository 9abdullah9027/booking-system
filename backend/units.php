<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Unit.php';
validateToken(); 

$db = (new Database())->getConnection();
$unit = new Unit($db);
$method = $_SERVER['REQUEST_METHOD'];

// GET
if($method === 'GET') {
    $stmt = $unit->read();
    $arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        $row['base_price'] = floatval($row['base_price']);
        array_push($arr, $row);
    }
    echo json_encode($arr);
}

// POST (Handle Create AND Update with File Upload)
elseif($method === 'POST') {
    // Check if ID exists in POST data => UPDATE MODE
    $id = $_POST['id'] ?? null;
    
    if(!empty($_POST['property_id']) && !empty($_POST['unit_name'])) {
        $unit->property_id = $_POST['property_id'];
        $unit->unit_name = $_POST['unit_name'];
        $unit->base_price = $_POST['base_price'] ?? 0;
        $unit->image_path = null;

        // File Upload Logic
        if(isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            if(in_array(strtolower($ext), $allowed)) {
                $new_name = uniqid("UNIT_") . "." . $ext;
                if(move_uploaded_file($_FILES['image']['tmp_name'], "uploads/units/" . $new_name)) {
                    $unit->image_path = $new_name;
                }
            }
        }

        if($id) {
            // Update Existing
            $unit->id = $id;
            if($unit->update()) echo json_encode(["message" => "Unit updated"]);
            else { http_response_code(500); echo json_encode(["message" => "Update failed"]); }
        } else {
            // Create New
            if($unit->create()) echo json_encode(["message" => "Unit created"]);
            else { http_response_code(500); echo json_encode(["message" => "Creation failed"]); }
        }
    } else {
        http_response_code(400); echo json_encode(["message" => "Incomplete Data"]);
    }
}

// PUT (Simple Status Updates from Housekeeping)
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if(!empty($data->id) && !empty($data->status)) {
        $unit->id = $data->id;
        if($unit->updateStatus($data->status)) echo json_encode(["message" => "Status updated"]);
        else http_response_code(500);
    }
}

// DELETE
elseif($method === 'DELETE' && isset($_GET['id'])) {
    $unit->id = $_GET['id'];
    $unit->delete(); echo json_encode(["message" => "Deleted"]);
}
?>