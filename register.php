<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "your_database_name");

if ($conn->connect_error) {
  die(json_encode(["error" => "Connection failed"]));
}

$data = json_decode(file_get_contents("php://input"), true);

$fullName = $conn->real_escape_string($data["fullName"]);
$username = $conn->real_escape_string($data["username"]);
$email = $conn->real_escape_string($data["email"]);
$phone = $conn->real_escape_string($data["phone"]);
$password = password_hash($data["password"], PASSWORD_DEFAULT);

$sql = "INSERT INTO users (full_name, username, email, phone, password) VALUES ('$fullName', '$username', '$email', '$phone', '$password')";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["message" => "User registered successfully"]);
} else {
  echo json_encode(["error" => "Registration failed: " . $conn->error]);
}

$conn->close();
?>
