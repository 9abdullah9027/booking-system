<?php
// backend/checkin_process.php
date_default_timezone_set('Asia/Karachi');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Removed X-Requested-With for file upload compatibility

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/database.php';
include_once 'middleware.php';

// 1. Validate Token (Important for security)
$user_data = validateToken();

$database = new Database();
$db = $database->getConnection();

// 2. Collect Data (NOTE: Using $_POST because of Multipart File)
$booking_id = $_POST['booking_id'] ?? 0;
$guest_name = $_POST['guest_name'] ?? 'Unknown';
$phone      = $_POST['guest_phone'] ?? '';
$payment_status = $_POST['payment_status'] ?? 'pending';
$payment_method = $_POST['payment_method'] ?? 'n/a';
$services_total = $_POST['services_total'] ?? 0; // Total Extra Fee
$json_items = $_POST['invoice_items'] ?? '[]'; // The JSON string of items

// 3. IMAGE UPLOAD LOGIC
$image_path = null;
if(isset($_FILES['id_card']) && $_FILES['id_card']['error'] === 0) {
    $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
    $filename = $_FILES['id_card']['name'];
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    if(in_array(strtolower($ext), $allowed)) {
        $new_name = uniqid("ID_") . "." . $ext;
        if(move_uploaded_file($_FILES['id_card']['tmp_name'], "uploads/ids/" . $new_name)) {
            $image_path = $new_name;
        }
    }
}

try {
    $db->beginTransaction();

    // A. SYNC GUEST TO CRM
    // Check if guest exists by name
    $query = "SELECT id FROM guests WHERE full_name = ? LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$guest_name]);
    $guest = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($guest) {
        // Update Existing Guest (Add image/phone if provided)
        $updateSQL = "UPDATE guests SET phone = COALESCE(NULLIF(?, ''), phone)";
        if ($image_path) $updateSQL .= ", id_card_image = '$image_path'";
        $updateSQL .= " WHERE id = ?";
        
        $upStmt = $db->prepare($updateSQL);
        $upStmt->execute([$phone, $guest['id']]);
    } else {
        // Create New Guest
        $insSQL = "INSERT INTO guests (full_name, phone, id_card_image) VALUES (?, ?, ?)";
        $insStmt = $db->prepare($insSQL);
        $insStmt->execute([$guest_name, $phone, $image_path]);
    }

    // B. SAVE INVOICE ADD-ONS
    $items = json_decode($json_items, true);
    if (is_array($items)) {
        $itemSql = "INSERT INTO booking_addons (booking_id, service_name, price) VALUES (?, ?, ?)";
        $itemStmt = $db->prepare($itemSql);
        foreach ($items as $item) {
            $itemStmt->execute([$booking_id, $item['name'], $item['price']]);
        }
    }

    // C. UPDATE BOOKING STATUS & FINANCIALS
    $today = date('Y-m-d');
    $bookSql = "UPDATE bookings SET 
                status = 'checked_in',
                check_in_date = :today, 
                payment_status = :paystat,
                payment_method = :paymethod,
                service_fee = :fee
                WHERE id = :id";
                
    $bookStmt = $db->prepare($bookSql);
    $bookStmt->execute([
        ':today' => $today,
        ':paystat' => $payment_status,
        ':paymethod' => $payment_method,
        ':fee' => $services_total,
        ':id' => $booking_id
    ]);

    $db->commit();
    echo json_encode(["message" => "Check-in Successful & Invoice Saved!"]);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>