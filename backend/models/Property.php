<?php
class Property {
    private $conn;
    private $table = "properties";

    public $id;
    public $name;
    public $address;
    public $type;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. Get All Properties
    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. Create Property
    public function create() {
        $query = "INSERT INTO " . $this->table . " SET name=:name, address=:address, type=:type";
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->type = htmlspecialchars(strip_tags($this->type));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":type", $this->type);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 3. Delete Property
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        if($stmt->execute()) return true;
        return false;
    }
}
?>