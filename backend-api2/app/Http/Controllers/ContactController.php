<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request) {
        $fields = $request->validate([
            'name' => 'required|string|max:225',
            'email' => 'required|string|max:225',
            'message' => 'required|string',
        ]);

        Contact::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'message' => $fields['message'],
        ]);

        return response()->json(['message' => 'Your message was sent sucessfully.'], 200);
    }
}
