<?php

namespace App\Http\Controllers\Api\Auxiliares;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    public function index()
    {
        return FormationResource::collection(Formation::all());
    }
}
