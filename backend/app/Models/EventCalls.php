<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventCalls extends Model
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

    public function event(): BelongsTo {
        return $this->belongsTo(Evento::class, 'event_id', 'id');
    }

}
