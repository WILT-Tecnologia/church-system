<?php

namespace App\Http\Requests;

use App\Enums\TypeEntryEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Laravel\Telescope\EntryType;

class StorePatrimonyRequest extends FormRequest
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
            'church_id' => ['required', 'uuid', 'exists:churches,id'],
            'number' =>  ['required'],
            'name' => ['required'],
            'registration_date' => ['required', 'date'],
            'description' => ['required'],
            'type_entry' => ['required',  new Enum(TypeEntryEnum::class)],
            'price' => ['nullable', 'decimal:2'],
            'is_member' => ['sometimes', 'boolean'],
            'member_id' => ['required_unless:is_member,false'],
            'donor' => ['nullable', 'string'],
            'photo' => ['nullable']
        ];
    }
}
