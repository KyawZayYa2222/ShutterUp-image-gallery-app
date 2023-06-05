<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\PremiumRecord;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function show(Request $request) {
        $id = Crypt::decrypt($request->id);
        $data = User::where('id', $id)->get()->first();
        $image = null;

        if ($data->image != null) {
            $image = 'http://127.0.0.1:8000/storage/user_image/'.$data->image;
        }

        $user = [
            'id' => $data->id,
            'name' => $data->name,
            'email' => $data->email,
            'image' => $image,
            'role' => $data->role,
        ];
        return response()->json(['user'=> $user], 201);
    }


    public function login(Request $request) {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if(empty($user)) {
            return response()->json(['message' => 'Email does not match!'], 400);
        }

        if(!Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Password does not match!'], 400);
        }

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


    public function logout(Request $request) {
        Auth()->user()->tokens()->delete();

        return [
            'message' => 'logout',
        ];
    }


    public function update(Request $request) {
        // return response()->json($request->id, 200);
        $id = Crypt::decrypt($request->id);
        // return response()->json($id, 200);
        $validator = Validator::make($request->all(), [
            'image' => 'required|mimes:jpg,jpeg,png,jfif,gif,svg|max:2084',
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users,email,' . $id,
        ]);

        if($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $oldImg = User::where('id', $id)->first()->image;
        // $oldImg = last(explode('/', $getOldImg));
        if($request->hasFile('image')) {
            if($oldImg != null) {
                Storage::delete(['public/user_image/'.$oldImg]);
            }
            $image = uniqid() . $request->file('image')->getClientOriginalName();
            $storePath = $request->file('image')->storeAs('user_image', $image, 'public');
            // $imageUrl = URL::to('') . '/storage/' . $storePath;
        }else {
            $image = null;
        }

        User::where('id', $id)->update([
            'name' => $request->name,
            'email' => $request->email,
            'image' => $image
        ]);

        return response()->json(['message'=> 'User info successfully updated.'], 201);
    }


    public function passwordUpdate(Request $request) {
        // return response()->json($request);
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'password' => 'required|string|confirmed',
        ]);

        if($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $id = Crypt::decrypt($request->id);

        $hashedPassword = User::where('id', $id)->get()->first()->password;

        if(!Hash::check($request->current_password, $hashedPassword)) {
            return response()->json(['message' => 'Password does not match!'], 400);
        }

        $password = Hash::make($request->password);

        User::where('id', $request->id)->update(['password' => $password]);

        return response()->json(['message' => 'Password successfully updated.'], 201);
    }


    public function getPremium(Request $request, $id) {
        $userId = Crypt::decrypt($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:225',
            'postal_code' => 'required|string|max:12',
            'card_num' => 'required|string|max:16',
            'expired_m' => 'required|string|max:2',
            'expired_y' => 'required|string|max:2',
            'cvv' => 'required|string|max:3',
        ]);

        if($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('id', $userId)->get()->first();
        $purchaseType = $request->purchase_type;

        if($purchaseType == 'monthly') {
            $cost = '6$';
            $duration = 30;
        } elseif($purchaseType == 'yearly') {
            $cost = '68$';
            $duration = 365;
        } else {
            return response()->json(['error' => 'Invalid purchase type'], 422);
        }

        $premiumEndDate = $user->premium_end_date;

        if($premiumEndDate != null) {
            $newStartDate = $premiumEndDate;
            $newEndDate = Carbon::parse($premiumEndDate)->addDays($duration);
        } else {
            $newStartDate = Carbon::now()->format('Y-m-d');
            $newEndDate = Carbon::now()->addDays($duration)->format('Y-m-d');
        }

        $user->update([
            'role' => 'premium',
            'premium_end_date' => $newEndDate,
        ]);

        PremiumRecord::create([
            'user_id' => $userId,
            'start_date' => $newStartDate,
            'end_date' => $newEndDate,
            'purchase_type' => $purchaseType,
            'cost' => $cost,
        ]);

        return response()->json(['message' => 'Payment is successful. Your purchase is active now.'], 200);

    }
}
