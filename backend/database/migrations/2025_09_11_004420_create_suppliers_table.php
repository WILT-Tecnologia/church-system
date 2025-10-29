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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('church_id');
            $table->string('name');
            $table->enum('type_supplier', ['PF', 'PJ']);
            $table->string('cpf_cnpj');
            $table->enum('type_service', ['Produto', 'Serviço', 'Ambos']);
            $table->string('pix_key')->nullable();
            $table->boolean('status')->default(true);
            $table->string('cep')->nullable();
            $table->string('street')->nullable();
            $table->string('number')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->string('uf')->nullable();
            $table->string('country')->nullable();
            $table->string('phone_one')->nullable();
            $table->string('phone_two')->nullable();
            $table->string('phone_three')->nullable();
            $table->string('email')->nullable();
            $table->string('contact_name')->nullable();
            $table->text('obs')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('church_id')->references('id')->on('churches')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
