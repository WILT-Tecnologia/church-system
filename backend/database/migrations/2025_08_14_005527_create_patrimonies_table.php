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
        Schema::create('patrimonies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('church_id');
            $table->string('number');
            $table->string('name');
            $table->date('registration_date');
            $table->string('description');
            $table->enum('type_entry', ['C', 'D', 'T']);
            $table->decimal('price', 10,2)->nullable();
            $table->boolean('is_member')->default(false);
            $table->uuid('member_id')->nullable();
            $table->string('donor')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('church_id')->references('id')->on('churches')->onDelete('cascade');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patrimonies');
    }
};
