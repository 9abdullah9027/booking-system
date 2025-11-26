<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Guest.php';
$user_data = validateToken();

$database = new Database();
$db = $database->getConnection();
$guest = new Guest($db);
$method = $_SERVER['REQUEST_METHOD'];

// GET
if($method === 'GET') {
    if(isset($_GET['search'])) $stmt = $guest->search($_GET['search']);
    else $stmt = $guest->read();
    
    $arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) array_push($arr, $row);
    echo json_encode($arr);
}

// POST (Create OR Update)
elseif($method === 'POST') {
    // Determine ID (If present, we are editing)
    $id = $_POST['id'] ?? null; 
    
    if(!empty($_POST['full_name'])) {
        $guest->full_name = $_POST['full_name'];
        $guest->email = $_POST['email'] ?? '';
        $guest->phone = $_POST['phone'] ?? '';
        $guest->id_number = $_POST['id_number'] ?? '';
        
        // Default: keep existing image if not replacing
        $image_change = false;

        // Upload Logic
        if(isset($_FILES['id_card']) && $_FILES['id_card']['error'] === 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
            $ext = pathinfo($_FILES['id_card']['name'], PATHINFO_EXTENSION);
            if(in_array(strtolower($ext), $allowed)) {
                $new_name = uniqid("ID_") . "." . $ext;
                if(move_uploaded_file($_FILES['id_card']['tmp_name'], "uploads/ids/" . $new_name)) {
                    $guest->id_card_image = $new_name;
                    $image_change = true;
                }
            }
        }

        if($id) {
            // --- UPDATE LOGIC ---
            $sql = "UPDATE guests SET full_name=?, email=?, phone=?, id_number=?";
            $params = [$guest->full_name, $guest->email, $guest->phone, $guest->id_number];
            if($image_change) {
                $sql .= ", id_card_image=?";
                $params[] = $guest->id_card_image;
            }
            $sql .= " WHERE id=?";
            $params[] = $id;

            $stmt = $db->prepare($sql);
            if($stmt->execute($params)) echo json_encode(["message" => "Guest updated."]);
            else { http_response_code(503); echo json_encode(["message" => "Update failed."]); }
        
        } else {
            // --- CREATE LOGIC ---
            $guest->create() ? http_response_code(201) && print(json_encode(["message"=>"Created"])) : http_response_code(503);
        }

    } else { http_response_code(400); echo json_encode(["message"=>"Name required"]); }
}

// DELETE
elseif($method === 'DELETE' && isset($_GET['id'])) {
    $guest->id = $_GET['id'];
    $guest->delete();
    echo json_encode(["message"=>"Deleted"]);
}
?>