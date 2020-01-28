# Aedes proxy example

## Steps

    1 Generate certicates with `generate-cert.sh` 
    ( if FQDN is set to something else than localhost, update docker-compose.yml NGINX_SERVER_HOST accordingly)

    2 `docker-compose build`

    3 `docker-compose up`

    3 Start `node client.js`

## Expected behaviour

Protocol decoder should be triggered only once when using TCP proxy that handles SSL termination.

## Current behaviour

Protocol decoder is triggered twice 