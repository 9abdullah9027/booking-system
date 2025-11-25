<?php
class Booking {
    private $conn;
    private $table = "bookings";

    // Object Properties
    public $id;
    public $unit_id;
    public $guest_name;
    public $check_in_date;
    public $check_out_date;
    public $total_amount;
    public $status;
    public $booking_reference;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ----------------------------------------------------
    // 1. READ ALL BOOKINGS (Fixed SQL Query)
    // ----------------------------------------------------
    public function read() {
        // We use specific columns to be safe. 
        // We use LEFT JOIN so that even if a Unit was deleted, the booking still shows up.
        $query = "SELECT 
                    b.id, 
                    b.booking_reference, 
                    b.guest_name, 
                    b.check_in_date, 
                    b.check_out_date, 
                    b.total_amount, 
                    b.status,
                    b.unit_id,
                    u.unit_name, 
                    p.name as property_name
                  FROM " . $this->table . " b
                  LEFT JOIN units u ON b.unit_id = u.id
                  LEFT JOIN properties p ON u.property_id = p.id
                  ORDER BY b.id DESC"; 
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // ----------------------------------------------------
    // 2. CHECK AVAILABILITY
    // ----------------------------------------------------
    public function isAvailable() {
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE unit_id = :unit_id 
                  AND status != 'cancelled'
                  AND check_in_date < :check_out 
                  AND check_out_date > :check_in";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':unit_id', $this->unit_id);
        $stmt->bindParam(':check_in', $this->check_in_date);
        $stmt->bindParam(':check_out', $this->check_out_date);
        $stmt->execute();

        if($stmt->rowCount() > 0) return false;
        return true;
    }

    // ----------------------------------------------------
    // 3. CREATE BOOKING
    // ----------------------------------------------------
    public function create() {
        if(!$this->isAvailable()) return false;

        $query = "INSERT INTO " . $this->table . " 
                  SET booking_reference=:ref, 
                      unit_id=:unit_id, 
                      guest_name=:guest, 
                      check_in_date=:in_date, 
                      check_out_date=:out_date, 
                      total_amount=:total, 
                      source='direct', 
                      status='confirmed'";

        $stmt = $this->conn->prepare($query);

        // Generate Random Reference #BK-XXXXX
        $this->booking_reference = 'BK-' . strtoupper(substr(uniqid(), -5));
        
        // Sanitize Input
        $this->guest_name = htmlspecialchars(strip_tags($this->guest_name));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));

        // Bind Data
        $stmt->bindParam(":ref", $this->booking_reference);
        $stmt->bindParam(":unit_id", $this->unit_id);
        $stmt->bindParam(":guest", $this->guest_name);
        $stmt->bindParam(":in_date", $this->check_in_date);
        $stmt->bindParam(":out_date", $this->check_out_date);
        $stmt->bindParam(":total", $this->total_amount);

        if($stmt->execute()) return true;
        
        return false;
    }
}
?>