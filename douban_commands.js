/**
 * Douban commands for Ubiquity, including recommand, subject search etc
 *
 * @author: Kiwi Qi(kiwi.sedna@gmail.com)
 * @version 1.0
 * @licence MPL
 */

var log = CmdUtils.log;

var getStarClass = function(rating) {
    rating = Math.round(rating) / 2 * 10;
    if (rating == "5") rating = "05";
    return "allstar" + rating
};

var getStyle = function(content) {
    return "<style>" + content + "</style>"
}

var handleSelect = function(items) {
    items.mouseover(function() {
        $(this).addClass("sel");
    });
    items.mouseout(function() {
        $(this).removeClass("sel");
    });
}

// A lot of this code is borrowed from the Google Image Search script
var addAction = function(event, item) {
    var rightClick = false;
    if (!event) var event = window.event;
    if (event.which) {
        rightClick = (event.which == 3);
    } else if (event.button) {
        rightClick = (event.button == 2);
    }

    if (rightClick) {
        var doc = context.focusedWindow.document;
        var focused = context.focusedElement;

        if (doc.designMode == "on") { // rich text case
            // hack for getting elem's HTML
            var contentHTML = getStyle(COMMON_STYLE) +
                    $(item).find(".index").remove().end().wrap("<div></div>").parent().html();
            doc.execCommand("insertHTML", false, contentHTML);
        } else if (focused != null && ((focused.type == "textarea") ||
                    (focused.type == "text"))) {
            CmdUtils.setSelection($(item).find(".index").remove().end().text());
        } else {
            displayMassage(_("This function can be used in an editable box only."));
        }
    } else {
        var url = $(item).find("a.nbg").attr("href");
        Utils.openUrlInBrowser(url);
    }
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebNavigation)
            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindow);
    Application.activeWindow.activeTab.focus();
}


const API_KEY = "0d6f49e09de645f3284ddda1d9b2d1d9";

const MAX_RESULT = 5;

const COMMON_STYLE = "body { font: 12px Tahoma, Geneva, sans-serif }" +
        "body, div, dl, dt, dd { margin: 0; padding: 0 }" +
        "table { border-collapse: collapse; border-spacing: 0 }" +
        "img { border: 0 }" +
        "a img { border-width: 0 }" +
        "a { text-decoration: none }" +
        "a:link { color: #369 }" +
        "a:visited { color: #669 }" +
        "a:hover { color: #fff; background: #039 }" +
        "a:active { color: #fff; background: #f93 }" +
        "a.nbg:hover { background: none }" +
        ".quote{ overflow: hidden; padding: 0 24px 5px 15px; margin: 8px 0 0 26px; " +
        "background: url(http://t.douban.com/pics/quotel.gif) no-repeat left 4px; " +
        "width: auto; *zoom: 1; word-wrap:break-word }" +
        ".quote span.inq{ display: inline; " +
        "background: url(http://t.douban.com/pics/quoter.gif) no-repeat right bottom; " +
        "color: #fff; padding-right: 15px; display:inline-block }" +
        ".pl { font: 12px Arial, Helvetica, sans-serif; line-height: 150%; color: #666 }" +
        ".pl2 { font: 14px Arial, Helvetica, sans-serif; line-height: 150%; color: #666 }" +
        ".clearfix { display: block; zoom: 1 }" +
        ".clearfix:after { content: \".\"; display: block; height: 0; clear: both; visibility: hidden }" +
        ".allstar50,.allstar45,.allstar40,.allstar35,.allstar30,.allstar25,.allstar20,.allstar15," +
        ".allstar10,.allstar05 { background: url(http://t.douban.com/pics/allstar.gif) no-repeat; " +
        "height: 12px; display: block; padding-left: 55px; color:#999; overflow: hidden; " +
        "font-size: 12px; margin-bottom: 7px; line-height: 100% }" +
        ".allstar50 { background-position: 0 0 }" +
        ".allstar45 { background-position: 0 -12px }" +
        ".allstar40 { background-position: 0 -24px }" +
        ".allstar35 { background-position: 0 -36px }" +
        ".allstar30 { background-position: 0 -48px }" +
        ".allstar25 { background-position: 0 -60px }" +
        ".allstar20 { background-position: 0 -72px }" +
        ".allstar15 { background-position: 0 -84px }" +
        ".allstar10 { background-position: 0 -96px }" +
        ".allstar05 { background-position: 0 -108px }" +
        ".rating_nums { color: #ff5138; font-size: 10px; padding: 0 5px 0 0 }" +
        ".errmsg { color: #d22 }" +
        ".mb10 { margin-bottom: 10px }";

