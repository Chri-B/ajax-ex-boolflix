$(document).ready(function() {

    // procedure per creare template Handlebars
    var cardSrc = $("#card-template").html();
    var cardTemplate = Handlebars.compile(cardSrc);

    var cardCastSrc = $('#actor-template').html();
    var cardCastTemplate = Handlebars.compile(cardCastSrc);

    // il selettore dei generi viene integrato di tutti i generi disponibili
    getGenreList('movie');
    getGenreList('tv');

    // alla selezione del genere, rimangono solamente le card del genere selezionato
    $('#genre-selector-movie').change(function() {
        var selectedGenre = $(this).val();
        cardSelector('#film-card-container', selectedGenre);
    });
    $('#genre-selector-tv').change(function() {
        var selectedGenre = $(this).val();
        cardSelector('#tv-card-container', selectedGenre);
    });

    // all'input di ricerca viene aggiunto un effetto box-shadow
    $('#input-search').click(function() {
        $(this).css('box-shadow', 'inset 0px 0px 5px 2px #d71d29');
    });

    // al click sul bottone viene eseguita la ricerca -  poi viene rimosso il box shadow
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
        $(this).children('img').show();
        $(this).children('.card-text').hide();
        $(this).parents('.more-info').remove();
        $(this).find('.box-generi').hide();
        $(this).find('.more-info').remove();
    });

    // al click della card nella sezione, vengono evocate le funzioni per visualizzare e
    $('#film-card-container').on('click', '.card button', function() {
        var that = $(this);
        showThirdCard(that);
        getCastGenreApi(that, 'movie');
    });
    $('#tv-card-container').on('click', '.card button', function() {
        var that = $(this);
        showThirdCard(that);
        getCastGenreApi(that, 'tv');
    });


    // ------------------------------------------FUNZIONI------------------------------------------------

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
                genreIds: movie.genre_ids,
                movieId: movie.id
            }
            var cardMovie = cardTemplate(movieTemplate);
            $(whereAppend).append(cardMovie);
        }
    }

    // funzione per raggiungere i dati relativi a Genere e Cast
    function getCastGenreApi(selezionato, tvMovie) {
        var apiBaseUrl = 'https://api.themoviedb.org/3';
        var movieId = selezionato.parents('.card').data('movieId');
        $.ajax({
            url: apiBaseUrl + '/' + tvMovie + '/' + movieId,
            method: 'GET',
            data: {
                api_key: 'bbf583179ea7e0b62001a8dd43710a73',
                language: 'it-IT',
                append_to_response: 'credits'
            },
            success: function(data) {
                var castMovie = data.credits.cast;
                createActorsPreview(selezionato, castMovie);
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

    // funzione che estrapola i dati dell'oggetto analizzato creando una card che viene riportata nel DIV corrispondente tramite handlebars
    function createActorsPreview(selezionato, castMovie) {
        for (var i = 0; i < 5; i++) {
            var actor = castMovie[i];
            var castTemplate = {
                foto: actor.profile_path,
                personaggio: actor.character,
                attore: actor.name
            }
            var cardCast = cardCastTemplate(castTemplate);
            $(selezionato).parents('.card').append(cardCast);
        }
    }

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

    // funzione per mostrare la terza view relativa ad ogni card
    function showThirdCard(selezione) {
        selezione.parents('.card-text').hide();
        selezione.parents('.card-text').siblings('.box-generi').show();
    };

    // funzione per raggiungere la lista dei generi per film o serie TV
    function getGenreList(tvMovie) {
        var apiBaseUrl = 'https://api.themoviedb.org/3';
        $.ajax({
            url: apiBaseUrl + '/genre/' + tvMovie + '/list',
            method: 'GET',
            data: {
                api_key: 'bbf583179ea7e0b62001a8dd43710a73',
                language: 'it-IT'
            },
            success: function(data) {
                var genreList = data.genres;
                for (var i = 0; i < genreList.length; i++) {
                    $('#genre-selector-' + tvMovie).append('<option value="' + genreList[i].id + '">' + genreList[i].name + '</option>');
                }
            },
            error: function(err) {
                alert('Errore richiesta lista-genere');
            }
        });
    };

    // funzione che confronta il valore in ingresso (selectedGenre) con il valore corrispondente delle CARD e mostra quelle coincidenti, nascondendo le altre.
    function cardSelector(position, selectedGenre) {
        if (selectedGenre == "") {
            $(position).find('.card').show();
        } else {
            $(position).find('.genre-ids').each(function() {
                if ($(this).text().includes(selectedGenre)) {
                    $(this).parents('.card').show();
                } else {
                    $(this).parents('.card').hide();
                }
            });
        }
    }

});
