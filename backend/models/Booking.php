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
    
    // Financial & Status Properties
    public $service_fee;
    public $payment_status;
    public $payment_method;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ----------------------------------------------------
    // 1. READ ALL BOOKINGS (Includes Unit Image & Status)
    // ----------------------------------------------------
    public function read() {
        $query = "SELECT 
                    b.id, b.booking_reference, b.guest_name, 
                    b.check_in_date, b.check_out_date, b.total_amount, b.status,
                    b.service_fee, b.payment_status, b.payment_method,
                    b.unit_id,
                    u.unit_name, 
                    u.status as unit_status, 
                    u.image_path, -- Critical for Calendar Hover
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
    // 2. CHECK DATE CONFLICT
    // ----------------------------------------------------
    public function isDateAvailable() {
        // Logic: Conflict if (NewStart < OldEnd) AND (NewEnd > OldStart)
        // Exclude 'cancelled' and 'checked_out' (as they don't occupy the room)
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
    // 3. GET STRICT UNIT STATUS
    // ----------------------------------------------------
    private function getUnitStatus() {
        $query = "SELECT status FROM units WHERE id = :uid LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':uid', $this->unit_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        // Normalize status (lowercase, trim spaces)
        return $row ? strtolower(trim($row['status'])) : 'clean';
    }

    // ----------------------------------------------------
    // 4. CREATE BOOKING (With Logic Checks)
    // ----------------------------------------------------
    public function create() {
        // STEP A: Check Room Status
        $current_status = $this->getUnitStatus();

        // STRICT BLOCK: Maintenance
        if ($current_status === 'maintenance') {
            return 'maintenance_error'; 
        }

        // STRICT BLOCK: Dirty (Only if checking in TODAY)
        $today = date('Y-m-d'); 
        if ($current_status === 'dirty' && $this->check_in_date == $today) {
            return 'dirty_error';
        }

        // STEP B: Check Conflicts
        if(!$this->isDateAvailable()) {
            return 'conflict_error';
        }

        // STEP C: Create Record
        $query = "INSERT INTO " . $this->table . " 
                  SET booking_reference=:ref, 
                      unit_id=:unit_id, 
                      guest_name=:guest, 
                      check_in_date=:in_date, 
                      check_out_date=:out_date, 
                      total_amount=:total, 
                      source='direct', 
                      status='confirmed', 
                      payment_status='pending', 
                      service_fee=0";

        $stmt = $this->conn->prepare($query);

        // Generate Reference if empty
        if(empty($this->booking_reference)) {
            $this->booking_reference = 'BK-' . strtoupper(substr(uniqid(), -5));
        }

        // Sanitize
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
    // 5. UPDATE STATUS (Check-In/Out Logic)
    // ----------------------------------------------------
    public function updateStatus($status) {
        $today = date('Y-m-d');
        $sql = "UPDATE " . $this->table . " SET status = :status";
        
        // CHECK-IN: Update Date, Add Fees, Payment Info
        if($status === 'checked_in') {
            $sql .= ", check_in_date = :today, 
                       service_fee = :fee, 
                       payment_status = :pay_stat, 
                       payment_method = :pay_meth";
        } 
        // CHECK-OUT: Update Date Only (Frees up inventory)
        elseif($status === 'checked_out') {
            $sql .= ", check_out_date = :today";
        }
        
        $sql .= " WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        
        $status = htmlspecialchars(strip_tags($status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $this->id);

        if($status === 'checked_in') {
            $stmt->bindParam(':today', $today);
            
            // Use defaults if null
            $this->service_fee = $this->service_fee ?? 0;
            $this->payment_status = $this->payment_status ?? 'pending';
            $this->payment_method = $this->payment_method ?? 'n/a';

            $stmt->bindParam(':fee', $this->service_fee);
            $stmt->bindParam(':pay_stat', $this->payment_status);
            $stmt->bindParam(':pay_meth', $this->payment_method);
        } 
        elseif ($status === 'checked_out') {
            $stmt->bindParam(':today', $today);
        }

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
        return $stmt->execute();
    }
}
?>