// User Id
var userId = null;
if (localStorage.getItem('user_id') != null) {
    userId = localStorage.getItem('user_id');
}
// api access token
var token = $.cookie('token');

// client form error handler 
var errors = (name, error) => {
    $('#'+name+'-error').text(error);
};

// ------------- Category fetching & CRUD ------------ //
function fetchCategory() {
    // loading effect 
    $('#acl-loading').show();
    let listArr = [];
    $.ajax({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/category/list',
        headers: {'Authorization': 'Bearer ' + token},
        // data: JSON.stringify({'user_id': userId}),
        contentType: 'application/json',
        dataType: 'json',
        complete: function() {
            $('#acl-loading').hide();
        },
        success: function(response) {
            // console.log(response)
            var categoryTable = $('#category-tb');
            categoryTable.html('');
            var i = 0;
            let tableHead = `
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>`;
            categoryTable.append(tableHead);

            response.forEach(function(response) {
                i += 1;
                let tabeRow = `
                <tr>
                    <td>${i}</td>
                    <td>${response.name}</td>
                    <td>
                      <div class="d-flex">
                        <button class="btn btn-sm btn-primary me-2" 
                        onclick="categoryEdit(${response.id},'${response.name}')">Edit</button>
                        <button class="btn btn-sm btn-danger" 
                        onclick="categoryDelete(`+response.id+`)">Delete</button>
                      </div>
                    </td>
                </tr>`;
                categoryTable.append(tabeRow);  
                // insert data to category list array for reuseable
                listArr.push(response);
            })
        },
        error: function(jqHXR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

    return listArr;
}
var categoryList = fetchCategory();

// Edit category 
function categoryEdit(id, name) {
    $('#staticBackdrop').remove();

    let modelTemplate = `
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" 
    tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Update Category</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="category-upd-form">
              <span class="error-span text-danger" id="ctg-upd-name-error"></span>
              <input type="text" name="name" class="form-control mb-3" value="`+ name +`">
              <input type="hidden" name="id" value="`+ id +`">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>`;

    $('#main').append(modelTemplate);

    $('#staticBackdrop').modal('show');

    // update ajax 
    $('#category-upd-form').submit(categoryUpdate);
}

// Update category callback
function categoryUpdate(e) {
    e.preventDefault();
    let name = $('#category-upd-form > input[name=name]').val();
    let id = $('#category-upd-form > input[name=id]').val();
    let formData = {'name': name, 'id': id};

    $.ajax({
        url: 'http://127.0.0.1:8000/api/category/update',
        method: 'PUT',
        headers: {'Authorization': 'Bearer ' + token, 'user_id': userId},
        data: JSON.stringify(formData),
        contentType: 'application/json',
        dataType: 'json',
        complete: function() {

        },
        success: function(response) {
            console.log(response)
            $('#staticBackdrop').modal('hide');
            let alert = `<div class="alert alert-success alert-dismissible fade show" 
                        role="alert">${response.message}<button type="button" 
                        class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                        </button></div>`;
            $('#category-cud-success-alert').html(alert); 

            categoryList = fetchCategory();
        },
        error: function(jqHXR, textStatus, errorThrown) {
            console.log(errorThrown);
            const nameErr = jqHXR.responseJSON.errors.name;
            nameErr ? errors('ctg-upd-name', nameErr[0]): errors('ctg-upd-name', null);
        }
    })
}

// Delete Category
function categoryDelete(id) {
    $.ajax({
        url: 'http://127.0.0.1:8000/api/category/delete',
        method: 'DELETE',
        headers: {'Authorization': 'Bearer ' + token, 'user_id': userId},
        data: JSON.stringify({'id': id}),
        contentType: 'application/json',
        dataType: 'json',
        success:function(response) {
            let alert = `<div class="alert alert-danger alert-dismissible fade show" 
                        role="alert">${response.message}<button type="button" 
                        class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                        </button></div>`;
            $('#category-cud-success-alert').html(alert); 

            categoryList = fetchCategory();
        },
        error: function(jqHXR, textStatus, errorThrown){
            console.log(errorThrown)
            const nameErr = jqHXR.responseJSON.errors.name;
            nameErr ? errors('name', nameErr[0]): errors('name', null);
        }
    })
}

$('#category-create-form').submit(function(e) {
    e.preventDefault();
    var category = $('#category-create-form > input[type=text]');

    // loading effect 
    $('#af-loading-1').show();

    $.ajax({
        url: 'http://127.0.0.1:8000/api/category/create',
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + token, 'user_id': userId},
        data: JSON.stringify({'name': category.val()}),
        contentType: 'application/json',
        dataType: 'json',
        complete: function() {
            $('#af-loading-1').hide();
        },
        success: function(response) {
            console.log(response);
            if(response.message) {
                category.val('');
                let alert = `<div class="alert alert-success alert-dismissible fade show" 
                            role="alert">${response.message}<button type="button" 
                            class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                            </button></div>`;
                $('#category-cud-success-alert').html(alert); 

                categoryList = fetchCategory();
            }
        },
        error: function(jqHXR, textStatus, errorThrown) {
            // console.log(response)
            const nameErr = jqHXR.responseJSON.errors.name;
            nameErr ? errors('name', nameErr[0]): errors('name', null);
        }
    })
})

// --------- Image & File Upload page & CRUD --------- // 
$('#upload-form-link').click(() => {
    $('#uploaded-image-overview').hide();
    $('#file-upload-form').show();
})

$('#file-overview-link').click(() => {
    $('#uploaded-image-overview').show();
    $('#file-upload-form').hide();
})

var selectedCategories = [];
// Removing selected category on click
function removeCategory(index) {
    selectedCategories.splice(index, 1);
    $('#ctg-'+index).remove();
} 

// search and selecting category input  
$('#category-search').keyup(function() {
    let searchTag = $(this);
    let searchResultTag = $('#search-result-con');
    searchResultTag.html('');
    
    // filter from category api 
    let filteredCategory = [];
    let searchText = searchTag.val().toLowerCase();
    filteredCategory = categoryList.filter((category) => {
        return category.name.toLowerCase().includes(searchText);
    })

    // showing search result 
    if (searchText.length > 0) {
        let searchResultBox = `<div class="border rounded shadow-sm p-1 mt-1" 
                                id="search-result-box"></div>`;
        searchResultTag.html(searchResultBox);

        if (filteredCategory.length > 0) {
            filteredCategory.forEach(function(category, index) {
                let filterResultTag = `<span class="cgs-result-span px-1" 
                                        data-id="${index}">${category.name}</span>`;
                $('#search-result-box').append(filterResultTag);
            })
        }else {
            let noResult = `<p class="text-center">No result</p>`;
            $('#search-result-box').append(noResult);
        }
    }

    // selecting & storing category 
    $('.cgs-result-span').click(function() {
        let index = $(this).data('id');
        let selectedCategroy = filteredCategory[index].name;
        let selectedBox = $('#category-selected-box');
        searchTag.val(selectedCategroy);
        searchResultTag.html('');
        selectedBox.html('');

        if (!selectedCategories.includes(selectedCategroy)) {
            selectedCategories.push(selectedCategroy);   
        }
        
        selectedCategories.forEach(function(category, index) {
            let categoryTemp = `<div class="border rounded p-1 my-1 me-2 d-inline-block" 
                                id="ctg-${index}">${category} <i class="bi bi-x ctg-remove-btn" 
                                onclick="removeCategory(${index})"></i></div>`;
            selectedBox.append(categoryTemp);
        })
    })
})

// original image upload preview properties ----- //

// file properties preview funct 
function fileProperties() {
    let filePropertyTag = $('#'+this.id+'-property');
    let file = this.files[0];

    if(file) {
        let reader = new FileReader();
        reader.onload = () => {
            filePropertyTag.html('');
            let result = reader.result;
            let img = new Image();

            img.onload = () => {
                let fileSize;
                let fileSizeLength = file.size.toString().length;
                if (fileSizeLength >= 4 && fileSizeLength <= 5) {
                    fileSize = (file.size / 1000) + 'KB';
                }else if (fileSizeLength > 5) {
                    fileSize = (file.size / 1000000) + 'MB';
                } else {
                    fileSize = file.size + 'B';
                }

                let propertyTag = `<div class="border rounded px-2 py-1 mb-3 d-flex flex-column"
                                    style="width: fit-content;background-color: white;">
                                    <small><b><i>Properties</i></b></small>
                                    <small><i>File name</i> : ${file.name}</small>
                                    <small><i>File type</i> : ${file.type}</small>
                                    <small><i>Ratio</i> : ${img.width} x ${img.height}</small>
                                    <small><i>Size</i> : ${fileSize}</small>
                                   </div>`;
                filePropertyTag.append(propertyTag);
            }
            img.src = result;
        }
        reader.readAsDataURL(file);
    }
}

$('input[name=original_img]').on('change', fileProperties);
$('input[name=high_q_img]').on('change', fileProperties);
$('input[name=normal_q_img]').on('change', fileProperties);
$('input[name=lazy_load_img]').on('change', fileProperties);

// File upload form ajax contorl 
$('#file-upload-form').submit(function(e) {
    e.preventDefault();
    let imageName = $('input[name=img-file-name]', this).val();
    let originalImg = $('input[name=original_img]', this)[0].files[0];
    let highQImg = $('input[name=high_q_img]', this)[0].files[0];
    let normalQImg = $('input[name=normal_q_img]', this)[0].files[0];
    let lazyLoadImg = $('input[name=lazy_load_img]', this)[0].files[0];
    let premium;
    if($('#premium-feature')[0].checked) {
        premium = true;
    } else {
        premium = false;
    }
    // console.log(originalImg, highQImg, normalQImg, lazyLoadImg)
    let formData = new FormData();
    formData.append('name', imageName)
    formData.append('categories', selectedCategories)
    formData.append('original_img', originalImg)
    formData.append('high_q_img', highQImg)
    formData.append('normal_q_img', normalQImg)
    formData.append('lazy_load_img', lazyLoadImg);
    formData.append('premium', premium);
    
    $.ajax({
        url: 'http://127.0.0.1:8000/api/imagefiles/create',
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + token, 'user_id': userId},
        data: formData,
        contentType: false,
        processData: false,
        complete: function() {

        },
        success: function(response) {
            console.log(response)
            if(response.message == "success") {
                let alert = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    `+ response.message +`
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
                $('#file-upload-success-alert').html(alert);
            }
        }, 
        error: function(jqHXR, textStatus, errorThrown) {
            console.log(errorThrown);
            const nameErr = jqHXR.responseJSON.errors.name;
            const categoryErr = jqHXR.responseJSON.errors.categories;
            const originalImgErr = jqHXR.responseJSON.errors.original_img;
            const highQImgErr = jqHXR.responseJSON.errors.high_q_img;
            const normalQImgErr = jqHXR.responseJSON.errors.normal_q_img;
            const lazyLoadImgErr = jqHXR.responseJSON.errors.lazy_load_img;

            nameErr ? errors('img-name', nameErr[0]): errors('img-name', null);
            categoryErr ? errors('category', categoryErr[0]): errors('category', null);
            originalImgErr ? errors('original-img', originalImgErr[0]): errors('original-img', null);
            highQImgErr ? errors('high-q-img', highQImgErr[0]): errors('high-q-img', null);
            normalQImgErr ? errors('normal-q-img', normalQImgErr[0]): errors('normal-q-img', null);
            lazyLoadImgErr ? errors('lazy-load-img', lazyLoadImgErr[0]): errors('lazy-load-img', null);
        }
    })
})