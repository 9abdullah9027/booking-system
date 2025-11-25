<?php
// backend/dashboard.php

// Ensure this matches your Model's Timezone
date_default_timezone_set('Asia/Karachi'); 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';
include_once 'middleware.php';

// Security
$user_data = validateToken();

$database = new Database();
$db = $database->getConnection();

$today = date('Y-m-d');
$current_month = date('Y-m');

$stats = [
    "check_ins_today" => 0,
    "check_outs_today" => 0,
    "active_bookings" => 0,
    "total_revenue" => "0.00",
    "rooms_total" => 0,
    "rooms_dirty" => 0,
    "rooms_maint" => 0
];

// 1. TODAY'S ACTIONS
// FIXED: 'check_outs' now counts both PENDING and COMPLETED check-outs for today.
$query = "SELECT 
    SUM(CASE WHEN check_in_date = '$today' AND status IN ('confirmed', 'checked_in') THEN 1 ELSE 0 END) as check_ins,
    SUM(CASE WHEN check_out_date = '$today' AND status IN ('checked_in', 'checked_out') THEN 1 ELSE 0 END) as check_outs,
    SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as active_guests,
    SUM(CASE WHEN check_in_date LIKE '$current_month%' AND status != 'cancelled' THEN total_amount ELSE 0 END) as revenue
FROM bookings";

$stmt = $db->prepare($query);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row) {
    $stats['check_ins_today'] = $row['check_ins'] ?? 0;
    $stats['check_outs_today'] = $row['check_outs'] ?? 0;
    $stats['active_bookings'] = $row['active_guests'] ?? 0;
    $stats['total_revenue'] = $row['revenue'] ? number_format($row['revenue'], 2) : "0.00";
}

// 2. ROOM STATS
$query_units = "SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'dirty' THEN 1 ELSE 0 END) as dirty,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maint
FROM units";
$stmt_u = $db->prepare($query_units);
$stmt_u->execute();
$row_u = $stmt_u->fetch(PDO::FETCH_ASSOC);

if($row_u) {
    $stats['rooms_total'] = $row_u['total'] ?? 0;
    $stats['rooms_dirty'] = $row_u['dirty'] ?? 0;
    $stats['rooms_maint'] = $row_u['maint'] ?? 0;
}

echo json_encode($stats);
?>