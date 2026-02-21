<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFinancialCategoryRequest;
use App\Http\Requests\UpdateFinancialCategoryRequest;
use App\Http\Resources\FinancialCategoryResource;
use App\Models\FinancialCategory;
use Illuminate\Http\Request;

class FinancialCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = FinancialCategory::all()->sortBy("name")->sortByDesc('status');
        return FinancialCategoryResource::collection($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFinancialCategoryRequest $request)
    {
        $category = FinancialCategory::create($request->validated());

        return new FinancialCategoryResource($category);
    }

    /**
     * Display the specified resource.
     */
    public function show(FinancialCategory $financialCategory)
    {
        return new FinancialCategoryResource($financialCategory);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFinancialCategoryRequest $request, FinancialCategory $financialCategory)
    {
        $financialCategory->update($request->validated());

        return new FinancialCategoryResource($financialCategory);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FinancialCategory $financialCategory)
    {
        $financialCategory->delete();
        return response()->json(['message' => 'Categoria financeira removida com sucesso.']);
    }
}
