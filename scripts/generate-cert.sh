#!/bin/bash
openssl req  -nodes -new -x509  \
    -keyout ./cert/server.key \
    -out ./cert/server.cert \
    -subj "/C=US/ST=PA/L=Phoenixville/O=EadsGraphic/OU=Com/CN=www.eadsgraphic.com"