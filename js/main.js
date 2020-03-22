$(document).ready(function() {

    // procedure per creare template Handlebars
    var cardSrc = $("#card-template").html();
    var cardTemplate = Handlebars.compile(cardSrc);

    // al click sul bottone o all'invio viene eseguita la ricerca
    $('#btn-search-film').click(findMedia);
    $('#input-search-film').keydown(function(event) {
        if(event.keyCode == '13') {
            findMedia();
        }
    });

    $('.container').on( 'mouseenter', '.card', function() {
        console.log('salito');
        $(this).children('img').hide();
        $(this).children('.card-text').addClass('active');
    });
    $('.container').on( 'mouseleave', '.card', function() {
        console.log('salito');
        $(this).children('img').show();
        $(this).children('.card-text').removeClass('active');
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
                        posterImg: film.poster_path,
                        title: film.title,
                        originalTitle: film.original_title,
                        originalFlag: flagsImg(film.original_language),
                        originalLanguage: film.original_language,
                        vote: starVote(film.vote_average),
                        overview: film.overview
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
                        posterImg: tvShow.poster_path,
                        title: tvShow.name,
                        originalTitle: tvShow.original_name,
                        originalFlag: flagsImg(tvShow.original_language),
                        originalLanguage: tvShow.original_language,
                        vote: starVote(tvShow.vote_average),
                        overview: tvShow.overview
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
    function findMedia() {
        $('.card').remove(); // rimuovo tutti le ricerce aperte, successivamente mostro quello che viene cercato
        var searchMedia = getValAndClear('#input-search-film');
        if (searchMedia != '') {
            getFilmApi(searchMedia, '#film-card-container');
            getTvApi(searchMedia, '#tv-card-container');
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

});
