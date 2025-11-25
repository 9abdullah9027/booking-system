<?php
// backend/bookings.php

// 1. Set Secure Headers (CORS & Types)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Handle Preflight Requests (For React)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Dependencies
include_once 'config/database.php'; // Ensure DB class is loaded
include_once 'middleware.php';
include_once 'models/Booking.php';

// 4. Validate Security Token
// If token is bad, this script stops here and sends 401 error
$user_data = validateToken(); 

// 5. Connect to Database
$database = new Database();
$db = $database->getConnection();
$booking = new Booking($db);

$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------
// GET REQUEST: List all Bookings
// ---------------------------------------------------------
if($method === 'GET') {
    $stmt = $booking->read();
    $bookings_arr = [];

    // Check if any rows were returned
    if($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            // Explicitly build the array to be safe against null values
            $item = array(
                "id" => $row['id'],
                "booking_reference" => $row['booking_reference'],
                "guest_name" => $row['guest_name'],
                "check_in_date" => $row['check_in_date'],
                "check_out_date" => $row['check_out_date'],
                "total_amount" => $row['total_amount'],
                "status" => $row['status'],
                // Handle missing property/unit names nicely
                "unit_name" => isset($row['unit_name']) ? $row['unit_name'] : "Unknown Unit",
                "property_name" => isset($row['property_name']) ? $row['property_name'] : "Unknown Property",
                "unit_id" => isset($row['unit_id']) ? $row['unit_id'] : 0
            );
            array_push($bookings_arr, $item);
        }
    }
    
    // Always return a valid JSON array, even if empty
    echo json_encode($bookings_arr);

} 

// ---------------------------------------------------------
// POST REQUEST: Create New Booking
// ---------------------------------------------------------
elseif($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Validation: Check strictly for required fields
    if(
        !empty($data->unit_id) && 
        !empty($data->check_in) && 
        !empty($data->check_out)
    ) {
        // Pass data to Model
        $booking->unit_id = $data->unit_id;
        $booking->guest_name = $data->guest_name ?? 'Guest'; // Default guest name if empty
        $booking->check_in_date = $data->check_in;
        $booking->check_out_date = $data->check_out;
        $booking->total_amount = $data->total_amount ?? 0;

        // Try to create the booking
        // The model returns TRUE if saved, FALSE if double-booked
        if($booking->create()) {
            http_response_code(201); // 201 Created
            echo json_encode([
                "message" => "Booking confirmed!", 
                "ref" => $booking->booking_reference
            ]);
        } else {
            http_response_code(409); // 409 Conflict
            echo json_encode(["message" => "Booking Failed: Room is already booked for these dates."]);
        }
    } else {
        http_response_code(400); // 400 Bad Request
        echo json_encode(["message" => "Incomplete data. Please check dates and unit."]);
    }
}
?>