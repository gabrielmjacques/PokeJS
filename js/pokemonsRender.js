function captalize( string ) {
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
}

function getPokemonsNames( data ) {
    const pokemons_names = data.map( pokemon => {
        return pokemon.name;
    } );
    return pokemons_names;
}

async function getPokemon( pokemon_name ) {
    const url = `https://pokeapi.co/api/v2/pokemon/${ pokemon_name }`;

    const res = await fetch( url );
    const data = await res.json();

    const pokemon = {
        name: captalize( data.name ),
        id: data.id,
        image: data.sprites.front_default,
        types: data.types.map( type => {
            return captalize( type.type.name );
        } ),
        stats: data.stats.map( stat => {
            return {
                name: stat.stat.name,
                value: stat.base_stat
            }
        } )
    }

    return pokemon;
}

async function getPokemonsList( offset, limit ) {
    let pokemons_list = [];

    const url = `https://pokeapi.co/api/v2/pokemon?offset=${ offset }&limit=${ limit }`;

    const res = await fetch( url );
    const data = await res.json();

    const pokemons_names = getPokemonsNames( data.results )

    const pokemons = await Promise.all( pokemons_names.map( async pokemon_name => {
        const pokemon = await getPokemon( pokemon_name )
        return pokemon
    } ) )

    return pokemons
}

function convertToHTML( pokemon ) {
    const primary_type = pokemon.types[ 0 ].toLowerCase()

    const pokemon_html = `
        <div class="card mb-3 shadow" data-bs-toggle="modal" data-bs-target="#pokemon-${ pokemon.id }">
            <div class="row g-0">
                <div class="pokemon-img-container col-md-4 d-flex justify-content-center w-100  ${ primary_type }">
                    <img src="${ pokemon.image }" class="img-fluid rounded-start w-50" alt="${ pokemon.name }">
                </div>
                <div class="col-md-8 w-100">
                    <div class="card-body">
                        <h5 class="card-title">${ pokemon.name }</h5>
                        <p class="card-text">
                            <strong>Types:</strong> ${ pokemon.types.join( ', ' ) }
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal fade" tabindex="-1" id="pokemon-${ pokemon.id }">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${ pokemon.name }</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        
                        <div class="row">
                            <div class="col-md-4">
                                <img src="${ pokemon.image }" class="img-fluid rounded-start w-100" style="max-width: 300px;" alt="${ pokemon.name }">
                            </div>
                            
                            <div class="col-md-8">
                                <h3 class="text-center">${ pokemon.name }</h3>
                                
                                <hr>
                                
                                <h5>Types:</h5>
                                <ul class="types-list">
                                    ${ pokemon.types.map( type => {
        return `<li class="${ primary_type }">${ type }</li>`
    } ).join( '' ) }
                                </ul>
                                
                                <hr>
                                
                                <h5>Stats:</h5>
                                
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${ pokemon.stats.map( stat => {
        return `
        <tr>
            <td><strong>${ stat.name.toUpperCase() }</strong></td>
            <td>${ stat.value }</td>
        </tr>   
    `
    } ).join( '' ) }
                                    </tbody>
                                </table>
                                
                            </div >
                        </div >
                    
                    </div >
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
                </div >
            </div >
    </div >
        `

    return pokemon_html
}

function morePokemons() {
    const more_pokemons_btn = $( '#more-pokemons-btn' )

    more_pokemons_btn.attr( 'disabled', true )
    more_pokemons_btn.html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...' )

    setTimeout( async function () {
        const offset = $( '#pokemons-container .card' ).length
        const limit = 20

        getPokemonsList( offset, limit ).then( pokemons_list => {
            const pokemons_html = pokemons_list.map( pokemon => {
                return convertToHTML( pokemon )
            } ).join( '' )

            $( '#pokemons-container' ).append( pokemons_html )
        } )
    }, 1000 )

    more_pokemons_btn.attr( 'disabled', false )
    more_pokemons_btn.html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...' )
}

$( document ).ready( async function () {
    const pokemons_list = await getPokemonsList()

    const pokemons_html = pokemons_list.map( pokemon => {
        return convertToHTML( pokemon )
    } ).join( '' )

    $( '#pokemons-container' ).append( pokemons_html )

    console.log( pokemons_list )
} );