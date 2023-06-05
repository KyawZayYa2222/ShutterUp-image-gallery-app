$(document).ready(function() {
    // menu btn toggle  -------  //
    $('#menu-toggle').click(function() {
        let sideMenu = $('.side-menu');
        if (sideMenu.hasClass('sidebar-active')) {
            sideMenu.removeClass('sidebar-active');
        }else {
            sideMenu.addClass('sidebar-active');
        }
    })

    // side menu action 
    $('#sidebar-close-btn').click(function() {
        $('.side-menu').removeClass('sidebar-active');
    })

    $('.side-menu-link').click(function() {
        $('.side-menu').removeClass('sidebar-active');
    })

    getUserInfo();

    // page changing and authantication 
    authRouteCtrl();

    $(window).on('hashchange', function() {
        authRouteCtrl();
    });
    
    if (location.href == 'http://127.0.0.1:5500/login.html' || location.href == 'http://127.0.0.1:5500/register.html') {
        if ($.cookie('token')) {
            window.location = "http://127.0.0.1:5500/#home";
        }        
    }

    // login features 
    if ($.cookie('token')) {
        $('.login-link').hide();
        $('.register-link').hide();
    }

    // profile section user actions ------- //
    function showGPage() {
        $('.g-page').css('display', 'none')
        userActiveGId = $('.user-act-active').data('id');
        $('#'+userActiveGId).css('display', 'block');
    }

    $('.user-action').click(function() {
        $('.user-action').removeClass('user-act-active');
        $(this).addClass('user-act-active');
        showGPage()
    })
    showGPage()

    // setting section form page ------ //
    function showStPage() {
        $('.st-page').css('display', 'none')
        userActiveGId = $('.st-act-active').data('id');
        $('#'+userActiveGId).css('display', 'block');
    }

    $('.st-action').click(function() {
        $('.st-action').removeClass('st-act-active');
        $(this).addClass('st-act-active');
        showStPage()
    })
    showStPage()

    // passowrd hide show check toggle -------- //
    $('#hide-show-pass').change(function() {
        this.checked ? changeInputType('text'): changeInputType('password')
    });

    function changeInputType(type) {
        $('.pass-input').each(function() {
            this.type = type;
        })
    };

    // Category fetching 
    getCategory();

    // Initial Image fetching ---------- //
    responsiveImgCols();
    getImage();

    // Infinate scrolling 
    $(window).on('scroll', (e) => {
        if($('#home').hasClass('page-active')) {
            if(Math.ceil(innerHeight + scrollY) == $('#home-page-body')[0].offsetHeight) {
                section++
                if(imgFetchingMood === 'cate-filter') {
                    getImgByCateFilter()
                } else if(imgFetchingMood === 'search-filter') {
                    // let searchResult = $('#search-input').val();
                    // getImgBySearchResult(searchResult);
                    return;
                } else {
                    getImage();
                }
            }
        }
        return;
    })

    // detect window screen size 
    let previousWidth = window.innerWidth;
    $(window).resize((e) => {
        let currentWidth = window.innerWidth;
        if(currentWidth !== previousWidth) {
            responsiveImgCols();
            if(imgFetchingMood === 'cate-filter') {
                getImgByCateFilter()
            }else if(imgFetchingMood === 'search-filter') {
                getImgBySearchResult();
            } else {
                getImage();
            }
        }
    })

    // search form control ----- 
    $('#search-input').on('blur', () => {
        setTimeout(() => {
            $('#search-resultbox').remove();
        }, 300);
    });

    $('#search-input').on('focus', () => {
        showSearchHistory();
    });
    
    $('#search-input').on('keyup', (event) => {
        if($(event.target).val().length >= 1) {
            showSearchResult(event)
        } else {
            showSearchHistory()
        }
    })

    $('#search-form').submit((e) => {
        e.preventDefault();
    })

    $('#search-form-moblie').submit((e) => {
        e.preventDefault();
        imgFetchingMood = 'search-filter';
        responsiveImgCols();
        let searchResult = $('#search-input-mobile').val();
        storeSearchHistory(searchResult);
        getImgBySearchResult(searchResult);
        $('#searchModal').modal('hide');
    })
})




// ---------- functions before page load & resuable ------------- //
// User Id -------
var userId = null;
if (localStorage.getItem('user_id') != null) {
    userId = localStorage.getItem('user_id');
}

var userRole = '';

// Api Accessed Token 
var token = $.cookie('token');

