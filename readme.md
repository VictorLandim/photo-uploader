## Generate token:
https://developer.wordpress.com/docs/oauth2/

- first stage:
https://public-api.wordpress.com/oauth2/authorize?client_id=68288&redirect_uri=http://localhost:8000/redirect/&response_type=code&blog=https://2665153697.photo.blog/&scope=global

https://public-api.wordpress.com/oauth2/authorize?client_id=68288&redirect_uri=http://localhost:8000/redirect/&response_type=code&scope=global

- second stage:
POST https://public-api.wordpress.com/oauth2/token
body:
   'client_id' => your_client_id,
    'redirect_uri' => your_redirect_url,
    'client_secret' => your_client_secret_key,
    'code' => $_GET['code'], // The code from the previous request
    'grant_type' => 'authorization_code'
