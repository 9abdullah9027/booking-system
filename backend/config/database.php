<?php
// backend/config/database.php

class Database {
    private $host = "localhost";
    private $db_name = "u_booking_db";
    private $username = "root";
    private $password = ""; // Default XAMPP password is empty
    public $conn;

    // Get the database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            
            // Set error mode to exception for better debugging and security
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Ensure UTF-8 encoding for all data transfers
            $this->conn->exec("set names utf8");
            
        } catch(PDOException $exception) {
            // In production, do not echo the error message to avoid leaking path info
            // For now (development), we show it.
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>