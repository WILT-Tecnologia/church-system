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
        Schema::create('events_guests', function (Blueprint $table) {
            $table->uuid('event_id');
            $table->uuid('person_id');
            $table->primary(['event_id', 'person_id']);

            // $table->foreign('member_id')->references('id')->on('members');
            $table->foreign('person_id')->references('id')->on('persons')->onDelete('cascade');
            // $table->foreign('event_id')->references('id')->on('events');
            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events_guests');
    }
};
