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
        Schema::create('event_participants', function (Blueprint $table) {
            // $table->uuid('id')->primary();
            $table->uuid('member_id');
            $table->uuid('event_id');
            $table->primary(['event_id', 'member_id']);

            // $table->foreign('member_id')->references('id')->on('members');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            // $table->foreign('event_id')->references('id')->on('events');
            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
        
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_participants');
    }
};
