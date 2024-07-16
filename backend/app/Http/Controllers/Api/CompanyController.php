<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;


class CompanyController extends Controller
{
    public function index()
    {
        return CompanyResource::collection(Company::paginate());
    }

    public function store(StoreCompanyRequest $request)
    {
        $data = $request->validated();

        $company = Company::create($data);

        return new CompanyResource($company);
    }

    public function show(Company $company)
    {
        return new CompanyResource($company);
    }

    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $data = $request->validated();

        $company->update($data);

        return new CompanyResource($company);
    }

    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json([], 204);
    }
}
