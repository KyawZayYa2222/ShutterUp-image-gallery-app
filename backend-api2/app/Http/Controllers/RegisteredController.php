<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;

class RegisteredController extends Controller
{
    public function register(Request $request) {
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users,email',
            'password' => 'required|string|confirmed',
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
        ]);

        $encryptedUserId = Crypt::encrypt($user->id);
        // $encryptionKey = config('app.key');
        $token = $user->createToken('myapptoken')->plainTextToken;

        $response = [
            'userId' => $encryptedUserId,
            // 'encryptionKey' => $encryptionKey,
            'token' => $token,
        ];

        return response()->json($response, 201);
    }
}
