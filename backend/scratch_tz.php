<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Timezone: " . config('app.timezone') . "\n";
echo "Now: " . now()->toDateTimeString() . "\n";
echo "Now (UTC): " . now()->utc()->toDateTimeString() . "\n";
