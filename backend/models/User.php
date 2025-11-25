<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $full_name;
    public $email;
    public $password_hash;
    public $role;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Check if email exists
    public function emailExists() {
        // Query to check email
        $query = "SELECT id, full_name, password_hash, role
                  FROM " . $this->table_name . "
                  WHERE email = ?
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->full_name = $row['full_name'];
            $this->password_hash = $row['password_hash'];
            $this->role = $row['role'];
            return true;
        }
        return false;
    }
}
?>