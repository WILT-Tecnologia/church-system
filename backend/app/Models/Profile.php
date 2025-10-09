<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Models\Role as SpatieRole;

class Profile extends SpatieRole
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'profile';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected string $guard_name = 'sanctum';

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class, 'user_profile', 'profile_id', 'user_id');
    }

    public function module(): BelongsToMany {
        return $this->belongsToMany(Module::class, 'profile_modules')
            ->withPivot(['can_read', 'can_write', 'can_delete'])
            ->withTimestamps();
    }
}
