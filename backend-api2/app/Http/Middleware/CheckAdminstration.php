<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class CheckAdminstration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $id = Crypt::decrypt($request->header('user_id'));

        $query = User::where('id', $id)->get('role')->first();

        if($query->role != "admin") {
            return response()->json(['message' => 'You are not allowed for this action.'], 400);
        }
        return $next($request);
    }
}
