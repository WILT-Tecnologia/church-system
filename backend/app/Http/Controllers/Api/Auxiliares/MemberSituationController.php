<?php

namespace App\Http\Controllers\Api\Auxiliares;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberSituationResource;
use App\Models\MemberSituation;
use Illuminate\Http\Request;

class MemberSituationController extends Controller
{
    public function index()
    {
        return MemberSituationResource::collection(MemberSituation::all());
    }
}
