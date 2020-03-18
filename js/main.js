// procedure per creare template Handlebars
var source = $("#card-template").html();
var cardTemplate = Handlebars.compile(source);

// al click sulla
$('#send-search').click(function () {
    $('.card-container .card').hide();
    var search = $('#input-search').val();
    $('#input-search').val('');
    
    var apiBaseUrl = 'https://api.themoviedb.org/3';
    $.ajax({
        url: apiBaseUrl + '/search/movie',
        method: 'GET',
        data: {
            api_key: 'bbf583179ea7e0b62001a8dd43710a73',
            language: 'it-IT',
            query: search
        },
        success: function (data) {
            var films = data.results;
            for (var i = 0; i < films.length; i++) {
                var film = films[i];
                var filmTemplate = {
                    title: film.title,
                    originalTitle: film.original_title,
                    originalLanguage: film.original_language,
                    vote: film.vote_average
                }
                var cardFilm = cardTemplate(filmTemplate);
                $('.card-container').append(cardFilm);
            }
        },
        error: function (err) {
            alert('Qualcosa è andato storto');
        }
    });
});
