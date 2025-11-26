<?php
class Logger {
    private $conn;
    private $table = "audit_logs";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function log($user_id, $user_name, $action, $details) {
        $query = "INSERT INTO " . $this->table . " 
                  SET user_id = :uid, user_name = :uname, action = :act, details = :det, ip_address = :ip";
        
        $stmt = $this->conn->prepare($query);
        
        // Get IP
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        // Sanitize
        $action = htmlspecialchars(strip_tags($action));
        $details = htmlspecialchars(strip_tags($details));

        $stmt->bindParam(':uid', $user_id);
        $stmt->bindParam(':uname', $user_name);
        $stmt->bindParam(':act', $action);
        $stmt->bindParam(':det', $details);
        $stmt->bindParam(':ip', $ip);

        $stmt->execute();
    }

    // Read Logs (For Admin View)
    public function readAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC LIMIT 200";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>