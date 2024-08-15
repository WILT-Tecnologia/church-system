<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'civil_status',
        'nationality',
        'naturalness',
        'color_race',
        'formation',
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
    ]
}