// client form error handler 
var errors = (name, error) => {
  $('#'+name+'-error').text(error);
}



// Authnicated route control  -------- ///
function authRouteCtrl() {
    if (location.hash === '#profile') {
        if(! $.cookie('token')) {
            window.location = "http://127.0.0.1:5500/login.html";
        } else {
            loadContent();
        }
    }else {
        loadContent();
    }
}

// page content change  ------- //
function loadContent() {
    $('.page-content').removeClass('page-active')
    var hashUrl = location.hash

    if(!location.hash) {
        $('#home').addClass('page-active');
    }

    $(hashUrl).addClass('page-active');
}

// ---------- search action and searchbar control --------- //
// showing search history on focus 
function showSearchHistory() {
    $('#search-resultbox').remove()
    let resultBoxTemp = `
    <div class="position-absolute mt-5 px-2 py-1 bg-light border rounded 
    shadow-sm mt-1" style="width: 100%;z-index:100;" id="search-resultbox">
        <h4 class="text-secondary fst-italic">Search history</h4>
        <div id="search-span-con"></div>
    </div>`;
    $('#searchbox').append(resultBoxTemp);

    let history = localStorage.getItem('search_history');
    let resultTemp = '';
    if(history) {
        history = JSON.parse(history);
        history.forEach(item => {
            let span = `<button class="btn btn-secondary text-light m-1 px-2 py-1 rounded d-inline-block"
                        onclick="searchHistoryResult('${item}')">${item}</button>`;

            $('#search-span-con').append(span);
        });
    }else {
        resultTemp = `<p class="text-center text-secondary">No search record have.</p>`;
        $('#search-span-con').append(resultTemp);
    }
}

function storeSearchHistory(searchItem) {
    let history = localStorage.getItem('search_history');
    if(history) {
        history = JSON.parse(history);
        if(history.length >= 8) {
            history.shift();
        }
        history.push(searchItem);
        localStorage.setItem('search_history', JSON.stringify(history));
    } else {
        history = [];
        history.push(searchItem);
        localStorage.setItem('search_history', JSON.stringify(history))
    }
}

function searchHistoryResult(searchResult) {
    imgFetchingMood = 'search-filter';
    section = 1;
    responsiveImgCols();
    getImgBySearchResult(searchResult);
}

$('.history-item').click(() => {
    console.log('hello')
})

// showing category that matched with search keywords 
function showSearchResult(event) {
    let key = $(event.target).val()
    let searchResultTemp = `
    <div class="overflow-scroll px-2" id="result-box" style="max-height: 200px">
    </div>`;
    $('#search-resultbox').html(searchResultTemp);

    // search filtering from category 
    let results = categories.filter((category) => {
        return category.name.toLowerCase().includes(key);
    })

    if(results.length > 0) {
        results.forEach((result, index) => {
            let resultSpanTemp = `
                                <div class="border-0 border-bottom boder-secondary px-2 py-1 search-result-span" 
                                id="res-${index}" onclick="getImgByMouseSelecting('${result.name}')">${result.name}</div>`;
            $('#result-box').append(resultSpanTemp);
        });
    } else {
        let resultSpanTemp = `
                            <div class="border-0 border-bottom boder-secondary px-2 py-1 search-result-span" 
                            style="background-color: #F0F0F0;">${key}</div>`;
        $('#result-box').append(resultSpanTemp);
    }

    resultSelectControl(event, results);
}

// search category result select control 
var selectIndex = -1;
function resultSelectControl(event, results) {
    switch (event.key) {
        case 'ArrowDown':
            if(selectIndex === results.length) {
                selectIndex = -1;
            }
            selectIndex ++
            console.log(selectIndex)
            selectedResult(event, selectIndex, results)
            break;

        case 'ArrowUp':
            if(selectIndex <= -1) {
                selectIndex = results.length;
            }
            selectIndex --
            console.log(selectIndex)
            selectedResult(event, selectIndex, results)
            break;

        case 'Enter':

            imgFetchingMood = 'search-filter';
            section = 1;

            if(selectIndex >= 0 && selectIndex <= results.length) {
                $(event.target).val(results[selectIndex].name.toLowerCase())
            }
            responsiveImgCols();
            let searchResult = $('#search-input').val();
            storeSearchHistory(searchResult);
            getImgBySearchResult(searchResult);
            break;

        default:
            break;
    }
}

// select result tag action 
function selectedResult(event, selectIndex, results) {
    let selectedRes = $('#res-'+selectIndex);
    selectedRes.css('background-color', '#e5e5e5');
}

