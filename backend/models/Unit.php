<?php
class Unit {
    private $conn;
    private $table = "units";

    public $id;
    public $property_id;
    public $unit_name;
    public $status; // clean, dirty, maintenance
    public $base_price;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. Read All Units (With Property Name)
    public function read() {
        // LEFT JOIN ensures unit shows up even if property name is missing
        $query = "SELECT p.name as property_name, u.* 
                  FROM " . $this->table . " u
                  LEFT JOIN properties p ON u.property_id = p.id
                  ORDER BY u.property_id DESC, u.unit_name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. Create Unit
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET property_id=:property_id, unit_name=:unit_name, status=:status, base_price=:base_price";
        
        $stmt = $this->conn->prepare($query);

        $this->unit_name = htmlspecialchars(strip_tags($this->unit_name));
        $this->status = $this->status ?? 'clean';

        $stmt->bindParam(":property_id", $this->property_id);
        $stmt->bindParam(":unit_name", $this->unit_name);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":base_price", $this->base_price);

        if($stmt->execute()) return true;
        return false;
    }

    // 3. Delete Unit
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        if($stmt->execute()) return true;
        return false;
    }

    // 4. Update Status (Housekeeping)
    public function updateStatus($status) {
        $query = "UPDATE " . $this->table . " 
                  SET status = :status 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $status = htmlspecialchars(strip_tags($status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) return true;
        return false;
    }
}
?>