const PREVIEW_STYLE = COMMON_STYLE +
        ".index { color: #fff }" +
        ".sel { border: 1px solid #222; background: #33373e; cursor: pointer }";

const ERR_MSG = getStyle(COMMON_STYLE) +
        "<p class='errmsg'>Search error, please visite " +
        "<a href='${url}'>${url}</a> instead.</p>";

const RECOMMEND_PREVIEW = getStyle(COMMON_STYLE) +
        "<dl><dt><a href='${url}'>${title}</a></dt>" +
        "<dd class='quote'><span class='inq'>${comment}</span></dd></dl>";

const SUBJECT_HINTS = getStyle(PREVIEW_STYLE) +
        "<p class='pl'>You can use the keyboard shortcut <span class='errmsg'>" +
        "ctrl + alt + number</span> to open one of the Douban subject search " +
        "results shown in the preview";

const EVENT_HINTS = getStyle(PREVIEW_STYLE) +
        "<p class='pl'>You can use the keyboard shortcut <span class='errmsg'>" +
        "ctrl + alt + number</span> to open one of the Douban event search " +
        "results shown in the preview";

const BOOK_SUBJECT_ITEM = "<table class='mb10 subject_item'><tbody><tr>" +
        "<td class='index'>${index}.&nbsp;</td>" +
        "<td width='100' valign='center'><a class='nbg' title=${title} href='${url}'>" +
        "<img alt='${title}' src='${image}' /></a></td><td valign='top'><div class='pl2'>" +
        "<span>[书籍]</span><a accesskey='${index}' href='${url}'>${title}</a></div>" +
        "<p class='pl'>作者：${author} /  译者：${translator} / " +
        "出版社:${publisher} / 出版年：${pubdate} / 定价：${price}</p><div class='star clearfix'>" +
        "{if rating}<span class='${starClass}' /><span class='rating_nums'>${rating}</span>{/if}</div>" +
        "</td></tr></tbody></table>";

const MOVIE_SUBJECT_ITEM = "<table class='mb10 subject_item'><tbody><tr>" +
        "<td class='index'>${index}.&nbsp;</td>" +
        "<td width='100' valign='center'><a class='nbg' title=${title} href='${url}'>" +
        "<img alt='${title}' src='${image}' /></a></td><td valign='top'><div class='pl2'>" +
        "<span>[电影]</span><a accesskey='${index}' href='${url}'>${title}</a></div>" +
        "<p class='pl'>导演：${author} /  演员：${cast} / " +
        "语言：${language} / 制片国家（地区）：${country} / 上映日期：${pubdate}</p><div class='star clearfix'>" +
        "{if rating}<span class='${starClass}' /><span class='rating_nums'>${rating}</span>{/if}</div>" +
        "</td></tr></tbody></table>";

const MUSIC_SUBJECT_ITEM = "<table class='mb10 subject_item'><tbody><tr>" +
        "<td class='index'>${index}.&nbsp;</td>" +
        "<td width='100' valign='center'><a class='nbg' title=${title} href='${url}'>" +
        "<img alt='${title}' src='${image}' /></a></td><td valign='top'><div class='pl2'>" +
        "<span>[音乐]</span><a accesskey='${index}' href='${url}'>${title}</a></div><p class='pl'>表演者:${singer} / " +
        "出版者：${publisher} / 发行时间：${pubdate}</p><div class='star clearfix'>" +
        "{if rating}<span class='${starClass}' /><span class='rating_nums'>${rating}</span>{/if}</div>" +
        "</td></tr></tbody></table>";

const EVENT_ITEM = "<table class='mb10 event_item'><tbody><tr>" +
        "<td class='index'>${index}.&nbsp;</td>" +
        "<td width='120' valign='center'><a class='nbg' title=${title} href='${url}'>" +
        "<img alt='${title}' src='${image}' /></a></td><td valign='top'><div class='pl2'>" +
        "<a accesskey='${index}' href='${url}'>${title}</a></div>" +
        "<p class='pl'>时间：${startTime} - ${endTime}<br />" +
        "地点：${where}<br />" +
        "${participants}人参加&nbsp;&nbsp;${wishers}人感兴趣</p>" +
        "</td></tr></tbody></table>";


