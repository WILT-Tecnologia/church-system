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
        'id',
        'name',
        'description',
        'status',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_profile');
    }

    public function permissions()
    {
        return $this->belongsToMany(
        Permission::class,          // Modelo relacionado
        'profile_permission',       // Tabela pivot
        'profile_id',               // Chave estrangeira local
        'permission_id'             // Chave estrangeira do modelo relacionado
    )->withTimestamps();
        //return $this->belongsToMany(Permissions::class);
    }
}
