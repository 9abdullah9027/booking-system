<?php
class Guest {
    private $conn;
    private $table = "guests";

    public $id;
    public $full_name;
    public $email;
    public $phone;
    public $id_number;
    public $id_card_image;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. READ ALL GUESTS
    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. SEARCH GUESTS (By Name or Phone)
    public function search($keyword) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE full_name LIKE ? OR phone LIKE ? OR id_number LIKE ?";
        $stmt = $this->conn->prepare($query);
        $term = "%{$keyword}%";
        $stmt->bindParam(1, $term);
        $stmt->bindParam(2, $term);
        $stmt->bindParam(3, $term);
        $stmt->execute();
        return $stmt;
    }

    // 3. CREATE GUEST (With File Upload logic handled in Controller usually, but stored here)
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET full_name=:name, email=:email, phone=:phone, 
                      id_number=:idn, id_card_image=:img";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->id_number = htmlspecialchars(strip_tags($this->id_number));
        $this->id_card_image = htmlspecialchars(strip_tags($this->id_card_image));

        $stmt->bindParam(":name", $this->full_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":idn", $this->id_number);
        $stmt->bindParam(":img", $this->id_card_image);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 4. DELETE GUEST
    public function delete() {
        // First get the image path to delete the physical file
        $sql = "SELECT id_card_image FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt_img = $this->conn->prepare($sql);
        $stmt_img->bindParam(':id', $this->id);
        $stmt_img->execute();
        $row = $stmt_img->fetch(PDO::FETCH_ASSOC);

        // If an image exists, delete it from the folder
        if($row && !empty($row['id_card_image'])) {
            $file_path = __DIR__ . "/../uploads/ids/" . $row['id_card_image'];
            if(file_exists($file_path)) {
                unlink($file_path);
            }
        }

        // Delete Database Record
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        if($stmt->execute()) return true;
        return false;
    }
}
?>