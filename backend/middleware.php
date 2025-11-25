<?php
// backend/middleware.php
include_once 'libs/php-jwt.php';
include_once 'config/database.php';

function validateToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    // Some servers prefix with 'Bearer ', remove it
    $jwt = str_replace("Bearer ", "", $authHeader);

    if($jwt) {
        $jwtHandler = new JwtHandler();
        $token_data = $jwtHandler->decode($jwt);

        if(!empty($token_data)) {
            // Token is valid, return the user ID and Role
            return $token_data;
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Access denied. Invalid token."]);
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. No token provided."]);
        exit();
    }
}
?>