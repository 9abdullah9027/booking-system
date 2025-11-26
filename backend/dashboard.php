<?php
date_default_timezone_set('Asia/Karachi');
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once 'config/database.php';
include_once 'middleware.php';
validateToken();

$db = (new Database())->getConnection();
$today = date('Y-m-d');
$month = date('Y-m');

$stats = [];

// 1. BASIC STATS
$q1 = "SELECT 
    SUM(CASE WHEN check_in_date LIKE '$month%' THEN total_amount ELSE 0 END) as income,
    SUM(CASE WHEN status='checked_in' THEN 1 ELSE 0 END) as active,
    (SELECT COUNT(*) FROM units) as total_units,
    (SELECT COUNT(*) FROM units WHERE status='clean') as clean_units,
    (SELECT COUNT(*) FROM units WHERE status='dirty') as dirty_units,
    (SELECT COUNT(*) FROM units WHERE status='maintenance') as maint_units
FROM bookings";
$row = $db->query($q1)->fetch(PDO::FETCH_ASSOC);

$stats['total_income'] = $row['income'] ?? 0;
$stats['active_customers'] = $row['active'];
$stats['total_units'] = $row['total_units'];
$stats['unit_stats'] = [
    ['name' => 'Available', 'value' => (int)$row['clean_units'], 'color' => '#3B82F6'],
    ['name' => 'Rented', 'value' => (int)$row['active'], 'color' => '#10B981'],
    ['name' => 'Maintenance', 'value' => (int)$row['maint_units'], 'color' => '#EF4444'],
];

// 2. FETCH UNITS (For "My Units" Section)
$q2 = "SELECT u.*, p.name as property_name FROM units u 
       LEFT JOIN properties p ON u.property_id = p.id 
       LIMIT 4";
$stmt2 = $db->prepare($q2);
$stmt2->execute();
$stats['my_units'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// 3. FETCH RECENT BOOKINGS (For "Booking List")
$q3 = "SELECT b.*, u.unit_name FROM bookings b 
       LEFT JOIN units u ON b.unit_id = u.id 
       ORDER BY b.id DESC LIMIT 6";
$stmt3 = $db->prepare($q3);
$stmt3->execute();
$stats['recent_bookings'] = $stmt3->fetchAll(PDO::FETCH_ASSOC);

// 4. CHART DATA (Mocking last 6 months for visual)
$stats['chart_data'] = [
    ['name' => 'Jan', 'income' => 4000],
    ['name' => 'Feb', 'income' => 3000],
    ['name' => 'Mar', 'income' => 5000],
    ['name' => 'Apr', 'income' => 2780],
    ['name' => 'May', 'income' => 1890],
    ['name' => 'Jun', 'income' => 2390],
];

echo json_encode($stats);
?>