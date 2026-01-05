<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('user_profile', function (Blueprint $table) {
            $table->uuid('user_id')->nullable(); // Make nullable since Spatie Permission doesn't populate this
            $table->uuid('profile_id');
            $table->uuid('model_id');
            $table->string('model_type');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('profile_id')->references('id')->on('profile')->onDelete('cascade')->onUpdate('cascade');
            $table->index(['model_id', 'model_type'], 'user_profile_model_id_model_type_index');
            
            // Add unique constraint to prevent duplicate role assignments
            $table->unique(['profile_id', 'model_id', 'model_type'], 'user_profile_role_model_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('user_profile');
    }
};
