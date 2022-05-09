import fetch from 'node-fetch';
let type = 'ANIME'
var query = `
query ($q: String) { # Define which variables will be used in the query (id)
  Media (search: $q, type: ${type}) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
    id
    title {
      romaji
      english
      native
    }
    description
  }
}
`;

// Define our query variables and values that will be used in the query request
var variables = {
    q: 'oregairu'
};

// Define the config we'll need for our Api request
var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };


function handleResponse(response) {
    return response.json().then(function(json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    console.log(data);
}

function handleError(error) {
    console.log('Error, check console');
    console.error(error);
}

fetch(url, options).then(handleResponse)
    .then(handleData)
    .catch(handleError);