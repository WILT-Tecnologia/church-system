<?php

namespace App\Http\Middleware;


use Auth;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetUserId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response {
        if (Auth::check()) {
            $userId = Auth::id();

            // Adiciona created_by e updated_by ao request se necessário
            if ($request->isMethod('post')) {
                $request->merge(['created_by' => $userId]);
            }

            if ($request->isMethod('put') || $request->isMethod('patch')) {
                $request->merge(['updated_by' => $userId]);
            }
        }

        return $next($request);
    }
}
