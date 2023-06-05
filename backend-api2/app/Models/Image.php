<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'original_img',
        'high_quality_img',
        'normal_quality_img',
        'lazy_loading_img',
        'premium',
    ];
}
