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

    // 1. Read
    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. Create
    public function create() {
        $query = "INSERT INTO " . $this->table . " SET name=:name, address=:address, type=:type";
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->type = htmlspecialchars(strip_tags($this->type));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":type", $this->type);

        return $stmt->execute();
    }

    // 3. Update (NEW)
    public function update() {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, address = :address, type = :type 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':address', $this->address);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':id', $this->id);

        return $stmt->execute();
    }

    // 4. Delete
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }
}
?>