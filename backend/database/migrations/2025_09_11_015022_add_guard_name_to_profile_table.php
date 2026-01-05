<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('profile', function (Blueprint $table) {
            if (!Schema::hasColumn('profile', 'guard_name')) {
                $table->string('guard_name')->default('sanctum')->after('name');
            }
        });

        // Set guard_name for existing profiles
        // Only update if the column was actually added or if it exists but is null
        if (Schema::hasColumn('profile', 'guard_name')) {
            \DB::table('profile')->whereNull('guard_name')->update(['guard_name' => 'sanctum']);
        }
    }

    public function down(): void {
        Schema::table('profile', function (Blueprint $table) {
            $table->dropColumn('guard_name');
        });
    }
};
