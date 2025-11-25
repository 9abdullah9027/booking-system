<?php
// backend/reset_password.php
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$email = "admin@hotel.com";
$new_password = "Admin123!"; 

// Generate a valid hash using your specific server's default algorithm
$new_hash = password_hash($new_password, PASSWORD_DEFAULT);

$query = "UPDATE users SET password_hash = :hash WHERE email = :email";
$stmt = $db->prepare($query);

$stmt->bindParam(':hash', $new_hash);
$stmt->bindParam(':email', $email);

if($stmt->execute()) {
    echo "<h1>Success!</h1>";
    echo "Password for <b>$email</b> has been reset to: <b>$new_password</b><br>";
    echo "New Hash stored: " . $new_hash;
} else {
    echo "Error updating password.";
}
?>