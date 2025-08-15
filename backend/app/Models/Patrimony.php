<?php

namespace App\Models;

use App\Enums\TypeEntryEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patrimony extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'patrimonies';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'church_id',
        'number',
        'name',
        'registration_date',
        'description',
        'type_entry',
        'price',
        'is_member',
        'member_id',
        'donor',
        'photo'
    ];

    protected $casts = [
        'resgistration_date' => 'date',
        'price' => 'decimal:2',
        'type_entry' => TypeEntryEnum::class,
    ];

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
