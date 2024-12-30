<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profile_permission', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('profile_id');
            $table->uuid('permission_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('profile_id')->references('id')->on('profile')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_permission');
    }
};
