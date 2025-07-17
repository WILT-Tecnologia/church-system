<?php

namespace App\Models;

use Auth;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evento extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'events';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'church_id',
        'event_type_id',
        'name',
        'obs'
    ];

    public function church(): BelongsTo {
        return $this->belongsTo(Church::class);
    }

    public function eventType(): BelongsTo {
        return $this->belongsTo(EventType::class);
    }

    public function participantes(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'event_participants', 'event_id');
    }

    public function guests(): BelongsToMany
    {
        return $this->belongsToMany(Person::class, 'events_guests', 'event_id');
    }

}
