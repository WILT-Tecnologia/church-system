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
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('person_id');
            $table->uuid('church_id');
            $table->string('rg')->nullable();
            $table->string('issuing_body')->nullable();
            $table->string('civil_status');
            $table->string('nationality')->default('Brasileira');
            $table->string('naturalness');
            $table->string('color_race');
            $table->string('formation');
            $table->string('formation_course')->nullable();
            $table->string('profission')->nullable();
            $table->boolean('def_physical')->default(false);
            $table->boolean('def_visual')->default(false);
            $table->boolean('def_hearing')->default(false);
            $table->boolean('def_intellectual')->default(false);
            $table->boolean('def_mental')->default(false);
            $table->boolean('def_multiple')->default(false);
            $table->boolean('def_other')->default(false);
            $table->string('def_other_description')->nullable();
            $table->date('baptism_date')->nullable();
            $table->string('baptism_locale')->nullable();
            $table->string('baptism_official')->nullable();
            $table->boolean('baptism_holy_spirit')->default(false);
            $table->date('baptism_holy_spirit_date')->nullable();
            $table->uuid('member_origin_id');
            $table->date('receipt_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('person_id')->references('id')->on('persons');
            $table->foreign('church_id')->references('id')->on('churches');
            $table->foreign('civil_status')->references('codigo')->on('aux_civil_status');
            $table->foreign('color_race')->references('codigo')->on('aux_color_race');
            $table->foreign('formation')->references('codigo')->on('aux_formation');
            $table->foreign('member_origin_id')->references('id')->on('member_origins');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
