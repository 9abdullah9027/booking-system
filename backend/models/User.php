<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $full_name;
    public $email;
    public $password; 
    public $password_hash;
    public $role;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. Read All Users
    public function read() {
        $query = "SELECT id, full_name, email, role, created_at 
                  FROM " . $this->table_name . " 
                  ORDER BY id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. Create User
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET full_name = :full_name,
                      email = :email,
                      password_hash = :password_hash,
                      role = :role";

        $stmt = $this->conn->prepare($query);

        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        
        // IMPORTANT: We check if password is set to prevent crashes
        if(!empty($this->password)) {
             $hash = password_hash($this->password, PASSWORD_BCRYPT);
        } else {
             $hash = ""; // Handle error upstream
        }

        $stmt->bindParam(':full_name', $this->full_name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password_hash', $hash);
        $stmt->bindParam(':role', $this->role);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 3. Check Email Exists
    public function emailExists() {
        $query = "SELECT id, full_name, password_hash, role
                  FROM " . $this->table_name . "
                  WHERE email = ? LIMIT 0,1";

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

    // 4. Delete User
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        
        if($stmt->execute()) return true;
        return false;
    }
}
?>