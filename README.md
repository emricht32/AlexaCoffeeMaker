# AlexaCoffeeMaker
Controlling a Coffee Maker via Alexa using a RaspberryPi and an Arduino

This is a work in progress.  Not all of the functionality that I would like to have is part of this yet but Alexa will at least turn on my coffee machine and brew a cup of coffeeAlexa.

See it working [here] (https://www.youtube.com/watch?v=mDmpJ5b01Jk).

A few assumptions before we begin.  This tutorial assumes you have used a Raspberry Pi and Arduino before, and that you are familiar with using that command line.  You dont need to know much about coding in Node.js or Python, the two languages used as the code is written already but some understanding may be useful.

###Hardware

1. Raspberry Pi 3
2. Arduino Uno
3. Soldering iron and solder OR hot glue gun
4. Relay
5. 5 wires
6. Farberware Coffee Maker (Really any simple coffee maker that has a push button start will likely work)

###Workflow

When everything is set up, the flow of instructions from user to hot coffee goes like this:


1.  User tells Alexa "Tell Coffee Maker Brew"
2.  Alexa relays the command to the CoffeeMaker skill (which is a lambda function) in AWS
3. The CoffeeMaker skill runs its code, in our case it sends a POST message to a public url that looks like: `http://XXXXXXXX.ngrok.io`.  Where XXXXXXXX is some hex value.  The exact url is given after you run the ngrok command in command line (more on that in a bit).
4. ngrok then tunnels to the localhost of the machine that started it (in our case a Raspberry Pi).  By default it tunnels to port 5000 but for our demo here its mapped to port 5002 of the pi.
5. The Pi is running a Python webserver on localhost:5002.  When it gets a `POST` on `/coffee` it send a command to the Arduino that is connected via USB using nanpy.  nanpy allows you to send commands to an Arduino using Python, which is handy since our webserver is written in Python.
6. The Arduino then sends a signal to a relay that is connected to the `On` button of the coffee maker.
7. About a minute later, hot coffee  is pouring into our cup.

#Lets Get Started

All code for this project can be found on [Github](https://github.com/emricht32/AlexaCoffeeMaker).  Im not going to write how to set up AWS, Alexa or nanpy.  There are some excellent tutorials (which I used) that do a way better and more thurough job then I ever could.  

Setup instructions for nanpy can be found [here](https://pypi.python.org/pypi/nanpy).

AWS and Alexa Skills setup (along with code I ended up modifying for this) can be found [here](https://github.com/rlisle/alexaParticleBridge).  For this project you can skip any part about using `Particle` mentioned in that tutorial.  I suggest setting up AWS and the Alexa Skill before continuing on.

One note if you use the tutorial above for setting up the Alexa Skill.  The tutorial uses Particle to turn things on and off, so the commands that are set up for the Alexa Skill are `on` and `off`.  We dont want to use Particle, we want to control our coffee maker.  The current state of this tutorial is such that it is not programmed for `off` though it could be easily adapted to add this fuctionality.  Also, I used the keyword `brew` for my command.  Towards the end of the Particle tutorial in the __Setup Skill in the Develop Portal__ in steps 6 and 7, replace the word `Particle` with `Coffee Maker` and in the __Interaction Model__ section, step 4, use the text `CoffeeMakerIntent brew` instead of the values given.

#ngrok

Using the Raspberry Pi navigate to [https://ngrok.com/](https://ngrok.com/).  Click the download button and select the 32-bit platforms option and select the Linux 32-bit download (this tutorial assumes you are running Raspian on your Pi, Raspian is a Linux variant).
 
Unzip the file using `unzip /path/to/ngrok.zip` command.  Next navigate back to the ngrok home page, click on the `Sign up` button.  You should see a few steps.  You have already done step 1 (download ngrok).  Copy the command in step 2.  It should look like `./ngrok authtoken <some_token>`.

Navigate to the folder that you saved ngrok to when you downloaded it. Paste the command including your unique token into the terminal and hit enter.  Finally run the command `./ngrok http 5002`.  5002 is the port that our webserver will be listening to.  

You should see something like:

```                                                                            
Session Status                online                                            
Account                       <Your Name Here> (Plan: Free)                      
Version                       2.2.4                                             
Region                        United States (us)                                
Web Interface                 http://127.0.0.1:4040                             
Forwarding                    http://562f96bb.ngrok.io -> localhost:5002        
Forwarding                    https://562f96bb.ngrok.io -> localhost:5002       
                                                                                
Connections                   ttl     opn     rt1     rt5     p50     p90       
                              0       0       0.00    0.00    0.00    0.00  
```

Copy the hex right before `.ngrok` on the line that says `Forwarding`.  In our case it's `562f96bb`.  You need to modify a line in `AlexaCoffeeMaker/ASK/src/index.js` from the github project.  Line 86 of the file is `hostname: 'def5fe6d.ngrok.io',`.  Replace the hex in front of `.ngrok` with what you copied from running ngrok.  In our case the new line looks like `hostname: '562f96bb.ngrok.io',`

Save the file, zip it with AlexaSkill.js and upload it to the Alexa Skill in AWS and save it in amazon.

#nanpy

[Here](https://pypi.python.org/pypi/nanpy) are the instructions for nanpy.  There are two parts.  Putting the slave firmware on the Arduino and installing the library that is needed for the Pi.  The following is taken from the __How to build and install__ section of the nanpy page:

First of all, you need to build the firmware and upload it on your Arduino, to do that clone the nanpy-firmware repository on Github or download it from PyPi.

```
git clone https://github.com/nanpy/nanpy-firmware.git
cd nanpy-firmware
./configure.sh
```
You can now edit Nanpy/cfg.h generated file to configure your Nanpy firmware, selecting the features you want to include and the baud rate.

To build and install Nanpy firmware, copy Nanpy directory under your “sketchbook” directory, start your Arduino IDE, open Sketchbook -> Nanpy and click on “Upload”.

To install Nanpy Python library on your master device just type:

```
pip install nanpy
```

#Hardware

Now we have all of the software set up, its time to wire up the hardware.  There are two steps.  Wire the Arduino to the relay and wire the relay to the coffee machine start button.  The only relay that I had was an 8 channel relay so that's what I used.  This could be done with one relay.  Also the only relay image I could find was that of a 4 channel relay in the picture below.  I hope it doesnt cause too much confusion.

###Arduino to Relay

Arduino pin   | Wire color    | Relay connection
------------- | ------------- | -------------
5V            | Red				| VCC
GND           | Black			| GND
Digital pin 8 | Orange			| IN1

###Relay to Coffee Maker button

Because I didnt know what I was doing at first, with the coffee maker, I actually took apart the whole thing.  It was a bit of a pain because the screws on the bottom had a wierd three prong star head.  I ended up using a small flat head screw driver that I forced to fit.  After I opened it up, I saw that all I needed to do was to pop the button out, which can easily be done with a flat head screw driver.

Relay connection   | Wire color    | Coffee Maker button connection
------------- | ------------- | -------------
Common        | Green			| Key
NC          	 | Yellow			| GND

#Make some coffee

Thats it!  Now all we have to do is start the python server on our Raspberry Pi and we can test with Alexa.  Start the server by running the command.

```
python rest-server.py
```
Double check that ngrok is still running and that you have modified the index.js file to add the correct url that you are given from ngrok (remember for us it was `562f96bb.ngrok.io`).

Now all you have to do is say "Alexa, tell coffee maker brew" and you should see the blue light on the coffee On switch turn on, the water will get warm (Hope you didnt forget the water), and in about one minute it will pour you your coffee.

Cheers