<?php

namespace App\Models;

use App\Enums\SexEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'persons';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'user_id',
        'image',
        'name',
        'cpf',
        'birth_date',
        'email',
        'phone_one',
        'phone_two',
        'sex',
        'cep',
        'street',
        'number',
        'complement',
        'district',
        'city',
        'state',
        'country'
    ];

    protected $casts = [
        'sex' => SexEnum::class,
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function church(): BelongsTo {
        return $this->belongsTo(Church::class);
    }

    public function member(): HasOne {
        return $this->HasOne(Member::class);
    }

    public function members(): HasMany {
        return $this->hasMany(Member::class);
    }

    public function family(): BelongsTo {
        return $this->belongsTo(Family::class);
    }
}
