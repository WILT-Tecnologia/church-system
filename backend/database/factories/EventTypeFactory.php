<?php

namespace Database\Factories;

use App\Models\EventType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventType>
 */
class EventTypeFactory extends Factory
{
    protected $model = EventType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array {
        $eventTypes = [
            'Culto',
            'Reunião de Oração',
            'Estudo Bíblico',
            'Escola biblica',
            'Batismo',
            'Casamento',
            'Seminário',
            'Conferência',
            'Acampamento',
            'Retiro Espiritual',
            'Grupo de Jovens',
        ];

        return [
            'name' => $this->faker->unique()->randomElement($eventTypes),
            'description' => $this->faker->sentence(),
            'color' => $this->faker->hexColor(),
            'status' => $this->faker->boolean(),
        ];
    }
}
