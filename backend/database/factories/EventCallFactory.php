<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventCalls>
 */
class EventCallFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array {
        return [
            'event_id' => \Illuminate\Support\Str::uuid(),
            'obs' => $this->faker->text(),
            'theme' => $this->faker->word(),
            'location' => $this->faker->word(),
            'start_date' => $this->faker->date(),
            'start_time' => $this->faker->time(),
            'end_date' => $this->faker->date(),
            'end_time' => $this->faker->time(),
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
        ];
    }
}
