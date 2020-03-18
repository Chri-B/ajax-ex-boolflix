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
                    vote: roundVote(film.vote_average)
                }
                var cardFilm = cardTemplate(filmTemplate);
                $(whereAppend).append(cardFilm);
            }
        },
        error: function (err) {
            alert('Qualcosa è andato storto');
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

// arrotonda voto da 1-10 decimale in intero e lo trasforma in una scala da 1 a 5
function roundVote(vote) {
    var newVote = Math.ceil(vote / 2)
    console.log(vote, newVote, 'voto 1-5');
    return newVote
}

function addStars(number) {

}
