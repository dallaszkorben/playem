import json

from flask import Flask
from flask import jsonify
from flask import session
from flask_classful import FlaskView, route, request

from playem.exceptions.invalid_api_usage import InvalidAPIUsage
from playem.restserver.representations import output_json

from playem.restserver.endpoints.ep_collect_media_by_card_id import EPCollectMediaByCardId

#from playem.restserver.endpoints.ep_collect_standalone_movies_by_genre import EPCollectStandaloneMoviesByGenre
from playem.restserver.endpoints.ep_collect_medium_by_card_id import EPCollectMediumByCardId

from playem.restserver.endpoints.ep_collect_child_hierarchy_or_card import EPCollectChildHierarchyOrCard

from playem.restserver.endpoints.ep_collect_general_level import EPCollectGeneralLevel
from playem.restserver.endpoints.ep_collect_general_standalone import EPCollectGeneralStandalone

from playem.restserver.endpoints.ep_collect_all_appendix_by_card_id import EPCollectAllAppendixByCardId

# -----------------------------------
#
# GET info
#
# curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/general/level/band/category/music_video/genre/new_wave/theme/*/origin/*/decade/80s/lang/en
# curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/general/standalone/category/movie/genre/drama/theme/*/director/*/actor/*/origin/*/decade/80s/lang/en
# curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/child_hierarchy_or_card/id/123/lang/en
#
# curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/standalone/movies/genre/drama/lang/en
#
# curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/all/appendix/card_id/123/lang/en

# curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/media/card_id/123/lang/en
#

# -----------------------------------
#
class CollectView(FlaskView):
    inspect_args = False

    def __init__(self, web_gadget):

        self.web_gadget = web_gadget

#        self.epCollectStandaloneMoviesByGenre = EPCollectStandaloneMoviesByGenre(web_gadget)
        self.epCollectMediumByCardId = EPCollectMediumByCardId(web_gadget)

        self.epCollectGeneralLevel = EPCollectGeneralLevel(web_gadget)
        self.epCollectGeneralStandalone = EPCollectGeneralStandalone(web_gadget)
        self.epCollectChildHierarchyOrCard = EPCollectChildHierarchyOrCard(web_gadget)
        self.epCollectMediaByCardId = EPCollectMediaByCardId(web_gadget)
        self.epCollectAllAppendixByCardId = EPCollectAllAppendixByCardId(web_gadget)

    #
    # GET http://localhost:5000/collect/
    #
    def index(self):
        return {}




# === series movies filtered by genre             ===

# === series movies filtered by theme             ===

# === series movies filtered by origin            ===



# === collect with general filter ===

    #
    # Gives back list of records of all levels with the given parameters
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/general/level/band/category/music_video/genre/new_wave/theme/*/origin/*/decade/80s/lang/en
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/general/level/series/category/movie/genre/drama/theme/life/origin/*/hu/decade/*/lang/en
    #
    # GET http://localhost:80/collect/all/series/movies
    #
    #@route('/general/level/<level>/category/<category>/genre/<genre>/theme/<theme>/origin/<origin>/decade/<decade>/lang/<lang>)
    @route(EPCollectGeneralLevel.PATH_PAR_URL, methods=[EPCollectGeneralLevel.METHOD])
    def collectGeneralLevelWithParameter(self, level, category, genre, theme, origin, decade, lang):

        out = self.epCollectGeneralLevel.executeByParameters(level, category, genre=genre, theme=theme, origin=origin, decade=decade, lang=lang)
        return out


    #
    # Gives back list of standalones of all levels with the given parameters
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/general/standalone/category/movie/genre/drama/theme/*/director/*/actor/*/origin/*/decade/80s/lang/en
    #
    # GET http://localhost:80/collect/all/series/movies
    #
    #@route('/general/standalone/category/<category>/genre/<genre>/theme/<theme>/director/<director>/actor/<actor>/origin/<origin>/decade/<decade>/lang/<lang>)
    @route(EPCollectGeneralStandalone.PATH_PAR_URL, methods=[EPCollectGeneralStandalone.METHOD])
    def collectGeneralStandaloneWithParameter(self, category, genre, theme, director, actor, origin, decade, lang):
        out = self.epCollectGeneralStandalone.executeByParameters(category=category, genre=genre, theme=theme, director=director, actor=actor, origin=origin, decade=decade, lang=lang)
        return out


# === all child card of a specific hirarchy card ===

    #
    # Gives back the next lower level of the specific card
    # It could be a media-card or level-card as well, we do not know that before we search for it
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/child_hierarchy_or_card/id/123/lang/en
    #
    # GET http://localhost:80/collect/child_hierarchy_or_card/id/123/lang/en
    #
    #@route('//id/<id>/lang/<lang>')
    @route(EPCollectChildHierarchyOrCard.PATH_PAR_URL, methods=[EPCollectChildHierarchyOrCard.METHOD])
    def collectChildHierarchyOrCardWithParameter(self, id, lang):

        out = self.epCollectChildHierarchyOrCard.executeByParameters(id=id, lang=lang)
        return out


## === standalone movies filtered by genre ===
#
#    #
#    # Gives back list of records of standalone movies with genre with parameters
#    #
#    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/standalone/movies/genre/drama/lang/en
#    #
#    # GET http://localhost:80/collect/standalone/movies/genre/drama/lang/en
#    #
#    #@route('/standalone/movies/genre/<genre>/lang/<lang>')
#    @route(EPCollectStandaloneMoviesByGenre.PATH_PAR_URL, methods=[EPCollectStandaloneMoviesByGenre.METHOD])
#    def collectStandaloneMoviesByGenreWithParameter(self, genre, lang):
#
#        out = self.epCollectStandaloneMoviesByGenre.executeByParameters(genre=genre, lang=lang)
#        return out


# === appendix filtered by card_id ===

    #
    # Gives back all appendix of a specific card id
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/all/appendix/card_id/123/lang/en
    #
    # GET http://localhost:80/collect/all/appendix/card_id/123/lang/en
    #
    #@route('/all/appendix/card_id/<card_id>/lang/<lang>')
    @route(EPCollectAllAppendixByCardId.PATH_PAR_URL, methods=[EPCollectAllAppendixByCardId.METHOD])
    def collectAllAppendixByCardIdWithParameter(self, card_id, lang):

        out = self.epCollectAllAppendixByCardId.executeByParameters(card_id=card_id, lang=lang)
        return out


# === one card with a specific card_id ===

    #
    # Gives back any media with a specific card id
    #
    # curl  --header "Content-Type: application/json" --request GET http://localhost:80/collect/media/card_id/123/lang/en
    #
    # GET http://localhost:80/collect/media/card_id/123/lang/en
    #
    #@route('/media/card_id/<card_id>/lang/<lang>')
    @route(EPCollectMediaByCardId.PATH_PAR_URL, methods=[EPCollectMediaByCardId.METHOD])
    def collectStandaloneMediaByCardIdWithParameter(self, card_id, lang):

        out = self.epCollectMediaByCardId.executeByParameters(card_id=card_id, lang=lang)
        return out
