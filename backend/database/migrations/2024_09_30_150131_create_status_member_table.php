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
        Schema::create('status_member', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('member_id');
            $table->uuid('member_situation_id');
            $table->date('initial_period');
            $table->date('final_period')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('member_id')->references('id')->on('members');
            $table->foreign('member_situation_id')->references('id')->on('aux_member_situation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_member');
    }
};
