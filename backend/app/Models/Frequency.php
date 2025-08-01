<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Frequency extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'frequncies';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'event_call_id',
        'member_id',
        'guest_id',
        'present'
    ];

    public function eventCall(): BelongsTo
    {
        return $this->belongsTo(EventCall::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'guest_id');
    }
}
