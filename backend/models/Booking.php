<?php
// backend/models/Booking.php

// Ensure server uses local time for "Today" calculations
date_default_timezone_set('Asia/Karachi'); 

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
    // 1. READ ALL BOOKINGS
    // ----------------------------------------------------
    public function read() {
        $query = "SELECT 
                    b.id, b.booking_reference, b.guest_name, 
                    b.check_in_date, b.check_out_date, b.total_amount, b.status,
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
    // 2. CHECK DATE CONFLICT (No overlaps)
    // ----------------------------------------------------
    public function isDateAvailable() {
        // Logic: Exclude 'cancelled' and 'checked_out' from conflicts
        // Overlap if (NewStart < OldEnd) AND (NewEnd > OldStart)
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE unit_id = :unit_id 
                  AND status NOT IN ('cancelled', 'checked_out')
                  AND check_in_date < :check_out 
                  AND check_out_date > :check_in";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':unit_id', $this->unit_id);
        $stmt->bindParam(':check_in', $this->check_in_date);
        $stmt->bindParam(':check_out', $this->check_out_date);
        $stmt->execute();

        if($stmt->rowCount() > 0) return false; // Conflict found
        return true;
    }

    // ----------------------------------------------------
    // 3. GET UNIT STATUS (With Cleanup)
    // ----------------------------------------------------
    private function getUnitStatus() {
        $query = "SELECT status FROM units WHERE id = :uid LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':uid', $this->unit_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? strtolower(trim($row['status'])) : 'clean';
    }

    // ----------------------------------------------------
    // 4. CREATE BOOKING
    // ----------------------------------------------------
    public function create() {
        $current_status = $this->getUnitStatus();

        // CHECK 1: Maintenance - Block ALL
        if ($current_status === 'maintenance') {
            return 'maintenance_error'; 
        }

        // CHECK 2: Dirty - Block only if Checking In TODAY
        $today = date('Y-m-d'); 
        if ($current_status === 'dirty' && $this->check_in_date == $today) {
            return 'dirty_error';
        }

        // CHECK 3: Date Overlap
        if(!$this->isDateAvailable()) {
            return 'conflict_error';
        }

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

        $this->booking_reference = 'BK-' . strtoupper(substr(uniqid(), -5));
        $this->guest_name = htmlspecialchars(strip_tags($this->guest_name));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));

        $stmt->bindParam(":ref", $this->booking_reference);
        $stmt->bindParam(":unit_id", $this->unit_id);
        $stmt->bindParam(":guest", $this->guest_name);
        $stmt->bindParam(":in_date", $this->check_in_date);
        $stmt->bindParam(":out_date", $this->check_out_date);
        $stmt->bindParam(":total", $this->total_amount);

        if($stmt->execute()) return 'success';
        
        return 'db_error';
    }

    // ----------------------------------------------------
    // 5. UPDATE STATUS (With Logic for In & Out)
    // ----------------------------------------------------
    public function updateStatus($status) {
        $today = date('Y-m-d');

        if($status === 'checked_in') {
            // A. CHECK-IN LOGIC: Set 'Check In Date' to Today
            // Accurate "In House" count and Late Arrival tracking
            $query = "UPDATE " . $this->table . " 
                      SET status = :status, check_in_date = :today 
                      WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':today', $today);

        } 
        elseif($status === 'checked_out') {
            // B. CHECK-OUT LOGIC: Set 'Check Out Date' to Today
            // Frees up the room immediately for tomorrow bookings
            $query = "UPDATE " . $this->table . " 
                      SET status = :status, check_out_date = :today 
                      WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':today', $today);

            // OPTIONAL: Mark unit as dirty here? 
            // For now, we stick to Updating Dates only.
        } 
        else {
            // C. STANDARD LOGIC (Cancel, etc)
            $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :id";
            $stmt = $this->conn->prepare($query);
        }
        
        $status = htmlspecialchars(strip_tags($status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) return true;
        return false;
    }

    // ----------------------------------------------------
    // 6. DELETE BOOKING
    // ----------------------------------------------------
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        
        if($stmt->execute()) return true;
        return false;
    }
}
?>