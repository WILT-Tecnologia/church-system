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
        if (!$this->start_date || !$this->end_date) {
            return true;
        }

        // Criamos objetos Carbon combinando data e hora do banco
        $startDateTime = \Carbon\Carbon::parse($this->start_date->format('Y-m-d') . ' ' . ($this->start_time ?: '00:00:00'));
        $endDateTime = \Carbon\Carbon::parse($this->end_date->format('Y-m-d') . ' ' . ($this->end_time ?: '23:59:59'));

        // O status "disponível" agora valida se o momento atual está EXATAMENTE dentro do intervalo
        return now()->between($startDateTime, $endDateTime);
    }

    public function getStatusAttribute(): string {
        return $this->getIsOpenAttribute() ? 'disponível' : 'fechado';
    }

    public function frequencies(): HasMany {
        return $this->hasMany(Frequency::class);
    }

}
