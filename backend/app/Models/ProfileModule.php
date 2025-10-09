<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfileModule extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'profile_modules';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'profile_id',
        'module_id',
        'can_read',
        'can_write',
        'can_delete',
    ];

    protected $casts = [
        'can_read' => 'boolean',
        'can_write' => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function profile() {
        return $this->belongsTo(Profile::class);
    }

    public function module() {
        return $this->belongsTo(Module::class);
    }
}
