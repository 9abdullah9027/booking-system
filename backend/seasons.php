<?php
// backend/seasons.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
validateToken();

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM seasonal_rates ORDER BY start_date ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if(!empty($data->name) && !empty($data->start_date) && !empty($data->multiplier)) {
        $stmt = $db->prepare("INSERT INTO seasonal_rates (name, start_date, end_date, multiplier) VALUES (?, ?, ?, ?)");
        if($stmt->execute([$data->name, $data->start_date, $data->end_date, $data->multiplier])) {
            echo json_encode(["message" => "Season Added"]);
        } else http_response_code(500);
    }
}
elseif ($method === 'DELETE' && isset($_GET['id'])) {
    $stmt = $db->prepare("DELETE FROM seasonal_rates WHERE id=?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["message" => "Deleted"]);
}
?>