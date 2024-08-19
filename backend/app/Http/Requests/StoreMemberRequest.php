<?php

namespace App\Http\Requests;

use App\Enums\CivilStatusEnum;
use App\Enums\ColorRaceEnum;
use App\Enums\FormationEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemberRequest extends FormRequest
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
            'person_id' => ['required', 'exists:persons,id'],
            'church_id' => ['required', 'exists:churches,id'],
            'rg' => 'nullable',
            'issuing_body' => 'nullable',
            'civil_status' => ['required', Rule::enum(CivilStatusEnum::class)],
            'nationality' => 'required',
            'naturalness' => 'required',
            'color_race' => ['required', Rule::enum(ColorRaceEnum::class)],
            'formation' => ['required', Rule::enum(FormationEnum::class)],
            'formation_course' => 'nullable',
            'profission' => 'nullable',
            'def_physical' => ['sometimes', 'boolean'],
            'def_visual' => ['sometimes', 'boolean'],
            'def_hearing' => ['sometimes', 'boolean'],
            'def_intellectual' => ['sometimes', 'boolean'],
            'def_mental' => ['sometimes', 'boolean'],
            'def_multiple' => ['sometimes', 'boolean'],
            'def_other' => ['sometimes', 'boolean'],
            'def_other_description' => 'required_unless:def_other,false',
            'baptism_date' => ['nullable', 'date'],
            'baptism_locale' => 'nullable',
            'baptism_official' => 'nullable',
            'baptism_holy_spirit' => 'nullable',
            'baptism_holy_spirit_date' => ['nullable', 'date'],
            'member_origin_id' => ['required', 'exists:member_origins,id'],
            'receipt_date' => ['nullable', 'date']
        ];
    }
}
