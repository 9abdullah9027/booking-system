<?php
// backend/export.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
validateToken(); // Security Check

$database = new Database();
$db = $database->getConnection();

// Get Month Filter (Optional, defaults to all)
$month = isset($_GET['month']) ? $_GET['month'] : ''; // Format YYYY-MM

$query = "SELECT 
            b.booking_reference, b.guest_name, 
            u.unit_name, 
            b.check_in_date, b.check_out_date, 
            b.total_amount, b.service_fee, b.status, 
            b.payment_status, b.payment_method
          FROM bookings b
          LEFT JOIN units u ON b.unit_id = u.id";

if($month) {
    $query .= " WHERE b.check_in_date LIKE '$month%'";
}

$query .= " ORDER BY b.check_in_date DESC";

$stmt = $db->prepare($query);
$stmt->execute();

// OUTPUT CSV HEADERS
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="bookings_report_' . date('Y-m-d') . '.csv"');

$output = fopen('php://output', 'w');

// CSV Column Headers
fputcsv($output, ['Reference', 'Guest Name', 'Room', 'Check In', 'Check Out', 'Room Revenue', 'Extras/Services', 'Total', 'Status', 'Payment', 'Method']);

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $total_bill = floatval($row['total_amount']) + floatval($row['service_fee']);
    fputcsv($output, [
        $row['booking_reference'],
        $row['guest_name'],
        $row['unit_name'],
        $row['check_in_date'],
        $row['check_out_date'],
        $row['total_amount'],
        $row['service_fee'],
        $total_bill,
        $row['status'],
        $row['payment_status'],
        $row['payment_method']
    ]);
}

fclose($output);
?>