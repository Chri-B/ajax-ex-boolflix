// procedure per creare template Handlebars
var source = $("#card-template").html();
var cardTemplate = Handlebars.compile(source);

// al click sul bottone o all'invio viene eseguita la ricerca
$('#send-search').click(findFilms);
$('#input-search').keydown(function(event) {
    if(event.which == '13') {
        findFilms();
    }
});




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
                    originalLanguage: film.original_language,
                    vote: starVote(film.vote_average),
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

// funzione che ottiene il valore inserito da un input e successivamente pulisce i caratteri digitati nell'input
function getValAndClear(input) {
    var val = $(input).val();
    $(input).val('');
    return val;
};

// funzione che restituisce i film ricercati
function findFilms() {
    $('.card-container .card').hide(); // nascondo tutti le ricerce aperte, successivamente mostro quello che viene cercato
    var searchFilm = getValAndClear('#input-search');
    getFilmApi(searchFilm, '.card-container');
};

// funzione che arrotonda voto da 1-10 decimale in intero e lo trasforma in una scala da 1 a 5
function roundHalfVote(number) {
    var newVote = Math.ceil(number / 2)
    return newVote
}

// funzione che assegna il numero di stella piene equivalente al voto del film, e un numero di stelle vuote uguale alla differenza tra 5 e il voto del film
function starVote(vote) {
    var starVote = roundHalfVote(vote);
    var stella = [];
    var j = 0;
    for (var i = 0; i < 5; i++) {
        console.log(j);
        if (j < starVote) {
            stella.push('<i class="fas fa-star"></i>');
            console.log(stella, j);
            j = j + 1;
        } else {
            stella.push('<i class="far fa-star"></i>');
            console.log(stella, j);
            j = j + 1;
        }
    }
    console.log(stella, 'array');
    return stella.join('');
}
