<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Profile;
use Illuminate\Database\Seeder;

class ProfileAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Profile::create(['name' => 'Admin', 'description' => 'Administrador do sistema', 'status' => true]);
        Permission::create([
            'module' => 'users',
            'can_read' => true,
            'can_write' => true,
            'can_delete' => true,
        ]);
    }
}