function getImgByMouseSelecting(searchResult) {
    imgFetchingMood = 'search-filter';
    section = 1;
    responsiveImgCols();
    getImgBySearchResult(searchResult);
    storeSearchHistory(searchResult);
}

function getImgBySearchResult(searchResult) {
    if(
        location.hash != '#home' ||
        location.hash != '#' ||
        location != 'http://127.0.0.1:5500'
        ) {
            location.hash = '#home';
            getImgAjax(searchResult);
    } else {
        getImgAjax(searchResult);
    }


function getImgAjax(searchResult) {
    // Loading 
    $('#image-content-loading').append(imgLoadingTemp);
    $.ajax({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/images/filter/search',
        data: {'search_result': searchResult, 'section': section},
        contentType: 'application/json',
        dataType: 'json',
        complete: () => {
            $('#image-load-spinner').remove();
            $('#search-input').blur();
        },
        success: (response) => {
            imageCardAppend(response, colNum);
            // lazy loading 
            $(".lazy").each(function() {
                observer.observe(this);
            });
        },
        error: (jqHXR, textStatus, errorThrown) => {
            console.log(jqHXR)
        }
    })
}
}

// Category fetching 
var categories = [];
function getCategory() {
    $.ajax({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/category/list',
        contentType: 'application/json',
        success: function(response) {
            response.forEach(data => {
                categories.push(data);

                let categorySpan = `<span class="px-2 py-1 mx-2 mb-2 d-inline-block 
                                    border border-secondary rounded category-span" 
                                    onclick="categoryFilter(${data.id})">${data.name}</span>`;
                $('#category-bar').append(categorySpan);
                $('#category-mobile').append(categorySpan);
            });
        },
        error: function(jqHXR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    })
}

var section = 1;
var colNum = 3;
var limit = 6;
var imgFetchingMood = 'normal';
var categoryId = null;
// fixing responsive image columns
function responsiveImgCols() {
    var colCon = $('#image-columns');
    var cols = '';
    if(window.innerWidth >= 992) {
        colNum = 3;
        cols = `
            <div class="col" id="col1"></div>
            <div class="col" id="col2"></div>
            <div class="col" id="col3"></div>`;
    }else if(window.innerWidth >= 768) {
        colNum = 2;
        cols = `
            <div class="col" id="col1"></div>
            <div class="col" id="col2"></div>`;
    }else {
        colNum = 1;
        cols = `<div class="col" id="col1"></div>`;
    }
    colCon.html(cols);
}


// Image loading Template
var imgLoadingTemp = `
    <div class="d-flex justify-content-center" id="image-load-spinner">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;

// Image card append method 
function imageCardAppend(response, colNum) {
    for (let i = 0; i < response.data.length; i++) {
        var divNum = i % colNum;
        var divId = 'col' + (divNum + 1);
        var div = $('#' + divId);

        let imageCardTemp = `
    <div class="img-item mb-md-4 mb-3">
      <div class="img-card">
        <div class="img-action">
        
        ${response.data[i].premium==1?
            '<a href="#premium_featured" class="position-absolute top-50 start-50 translate-middle btn btn-light rounded-pill" id="premium">Premium+</a>':''}
          
            <span class="text-truncate text-light position-absolute top-0 ms-1" 
          style="max-width: 200px;">${response.data[i].name}</span>
          <a href="#" class="save-btn text-light position-absolute top-0 end-0 me-1">
            <i class="fa-regular fa-plus-square"></i>
          </a>
          <a href="#" class="like-btn text-light position-absolute bottom-0 ms-1">
            <i class="fa-regular fa-heart"></i>
          </a>
          <a class="btn btn-outline-light dropdown-toggle position-absolute bottom-0 end-0 me-1 mb-1" 
          href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Download</a>
           <ul class="dropdown-menu">
             <li><a class="dropdown-item"
             onclick="downloadControl('${response.data[i].id}', '${response.data[i].premium}', 'normal')">Normal</a></li>
             <li><a class="dropdown-item"
             onclick="downloadControl('${response.data[i].id}', '${response.data[i].premium}', 'high-quality')">
             High-quality ${response.data[i].premium==1?'<i class="text-grd">(premium)</i>':''}</a></li>
             <li><a class="dropdown-item"
             onclick="downloadControl('${response.data[i].id}', '${response.data[i].premium}', 'original')">
             Original ${response.data[i].premium==1?'<i class="text-grd">(premium)</i>':''}</a></li>
           </ul>
          <div class="zoom-in" onclick="showImageModal('${response.data[i].name}', '${response.data[i].normal_quality_img}')"></div>
        </div>
        <figure>
          <a onclick="showImageModal('${response.data[i].name}', '${response.data[i].normal_quality_img}')">
            <img src="http://127.0.0.1:8000/storage/lazy_loading_image/${response.data[i].lazy_loading_img}" 
            data-src="http://127.0.0.1:8000/storage/normal_quality_image/${response.data[i].normal_quality_img}" 
            class="lazy image" style="width:100%">
          </a>
        </figure>
      </div>
      <div class="img-action-mobile">
        <div class="d-flex justify-content-between px-2">
          <span class="pt-1">
            <a href="#" class="save-btn text-dark px-1"><i class="fa-regular fa-plus-square"></i></a>
            <a href="#" class="like-btn text-dark px-1"><i class="fa-regular fa-heart"></i></a>
          </span>
          <a class="btn btn-outline-dark dropdown-toggle" href="#" role="button" 
          data-bs-toggle="dropdown" aria-expanded="false">Download</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item"
            onclick="downloadControl('${response.data[i].id}', '${response.data[i].premium}', 'normal')">Normal</a></li>
            <li><a class="dropdown-item"
            onclick="downloadControl('${response.data[i].id}', '${response.data[i].premium}', 'high-quality')">
            High-quality ${response.data[i].premium==1?'<i class="text-grd">(premium)</i>':''}</a></li>
            <li><a class="dropdown-item"
            onclick="downloadControl('${response.data[i].id}', '${response.data[i].premium}', 'original')">
            Original ${response.data[i].premium==1?'<i class="text-grd">(premium)</i>':''}</a></li>
          </ul>
        </div>
      </div>
    </div>`;

    div.append(imageCardTemp);
    } 
}

// Image downloading 
function downloadControl(imgId, premium, imgType) {
    if(! $.cookie('token')) {
        window.location = "http://127.0.0.1:5500/login.html";
    } else {
        if(imgType === 'normal') {
            downloadImg(imgId, imgType);
        } else if(imgType === 'high-quality' || imgType === 'original') {
            if(premium == 1) {
                if(userRole != 'premium') {
                    premiumAlert();
                } else {
                    downloadImg(imgId, imgType); 
                }
            } else {
                downloadImg(imgId, imgType);
            }
        }    
    }   
}

// download in serverside 
function downloadImg(imgId, imgType) {
    $.ajax({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/images/'+imgId+'/download',
        headers: {'Authorization': 'Bearer ' + token},
        data: JSON.stringify({'img_type': imgType}),
        contentType: 'application/json',
        dataType: 'json',
        success: (response) => {
            console.log(response.downloadlink)
            let link = document.createElement('a')
            link.href = response.downloadlink
            link.download = ''
            link.style.display = 'none'
            link.addClass = 'download'
            link.click()
            link.remove()
        }
    })
}


// Premium alert modal 
function premiumAlert() {
    $('#premiumAlertModal').remove();
    let modalTemp = `
    <div class="modal fade" id="premiumAlertModal" tabindex="-1" 
    aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title text-grd">Shutter Up</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="fs-18">This feature access only for premium members.</p>
          </div>
          <div class="modal-footer">
            <a class="btn btn-primary" href="#premium_featured" 
            onclick="$('#premiumAlertModal').modal('hide')">Get premium</a>
          </div>
        </div>
      </div>
    </div>`;

    $('body').append(modalTemp);
    $('#premiumAlertModal').modal('show');
}

// Getting Image data and fetching
function getImage() {
    // Loading 
    $('#image-content-loading').append(imgLoadingTemp);

    $.ajax({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/images/paginatedList',
        data: {'section': section, 'limit': limit},
        contentType: 'application/json',
        dataType: 'json',
        complete: () => {
            $('#image-load-spinner').remove();
        },
        success: (response) => {
            console.log(response)
            imageCardAppend(response, colNum);
            // lazy loading 
            $(".lazy").each(function() {
                observer.observe(this);
            });
        }
    })
}


// image lazy loading using IntersectionObserver API
function lazyLoadImage(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = $(entry.target);
        img.attr("src", img.data("src"));
        img.removeClass("lazy");
        $('.img-action-mobile').css('opacity', 1);
        observer.unobserve(entry.target);
      }
    });
  }

const observer = new IntersectionObserver(lazyLoadImage);

// Category filter 
function categoryFilter(id) {
    imgFetchingMood = 'cate-filter';
    section = 1;
    categoryId = id;
    section = 1;
    $('#searchModal').modal('hide');
    responsiveImgCols();
    getImgByCateFilter();
}

function getImgByCateFilter() {
    // Loading 
    $('#image-content-loading').append(imgLoadingTemp);
    $.ajax({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/images/filter/category',
        data: {'id': categoryId, 'section': section, 'limit': limit},
        contentType: 'application/json',
        dataType: 'json',
        complete: () => {
            $('#image-load-spinner').remove();
        },
        success: (response) => {
            console.log(response)
            imageCardAppend(response, colNum);
            // lazy loading 
            $(".lazy").each(function() {
                observer.observe(this);
            });
        }
    })
}

// Image model & zoom in
function showImageModal(name, img) {
    $('#imageModal').remove();
    let ImageModalTemp = `
    <div class="modal fade" id="imageModal" tabindex="-1" 
    aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">${name}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="w-100 overflow-scroll" style="max-height: 80vh;">
              <img src="http://127.0.0.1:8000/storage/normal_quality_image/${img}"/>
            </div>
            <div class="d-flex align-items-center mt-1">
              <a href="#" class="save-btn text-dark px-1"><i class="fa-regular fa-plus-square"></i></a>
              <a href="#" class="like-btn text-dark px-1"><i class="fa-regular fa-heart"></i></a>
              <a class="btn btn-outline-dark ms-auto dropdown-toggle" href="#" role="button" 
              data-bs-toggle="dropdown" aria-expanded="false">Download</a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Normal <i class="text-green">free</i></a></li>
                <li><a class="dropdown-item" href="#">Hight quality <i class="text-green">free</i></a></li>
                <li><a class="dropdown-item" href="#">Raw <i class="text-grd">premium</i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    $('body').append(ImageModalTemp);
    $('#imageModal').modal('show');
}

