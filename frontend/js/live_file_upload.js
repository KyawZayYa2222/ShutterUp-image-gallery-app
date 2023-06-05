// live preview image file upload

$(document).ready(function() {
    var img = $('#preview-img');
    var fileInput = $('#file-input');
    fileInput.change(function () {
        let file = this.files[0];
        if(file) {
            let reader = new FileReader();
            reader.onload = function() {
                let result = reader.result;
                img.attr('src', result);
            }
            reader.readAsDataURL(file);
        }
    });
});
