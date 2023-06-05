<?php

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RegisteredController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// public routes
Route::post('/register', [RegisteredController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/contact/create', [ContactController::class, 'store']);
Route::get('/category/list', [CategoryController::class, 'index']);
Route::get('/category/search', [CategoryController::class, 'search']);
Route::get('/images/paginatedList', [ImageController::class, 'index']);
Route::get('/images/filter/category', [ImageController::class, 'showByCategory']);
Route::get('/images/filter/search', [ImageController::class, 'showBySearchResult']);

// Image download temporary link
Route::get('file/download', function(Request $request) {
    if (! $request->hasValidSignature()) {
        return response()->json(['message' => 'Route not found.'], 404);
    }
    return response()->download($request->url);
})->name('file.download');


// authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::delete('/user/logout', [UserController::class, 'logout']);
    Route::post('/user/update', [UserController::class, 'update']);
    Route::post('/user/password/update', [UserController::class, 'passwordUpdate']);
    Route::put('/user/{id}/premium', [UserController::class, 'getPremium']);
    Route::post('/images/{id}/download', [ImageController::class, 'downloadFile']);
});

// Authenticated Admin Routes
Route::middleware(['auth:sanctum', 'admin_auth'])->group(function () {
    Route::post('/category/create', [CategoryController::class, 'store']);
    Route::put('/category/update', [CategoryController::class, 'update']);
    Route::delete('/category/delete', [CategoryController::class, 'destory']);
    Route::post('/imagefiles/create', [ImageController::class, 'store']);
});
