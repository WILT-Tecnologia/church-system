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
        Schema::create('frequencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_call_id');
            $table->uuid('member_id')->nullable();
            $table->uuid('guest_id')->nullable();
            $table->boolean('present')->default(false);
            $table->timestamps();

            $table->foreign('event_call_id')->references('id')->on('event_calls')->onDelete('cascade');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('guest_id')->references('id')->on('persons')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frequencies');
    }
};
