// Grab the articles as a json
// $.getJSON("/articles", function (data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//         // Display the apropos information on the page
//         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + '</p><div class="note"></div>');
//     }
// });

// Load articles to browser
$(document).ready(function () {
    $('.scraper').on('click', function (event) {
        event.preventDefault();
        $('#articles').empty();

        var id = $(this).attr('data-exercise');

        $.ajax('/api/articles', {
            method: 'GET',
        }).done(function (response) {
            console.log(response);
            for (var i = 0; i < response.length; i++) {
                var articleBlock = $('<div class="article">');

                articleBlock.append('<div class="card amber lighten-4"><div class="card-content"><span class="card-title">' + response[i].title + '</span></div><div class="card-action"><a href="' + response[i].link +'" class="btn red lighten-2" target="_blank">Read Entire Article</a><a class="btn save-note">Save Article</a></div></div>');

                $('#articles').prepend(articleBlock);
            }

        });
    });

});


// When you click the savenote button
$(document).on("click", ".save-note", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .done(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});
