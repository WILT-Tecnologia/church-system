<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    public function members(): BelongsToMany {
        return $this->belongsToMany(Member::class, 'church_member', 'church_id', 'member_id');
    }

    public function evento(): HasMany {
        return $this->hasMany(Evento::class);
    }

    public function getMembersCountAttribute(): int
    {
        return $this->members()->count();
    }

    public function patrimonies(): HasMany
    {
        return $this->hasMany(Patrimony::class);
    }
}
