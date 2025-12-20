<?php
// Contact Form Handler for Prosista Romania
// This file should be uploaded to the public/ directory on cPanel

header('Content-Type: application/json');

// Configuration
$to_email = 'info@prosista.ro'; // Change this to your actual email
$subject_prefix = 'Contact Form - Prosista.ro';

// Sanitize and validate input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Get form data
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
$subject = isset($_POST['subject']) ? sanitize_input($_POST['subject']) : '';
$message = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Numele este obligatoriu';
}

if (empty($email)) {
    $errors[] = 'Email-ul este obligatoriu';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email-ul nu este valid';
}

if (empty($subject)) {
    $errors[] = 'Subiectul este obligatoriu';
}

if (empty($message)) {
    $errors[] = 'Mesajul este obligatoriu';
}

// If there are errors, return them
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Prepare email
$email_subject = $subject_prefix . ' - ' . $subject;
$email_body = "Nume: $name\n";
$email_body .= "Email: $email\n";
if (!empty($phone)) {
    $email_body .= "Telefon: $phone\n";
}
$email_body .= "Subiect: $subject\n\n";
$email_body .= "Mesaj:\n$message\n";

$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
$mail_sent = mail($to_email, $email_subject, $email_body, $headers);

if ($mail_sent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Mesajul a fost trimis cu succes!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou.']);
}
?>

