<?php
// backend/checkout_process.php
date_default_timezone_set('Asia/Karachi');
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
validateToken();

$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    try {
        $db->beginTransaction();
        
        // 1. Add Checkout Items (Mini bar etc)
        if (!empty($data->invoice_items)) {
            $stmt = $db->prepare("INSERT INTO booking_addons (booking_id, service_name, price) VALUES (?, ?, ?)");
            foreach ($data->invoice_items as $item) {
                $stmt->execute([$data->id, $item->name, $item->price]);
            }
        }
        
        // 2. Finalize
        // Note: service_fee field tracks Total Addons ($ Check-in extras + $ Checkout extras)
        // You must calculate the NEW total fee in React and send it here as 'total_services_fee'
        
        $sql = "UPDATE bookings SET 
                status = 'checked_out', 
                check_out_date = ?, 
                service_fee = ?,
                payment_status = 'paid'
                WHERE id = ?";
        
        $today = date('Y-m-d');
        $up = $db->prepare($sql);
        $up->execute([$today, $data->total_services_fee, $data->id]);
        
        // 3. Mark Unit Dirty? (Optional Logic - lets do it)
        $dirty = $db->prepare("UPDATE units SET status = 'dirty' WHERE id = (SELECT unit_id FROM bookings WHERE id = ?)");
        $dirty->execute([$data->id]);

        $db->commit();
        echo json_encode(["message" => "Checked Out & Invoiced Successfully"]);
        
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["message" => "Error processing checkout"]);
    }
} else { http_response_code(400); echo json_encode(["message" => "No ID"]); }
?>