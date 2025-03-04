<?php

namespace App\Http\Controllers\Api\Auxiliares;

use App\Http\Controllers\Controller;
use App\Http\Resources\KinshipResource;
use App\Models\Kinship;
use Illuminate\Http\Request;

class KinshipController extends Controller
{
    public function index()
    {
        return KinshipResource::collection(Kinship::all());
    }
}
