#!/usr/bin/env python3

from browser import Browser

from flask import Flask, render_template, request
from flask import jsonify
app = Flask(__name__)

browser = Browser()


@app.route('/')
@app.route('/<string:rootid>')
def index(rootid=0):
    return render_template('index.html',
                           rootid=rootid,
                           )


@app.route('/get/<string:ID>', methods=['GET'])
def get(ID):
    j = browser.get(ID)
    return jsonify(j)


@app.route('/galaxy/getClusters/<string:galalxyId>', methods=['GET'])
def getClusters(galalxyId):
    j = browser.getClusters(galalxyId)
    return jsonify(j)

@app.route('/galaxy/getAll/', methods=['GET'])
def getAllGalaxies():
    allGalaxies = browser.getAllGalaxies()
    return jsonify(allGalaxies)


@app.route('/galaxy/getName/', methods=['POST'])
def getGalaxyNames():
    galaxies = browser.getGalaxyNames()
    return jsonify(galaxies)


@app.route('/lookup/', methods=['POST'])
def lookup():
    request_data = request.get_json(silent=True)
    value = request_data.get('galaxy', '')
    galaxies = browser.lookup(value)
    return jsonify(galaxies)


app.run()
