<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Church extends Model
{
    use HasFactory;
    use SoftDeletes;
    use HasUuids;

    protected $table = 'churches';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'responsible_id',
        'name',
        'email',
        'cnpj',
        'cep',
        'street',
        'number',
        'complement',
        'district',
        'city',
        'state',
        'country',
        'logo',
        'favicon',
        'background',
        'color',
    ];

    public function responsible(): BelongsTo {
        return $this->belongsTo(Person::class, 'responsible_id');
    }

    public function members(): HasMany {
        return $this->hasMany(Member::class);
    }

    public function evento(): HasMany {
        return $this->hasMany(Evento::class);
    }
}
