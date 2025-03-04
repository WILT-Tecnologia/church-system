<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePersonRequest;
use App\Http\Requests\UpdatePersonRequest;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    public function index() {
        $persons = Person::all()->sortBy('name');

        return response()->json(PersonResource::collection($persons));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePersonRequest $request) {
        $data = $request->validated();

        $person = Person::create($data);

        return new PersonResource($person);
    }

    /**
     * Display the specified resource.
     */
    public function show(Person $person) {
        return new PersonResource($person);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePersonRequest $request, Person $person) {
        $data = $request->validated();

        $person->update($data);

        return new PersonResource($person);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Person $person) {
        $person->delete();

        return response()->json([], 204);
    }
}
