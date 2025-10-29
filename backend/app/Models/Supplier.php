<?php

namespace App\Models;

use App\Enums\TypeServiceEnum;
use App\Enums\TypeSupplierEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $table = 'suppliers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'church_id',
        'name',
        'type_supplier',
        'cpf_cnpj',
        'type_service',
        'pix_key',
        'status',
        'cep',
        'street',
        'number',
        'district',
        'city',
        'uf',
        'country',
        'phone_one',
        'phone_two',
        'phone_three',
        'email',
        'contact_name',
        'obs'
    ];

    protected $casts = [
        'status' => 'boolean',
        'type_supplier' => TypeSupplierEnum::class,
        'type_service' => TypeServiceEnum::class
    ];

    public function church(): BelongsTo
    {
        return $this->belongsTo(Church::class);
    }
}
