<?php

namespace App\Http\Requests;

use App\Enums\TypeEntryEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Laravel\Telescope\EntryType;

class UpdatePatrimonyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'church_id' => ['sometimes', 'required', 'uuid', 'exists:churches,id'],
            'number' =>  ['sometimes', 'required'],
            'name' => ['sometimes', 'required'],
            'registration_date' => ['sometimes', 'required', 'date'],
            'description' => ['sometimes', 'required'],
            'type_entry' => ['sometimes', 'required', new Enum(TypeEntryEnum::class)],
            'price' => ['sometimes', 'nullable', 'decimal:2'],
            'is_member' => ['sometimes', 'boolean'],
            'member_id' => ['sometimes', 'required_unless:is_member,false'],
            'donor' => ['sometimes', 'nullable', 'string'],
            'photo' => ['sometimes', 'nullable']
        ];
    }
}
