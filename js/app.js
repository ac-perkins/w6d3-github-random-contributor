(function() {
    'use strict';

    var ghToken;

    var contribData = JSON.parse( localStorage.getItem('contribData') );
    if (!contribData) {
          contribData = [];
      }

    // Appends UI elements on page load from localStorage
    contribData.forEach(function (element) {
      $('#contributors ul')
          .append( $('<li>').text(element.login)
              .append( $('<img>').attr( {src: element.avatar_url} ) )
          );
    });

    // Clears localStorage when the Clear Data button is clicked
    $('.clear').click(function (event) {
        event.preventDefault();
        localStorage.clear();
    });


    $('#search').submit(function (event) {
        event.preventDefault();
        ghToken = $('#api-key').val();
        getQueryData( $('#query').val() )
          .then(queryIsDone)
          .then(repoIsDone)
          .fail(function workFailed(xhr) {
                console.warn(xhr);
                $('#contributors ul')
                    .append( $('<li>').text("Your request failed. Please try again.")
                );
            });
    });

    /**
     * Ajax call to get a list of repos associated with the query
     * @param  {string} url The query entered into the form  
     */
    function getQueryData(url) {

        return $.ajax({
            url: 'https://api.github.com/search/repositories?q=' + url,
            dataType: 'json',
            headers: {
            Authorization: 'token ' + ghToken
        }
        });
    }

    /**
     * Takes data received from the getQueryData ajax call and selects a random
     * repo to inititate another ajax call and get that repo's list of commits.
     * @param  {array} data  Array of repos related to initial query
     * @return {[type]}
     */
    function queryIsDone(data) {
        console.log(data);
        var randomRepo = Math.floor(Math.random() * data.items.length);
        var repo = data.items[randomRepo].full_name;
        console.log(repo);
        return AjaxRepoCall(repo);
    }

    /**
     * Ajax call to get an array of commits associated with the randomly selected repo
     * @param {string} url a string which includes the username and reponame of the
     *                     randomly selected repo.
     */
    function AjaxRepoCall(url) {

        return $.ajax({
            url: 'https://api.github.com/repos/' + url + '/commits',
            dataType: 'json',
            headers: {
            Authorization: 'token ' + ghToken
        }
        });
    }

    /**
     * Selects a random commit from the given array of commits and grabs the necessary
     * data that can then be pushed to an array for localStorage and also appended to
     * the UI.
     * @param  {array} data Array of commits from randomly selected repo
     * @return {[type]}
     */
    function repoIsDone(data) {
        console.log(data);
        var randomCommit = Math.floor(Math.random() * data.length);
        var commit = data[randomCommit];
        var commitArray = {};

        if (commit.author === null){
            commitArray =  {
              login: commit.commit.author.email + " (This user's GitHub account is no longer active)",
              avatar_url: 'https://avatars.githubusercontent.com/u/11791361?v=3'
            };
            contribData.push( commitArray );
            localStorage.setItem( 'contribData', JSON.stringify(contribData) );
            return AppendInactiveAuthor(commit);
        } else {
            commitArray =  {login: commit.author.login, avatar_url: commit.author.avatar_url} ;
            contribData.push( commitArray );
            localStorage.setItem( 'contribData', JSON.stringify(contribData) );
            return AppendAuthor(commit);
        }
    }


    function AppendAuthor(commit) {
        $('#contributors ul')
            .append( $('<li>').text(commit.author.login)
                .append( $('<img>').attr( {src: commit.author.avatar_url} ) )
            );
    }

    function AppendInactiveAuthor(commit) {
        $('#contributors ul')
            .append( $('<li>').text(commit.commit.author.email + " (This user's GitHub account is no longer active)")
                .append( $('<img>').attr( {src: 'https://avatars.githubusercontent.com/u/11791361?v=3'} ) )
            );
    }

})();