// premium upgrade 
function getPremium(type) {
    $('#paymentFormModal').remove();
    let purchaseType = type;
    let duration, cost;
    if(purchaseType == 'monthly') {
         duration = "1 month";
         cost = "6$";
    }
    if(purchaseType == 'yearly') {
        duration = "1 year";
        cost = "68$";
    }

    let paymentFormTemp = `
<div class="modal fade" id="paymentFormModal" tabindex="-1" 
aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel" 
        style="font-family: 'Lora', serif;">Confirm Purchase</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
          <div class="purchase-detail p-2 mb-4 rounded" style="font-family: 'Lora', serif;">
              <h4 class="text-center"><span class="text-light">Shutter Up</span> Premium</h4>
            <div class="d-flex justify-content-center">
              <div class="row" style="width: fit-content;">
                <div class="col">
                    <h6>PurchaseType</h6>
                    <h6>Duration</h6>
                    <h6>TotalCost</h6>
                </div>
                <div class="col">
                    <h6>: ${purchaseType}</h6>
                    <h6>: ${duration}</h6>
                    <h6>: ${cost}</h6>
                </div>
              </div>
            </div>
          </div>
          <form method="post" id="premium-payment-form" onsubmit="submitPurchase(event)">
            <div class="row">
              <div class="col-8">
                <label for="name" class="fst-italic">Name on Card</label>
                <small class="error-span text-danger" id="card-user-name-error"></small>
                <input type="text" name="name" class="form-control w-100 mb-3" id="name" placeholder="Name">
              </div>
              <div class="col-4 ms-auto">
                <label for="postal-code" class="fst-italic">Postal Code</label>
                <small class="error-span text-danger" id="postal-code-error"></small>
                <input type="text" name="postal-code" class="form-control w-100 mb-3" 
                id="postal-code" placeholder="xxxxx">
              </div>
            </div>
            <label for="card-num" class="fst-italic">Card Number</label>
            <small class="error-span text-danger" id="card-num-error"></small>
            <input type="number" name="card-num" class="form-control w-100 mb-3" 
            id="card-num" placeholder="0000 0000 0000 0000">
            <div class="row">
                <div class="col-4">
                  <label for="mm" class="fst-italic">Expiration</label>
                  <small class="error-span text-danger" id="expired-m-error"></small>
                  <input type="text" name="mm" class="form-control w-100 mb-3" id="mm" placeholder="MM">
                </div>
                <div class="col-4">
                  <label for="yy"></label>
                  <small class="error-span text-danger" id="expired-y-error"></small>
                  <input type="text" name="yy" class="form-control w-100 mb-3" id="yy" placeholder="YY">
                </div>
                <div class="col-4">
                  <label for="cvv" class="fst-italic">CVV</label>
                  <small class="error-span text-danger" id="cvv-error"></small>
                  <input type="text" name="cvv" class="form-control w-100 mb-3" id="cvv" placeholder="123">
                </div>
            </div>
            <input type="hidden" name="purchase_type" value="${purchaseType}">
            <button class="btn rounded-pill form-control" type="submit" id="payment-submit">Pay Now</button>
        </form>
      </div>
    </div>
  </div>
</div>`;

    $('body').append(paymentFormTemp);
    $('#paymentFormModal').modal('show');
}

