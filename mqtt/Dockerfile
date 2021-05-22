FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

ARG INFL_ORG="Miciot"
ARG INFL_TOKEN="tOGsUG7dNLjcmj_4ruYzknCPXDjnwhYSv0gZCCq1yOeMvE2hqzvFyCQM3XawxQ8Z2-8DjwsQcu-mAuH0KiloDg=="
ARG INFL_URL="http://2.57.186.96:8086"
ARG MQTT_HOST="2.57.186.96"
ARG MQTT_PORT="1883"


ENV INFL_ORG ${INFL_ORG}
ENV INFL_TOKEN ${INFL_TOKEN}
ENV INFL_URL ${INFL_URL}
ENV MQTT_HOST ${MQTT_HOST}
ENV MQTT_PORT ${MQTT_PORT}


#RUN echo '{"host" : "${FLASK_HOST}" , "port": "${FLASK_PORT}"}' > config.json

COPY . .
EXPOSE 5000
CMD [ "python3", "listener.py"]