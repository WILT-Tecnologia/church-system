<?php

namespace App\Http\Requests;

use App\Enums\CivilStatusEnum;
use App\Enums\ColorRaceEnum;
use App\Enums\FormationEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
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
            'person_id' => ['sometimes','required', 'exists:persons,id'],
            'church_id' => ['sometimes','required', 'exists:churches,id'],
            'rg' => ['sometimes','nullable'],
            'issuing_body' => ['sometimes','nullable'],
            'civil_status' => ['sometimes','required', Rule::enum(CivilStatusEnum::class)],
            'nationality' => ['sometimes','required'],
            'naturalness' => ['sometimes','required'],
            'color_race' => ['sometimes','required', Rule::enum(ColorRaceEnum::class)],
            'formation' => ['sometimes', 'required', Rule::enum(FormationEnum::class)],
            'formation_course' => ['sometimes','nullable'],
            'profission' => ['sometimes','nullable'],
            'def_physical' => ['sometimes', 'boolean'],
            'def_visual' => ['sometimes', 'boolean'],
            'def_hearing' => ['sometimes', 'boolean'],
            'def_intellectual' => ['sometimes', 'boolean'],
            'def_mental' => ['sometimes', 'boolean'],
            'def_multiple' => ['sometimes', 'boolean'],
            'def_other' => ['sometimes', 'boolean'],
            'def_other_description' => ['sometimes', 'required_unless:def_other,false'],
            'baptism_date' => ['sometimes', 'nullable', 'date'],
            'baptism_locale' => ['sometimes','nullable'],
            'baptism_official' => ['sometimes','nullable'],
            'baptism_holy_spirit' => ['sometimes','nullable'],
            'baptism_holy_spirit_date' => ['sometimes', 'nullable', 'date'],
            'member_origin_id' => ['sometimes', 'required', 'exists:member_origins,id'],
            'receipt_date' => ['sometimes', 'nullable', 'date']
        ];
    }
}
