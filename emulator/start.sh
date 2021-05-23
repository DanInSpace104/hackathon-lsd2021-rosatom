#!/bin/bash
app="emulator_test"
docker stop ${app}
docker rm ${app}
docker rmi ${app}
docker build -t ${app} .
docker run --name=${app} \
  --net=host \
  -v $PWD:/app  -d ${app}