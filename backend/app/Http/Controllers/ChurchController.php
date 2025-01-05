<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChurchRequest;
use App\Http\Requests\UpdateChurchRequest;
use App\Http\Resources\ChurchResource;
use App\Models\Church;
use Illuminate\Http\Request;

class ChurchController extends Controller
{

    public function index() {
        $church = Church::with('responsible')->get();
        return response()->json($church);
    }

    public function store(StoreChurchRequest $request) {
        $data = $request->validated();

        $church = Church::create($data);

        return new ChurchResource($church);
    }

    public function show(Church $church) {
        return new ChurchResource($church);
    }

    public function update(UpdateChurchRequest $request, Church $church) {
        $data = $request->validated();

        $church->update($data);

        return new ChurchResource($church);
    }

    public function destroy(Church $church) {
        $church->delete();

        return response()->json([], 204);
    }
}
