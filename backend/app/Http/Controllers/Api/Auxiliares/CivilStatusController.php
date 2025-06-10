<?php

namespace App\Http\Controllers\Api\Auxiliares;

use App\Http\Controllers\Controller;
use App\Http\Resources\CivilStatusResource;
use App\Models\CivilStatus;
use Illuminate\Http\Request;

class CivilStatusController extends Controller
{
    public function index()
    {
        return CivilStatusResource::collection(CivilStatus::all());
    }
}
