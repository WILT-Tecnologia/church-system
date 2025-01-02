<?php

namespace App\Http\Middleware;

use Closure;
use App;

class CorsDomainMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->isMethod('OPTIONS')) {
            return response()->json(null, 200)->header(
                'Access-Control-Allow-Methods',
                'HEAD, GET, POST, PUT, PATCH, DELETE'
            )
            ->header(
                'Access-Control-Allow-Headers',
                $request->header('Access-Control-Request-Headers')
            )
            ->header('Access-Control-Allow-Origin', '*');
        }

        $response = $next($request);
        return $response
            ->header(
                'Access-Control-Allow-Methods',
                'HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS'
            )
            ->header(
                'Access-Control-Allow-Headers',
                $request->header('Access-Control-Request-Headers')
            )
            ->header('Access-Control-Allow-Origin', '*');
    }
}
