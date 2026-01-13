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
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('church_id');
            $table->enum('entry_exit', ['entrada', 'saida']);
            $table->enum('customer_supplier', ['membro', 'fornecedor', 'pessoa']);
            $table->uuid('member_id')->nullable();
            $table->uuid('supplier_id')->nullable();
            $table->string('person_name')->nullable();
            $table->text('description')->nullable();
            $table->uuid('cat_financial_id');
            $table->enum('payment',['pix', 'dinheiro', 'boleto', 'credito', 'debito', 'cheque']);
            $table->decimal('amount', 8, 2);
            $table->decimal('discount', 8, 2)->nullable();
            $table->decimal('amount_discount', 8, 2)->nullable();
            $table->date('payment_date');
            $table->string('receipt')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('church_id')->references('id')->on('churches')->onDelete('cascade');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->foreign('cat_financial_id')->references('id')->on('fincancial_categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
