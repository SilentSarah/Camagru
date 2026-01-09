#!/bin/sh

envsubst < /usr/share/nginx/html/js/env.js.template > /usr/share/nginx/html/js/env.js

exec nginx -g 'daemon off;'
