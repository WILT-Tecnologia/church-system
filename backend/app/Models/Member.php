<?php

namespace App\Models;

use App\Enums\CivilStatusEnum;
use App\Enums\ColorRaceEnum;
use App\Enums\FormationEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;

class Member extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'members';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'person_id',
        'church_id',
        'rg',
        'issuing_body',
        'civil_status_id',
        'nationality',
        'naturalness',
        'color_race_id',
        'formation_id',
        'formation_course',
        'profission',
        'def_physical',
        'def_visual',
        'def_hearing',
        'def_intellectual',
        'def_mental',
        'def_multiple',
        'def_other',
        'def_other_description',
        'baptism_date',
        'baptism_locale',
        'baptism_official',
        'baptism_holy_spirit',
        'baptism_holy_spirit_date',
        'member_origin_id',
        'receipt_date'
    ];

    public function person(): BelongsTo {
        return $this->belongsTo(Person::class);
    }

    public function church(): BelongsTo {
        return $this->belongsTo(Church::class);
    }

    public function churches(): BelongsToMany {
        return $this->belongsToMany(Church::class, 'church_member', 'member_id', 'church_id');
    }

    public function memberOrigin(): BelongsTo {
        return $this->belongsTo(MemberOrigin::class);
    }

    public function civilStatus(): BelongsTo {
        return $this->belongsTo(CivilStatus::class);
    }

    public function colorRace(): BelongsTo {
        return $this->belongsTo(ColorRace::class);
    }

    public function formation(): BelongsTo {
        return $this->belongsTo(Formation::class);
    }

    public function families(): HasMany {
        return $this->hasMany(Family::class);
    }

    public function ordination(): HasMany {
        return $this->HasMany(Ordination::class);
    }

    public function statusMember(): BelongsTo
    {
        return $this->belongsTo(StatusMember::class, 'id', 'member_id');
    }

    public function histMembers(): HasMany
    {
        return $this->hasMany(HistMember::class);

    }
}
