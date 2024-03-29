class ContainerGenerator{
    constructor(language_code="en"){
        this.language_code = language_code;
    }

    showContainers(objScrollSection){
        let containerList = this.getContainerList();
        containerList.forEach(oContainer => {
            objScrollSection.addThumbnailContainerObject(oContainer);
        });
    }

    getContainerList(){
        throw new Error("Implement getContainerList() method in the descendant class of ContainerGenerator!");
    }
}

/**
 * MAIN MENU
 */
class MainMenuContainerGenerator extends ContainerGenerator{  
    getContainerList(){
        let refToThis = this;
        let containerList = [];

        let oContainer = new ObjThumbnailContainer(translated_titles['categories']);

        let thumbnail = new Thumbnail();
        let thumbnail_src, description_src,lang,original,translated,thumb,history; //,directors,writers,stars,length,year,origin,genre,theme
        thumbnail.setImageSources(thumbnail_src="images/categories/movie.jpg", description_src="images/categories/movie.jpg");
        thumbnail.setTitles(lang=this.language_code, original=translated_titles['movies'], translated=translated_titles['movies'], thumb=translated_titles['movies'], history=translated_titles['movies']);
        thumbnail.setFunctionForSelection({"menu": 
            (function(movie_type) {
                return function() {
                    return new MovieCardContainerGenerator(refToThis.language_code);
                };
            })("movies")});
        oContainer.addThumbnail(1, thumbnail);

        thumbnail = new Thumbnail();
        thumbnail.setImageSources(thumbnail_src="images/categories/series.jpg", description_src="images/categories/series.jpg");
        thumbnail.setTitles(lang=this.language_code, original=translated_titles['movie_series'], translated=translated_titles['movie_series'], thumb=translated_titles['movie_series'], history=translated_titles['movie_series']);
        thumbnail.setFunctionForSelection({"menu":
            (function(movie_type) {
                return function() {
                    return new MovieSeriesContainerGenerator(refToThis.language_code, translated_titles['series'])
                };
            })("movie_series")});
        oContainer.addThumbnail(2, thumbnail);

        thumbnail = new Thumbnail();
        thumbnail.setImageSources(thumbnail_src="images/categories/music_video.jpg", description_src="images/categories/music_video.jpg");
        thumbnail.setTitles(lang=this.language_code, original=translated_titles['music_video'], translated=translated_titles['music_video'], thumb=translated_titles['music_video'], history=translated_titles['music_video']);
        thumbnail.setFunctionForSelection(function(){refToThis.viewMovie()});
        oContainer.addThumbnail(3, thumbnail);

        thumbnail = new Thumbnail();
        thumbnail.setImageSources(thumbnail_src="images/categories/music_audio.jpg", description_src="images/categories/music_audio.jpg");
        thumbnail.setTitles(lang=this.language_code, original=translated_titles['music_audio'], translated=translated_titles['music_audio'], thumb=translated_titles['music_audio'], history=translated_titles['music_audio']);
        thumbnail.setFunctionForSelection(function(){refToThis.viewMovie()});
        oContainer.addThumbnail(4, thumbnail);

        containerList.push(oContainer);
 
        return containerList;
    }  
}


//-----


class AjaxContainerGenerator extends  ContainerGenerator{

    generateThumbnail(hit){
        throw new Error("Implement generateThumbnails() method in the descendant class of AjaxContainerGenerator!");
    }

    sendRestRequest(rq_method, rq_url){
        let rq_assync = false;
        let result = $.getJSON({method: rq_method, url: rq_url, async: rq_assync, dataType: "json"});
        return result.responseJSON;
    }

    getRandomFileFromDirectory(path, filter){
        let file_list = [];
        let rawText = $.ajax({url: path, async: false}).responseText;
        $(rawText).find('tr > td > a').not(':first').each(function(){                          
            let file_name = $(this).attr("href");
            if(filter.test(file_name))
                file_list.push(file_name);
        });
        let random_file = undefined;
        if(file_list.length)
            random_file = file_list[Math.floor(Math.random()*file_list.length)];
        return random_file;
    }

    getTruncatedTitle(text, max_length){
        let tail = "...";    
        if (text.length > max_length + tail.length)
            text = text.slice(0, max_length) + tail;
        return text;
    }

    generateContainers(requestList){

        let container_list = [];

        for(let request of requestList){
    
            let oContainer = new ObjThumbnailContainer(request["title"]);
            
            let request_result = this.sendRestRequest(request["rq_method"], request["rq_url"]);

            for(let line of request_result){

                let thumbnail = this.generateThumbnail(line);
                // let details = this.fetchDetails(line["id"]);
                // let thumbnail = this.generateThumbnail(details);

                oContainer.addThumbnail(line["id"], thumbnail);
            }
            container_list.push(oContainer);
        }
        return container_list;
    }
}


