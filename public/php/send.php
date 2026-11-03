<?php

header('Content-Type: application/json; charset=utf-8');

// ===== НАСТРОЙКИ =====
$botToken = getenv('TELEGRAM_BOT_TOKEN') ?: '';
$chatId = getenv('TELEGRAM_CHAT_ID') ?: '';

// ===== ПОЛУЧЕНИЕ ДАННЫХ =====
$name    = trim($_POST['name'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

// ===== ПРОВЕРКА =====
if (empty($name) || empty($phone)) {
    echo json_encode([
        'success' => false,
        'message' => 'Заполните обязательные поля'
    ]);
    exit;
}

// ===== ТЕКСТ =====
$text = "📩 Новая заявка с сайта\n\n";
$text .= "👤 Имя: {$name}\n";
$text .= "📞 Телефон: {$phone}\n";
$text .= "📝 Задача: {$message}";

// ===== ОТПРАВКА =====
$url = "https://api.telegram.org/bot{$botToken}/sendMessage";

$data = [
    'chat_id' => $chatId,
    'text' => $text
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data),
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

// ===== ОТВЕТ =====
if ($result) {
    echo json_encode([
        'success' => true,
        'message' => 'Заявка отправлена'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка отправки'
    ]);
}
