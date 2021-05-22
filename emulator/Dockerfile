FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

ARG MQTT_HOST="2.57.186.96"
ARG MQTT_PORT=1883

ENV MQTT_HOST ${MQTT_HOST}
ENV MQTT_PORT ${MQTT_PORT}

#RUN echo '{"host" : "${FLASK_HOST}" , "port": "${FLASK_PORT}"}' > config.json

COPY . .
EXPOSE 5000
CMD [ "python3", "temperature.py"]