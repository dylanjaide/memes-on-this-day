$( document ).ready(function() {
    
    document.getElementById("submitbutton").addEventListener('click', function(e) {
        e.preventDefault();
        day = document.getElementById("days").value;
        month = document.getElementById("months").value;
        request_meme(day, month);
    });
    
    // On page load, select a meme to display automatically
    var meme_displayed_on_load = false;
    
    // First, check the url for a direct link
    var url_vars = get_url_vars();
    if (url_vars.hasOwnProperty("meme")) {
        // Loop over all memes in the database
        Object.keys(meme_data).forEach(function(key_date) {
            for (var i = 0; i < meme_data[key_date].length; i++) {
                // If a meme with that ID exists, display it
                if (meme_data[key_date][i]["id"] == url_vars["meme"]) {
                    var day_month = key_date_to_day_month(key_date);
                    request_meme(day_month[0], day_month[1]);
                    set_input_form_values(day_month[0], day_month[1]);
                    meme_displayed_on_load = true;
                    break;
                }
            }
        });
    }
    
    // Otherwise, request a meme from the current date
    if (!meme_displayed_on_load) {
        var d = new Date();
        var months_list = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var day = d.getDate().toString();
        var month = months_list[d.getMonth()];
        request_meme(day, month);
        set_input_form_values(day, month);
    }
    
});




function get_url_vars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
    return vars;
}




function key_date_to_day_month(key_date) {
    return key_date.match(/[a-zA-Z]+|[0-9]+/g);
}




function set_input_form_values(day, month) {
    document.getElementById("days").value = day;
    document.getElementById("months").value = month;
}




function request_meme(day, month) {
    // Get day/month from form
    var date = day.concat(month);
    
    // Validate input - ie. check that day/month are valid, and that combination is valid
    var allowed_days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
    var allowed_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (!(allowed_days.includes(day) && allowed_months.includes(month))) {
        display_error("Somehow you've managed to submit an invalid day/month. You've probably messed about with the HTML form without checking the JS. Hi I guess.");
        return false;
    }
    var disallowed_dates = ["30February", "31February", "31April", "31June", "31September", "31November"];
    if (disallowed_dates.includes(date)) {
        display_error("You've selected an invalid day/month combination. Please try again!")
        return false;
    }
    
    // Reaching here means the input day/month are valid
    // Lookup date in JSON file
    var data = meme_data[date];
    // If there is no data, display an error and return
    if (data.length < 1) {
        display_error("".concat("Sorry - there are currently no memes in our records for ", day, " ", month, ".\nPlease try searching for another date!"));
        return false;
    }
    // Otherwise, randomly choose one entry to display
    var index = Math.floor(Math.random() * data.length);
    display_result(day, month, data[index]);
    return true;
}




function clear_display() {
    // Clear error message
    var formErrorMessage = document.getElementById("form-error-message");
    formErrorMessage.innerText = "";
    formErrorMessage.style.display = "none";
    
    // Clear meme display
    document.getElementById("result").style.display = "none";
    document.getElementById("result-title").innerText = "";
    var resultYtEmbed = document.getElementById("result-ytembed");
    resultYtEmbed.style.display = "none";
    resultYtEmbed.height = 0;
    resultYtEmbed.src = "";
    var resultImage = document.getElementById("result-img");
    resultImage.style.display = "none";
    resultImage.src = "";
    document.getElementById("result-info").innerText = "";
    var resultKymLink = document.getElementById("result-kymlink");
    resultKymLink.href = "";
    resultKymLink.innerText = "";
    var resultDirectLink = document.getElementById("result-directlink");
    resultDirectLink.href = "";
    resultDirectLink.innerText = "";
}




function display_error(error) {
    clear_display();
    var formErrorMessage = document.getElementById("form-error-message");
    formErrorMessage.innerText = error;
    formErrorMessage.style.display = "inline";
}




function display_result(day, month, meme_json) {
    clear_display();
    document.getElementById("result").style.display = "block";
    
    // Title
    document.getElementById("result-title").innerText = "".concat(day, " ", month, " ", meme_json.year.toString(), ": ", meme_json.title);
    // YouTube link
    if (meme_json.youtube != false) {
        var resultYtEmbed = document.getElementById("result-ytembed");
        resultYtEmbed.style.display = "block";
        resultYtEmbed.height = 315;
        resultYtEmbed.src = "".concat("https://www.youtube.com/embed/", meme_json.youtube);
    }
    // Image
    if (meme_json.image != false) {
        var resultImage = document.getElementById("result-img");
        resultImage.style.display = "block";
        resultImage.src = meme_json.image;
    }
    // Info paragraph
    document.getElementById("result-info").innerText = meme_json.info;
    // KnowYourMeme link
    if (meme_json.kym != false) {
        var resultKymLink = document.getElementById("result-kymlink");
        resultKymLink.href = meme_json.kym;
        resultKymLink.innerText = "See more on KnowYourMeme";
    }
    // Direct link
    var resultDirectLink = document.getElementById("result-directlink");
    resultDirectLink.href = "".concat("https://dylanjai.de/memes-on-this-day/?meme=", meme_json.id);
    resultDirectLink.innerText = "Share this meme";
    
}
