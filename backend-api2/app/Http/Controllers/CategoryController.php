<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request) {
        $fields = $request->validate([
            'name' => 'required|string|max: 225',
        ]);

        $data = [
            'name' => $fields['name'],
        ];

        Category::create($data);

        return response()->json(['message' => 'Category sucessfully created.'], 201);
    }


    public function index(Request $request) {
        $category = Category::get();

        return response()->json($category);
    }


    public function search(Request $request) {
        $key = $request->key;

        $resultCategory = Category::where('name', 'LIKE', "%$key%")->get('name');

        return response()->json($resultCategory, 200);
    }


    public function update(Request $request) {
        $fields = $request->validate([
            'name' => 'required|string|max: 225',
        ]);

        $data = [
            'name' => $fields['name'],
        ];

        Category::where('id', $request->id)->update($data);

        return response()->json(['message' => 'Category successfully updated.'], 201);
    }


    public function destory(Request $request) {
        Category::where('id', $request->id)->delete();

        return response()->json(['message' => 'Category successfully deleted.'], 201);
    }
}
