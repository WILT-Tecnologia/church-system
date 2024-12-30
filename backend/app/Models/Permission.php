<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permission extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'permissions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'module',
        'can_read',
        'can_write',
        'can_delete',
    ];

    protected $casts = [
        'can_read' => 'boolean',
        'can_write' => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function profile()
    {
        return $this->belongsToMany(
        Profile::class,
        'profile_permission',
        'permission_id',
        'profile_id'
    )->withTimestamps();
        //return $this->belongsToMany(Profile::class);
    }
}
