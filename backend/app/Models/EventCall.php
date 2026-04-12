<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventCall extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'event_calls';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'event_id',
        'theme',
        'location',
        'start_date',
        'start_time',
        'end_date',
        'end_time',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    public function evento(): BelongsTo {
        return $this->belongsTo(Evento::class, 'event_id', 'id');
    }

    public function getIsOpenAttribute(): bool {
        if (!$this->end_date) {
            return true;
        }

        $endDate = $this->end_date instanceof \Carbon\Carbon
            ? $this->end_date
            : \Carbon\Carbon::parse($this->end_date);

        if ($this->end_time) {
            $endDateTime = \Carbon\Carbon::parse($endDate->format('Y-m-d') . ' ' . $this->end_time);
        } else {
            $endDateTime = $endDate->copy()->endOfDay();
        }

        return now()->lessThanOrEqualTo($endDateTime);
    }

    public function frequencies(): HasMany {
        return $this->hasMany(Frequency::class);
    }

}
