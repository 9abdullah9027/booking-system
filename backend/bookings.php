<?php
// backend/bookings.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Booking.php';
include_once 'models/Logger.php'; // Added Logger

$user_data = validateToken(); 
$database = new Database();
$db = $database->getConnection();
$booking = new Booking($db);
$logger = new Logger($db); // Init Logger

// Helper to get User Info for Logging
$uid = $user_data->user_id;
$uname = $user_data->email; // Or fetch name if needed

$method = $_SERVER['REQUEST_METHOD'];

if($method === 'GET') {
    $res = $booking->read();
    $arr=[]; 
    while($row=$res->fetch(PDO::FETCH_ASSOC)) {
        $s = $db->prepare("SELECT service_name as name, price FROM booking_addons WHERE booking_id = ?");
        $s->execute([$row['id']]);
        $row['addons'] = $s->fetchAll(PDO::FETCH_ASSOC);
        $arr[] = $row;
    }
    echo json_encode($arr);
} 
elseif($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $booking->unit_id = $data->unit_id;
    $booking->guest_name = $data->guest_name;
    $booking->check_in_date = $data->check_in;
    $booking->check_out_date = $data->check_out;
    $booking->total_amount = $data->total_amount;
    $booking->booking_reference = isset($data->booking_reference) ? $data->booking_reference : '';

    $r = $booking->create();
    if($r==='success') {
        // LOG IT
        $logger->log($uid, $uname, "CREATE BOOKING", "Ref: " . $booking->booking_reference);
        http_response_code(201); 
        echo json_encode(["message"=>"Booking confirmed!", "ref"=>$booking->booking_reference]);
    }
    elseif($r==='maintenance_error') {http_response_code(400); echo json_encode(["message"=>"BLOCKED: Maintenance"]);}
    elseif($r==='dirty_error') {http_response_code(400); echo json_encode(["message"=>"BLOCKED: Room Dirty"]);}
    elseif($r==='conflict_error') {http_response_code(409); echo json_encode(["message"=>"BLOCKED: Date Overlap"]);}
    else {http_response_code(503); echo json_encode(["message"=>"Db Error"]);}
}
elseif($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(isset($data->edit_mode)) {
        // EDIT MODE
        $sql = "UPDATE bookings SET guest_name=?, unit_id=?, check_in_date=?, check_out_date=?, total_amount=? WHERE id=?";
        $stmt = $db->prepare($sql);
        if($stmt->execute([$data->guest_name, $data->unit_id, $data->check_in, $data->check_out, $data->total_amount, $data->id])) {
            $logger->log($uid, $uname, "EDIT BOOKING", "Updated Booking ID: " . $data->id);
            echo json_encode(["message"=>"Updated"]);
        } else { http_response_code(500); echo json_encode(["message"=>"Error"]); }
    } else {
        // STATUS UPDATE
        $booking->id = $data->id;
        $booking->service_fee = $data->service_fee ?? 0;
        $booking->payment_status = $data->payment_status ?? 'pending';
        $booking->payment_method = $data->payment_method ?? 'n/a';
        
        if($booking->updateStatus($data->status)) {
            $logger->log($uid, $uname, "STATUS CHANGE", "Booking ID " . $data->id . " -> " . $data->status);
            echo json_encode(["message"=>"Status Updated"]);
        } else { http_response_code(500); echo json_encode(["message"=>"Fail"]); }
    }
}
elseif($method === 'DELETE' && isset($_GET['id'])) {
    $booking->id = $_GET['id'];
    if($booking->delete()) {
        $logger->log($uid, $uname, "DELETE BOOKING", "Deleted Booking ID: " . $_GET['id']);
        echo json_encode(["message"=>"Deleted"]);
    } else { 
        http_response_code(503); echo json_encode(["message"=>"Failed"]); 
    }
}
?>