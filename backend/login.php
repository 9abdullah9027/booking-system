<?php
// backend/login.php

// 1. CORS Headers - Allow React to access PHP
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Handle Preflight OPTIONS Request
// Browser asks: "Is it safe to send data?" -> We say: "Yes (200 OK)"
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Database & Objects
include_once 'config/database.php';
include_once 'models/User.php';
include_once 'libs/php-jwt.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// 4. Get Posted Data
$data = json_decode(file_get_contents("php://input"));

// 5. Processing
http_response_code(200);

if(!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;

    if($user->emailExists()) {
        
        // Verify Password
        if(password_verify($data->password, $user->password_hash)) {
            
            // Generate Token
            $jwtHandler = new JwtHandler();
            $tokenData = [
                "user_id" => $user->id,
                "role" => $user->role,
                "email" => $user->email,
                "iat" => time(),
                "exp" => time() + (60 * 60 * 24) // 24 Hours
            ];

            $token = $jwtHandler->encode($tokenData);

            echo json_encode(array(
                "message" => "Successful login.",
                "jwt" => $token,
                "user" => array(
                    "full_name" => $user->full_name,
                    "role" => $user->role
                )
            ));

        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. Wrong password."));
        }

    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Login failed. Email not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>