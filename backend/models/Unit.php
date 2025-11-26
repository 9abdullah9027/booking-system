<?php
class Unit {
    private $conn;
    private $table = "units";

    public $id;
    public $property_id;
    public $unit_name;
    public $status;
    public $base_price;
    public $image_path; // New Field

    public function __construct($db) { $this->conn = $db; }

    public function read() {
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
                  SET property_id=:pid, unit_name=:name, base_price=:price, image_path=:img, status='clean'";
        $stmt = $this->conn->prepare($query);
        
        // Sanitize
        $this->unit_name = htmlspecialchars(strip_tags($this->unit_name));
        $this->base_price = htmlspecialchars(strip_tags($this->base_price));

        $stmt->bindParam(":pid", $this->property_id);
        $stmt->bindParam(":name", $this->unit_name);
        $stmt->bindParam(":price", $this->base_price);
        $stmt->bindParam(":img", $this->image_path);

        return $stmt->execute();
    }

    // NEW: Update Unit
    public function update() {
        // Dynamic query to handle image update only if a new image is provided
        $query = "UPDATE " . $this->table . " 
                  SET property_id=:pid, unit_name=:name, base_price=:price";
        
        if($this->image_path) {
            $query .= ", image_path=:img";
        }
        
        $query .= " WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":pid", $this->property_id);
        $stmt->bindParam(":name", $this->unit_name);
        $stmt->bindParam(":price", $this->base_price);
        $stmt->bindParam(":id", $this->id);
        
        if($this->image_path) {
            $stmt->bindParam(":img", $this->image_path);
        }

        return $stmt->execute();
    }

    public function delete() {
        // Optional: Delete physical image file here if needed
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function updateStatus($status) {
        $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $this->id);
        return $stmt->execute();
    }
}
?>