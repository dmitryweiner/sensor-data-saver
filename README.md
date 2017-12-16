# sensor-data-saver
Listen to MQTT events, save data and show live graphs

## Prerequisites
* Mosquitto -- MQTT broker
~~~
$ wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key 
$ sudo apt-key add mosquitto-repo.gpg.key 
$ cd /etc/apt/sources.list.d/ 
$ sudo wget http://repo.mosquitto.org/debian/mosquitto-wheezy.list 
$ sudo apt-get update $ sudo apt-get install mosquitto
~~~
Don't forget to setup security: https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-the-mosquitto-mqtt-messaging-broker-on-ubuntu-16-04

## Technologies
* Node.js
* Express.js (web framework)
* Mongoose.js (MongoDB framework)
* [Dygraphs](http://dygraphs.com/) -- 2D graphs

## Installation
* `npm install`
* Set actual parameters for Mosquitto in config.js
* Set up pm2 manager or run directly via "npm run"

## Live example
Running example is running [here](http://sensor.dweiner.ru/) (data from sensor inside my room)