CmdUtils.CreateCommand({
    names: ["douban recommend"],
    arguments: [
        { role: "object", nountype: noun_arb_text, label: "your comments here" }
    ],
    icon: "http://t.douban.com/favicon.ico",
    author: { name: "Kiwi Qi", email: "kiwi.sedna@gmail.com" },
    license: "MPL",
    description: "Recommended a webpage to <a href=\"http://www.douban.com\">Douban</a>.",
    help: "You can recommend a webpage to Douban, along with your comments. Type \"douban recommend it'cool!\" for a try.",

    _params: function(args) {
        var document = CmdUtils.getDocument();
        var params = {
            url: document.location,
            title: document.title,
            comment: args.object.text || "",
        };
        return params;
    },

    _getRecommendUrl: function(args) {
        var baseUrl = "http://www.douban.com/recommend/";
        return baseUrl + Utils.paramsToString(this._params(args));
    },

    preview: function(pblock, args) {
        pblock.innerHTML = _(RECOMMEND_PREVIEW, this._params(args));
    },

    execute: function(args) {
        Utils.openUrlInBrowser(this._getRecommendUrl(args));
    }
});


CmdUtils.CreateCommand({
    names: ["douban subject"],
    arguments: [
        { role: "object", nountype: noun_arb_text, label: "subject title" },
        { role: "format", nountype: ["book", "movie", "music"], label: "book, movie or music"}
    ],
    icon: "http://t.douban.com/favicon.ico",
    author: { name: "Kiwi Qi", email: "kiwi.sedna@gmail.com" },
    license: "MPL",
    description: "Searches <a href=\"http://www.douban.com\">Douban</a> for subjects matching your words. Previews the top results.",

    _params: function(args) {
        var params = {
            apikey: API_KEY,
            q: $.trim(args.object.text),
            'max-results': MAX_RESULT,
        };
        return params;
    },

    _getAPISearchUrl: function(args) {
        var cat = args.format.text;
        var baseUrl = "http://api.douban.com/{CAT}/subjects";
        baseUrl = baseUrl.replace(/{CAT}/g, cat);
        return baseUrl + Utils.paramsToString(this._params(args));
    },

    _getNormalSearchUrl: function(args) {
        var query = args.object.text;
        var cat = args.format.text;

        var catIdMapping = {
            book: "1001",
            movie: "1002",
            music: "1003",
            get: function(attr, defaultResult) {
                result = eval("this." + attr);
                return result ? result : ((defaultResult != undefined) ? defaultResult : undefined);
            },
        };

        var url = "http://www.douban.com/subject_search?search_text={QUERY}&cat_id={CAT_ID}"
        url = url.replace(/{QUERY}/g, query);
        url = url.replace(/{CAT_ID}/g, catIdMapping.get(cat, ""));
        return url;
    },

    _bookParser: function(xml) { // TODO, ugly parsers, need refactor...
        var subjectItems = SUBJECT_HINTS;

        $(xml).find("entry").each(function(index) {
            var author = "";
            var translator = "";
            var price = "";
            var publisher = "";
            var pubdate = "";
            var rating = 0;
            var url = "";
            var image = "";

            $(this).children().each(function(index) {
                if (this.nodeName == "db:attribute") {
                    switch($(this).attr("name")) {
                        case 'author':
                            if (author != "") {
                                author += " 、" + $(this).text();
                            } else {
                                author = $(this).text();
                            }
                            break;
                        case 'translator':
                            if (translator != "") {
                                translator += " 、" + $(this).text();
                            } else {
                                translator = $(this).text();
                            }
                            break;
                        case 'price':
                            price = $(this).text();
                            break;
                        case 'publisher':
                            publisher = $(this).text();
                            break;
                        case 'pubdate':
                            pubdate = $(this).text();
                            break;
                    }
                } else if (this.nodeName == "gd:rating") {
                    rating = parseFloat($(this).attr("average"));
                } else if (this.nodeName == "link") {
                    switch($(this).attr("rel")) {
                        case 'alternate':
                            url = $(this).attr("href");
                            break;
                        case 'image':
                            image = $(this).attr("href");
                            break;
                    }
                }
            });

            subjectItems += _(BOOK_SUBJECT_ITEM, {
                index: index + 1,
                title: $(this).children("title").text(),
                author: author,
                translator: translator,
                price: price,
                publisher: publisher,
                pubdate: pubdate,
                rating: rating,
                starClass: getStarClass(rating),
                url: url,
                image: image || "http://t.douban.com/pics/book-default-small.gif",
            });
        });

        return subjectItems;
    },

    _movieParser: function(xml) {
        var subjectItems = SUBJECT_HINTS;

        $(xml).find("entry").each(function(index) {
            var cast = "";
            var language = "";
            var country = "";
            var pubdate = "";
            var rating = 0;
            var url = "";
            var image = "";

            $(this).children().each(function(index) {
                if (this.nodeName == "db:attribute") {
                    switch($(this).attr("name")) {
                        case 'cast':
                            if (cast != "") {
                                cast += " 、" + $(this).text();
                            } else {
                                cast = $(this).text();
                            }
                            break;
                        case 'language':
                            language = $(this).text();
                            break;
                        case 'country':
                            country = $(this).text();
                            break;
                        case 'pubdate':
                            pubdate = $(this).text();
                            break;
                    }
                } else if (this.nodeName == "gd:rating") {
                    rating = parseFloat($(this).attr("average"));
                } else if (this.nodeName == "link") {
                    switch($(this).attr("rel")) {
                        case 'alternate':
                            url = $(this).attr("href");
                            break;
                        case 'image':
                            image = $(this).attr("href");
                            break;
                    }
                }
            });

            subjectItems += _(MOVIE_SUBJECT_ITEM, {
                index: index + 1,
                title: $(this).children("title").text(),
                author: $(this).children("author").children("name").text(),
                cast: cast,
                language: language,
                country: country,
                pubdate: pubdate,
                rating: rating,
                starClass: getStarClass(rating),
                url: url,
                image: image || "http://t.douban.com/pics/movie-default-small.gif",
            });
        });

        return subjectItems;
    },

    _musicParser: function(xml) {
        var subjectItems = SUBJECT_HINTS;

        $(xml).find("entry").each(function(index) {
            var singer = "";
            var publisher = "";
            var pubdate = "";
            var rating = 0;
            var url = "";
            var image = "";

            $(this).children().each(function(index) {
                if (this.nodeName == "db:attribute") {
                    switch($(this).attr("name")) {
                        case 'singer':
                            if (singer != "") {
                                singer += " 、" + $(this).text();
                            } else {
                                singer = $(this).text();
                            }
                            break;
                        case 'publisher':
                            publisher = $(this).text();
                            break;
                        case 'pubdate':
                            pubdate = $(this).text();
                            break;
                    }
                } else if (this.nodeName == "gd:rating") {
                    rating = parseFloat($(this).attr("average"));
                } else if (this.nodeName == "link") {
                    switch($(this).attr("rel")) {
                        case 'alternate':
                            url = $(this).attr("href");
                            break;
                        case 'image':
                            image = $(this).attr("href");
                            break;
                    }
                }
            });

            subjectItems += _(MUSIC_SUBJECT_ITEM, {
                index: index + 1,
                title: $(this).children("title").text(),
                singer: singer,
                publisher: publisher,
                pubdate: pubdate,
                rating: rating,
                starClass: getStarClass(rating),
                url: url,
                image: image || "http://t.douban.com/pics/music-default-small.gif",
            });
        });

        return subjectItems;
    },

    preview: function(pblock, args) {
        var me = this;
        CmdUtils.previewAjax(pblock, {
            type: "GET",
            url: me._getAPISearchUrl(args),
            dataType: "xml",
            error: function() {
                pblock.innerHTML = _(ERR_MSG, { url: me._getNormalSearchUrl(args) });
            },
            success: function(xml) {
                // me._bookParser, me._movieParser or me._musicParser
                var parser = eval("me._" + args.format.text + "Parser");
                var subjectItems = parser(xml);
                pblock.innerHTML = subjectItems;

                var subjectItems = $(pblock.ownerDocument).find(".subject_item");
                subjectItems.mousedown(function(e) {
                    addAction(e, this);
                });
                handleSelect(subjectItems);
            },
        });
    },

    execute: function(args) {
        var me = this;
        $.ajax({
            type: "GET",
            url: me._getAPISearchUrl(args),
            dataType: "xml",
            error: function() {
                Utils.openUrlInBrowser(me._getNormalSearchUrl(args));
            },
            success: function(xml) {
                var parser = eval("me._" + args.format.text + "_parser");
                var subjectItems = parser(xml);
                CmdUtils.setSelection(subjectItems);
            },
        });
    }
});


