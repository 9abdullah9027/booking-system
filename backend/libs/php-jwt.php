<?php
class JwtHandler {
    private $secret = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_LATER"; // Strong secret key

    // Encode payload to JWT
    public function encode($data) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($data);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    // Decode (we will use this in Phase 3 for protection)
    public function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) return null;
        
        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signatureProvided = $tokenParts[2];

        // Verify Signature
        $signatureCheck = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], $this->secret, true);
        $base64UrlSignatureCheck = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signatureCheck));

        if ($base64UrlSignatureCheck === $signatureProvided) {
            return json_decode($payload);
        }
        return null;
    }
}
?>