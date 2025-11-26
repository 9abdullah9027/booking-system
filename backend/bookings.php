<?php
// backend/bookings.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';
include_once 'middleware.php';
include_once 'models/Booking.php';

$user_data = validateToken(); 

$database = new Database();
$db = $database->getConnection();
$booking = new Booking($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: LIST BOOKINGS
if($method === 'GET') {
    $stmt = $booking->read();
    $bookings_arr = [];

    if($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            // Safety defaults
            $row['unit_name'] = $row['unit_name'] ?? 'Unknown Unit';
            $row['property_name'] = $row['property_name'] ?? 'Unknown Property';
            array_push($bookings_arr, $row);
        }
    }
    echo json_encode($bookings_arr);
} 

// POST: CREATE
elseif($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->unit_id) && !empty($data->check_in) && !empty($data->check_out)) {
        
        $booking->unit_id = $data->unit_id;
        $booking->guest_name = $data->guest_name ?? 'Guest';
        $booking->check_in_date = $data->check_in;
        $booking->check_out_date = $data->check_out;
        $booking->total_amount = $data->total_amount ?? 0;

        $result = $booking->create();

        if($result === 'success') {
            http_response_code(201);
            echo json_encode(["message" => "Booking confirmed!", "ref" => $booking->booking_reference]);
        } 
        elseif ($result === 'maintenance_error') {
            http_response_code(400); 
            echo json_encode(["message" => "BLOCKED: Room is under MAINTENANCE."]);
        }
        elseif ($result === 'dirty_error') {
            http_response_code(400); 
            echo json_encode(["message" => "BLOCKED: Room is DIRTY. Clean it first for Today's check-in."]);
        }
        elseif ($result === 'conflict_error') {
            http_response_code(409); 
            echo json_encode(["message" => "BLOCKED: Date conflict with active booking."]);
        }
        else {
            http_response_code(503);
            echo json_encode(["message" => "Database error."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
}

// PUT: UPDATE STATUS
elseif($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if(!empty($data->id) && !empty($data->status)) {
        $booking->id = $data->id;
        if($booking->updateStatus($data->status)) {
            echo json_encode(["message" => "Status updated."]);
        } else {
            http_response_code(503); echo json_encode(["message" => "Failed."]);
        }
    }
}

// DELETE: REMOVE (FOR HISTORY)
elseif($method === 'DELETE') {
    if(isset($_GET['id'])) {
        $booking->id = $_GET['id'];
        if($booking->delete()) {
            echo json_encode(["message" => "Booking record deleted."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Delete failed."]);
        }
    }
}
?>