CmdUtils.CreateCommand({
    names: ["douban event"],
    arguments: [
        { role: "object", nountype: noun_arb_text, label: "event name" },
        { role: "format", nountype: noun_type_geolocation, label: "location" }
    ],
    icon: "http://t.douban.com/favicon.ico",
    author: { name: "Kiwi Qi", email: "kiwi.sedna@gmail.com" },
    license: "MPL",
    description: "Searches <a href=\"http://www.douban.com\">Douban</a> for events matching your words. Previews the top results.",

    _params: function(args) {
        var params = {
            apikey: API_KEY,
            q: $.trim(args.object.text),
            location: this._getLocation(args),
            'max-results': MAX_RESULT,
        };
        return params;
    },

    _getLocation: function(args) {
        var loc = args.format.text || CmdUtils.getGeoLocation().city;
        return loc.toLowerCase();
    },

    _getAPISearchUrl: function(args) {
        var baseUrl = "http://api.douban.com/events";
        return baseUrl + Utils.paramsToString(this._params(args));
    },

    _getNormalSearchUrl: function(args) {
        var query = args.object.text;
        var loc = this._getLocation(args);

        var url = "http://www.douban.com/event/search?search_text={QUERY}&loc={LOC}"
        url = url.replace(/{QUERY}/g, query);
        url = url.replace(/{LOC}/g, loc);
        return url;
    },

    _parser: function(xml) {
        var eventItems = EVENT_HINTS;

        $(xml).find("entry").each(function(index) {
            var participants = 0;
            var wishers = 0;
            var startTime = null;
            var endTime = null;
            var where = "";
            var url = "";
            var image = "";

            $(this).children().each(function(index) {
                if (this.nodeName == "db:attribute") {
                    switch($(this).attr("name")) {
                        case 'participants':
                            participants = $(this).text();
                            break;
                        case 'wishers':
                            wishers = $(this).text();
                            break;
                    }
                } else if (this.nodeName == "gd:when") {
                    startTime = Date($(this).attr("startTime"));
                    endTime = Date($(this).attr("endTime"));
                } else if (this.nodeName == "gd:where") {
                    where = $(this).attr("valueString");
                } else if (this.nodeName == "link") {
                    switch($(this).attr("rel")) {
                        case 'alternate':
                            url = $(this).attr("href");
                            break;
                        case 'image':
                            image = $(this).attr("href");
                            break;
                    }
                }
            });

            eventItems += _(EVENT_ITEM, {
                index: index + 1,
                title: $(this).children("title").text(),
                participants: participants,
                wishers: wishers,
                startTime: startTime,
                endTime: endTime,
                where: where,
                url: url,
                image: image && image.replace('mpic', 'spic') || "http://t.douban.com/pics/event/spic/event_dft.jpg",
            });
        });

        return eventItems;
    },

    preview: function(pblock, args) {
        var me = this;
        CmdUtils.previewAjax(pblock, {
            type: "GET",
            url: me._getAPISearchUrl(args),
            dataType: "xml",
            error: function() {
                pblock.innerHTML = _(ERR_MSG, { url: me._getNormalSearchUrl(args) });
            },
            success: function(xml) {
                var eventItems = me._parser(xml);
                pblock.innerHTML = eventItems;

                var eventItems = $(pblock.ownerDocument).find(".event_item");
                eventItems.mousedown(function(e) {
                    addAction(e, this);
                });
                handleSelect(eventItems);
            }
        });
    },

    execute: function(args) {
        var me = this;
        $.ajax({
            type: "GET",
            url: me._getAPISearchUrl(args),
            dataType: "xml",
            error: function() {
                Utils.openUrlInBrowser(me._getNormalSearchUrl(args));
            },
            success: function(xml) {
                var eventItems = me._parser(xml);
                CmdUtils.setSelection(eventItems);
            },
        });
    }
});