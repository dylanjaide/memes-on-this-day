$( document ).ready(function() {
    
    // Define main search button behaviour: search for a meme using the day/month from the form
    document.getElementById("submitbutton").addEventListener('click', function(e) {
        e.preventDefault();
        day = document.getElementById("days").value;
        month = document.getElementById("months").value;
        search_meme(day, month);
    });
    
    // Define random meme button behaviour: randomly select a meme
    document.getElementById("randombutton").addEventListener('click', function(e) {
        e.preventDefault();
        var rand_meme = get_random_meme();
        if (typeof rand_meme["data"] !== 'undefined') {
            display_meme(rand_meme["day"], rand_meme["month"], rand_meme["data"]);
        } else {
            display_error("There was an error selecting a random meme.\nPlease report this error, and try again.");
        }
    });
    
    
    // Define behaviour for display "About this page" modal
    var modal = document.getElementById("aboutbox");
    document.getElementById("aboutlink").addEventListener("click", function(e) {
        modal.style.display = "block";
    });
    
    // Close modal when clicking close button
    document.getElementsByClassName("modal-close")[0].addEventListener("click", function(e) {
        modal.style.display = "none";
    });
    
    // Close modal when clicking outside of content box
    window.addEventListener("click", function(e) {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });
    
    
    // On page load, fill the about modal with the number of days that have memes
    var number_memes = get_number_memes();
    document.getElementById("number-memes").innerText = number_memes.toString();
    var num_days_with_memes = get_number_days_with_memes();
    document.getElementById("number-days-with-memes").innerText = num_days_with_memes.toString();
    document.getElementById("number-days-without-memes").innerText = (366 - num_days_with_memes).toString();
    
    
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
                    display_meme(day_month[0], day_month[1], meme_data[key_date][i]);
                    set_input_form_values(day_month[0], day_month[1]);
                    meme_displayed_on_load = true;
                    break;
                }
            }
        });
    }
    
    // Otherwise, search for a meme from the current date
    if (!meme_displayed_on_load) {
        var d = new Date();
        var months_list = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var day = d.getDate().toString();
        var month = months_list[d.getMonth()];
        search_meme(day, month);
        set_input_form_values(day, month);
    }
    
});




// Return a dictionary of variables defined by appending to the page url in the address bar
function get_url_vars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
    return vars;
}




// Return a list separating the day and month from a key_date string
// eg. "30June" -> ["30", "June"]
function key_date_to_day_month(key_date) {
    return key_date.match(/[a-zA-Z]+|[0-9]+/g);
}




function get_random_int(max_ni) {
    return Math.floor(Math.random() * max_ni);
}




// Set the values in the input form <select> tags
function set_input_form_values(day, month) {
    document.getElementById("days").value = day;
    document.getElementById("months").value = month;
}




// Counts the number of memes currently in the database
function get_number_memes() {
    var count = 0;
    for (d in meme_data) {
        count += meme_data[d].length;
    }
    return count
}




// Counts the number of days for which there is at least one meme
function get_number_days_with_memes() {
    var count = 0;
    for (d in meme_data) {
        if (meme_data[d].length > 0) {
            count += 1;
        }
    }
    return count
}




// Get info about a random meme from the database
function get_random_meme() {
    var n_rand_meme = get_random_int( get_number_memes() );
    var count = 0;
    for (d in meme_data) {
        if ( count + meme_data[d].length > n_rand_meme ) {
            var index = n_rand_meme - count;
            var day_month = key_date_to_day_month(d);
            return {
                "day": day_month[0],
                "month": day_month[1],
                "data": meme_data[d][index]
            };
        }
        count += meme_data[d].length;
    }
}




// Check for a meme on a specified day/month
// If one exists in the database, display it
// Otherwise, display an appropriate error message
function search_meme(day, month) {
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
    display_meme(day, month, data[index]);
    return true;
}




// Clear all elements that contain error messages or things relating to a meme
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




// Clears the display, then shows the passed error message
function display_error(error) {
    clear_display();
    var formErrorMessage = document.getElementById("form-error-message");
    formErrorMessage.innerText = error;
    formErrorMessage.style.display = "inline";
}




// Clears the display, then shows the specified meme (using passed date & JSON data)
function display_meme(day, month, meme_json) {
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
