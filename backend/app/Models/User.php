<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'change_password'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected string $guard_name = 'sanctum';

    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function person(): HasOne {
        return $this->hasOne(Person::class, 'user_id');
    }

    public function profile() {
        return $this->belongsToMany(Profile::class, 'user_profile', 'user_id', 'profile_id');
    }
}
