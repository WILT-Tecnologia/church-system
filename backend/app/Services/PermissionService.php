<?php

namespace App\Services;

use App\Models\Module;
use Illuminate\Support\Str;

class PermissionService
{
    public function permissionKey(Module $module): string
    {
        $moduleName = Str::of($module->name)
            ->lower()
            ->replace([' ', '/', '_'], '_')
            ->ascii()
            ->snake();

        return "{$module->context}_{$moduleName}";
    }
}
