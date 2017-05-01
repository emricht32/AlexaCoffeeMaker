#!flask/bin/python
from flask import Flask, jsonify, abort, request, make_response, url_for
from flask.ext.httpauth import HTTPBasicAuth

import threading
import serial
ser = serial.Serial('/dev/cu.usbmodem1421')

app = Flask(__name__, static_url_path = "")
auth = HTTPBasicAuth()
brewing = False

def start_brew():
    global brewing
    brewing=True
    
    return None


@auth.error_handler
def unauthorized():
    return make_response(jsonify( { 'error': 'Unauthorized access' } ), 403)
    # return 403 instead of 401 to prevent browsers from displaying the default auth dialog
    
@app.errorhandler(400)
def not_found(error):
    return make_response(jsonify( { 'error': 'Bad request' } ), 400)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)


@app.route('/coffee', methods = ['GET'])
#@auth.login_required
def get_coffee():
    return jsonify( { 'brewing': brewing } )


@app.route('/coffee', methods = ['POST'])
#@auth.login_required
def create_coffee():
    global brewing
    if not brewing:
        #send message to brew
        thread = threading.Thread(target=start_brew,args=())
        thread.daemon = True                            # Daemonize thread
        thread.start()
    
    return jsonify( { 'success': True} ), 201

#cancel - more to do
@app.route('/coffee', methods = ['DELETE'])
#@auth.login_required
def delete_coffee():
    #task = filter(lambda t: t['id'] == task_id, tasks)
    global brewing
    if brewing:
        brewing = False
    #Stop brewing
    return jsonify( { 'brewing': brewing } )
    
if __name__ == '__main__':
    #app.run(host='0.0.0.0')
    app.run()

#while 1:
#    ser.readline()
