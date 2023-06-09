import json

from flask import Flask
from flask import jsonify
from flask import session
from flask_classful import FlaskView, route, request

from playem.exceptions.invalid_api_usage import InvalidAPIUsage
from playem.restserver.representations import output_json

from playem.restserver.endpoints.ep_translate_genre import EPTranslateGenre

# -----------------------------------
#
# GET Translate
#
# -----------------------------------
#
class TranslateView(FlaskView):
    inspect_args = False

    def __init__(self, web_gadget):

        self.web_gadget = web_gadget

        self.epTranslateGenre = EPTranslateGenre(web_gadget)

    #
    # GET http://localhost:5000/translate/
    #
    def index(self):
        return {}

    #
    # Gives back translation of a genre with payload
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/translate/genre
    #
    # GET http://localhost:80/translate/genre/drama/lang/en
    #
    #@route('/translate/genre', methods=['GET'])


    # @route(EPTranslateGenre.PATH_PAR_PAYLOAD, methods=[EPTranslateGenre.METHOD])
    # def translateGenreWithPayload(self):

    #     # WEB
    #     if request.form:
    #         json_data = request.form

    #     # CURL
    #     elif request.json:
    #         json_data = request.json

    #     else:
    #         return "Not valid request", EP.CODE_BAD_REQUEST

    #     out = self.epTranslateGenre.executeByPayload(json_data)
    #     return out



    #
    # Gives back translation of a genre with parameters
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/translate/genre/drama/category/movie/lang/en
    #
    # GET http://localhost:80/translate/genre/drama/category/movie/lang/en
    #
    #@route('/genre/<genre>/category/<movie>/lang/<lang>')
    @route(EPTranslateGenre.PATH_PAR_URL, methods=[EPTranslateGenre.METHOD])
    def translateGenreWithParameter(self, genre, category, lang):        
        out = self.epTranslateGenre.executeByParameters(category=category, genre=genre, lang=lang)
        return out

# ===


