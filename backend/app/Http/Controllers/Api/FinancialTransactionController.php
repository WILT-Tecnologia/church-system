<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFinancialTransactionRequest;
use App\Http\Requests\UpdateFinancialTransactionRequest;
use App\Http\Resources\FinancialCategoryResource;
use App\Http\Resources\FinancialTransactionResource;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use Illuminate\Http\Request;

class FinancialTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return FinancialTransactionResource::collection(FinancialTransaction::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFinancialTransactionRequest $request)
    {
        $transation = FinancialTransaction::create($request->validated());

        return new FinancialTransactionResource($transation);
    }

    /**
     * Display the specified resource.
     */
    public function show(FinancialTransaction $financialTransaction)
    {
        return new FinancialTransactionResource($financialTransaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFinancialTransactionRequest $request, FinancialTransaction $financialTransaction)
    {
        $financialTransaction->update($request->validated());

        return new FinancialTransactionResource($financialTransaction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FinancialTransaction $financialTransaction)
    {
        $financialTransaction->delete();

        return response()->noContent();
    }
}