class MovieCardContainerGenerator extends  AjaxContainerGenerator{
    getContainerList(){
        let containerList = [];

        let requestList = [
            {title: translated_genre_movie['drama'],  rq_method: "GET", rq_url: "http://192.168.0.21/collect/standalone/movies/genre/drama/lang/" +  this.language_code},
            {title: translated_genre_movie['comedy'], rq_url:    "GET", rq_url: "http://192.168.0.21/collect/standalone/movies/genre/comedy/lang/" + this.language_code},
            {title: translated_genre_movie['scifi'],  rq_url:    "GET", rq_url: "http://192.168.0.21/collect/standalone/movies/genre/scifi/lang/" +  this.language_code}
        ];

        containerList = this.generateContainers(requestList);
        return containerList;
    }

    generateThumbnail(hit){
        let thumbnail = new Thumbnail();
        let max_length = 20;

        let card_id = hit["id"];
        let card_request_url = "http://192.168.0.21/collect/standalone/movie/card_id/" + card_id + "/lang/" + this.language_code
        let card = this.sendRestRequest("GET", card_request_url)[0];

        if(!hit["lang_orig"]){
            hit["lang_orig"] = "";
        }
        let short_title = "";
        if ( hit["title_req"] != null ){
            short_title = hit["title_req"];
        }else if ( hit["title_orig"] != null ){
            short_title = hit["title_orig"];
        }

        short_title = this.getTruncatedTitle(short_title, max_length);
        
        let medium_path = pathJoin([card["source_path"], card["medium"]["video"][0]])
        let thumbnail_file = this.getRandomFileFromDirectory(card["source_path"] + "/thumbnails", /\.jpg$/);
        let screenshot_file = this.getRandomFileFromDirectory(card["source_path"] + "/screenshots", /\.jpg$/);

        let thumbnail_src, description_src,lang,original,translated,thumb,directors,writers,stars,actors,voices,length,date,origins,genres,themes
        thumbnail.setImageSources(thumbnail_src=card["source_path"] + "/thumbnails/" + thumbnail_file, description_src=card["source_path"] + "/screenshots/" + screenshot_file);
        thumbnail.setTitles(lang=hit["lang_orig"], original=hit["title_orig"], translated=hit["title_req"], thumb=short_title);
        thumbnail.setStoryline(card["storyline"]);
        thumbnail.setCredentials(directors=card["directors"], writers=card["writers"], stars=card["stars"], actors=card["actors"], voices=card["voices"]);
        thumbnail.setExtras(length=card["length"], date=card["date"], origins=card["origins"], genres=card["genres"], themes=card["themes"]);

        thumbnail.setFunctionForSelection({"play": 
            (function(medium_path) {
                return function() {
                    return medium_path
                };
            })(medium_path)
        });

        return thumbnail;
    }    
}

class MovieSeriesCardHierarchyContainerGenerator extends  AjaxContainerGenerator{
    constructor(language_code, container_title, hierarchy_id){
        super(language_code);
        this.container_title = container_title;
        this.hierarchy_id = hierarchy_id;
    }

    getContainerList(){
        let containerList = [];

        let requestList = [
            {title: this.container_title,  rq_method: "GET", rq_url: "http://192.168.0.21//collect/child_hierarchy_or_card/id/" + this.hierarchy_id+ "/lang/" +  this.language_code},
        ];

        containerList = this.generateContainers(requestList);
        return containerList;
    }
   