// Getting User Info 
function getUserInfo() {
  if ($.cookie('token') && localStorage.getItem('user_id')) {
    // loading effect 
    $('#loading').show();
    $.ajax({
        method: 'GET',
        url: 'http://127.0.0.1:8000/api/user',
        headers: {'Authorization': 'Bearer ' + token},
        data: {'id': userId},
        contentType: 'application/json',
        dataType: 'json',
        complete: function() {
            $('#loading').hide();
        },
        success: function(response) {
            if(response != null) {
                let userInfo = response.user;
                $('#pf-name').text(userInfo.name);
                $('#profile-upd-form > input[name=name]').val(userInfo.name);
                $('#contact-form > input[name=name]').val(userInfo.name);
                $('#profile-upd-form > input[name=email]').val(userInfo.email);
                $('#contact-form > input[name=email]').val(userInfo.email);
                $('#profile-upd-form > input[name=user_id]').val(userId);
                $('#change-pass-form > input[name=user_id]').val(userInfo.id);
                userRole = userInfo.role;
                switch (userRole) {
                    case "premium":
                        $('#pf-role').text("Premium Member");
                        break;
                    case "admin":
                        $('#pf-role').text("Adminstrator");
                        break;
                    default:
                        $('#pf-role').text("Normal Member");
                        break;
                }
                // profile image 
                if(userInfo.image != null) {
                    let profileImg = $('.profile-img');
                    profileImg.each(function(e) {
                        this.src = userInfo.image;
                    })
                }
            }
        },
        error: function(jqHXR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
  }
}

// register form ajax control 
$('#register-form').submit(function(e) {
  e.preventDefault();
  let name, email, password, confirmPass, userData;
  name = $('#register-form > input[name=name]').val();
  email = $('#register-form > input[name=email]').val();
  password = $('#register-form > input[name=password]').val();
  confirmPass = $('#register-form > input[name=confirm_pass]').val();
  userData = {
      'name': name, 
      'email': email, 
      'password': password, 
      'password_confirmation': confirmPass
  };

  // loading effect 
  $('#loading-1').show();

  $.ajax({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/register',
      data: JSON.stringify(userData),
      contentType: 'application/json',
      dataType: 'json',
      complete: function() {
          $('#loading-1').hide();
      },
      success: function(response) {
          // access token store in cookie storage 
          const accessToken = response.token;
          $.cookie('token', accessToken, {expires: 30, path: '/'});

          // user info store in local storage 
          userId = response.userId;
          localStorage.setItem('user_id', JSON.stringify(userId));

          window.location = "http://127.0.0.1:5500/#home";
      },
      error: function(jqHXR, textStatus, errorThrown) {
          // client error handling 
          const nameErr = jqHXR.responseJSON.errors.name;
          const emailErr = jqHXR.responseJSON.errors.email;
          const passwordErr = jqHXR.responseJSON.errors.password;

          nameErr ? errors('name', nameErr[0]): errors('name', null);
          emailErr ? errors('email', emailErr[0]): errors('email', null);
          passwordErr ? errors('password', passwordErr[0]): errors('password', null);
      }
  })
})

// login ajax control 
$('#login-form').submit(function(e) {
  e.preventDefault();
  let email, password, loginData;
  email = $('#login-form > input[name=email]').val();
  password = $('#login-form > input[name=password]').val();
  loginData = {'email': email, 'password': password};

  // loading effect 
  $('#loading-1').show();

  $.ajax({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/login',
      data: JSON.stringify(loginData),
      contentType: 'application/json',
      dataType: 'json',
      complete: function() {
          $('#loading-1').hide();
      },
      success: function(response) {
          // access token store in cookie storage 
          const accessToken = response.token;
          $.cookie('token', accessToken, {expires: 30, path: '/'});

          // user info store in local storage 
          let userId = response.userId;
          localStorage.setItem('user_id', JSON.stringify(userId));

          window.location = "http://127.0.0.1:5500/#home";
      },
      error: function(jqHXR, textStatus, errorThrown) {
          // client error handling 
          $('.error-span').text('');
          if (jqHXR.status === 400) {
              const message = jqHXR.responseJSON.message;
              errors('message', message);
          }else {
              const emailErr = jqHXR.responseJSON.errors.email;
              const passwordErr = jqHXR.responseJSON.errors.password;

              emailErr ? errors('email', emailErr[0]): errors('email', null);
              passwordErr ? errors('password', passwordErr[0]): errors('password', null);
          }
      }
  })
})

// logout ajax control 
$('#logout').click((e) => {
  e.preventDefault();

  $.ajax({
      method: 'DELETE',
      url: 'http://127.0.0.1:8000/api/user/logout',
      headers: {'Authorization': 'Bearer ' + token},
      contentType: 'application/json',
      success: function(response) {
          $.removeCookie('token');
          localStorage.removeItem('user_id');
          window.location = 'http://127.0.0.1:5500/login.html';
      },
      error: function(jqHXR, textStatus, errorThrown) {
          console.log(errorThrown);
      }
  })
})

// user info update form 
$('#profile-upd-form').submit((e) => {
  e.preventDefault();

  let formData = new FormData();
  formData.append('image', $('#file-input')[0].files[0]);
  formData.append('id', $('#profile-upd-form > input[name=user_id]').val());
  formData.append('name', $('#profile-upd-form > input[name=name]').val());
  formData.append('email', $('#profile-upd-form > input[name=email]').val());

  // loading effect 
  $('#loading-1').show();

  $.ajax({
      url: 'http://127.0.0.1:8000/api/user/update',
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + token},
      data: formData,
      contentType: false,
      processData: false,
      complete: function() {
          $('#loading-1').hide();
      },
      success: function(response) {
          console.log(response)
          errors('image', null);
          errors('name', null);
          errors('email', null);
          getUserInfo();
      },
      error: function(jqHXR, textStatus, errorThrown) {
          console.log(errorThrown);
          const imageErr = jqHXR.responseJSON.errors.image;
          const nameErr = jqHXR.responseJSON.errors.name;
          const emailErr = jqHXR.responseJSON.errors.email;

          imageErr ? errors('image', imageErr[0]): errors('image', null);
          nameErr ? errors('name', nameErr[0]): errors('name', null);
          emailErr ? errors('email', emailErr[0]): errors('email', null);
      }
  })
})

// password change form control
$('#change-pass-form').submit(function(e) {
  e.preventDefault();
  let oldPass = $('#change-pass-form > input[name=current_password]').val();
  let password = $('#change-pass-form > input[name=password]').val();
  let confirmPass = $('#change-pass-form > input[name=confirm_password]').val();
  // let id = $('#change-pass-form > input[name=user_id]').val();

  let formData = {
      'current_password': oldPass, 
      'password': password, 
      'password_confirmation': confirmPass, 
      'id': userId
  };

  // loading effect 
  $('#loading-2').show();

  $.ajax({
      url: 'http://127.0.0.1:8000/api/user/password/update',
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + token},
      data: JSON.stringify(formData),
      contentType: 'application/json',
      dataType: 'json',
      complete: function() {
          $('#loading-2').hide();
      },
      success: function(response) {
          console.log(response);
          $('#change-pass-form > input[name=current_password]').val('');
          $('#change-pass-form > input[name=password]').val('');
          $('#change-pass-form > input[name=confirm_password]').val('');
          if (response.message) {
              let alert = `
              <div class="alert alert-success alert-dismissible fade show" role="alert">
                  `+ response.message +`
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
              $('#password-form-success-alert').html(alert);   
          }
      },
      error: function(jqHXR, textStatus, errorThrown) {
          console.log(textStatus);
          $('.error-span').text('');
          if (jqHXR.status === 400) {
              console.log(jqHXR);
              const message = jqHXR.responseJSON.message;
              errors('current-password', message);
          }else {
              const currentPassErr = jqHXR.responseJSON.errors.current_password;
              const passErr = jqHXR.responseJSON.errors.password;

              currentPassErr ? errors('current-password', currentPassErr[0]): errors('current-password', null);
              passErr ? errors('password', passErr[0]): errors('password', null);
          }
      }
  })
})

// contact form control 
$('#contact-form').submit(function(e) {
    e.preventDefault();

    let name = $('#contact-form > input[name=name]').val();
    let email = $('#contact-form > input[name=email]').val();
    let message = $('#contact-form > #message-input').val();

    let formData = {'name': name, 'email': email, 'message': message};

    // loading effect 
    $('#loading-3').show();

    $.ajax({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/contact/create',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        dataType: 'json',
        complete: function() {
            $('#loading-3').hide();
        },
        success: function(response) {
            console.log(response)
            if(response.message) {
                let alert = `
                <div class="alert alert-success alert-dismissible fade show" role="alert" style="width: 100%;max-width: 24rem;">
                    `+ response.message +`
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
                $('#contact-form-success-alert').html(alert);
            }
        },
        error: function(jqHXR, textStatus, errorThrown) {
            console.log(jqHXR)
            console.log(textStatus)
            console.log(errorThrown)

            const nameErr = jqHXR.responseJSON.errors.name;
            const emailErr = jqHXR.responseJSON.errors.email;
            const messageErr = jqHXR.responseJSON.errors.message;

            nameErr ? errors('name', nameErr[0]): errors('name', null);
            emailErr ? errors('email', emailErr[0]): errors('email', null);
            messageErr ? errors('message', messageErr[0]): errors('message', null);
        }
    })
})

// premium purchase submit payment
function submitPurchase(e) {
    e.preventDefault();
    if(! $.cookie('token')) {
        window.location = "http://127.0.0.1:5500/login.html";
    } else {
        let name = $('#premium-payment-form  input[name=name]').val();
        let postalCode = $('#premium-payment-form  input[name=postal-code]').val();
        let cardNum = $('#premium-payment-form  input[name=card-num]').val();
        let expM = $('#premium-payment-form  input[name=mm]').val();
        let expY = $('#premium-payment-form  input[name=yy]').val();
        let cvv = $('#premium-payment-form  input[name=cvv]').val();
        let purchaseType = $('#premium-payment-form  input[name=purchase_type]').val();

        let formData = {
            'name': name, 
            'postal_code': postalCode, 
            'card_num': cardNum, 
            'expired_m': expM, 
            'expired_y': expY, 
            'cvv': cvv, 
            'purchase_type': purchaseType,
        };

        console.log(userId);

        $.ajax({
            method: 'PUT',
            url: 'http://127.0.0.1:8000/api/user/'+userId+'/premium',
            headers: {'Authorization': 'Bearer ' + token},
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            complete: function() { 
                // code 
            },
            success: function(response) {
                $('#paymentFormModal').modal('hide');
                purchaseSuccessToast(response);
            },
            error: function(jqHXR, textStatus, errorThrown) {
                console.log(jqHXR);
                const nameErr = jqHXR.responseJSON.errors.name;
                const postalCodeErr = jqHXR.responseJSON.errors.postal_code;
                const cardNumErr = jqHXR.responseJSON.errors.card_num;
                const expMErr = jqHXR.responseJSON.errors.expired_m;
                const expYErr = jqHXR.responseJSON.errors.expired_m;
                const cvvErr = jqHXR.responseJSON.errors.cvv;

                nameErr ? errors('card-user-name', nameErr[0]): errors('card-user-name', null);
                postalCodeErr ? errors('postal-code', postalCodeErr[0]): errors('postal-code', null);
                cardNumErr ? errors('card-num', cardNumErr[0]): errors('card-num', null);
                expMErr ? errors('expired-m', expMErr[0]): errors('expired-m', null);
                expYErr ? errors('expired-y', expYErr[0]): errors('expired-y', null);
                cvvErr ? errors('cvv', cvvErr[0]): errors('cvv', null);
            }
        })
    }
}

// Purchase success toast alert
function purchaseSuccessToast(response) {
    $('#purchaseSuccessToast').remove();

    let toastTemp = `
    <div class="toast-container position-fixed top-0 end-0 p-3" id="purchaseSuccessToast">
      <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto text-grd fs-20">Shutterup</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            <div class="alert alert-success" role="alert">
                ${response.message}
            </div>
            <small>See purchase details on your <a href="#profile" class="link-success">profile</a></small>
        </div>
      </div>
    </div>`;

    $('body').append(toastTemp);
    $('#liveToast').toast('show');
}
