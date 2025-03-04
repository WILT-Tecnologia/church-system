<?php

namespace Database\Factories;

use App\Models\MemberOrigin;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MemberOrigin>
 */
class MemberOriginFactory extends Factory
{
    protected $model = MemberOrigin::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'        => $this->faker->unique()->company(),
            'description' => $this->faker->sentence(),
            'status'      => $this->faker->boolean(),
        ];
    }
}