    generateThumbnail(hit){
        let refToThis = this;
        let thumbnail = new Thumbnail();
        let max_length = 20;

        if(!hit["lang_orig"]){
            hit["lang_orig"] = "";
        }
        let short_title = "";
        if ( hit["title_req"] != null ){
            short_title = hit["title_req"];
        }else if ( card["title_orig"] != null ){
            short_title = hit["title_orig"];
        }

        short_title = this.getTruncatedTitle(short_title, max_length);

        if(hit["level"]){
//        let medium_path = pathJoin([card["source_path"], card["medium"]["video"][0]])
            let thumbnail_file = this.getRandomFileFromDirectory(hit["source_path"] + "/thumbnails", /\.jpg$/);
            let screenshot_file = this.getRandomFileFromDirectory(hit["source_path"] + "/screenshots", /\.jpg$/);

            let thumbnail_src, description_src,lang,original,translated,thumb; //,directors,writers,stars,actors,voices,length,date,origins,genres,themes
            thumbnail.setImageSources(thumbnail_src=hit["source_path"] + "/thumbnails/" + thumbnail_file, description_src=hit["source_path"] + "/screenshots/" + screenshot_file);
            thumbnail.setTitles(lang=hit["lang_orig"], original=hit["title_orig"], translated=hit["title_req"], thumb=short_title);
//        thumbnail.setStoryline(card["storyline"]);
//        thumbnail.setCredentials(directors=card["directors"], writers=card["writers"], stars=card["stars"], actors=card["actors"], voices=card["voices"]);
//        thumbnail.setExtras(length=card["length"], date=card["date"], origins=card["origins"], genres=card["genres"], themes=card["themes"]);

            thumbnail.setFunctionForSelection({"menu": 
                (function(hierarchy_id) {
                    return function() {
                        return new MovieSeriesCardHierarchyContainerGenerator(refToThis.language_code, short_title, hierarchy_id);
                    };
                })(hit["id"])
            });

        }else{

            let card_id = hit["id"];
            let card_request_url = "http://192.168.0.21/collect/standalone/movie/card_id/" + card_id + "/lang/" + this.language_code
            let card = this.sendRestRequest("GET", card_request_url)[0];
    
            let medium_path = pathJoin([card["source_path"], card["medium"]["video"][0]])
            let thumbnail_file = this.getRandomFileFromDirectory(card["source_path"] + "/thumbnails", /\.jpg$/);
            let screenshot_file = this.getRandomFileFromDirectory(card["source_path"] + "/screenshots", /\.jpg$/);
    
            let thumbnail_src, description_src,lang,original,translated,thumb,directors,writers,stars,actors,voices,length,date,origins,genres,themes
            thumbnail.setImageSources(thumbnail_src=card["source_path"] + "/thumbnails/" + thumbnail_file, description_src=card["source_path"] + "/screenshots/" + screenshot_file);
            thumbnail.setTitles(lang=hit["lang_orig"], original=hit["title_orig"], translated=hit["title_req"], thumb=short_title);
            thumbnail.setStoryline(card["storyline"]);
            thumbnail.setCredentials(directors=card["directors"], writers=card["writers"], stars=card["stars"], actors=card["actors"], voices=card["voices"]);
            thumbnail.setExtras(length=card["length"], date=card["date"], origins=card["origins"], genres=card["genres"], themes=card["themes"]);
    
            thumbnail.setFunctionForSelection({"play": 
                (function(medium_path) {
                    return function() {
                        return medium_path
                    };
                })(medium_path)
            });
        }
        return thumbnail;
    }    
}


class MovieSeriesContainerGenerator extends  AjaxContainerGenerator{
    constructor(language_code, container_title){
        super(language_code);
        this.container_title = container_title;
    }

    getContainerList(){
         let containerList = [];

         let requestList = [
             {title: this.container_title,  rq_method: "GET", rq_url: "http://192.168.0.21/collect/all/series/movies/lang/" +  this.language_code},
         ];

         containerList = this.generateContainers(requestList);
         return containerList;
    }

    generateThumbnail(hit){
        let refToThis = this;
        let thumbnail = new Thumbnail();
        let max_length = 20;

        if(!hit["lang_orig"]){
            hit["lang_orig"] = "";
        }
        let short_title = "";
        if ( hit["title_req"] != null ){
            short_title = hit["title_req"];
        }else if ( card["title_orig"] != null ){
            short_title = hit["title_orig"];
        }

        short_title = this.getTruncatedTitle(short_title, max_length);

//        let medium_path = pathJoin([card["source_path"], card["medium"]["video"][0]])
        let thumbnail_file = this.getRandomFileFromDirectory(hit["source_path"] + "/thumbnails", /\.jpg$/);
        let screenshot_file = this.getRandomFileFromDirectory(hit["source_path"] + "/screenshots", /\.jpg$/);

        let thumbnail_src, description_src,lang,original,translated,thumb; //,directors,writers,stars,actors,voices,length,date,origins,genres,themes
        thumbnail.setImageSources(thumbnail_src=hit["source_path"] + "/thumbnails/" + thumbnail_file, description_src=hit["source_path"] + "/screenshots/" + screenshot_file);
        thumbnail.setTitles(lang=hit["lang_orig"], original=hit["title_orig"], translated=hit["title_req"], thumb=short_title);
//        thumbnail.setStoryline(card["storyline"]);
//        thumbnail.setCredentials(directors=card["directors"], writers=card["writers"], stars=card["stars"], actors=card["actors"], voices=card["voices"]);
//        thumbnail.setExtras(length=card["length"], date=card["date"], origins=card["origins"], genres=card["genres"], themes=card["themes"]);

        thumbnail.setFunctionForSelection({"menu": 
            (function(hierarchy_id) {
                return function() {
                    return new MovieSeriesCardHierarchyContainerGenerator(refToThis.language_code, short_title, hierarchy_id);
                };
            })(hit["id"])
        });

        return thumbnail;
    }    
}
