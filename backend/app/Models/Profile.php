<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'profile';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_profile');
    }

    public function module()
    {
        return $this->belongsToMany(Module::class,
            'profile_modules',
        )->withPivot(['can_read', 'can_write', 'can_delete'])->withTimestamps();
    }
}
