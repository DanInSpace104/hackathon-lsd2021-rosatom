#!/bin/bash
app="flask_test"
docker stop ${app}
docker rm ${app}
docker rmi ${app}
docker build -t ${app} .
#docker run -d -p 5000:5000 \
#  --name=${app} \
#  --net=host \
#  -v $PWD:/app  -d ${app}