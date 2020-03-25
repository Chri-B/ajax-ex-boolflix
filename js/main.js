$(document).ready(function() {

    // procedure per creare template Handlebars
    var cardSrc = $("#card-template").html();
    var cardTemplate = Handlebars.compile(cardSrc);

    var cardCastSrc = $('#actor-template').html();
    var cardCastTemplate = Handlebars.compile(cardCastSrc);

    // all'input di ricerca viene aggiunto un effetto box-shadow
    $('#input-search').click(function() {
        $(this).css('box-shadow', 'inset 0px 0px 5px 2px #d71d29');
    });

    // al click sul bottone viene eseguita la ricerca - poi viene rimosso il box shadow
    $('#btn-search').click(function() {
        findMedia();
        removeBoxShadow('#input-search');
    });
    // al click sul tasto Enter della tastiera viene eseguita la ricerca - poi viene rimosso il box shadow
    $('#input-search').keydown(function(event) {
        if(event.keyCode == '13') {
            findMedia();
            removeBoxShadow('#input-search');
        }
    });

    // viene rimosso il box shadow con un click ovunque sulle section (NON nell'header)
    $('section').click(function() {
        removeBoxShadow('#input-search');
    });

    // al mouse hover su una carta viene nascosta la copertina e vengono visualizzate le info della carta
    $('.container').on( 'mouseenter', '.card', function() {
        $(this).children('img').hide();
        $(this).children('.card-text').show();
    });
    // al mouse leave viene ripristinata la situazione iniziale
    $('.container').on( 'mouseleave', '.card', function() {
        $(this).parents('.more-info').hide();
        $(this).children('img').show();
        $(this).children('.card-text').hide();
        $(this).find('.box-generi').hide();
        $(this).find('.more-info').remove();
    });

    $('section').on('click', '.card button', function() {
        var movieId = $(this).parents('.card').data('movieId');
        $(this).parents('.card-text').hide();
        var that = $(this);
        that.parents('.card-text').siblings('.box-generi').show();
        console.log(movieId);
        getCastGenreApi(movieId, that);
    });

    // --------------------------------------------------------------------------------------------------
    // ------------------------------------------FUNZIONI------------------------------------------------
    // --------------------------------------------------------------------------------------------------

    // funzione che restituisce i film ricercati
    function findMedia() {
        $('.card').remove(); // rimuovo tutte le card generate in precedenza, se ci sono
        var searchMedia = getValAndClear('#input-search');
        if (searchMedia != '') {
            getMediaApi('movie', searchMedia, '#film-card-container');
            getMediaApi('tv', searchMedia, '#tv-card-container');
        }
    };

    // funzione che ottiene il valore inserito da un input e successivamente pulisce i caratteri digitati nell'input
    function getValAndClear(input) {
        var val = $(input).val();
        $(input).val('');
        return val;
    };

    // funzione per raggiungere i film/serie tv nell'API
    function getMediaApi(tipo, inpSearch, whereAppend) {
        var apiBaseUrl = 'https://api.themoviedb.org/3';
        $.ajax({
            url: apiBaseUrl + '/search/' + tipo,
            method: 'GET',
            data: {
                api_key: 'bbf583179ea7e0b62001a8dd43710a73',
                language: 'it-IT',
                query: inpSearch
            },
            success: function (data) {
                var movies = data.results;
                createCard(movies, tipo, whereAppend);
            },
            error: function (err) {
                alert('Ops...Qualcosa è andato storto');
            }
        });
    };

    // funzione che estrapola i dati dell'oggetto analizzato creando una card che viene riportata nel DIV corrispondente tramite handlebars
    function createCard(array, tipo, whereAppend) {
        for (var i = 0; i < array.length; i++) {
            var movie = array[i];
            var titolo, titoloOriginale;
            if (tipo == 'movie') {
                titolo = movie.title;
                titoloOriginale = movie.original_title;
            } else if (tipo == 'tv') {
                titolo = movie.name;
                titoloOriginale = movie.original_name;
            }
            var movieTemplate = {
                posterImg: movie.poster_path,
                title: titolo,
                originalTitle: titoloOriginale,
                originalFlag: flagsImg(movie.original_language),
                originalLanguage: movie.original_language,
                vote: movie.vote_average,
                stelle: starVote(movie.vote_average),
                overview: movie.overview,
                movieId: movie.id
            }
            var cardMovie = cardTemplate(movieTemplate);
            $(whereAppend).append(cardMovie);
        }
    }

    // funzione per raggiungere i dati relativi a Genere e Cast
    function getCastGenreApi(idFilmSerie, selezionato) {
        var apiBaseUrl = 'https://api.themoviedb.org/3';
        $.ajax({
            url: apiBaseUrl + '/movie/' + idFilmSerie,
            method: 'GET',
            data: {
                api_key: 'bbf583179ea7e0b62001a8dd43710a73',
                language: 'it-IT',
                append_to_response: 'credits'
            },
            success: function(data) {
                var castMovie = data.credits.cast;
                for (var i = 0; i < 5; i++) {
                    // console.log(castMovie[i]);
                    var actor = castMovie[i];
                    var castTemplate = {
                        foto: actor.profile_path,
                        personaggio: actor.character,
                        attore: actor.name
                    }
                    var cardCast = cardCastTemplate(castTemplate);
                    $(selezionato).parents('.card').append(cardCast);
                    console.log(castTemplate.foto);
                }
                createBoxGenre(selezionato, data);
            },
            error: function(err) {
                alert('Errore richiesta Cast');
            }
        });
    };

    // funzione che ricava i generi del film e li assembla in un array
    function createBoxGenre(selezionato, data) {
        var genreMovie = data.genres;
        var arrayGenre = [];
        for (var i = 0; i < genreMovie.length; i++) {
            arrayGenre.push(genreMovie[i].name);
        }
        var arrayJoinGenre = arrayGenre.join(', ');
        $(selezionato).parents('.card').find('.box-generi .generi span').remove();
        $(selezionato).parents('.card').find('.box-generi .generi').append('<span>' + arrayJoinGenre + '</span>');
    };

    // funzione che restituisce una immagine di bandiera nella sezione lingua originale
    function flagsImg(country) {
        var flag = country;
        if (flag == 'en') {
            var flag = 'gb';
        } else if (flag == 'zh') {
            var flag = 'cn';
        } else if (flag == 'ja') {
            var flag = 'jp';
        }
        return flag;
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

    // funzione che arrotonda voto da 1-10 decimale in intero e lo trasforma in una scala da 1 a 5
    function roundHalfVote(number) {
        return Math.ceil(number / 2)
    };

    // funzione che rimuove il box-shadow interno rosso
    function removeBoxShadow(element) {
        $(element).css('box-shadow', 'none');
    };

});
