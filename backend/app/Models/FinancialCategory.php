<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialCategory extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'financial_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'name',
        'description',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean'
    ];

    public function FinancialTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class);
    }
}
