<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use App\Models\ImageCategoryJoiner;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Pagination\LengthAwarePaginator;

class ImageController extends Controller
{
    // image list
    public function index(Request $request) {
        $page = $request->section;
        $perPage = $request->limit;

        $data = Image::paginate($perPage, ['id', 'name', 'normal_quality_img', 'lazy_loading_img', 'premium'], 'page', $page);

        return response()->json($data, 200);
    }


    // Image download
    public function downloadFile(Request $request, $id) {
        $imageType = $request->img_type;

        if($imageType == 'normal') {
            $downloadLink = $this->CreateDownloadLink($id, $imageType);
            return response()->json(['downloadlink' => $downloadLink], 200);
        }

        if($imageType == 'high-quality' || $imageType == 'original') {
            if(Auth()->user()->role == 'premium') {
                $downloadLink = $this->CreateDownloadLink($id, $imageType);
                return response()->json(['downloadlink' => $downloadLink], 200);
            } else {
                return response()->json(['message' => 'You are not accessed for premium feature.'], 400);
            }
        }
    }


    public function showByCategory(Request $request) {
        $page = $request->section;
        $perPage = $request->limit;

        $data = ImageCategoryJoiner::where('category_id', $request->id)
                ->join('images', 'image_id', '=', 'images.id')
                ->select('images.id', 'images.name', 'images.normal_quality_img', 'images.lazy_loading_img', 'images.premium')
                ->paginate($perPage, '*', 'page', $page);
        return response()->json($data, 200);
    }


    public function showBySearchResult(Request $request) {
        $searchRes = $request->search_result;
        $resultCategory = Category::where('name', 'LIKE', "%$searchRes%")->get();
        $imageArr = [];
        $previousImgId = [];

        if(count($resultCategory) > 0) {
            foreach ($resultCategory as $category) {
                $images = ImageCategoryJoiner::where('category_id', $category->id)
                        ->join('images', 'image_id', '=', 'images.id')
                        ->select('images.id', 'images.name', 'images.normal_quality_img', 'images.lazy_loading_img', 'images.premium')
                        ->get();

                foreach ($images as $image) {
                    // filtering repeated image object and push
                    if(!in_array($image->id, $previousImgId)) {
                        array_push($imageArr ,$image);
                        array_push($previousImgId, $image->id);
                    }
                }
            }
        }

        // making pagination to image array
        $collection = new Collection($imageArr);

        $perPage = 6;

        if($collection->count() < $perPage) {
            $perPage = $collection->count();
        }

        if($collection->count() == 0) {
            return response()->json(['message' => 'No data found'], 404);
        }

        $currentPage = $request->section;
        $currentPageItems = $collection->slice(($currentPage - 1) * $perPage, $perPage);

        $paginator = new LengthAwarePaginator(
            $currentPageItems->toArray(),
            $collection->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url()]
        );

        return response()->json($paginator, 200);
    }


    public function store(Request $request) {
        // validation check
        $validator = $this->ValidationCheck($request);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // store original image in storage
        $originalImage = $this->StoreFiles($request, 'original_img', 'original_image');

        // store high quality image in storage
        $highQImage = $this->StoreFiles($request, 'high_q_img', 'high_quality_image');

        // store normal quality image in storage
        $normalQImage = $this->StoreFiles($request, 'normal_q_img', 'normal_quality_image');

        // store lazy loading image in storage
        $lazyLoadImage = $this->StoreFiles($request, 'lazy_load_img', 'lazy_loading_image');

        if($request->premium == 'true') {
            $premium = 1;
        } else {
            $premium = 0;
        }

        $fields = [
            'name' => $request->name,
            'original_img' => $originalImage,
            'high_quality_img' => $highQImage,
            'normal_quality_img' => $normalQImage,
            'lazy_loading_img' => $lazyLoadImage,
            'premium' => $premium,
        ];

        // insert to image tb
        $imageQuery = Image::create($fields);

        // image id
        $imageId = $imageQuery->id;

        // insert data to image category joiner tb
        $categories = explode(',', $request->categories);
        foreach ($categories as $category) {
            $categoryId = Category::where('name', $category)->get()->first()->id;
            ImageCategoryJoiner::create([
                'image_id'=> $imageId,
                'category_id'=> $categoryId,
            ]);
        }

        return response()->json(['message' => 'success'], 200);
    }

    // validation check
    private function ValidationCheck($request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:225',
            'categories' => 'required',
            'original_img' => 'required|image|max:12084',
            'high_q_img' => 'required|image|max:8084',
            'normal_q_img' => 'required|image|max:2084',
            'lazy_load_img' => 'required|image|max:40',
        ]);
        return $validator;
    }

    // files store
    private function StoreFiles($request, $fileName, $folder) {
        if($request->hasFile($fileName)) {
            $image = uniqid() . $request->file($fileName)->getClientOriginalName();
            $storePath = $request->file($fileName)->storeAs($folder, $image, 'public');
            return $image;
        }
    }

    private function CreateDownloadLink($imageId, $imageType) {
        $imageData = Image::where('id', $imageId)->get()->first();
        // return response()->json($imageId, 200);

        switch ($imageType) {
            case 'high-quality':
                $filePath = public_path('storage/high_quality_image/'.$imageData->high_quality_img);
                break;

            case 'original':
                $filePath = public_path('storage/original_image/'.$imageData->original_img);
                break;

            default:
                $filePath = public_path('storage/normal_quality_image/'.$imageData->normal_quality_img);
                break;
        }

        $downloadUrl = URL::temporarySignedRoute('file.download', now()->addMinutes(15), ['url' => $filePath]);

        return $downloadUrl;
    }
}
