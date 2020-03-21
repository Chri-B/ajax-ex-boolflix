// procedure per creare template Handlebars
var cardSrc = $("#card-template").html();
var cardTemplate = Handlebars.compile(cardSrc);

// al click sul bottone o all'invio viene eseguita la ricerca
$('#btn-search-film').click(findFilms);
$('#btn-search-tv').click(findTv);
$('#input-search-film').keydown(function(event) {
    if(event.keyCode == '13') {
        findFilms();
    }
});
$('#input-search-tv').keydown(function(event) {
    if(event.keyCode == '13') {
        findTv();
    }
});


// funzione per raggiungere il film nell'API
function getFilmApi(inpSearch, whereAppend) {
    var apiBaseUrl = 'https://api.themoviedb.org/3';
    $.ajax({
        url: apiBaseUrl + '/search/movie',
        method: 'GET',
        data: {
            api_key: 'bbf583179ea7e0b62001a8dd43710a73',
            language: 'it-IT',
            query: inpSearch
        },
        success: function (data) {
            var films = data.results;
            for (var i = 0; i < films.length; i++) {
                var film = films[i];
                var filmTemplate = {
                    title: film.title,
                    originalTitle: film.original_title,
                    originalFlag: flagsImg(film.original_language),
                    originalLanguage: film.original_language,
                    vote: starVote(film.vote_average)
                }
                var cardFilm = cardTemplate(filmTemplate);
                $(whereAppend).append(cardFilm);
            }
        },
        error: function (err) {
            alert('Ops...Qualcosa è andato storto');
        }
    });
};

// funzione per raggiungere le serie TV nell'API
function getTvApi(inpSearch, whereAppend) {
    var apiBaseUrl = 'https://api.themoviedb.org/3';
    $.ajax({
        url: apiBaseUrl + '/search/tv',
        method: 'GET',
        data: {
            api_key: 'bbf583179ea7e0b62001a8dd43710a73',
            language: 'it-IT',
            query: inpSearch
        },
        success: function (data) {
            var tvShows = data.results;
            for (var i = 0; i < tvShows.length; i++) {
                var tvShow = tvShows[i];
                var tvShowTemplate = {
                    title: tvShow.name,
                    originalTitle: tvShow.original_name,
                    originalFlag: flagsImg(tvShow.original_language),
                    originalLanguage: tvShow.original_language,
                    vote: starVote(tvShow.vote_average),
                    date: tvShow.first_air_date
                }
                var cardTvShow = cardTemplate(tvShowTemplate);
                $(whereAppend).append(cardTvShow);
            }
        },
        error: function (err) {
            alert('Ops...Qualcosa è andato storto');
        }
    });
};

// funzione che ottiene il valore inserito da un input e successivamente pulisce i caratteri digitati nell'input
function getValAndClear(input) {
    var val = $(input).val();
    $(input).val('');
    return val;
};

// funzione che restituisce i film ricercati
function findFilms() {
    $('#film-card-container .card').remove(); // rimuovo tutti le ricerce aperte, successivamente mostro quello che viene cercato
    var searchFilm = getValAndClear('#input-search-film');
    if (searchFilm != '') {
        getFilmApi(searchFilm, '#film-card-container');
    }
};
// funzione che restituisce le serie tv ricercate
function findTv() {
    $('#tv-card-container .card').remove(); // rimuovo tutti le ricerce aperte, successivamente mostro quello che viene cercato
    var searchTv = getValAndClear('#input-search-tv');
    if (searchTv != '') {
        getTvApi(searchTv, '#tv-card-container');
    }
};

// funzione che arrotonda voto da 1-10 decimale in intero e lo trasforma in una scala da 1 a 5
function roundHalfVote(number) {
    var newVote = Math.ceil(number / 2)
    return newVote
};

// funzione che assegna il numero di stella piene equivalente al voto del film, e un numero di stelle vuote uguale alla differenza tra 5 e il voto del film
function starVote(vote) {
    var starVote = roundHalfVote(vote);
    var stella = [];
    var j = 0;
    for (var i = 0; i < 5; i++) {
        if (j < starVote) {
            stella.push('<i class="fas fa-star"></i>');
            j = j + 1;
        } else {
            stella.push('<i class="far fa-star"></i>');
            j = j + 1;
        }
    }
    return stella.join('');
};

// funzione che restituisce una immagine di bandiera nella sezione lingua originale
function flagsImg(country) {
    var flag = country;
    if (flag == 'en') {
        var flag = 'gb';
    } else if (flag == 'zh') {
        var flag = 'cn';
    }
    return flag;
};
