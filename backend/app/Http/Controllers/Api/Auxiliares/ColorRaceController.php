<?php

namespace App\Http\Controllers\Api\Auxiliares;

use App\Http\Controllers\Controller;
use App\Http\Resources\ColorRaceResource;
use App\Models\ColorRace;
use Illuminate\Http\Request;

class ColorRaceController extends Controller
{
    public function index()
    {
        return ColorRaceResource::collection(ColorRace::all());
    }
}
