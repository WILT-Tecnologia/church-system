<?php

namespace App\Models;

use App\Enums\CustomerSupplierEnum;
use App\Enums\EntryExitEnum;
use App\Enums\PaymentMethodEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialTransaction extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'financial_transactions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'church_id',
        'entry_exit',
        'customer_supplier',
        'member_id',
        'supplier_id',
        'person_name',
        'description',
        'cat_financial_id',
        'payment',
        'amount',
        'discount',
        'amount_discount',
        'payment_date',
        'receipt',
    ];

    protected $casts = [
        'entry_exit' => EntryExitEnum::class,
        'customer_supplier' => CustomerSupplierEnum::class,
        'payment' => PaymentMethodEnum::class,
        'payment_date' => 'date',
        'amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'amount_discount' => 'decimal:2',
    ];

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class);
    }
}
