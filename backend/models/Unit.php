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

    // Read Units (Filter by Property ID if needed)
    public function read() {
        // Query to join with property name for easier reading
        $query = "SELECT p.name as property_name, u.* 
                  FROM " . $this->table . " u
                  LEFT JOIN properties p ON u.property_id = p.id
                  ORDER BY u.property_id DESC, u.unit_name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET property_id=:property_id, unit_name=:unit_name, status=:status, base_price=:base_price";
        
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->unit_name = htmlspecialchars(strip_tags($this->unit_name));
        $this->status = $this->status ?? 'clean';

        $stmt->bindParam(":property_id", $this->property_id);
        $stmt->bindParam(":unit_name", $this->unit_name);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":base_price", $this->base_price);

        if($stmt->execute()) return true;
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        if($stmt->execute()) return true;
        return false;
    }
}
?>