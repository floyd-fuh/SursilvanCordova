var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	
	currentSearchword: "",
	
	searchClicked: function() {
		  	var word = $('#search').val();
			app.currentSearchword = word;
			app.spinAllClearAll();
		  	app.getVocabulariGerman(word);
			app.getVocabulariSursilvan(word);
			app.getPledariGerman(word);
			app.getPledariSursilvan(word);
	},
	
    receivedEvent: function(id) {
		document.addEventListener('searchbutton', app.searchClicked, false);
		$(".button").click(app.searchClicked);
		$('#search').on("keyup", function(e){
			var theEvent = e || window.event;
			var keyPressed = theEvent.keyCode || theEvent.which;
			// enter key code is 13
		   	if(keyPressed === 13){
			   	app.searchClicked();
		   	}
		});
		$("#vocabularigerman").hide();
		$("#pledarigerman").hide();		
		$('a[target=_blank]').on('click', function(e) {
			e.preventDefault();
			window.open($(this).attr('href'), '_blank');
			return false;
		});
    },
	
	spinAllClearAll: function(){
		$("#searchingthrough").hide();
		$(".list").empty();
		$(".statusimg").css("display", "inline");
		$(".statusimg").attr("src", "img/loading.gif");
		$("#vocabularigerman").show();
		$("#pledarigerman").show();
		$("#vocabulariromansh .link").html("Da sursilvan en tudestg,<br>resultats Vocabulari Sursilvan");
		$("#vocabularigerman .link").html("Da tudestg en sursilvan,<br>resultats Vocabulari Sursilvan");
		$("#pledariromansh .link").html("Da sursilvan en tudestg,<br>resultats MeinPledari");
		$("#pledarigerman .link").html("Da tudestg en sursilvan,<br>resultats MeinPledari");
	},
	
	failedSelector: function(selector){
		$(selector).find('.statusimg').attr("src", "img/noresult.png");
		$(selector).appendTo($('#result-status'));
		if($(selector+" .link").html().indexOf("Suche") == -1){
			$(selector+" .link").html($(selector+" .link").html().replace("resultats", "negins resultats per la tscherca"));
		}
	},
    
	doPostRedirectVocabulari: function(url, word, german){
		var win = window.open(url, "_blank", "EnableViewPortScale=yes" );
		win.addEventListener("loadstop", function() {
		    win.executeScript({ code: "if("+german+"){ \
				document.formular_encurir.lungatg.selectedIndex = '1'; \
			} else { document.formular_encurir.lungatg.selectedIndex = '0'; }; \
			var inputs = document.getElementsByTagName('input'); \
			var origvalue = ''; \
			for(i=0; i<inputs.length; i++){ \
				if(inputs[i].type == 'text'){ \
					origvalue = inputs[i].value; \
					inputs[i].value = '"+word+"'; \
				} \
			} \
			if(origvalue == ''){ \
				document.formular_encurir.submit(); \
			}" });
		});
	},

	getVocabulariGerman: function(word){
		var selector = "#vocabularigerman";
		var url = "https://www.vocabularisursilvan.ch/index.php";
		$(selector).find('.link').click( function(e) {e.preventDefault(); app.doPostRedirectVocabulari(url, word, "true"); return false; } );
        var postdata = "plaid="+encodeURIComponent(word)+"&lungatg=d&modus=3";
		$.post(url, postdata, function(data){app.gotVocabulari(word, data, selector, url, postdata, false)});    
	},
	
	getVocabulariSursilvan: function(word){
		var selector = "#vocabulariromansh";
		var url = "https://www.vocabularisursilvan.ch/index.php";
		$(selector).find('.link').click( function(e) {e.preventDefault(); app.doPostRedirectVocabulari(url, word, "false"); return false; } );
        var postdata = "plaid="+encodeURIComponent(word)+"&lungatg=r&modus=3";
		$.post(url, postdata, function(data){app.gotVocabulari(word, data, selector, url, postdata, true)});    
	},
	
	gotVocabulari: function(word, data, selector, url, postdata, inverse){
		if(word != app.currentSearchword){
			return;
		}
		if(data.indexOf("(0 resultat") == -1 && data.indexOf(" resultat") != -1){
			$(selector).find('.statusimg').attr("src", "img/success.png");
			var dummydiv = $("<div>").html(data);
			var sourceNames = $(".d", dummydiv.get(0));
            $('i', sourceNames).remove(); //Remove <i> further info
			var targetNames = $(".rr b", dummydiv.get(0)); //Match the first bold tag: <td class="rr"><b>baghetg</b> m, 1.a) Bau m, Gebäude n; ~ d'economia
			for (var i = 0; i < sourceNames.length; i++) {
				var source = $(sourceNames[i]).text();
				var target = $(targetNames[i]).text();
				if(target == ""){
					continue;
				}
                if(inverse){
				    $(selector).find('.list').append("<li>"+target+" → "+source+"</li>");
                }
                else{
                    $(selector).find('.list').append("<li>"+source+" → "+target+"</li>");
                }
			}
		}
		else{
			app.failedSelector(selector);
		}
	},
	
	doPostRedirectPledari: function(url, word, german){
		var win = window.open(url, "_blank", "EnableViewPortScale=yes" );
		win.addEventListener("loadstop", function() {
		    win.executeScript({ code: "if(!"+german+"){ \
				document.tschertga.direcziun.selectedIndex = '2'; \
			}; \
			var inputs = document.getElementsByTagName('input'); \
			var origvalue = ''; \
			for(i=0; i<inputs.length; i++){ \
				if(inputs[i].type == 'text'){ \
					origvalue = inputs[i].value; \
					inputs[i].value = '"+word+"'; \
				} \
			} \
			if(origvalue == ''){ \
				document.tschertga.submit(); \
			}" });
		});
	},
	
	getPledariGerman: function(word){
		var selector = "#pledarigerman";
		var url = "http://www.pledari.ch/meinpledari/index.php";
		$(selector).find('.link').click( function(e) {e.preventDefault(); app.doPostRedirectPledari(url, word, true); return false; } );		
		var postdata = "direcziun=0&modus=entschatta&pled="+encodeURIComponent(word)+"&tschertgar=5.+Tschertgar+%2F+suchen";
		//$.post(url, postdata, function(data){app.gotPledari(word, data, selector, url, postdata, true)});
        
        $.ajax({
            url: url,
            method: "POST",
            data: postdata,
            success: function(data){app.gotPledari(word, data, selector, url, postdata, true)},
            //This is super important as meinPledari doesn't send a Content-Type HTTP header but only a <meta>
            //which is not sufficient for jQuery to detect the correct encoding
            beforeSend: function(jqXHR) {
                jqXHR.overrideMimeType('text/html; charset=iso-8859-1');
            },
        }
        );
	},
	
	getPledariSursilvan: function(word){
		var selector = "#pledariromansh";
		var url = "http://www.pledari.ch/meinpledari/index.php";
		$(selector).find('.link').click( function(e) {e.preventDefault(); app.doPostRedirectPledari(url, word, false); return false; } );
		var postdata = "direcziun=2&modus=entschatta&pled="+encodeURIComponent(word)+"&tschertgar=5.+Tschertgar+%2F+suchen";
        $.ajax({
            url: url,   
            method: "POST",
            data: postdata,
            success: function(data){app.gotPledari(word, data, selector, url, postdata, true)},
            //This is super important as meinPledari doesn't send a Content-Type HTTP header but only a <meta>
            //which is not sufficient for jQuery to detect the correct encoding
            beforeSend: function(jqXHR) {
                jqXHR.overrideMimeType('text/html; charset=iso-8859-1');
            },
        }
        );
	},
	
	gotPledari: function(word, data, selector, url, postdata, recurse){
		if(word != app.currentSearchword){
			return;
		}
		var treffer = 0;
		if(recurse){
			var sdata = data.replace(/(\r\n|\n|\r)/gm,"");
			var indicator = "Treffer:";
			var indicator_end = "/ Dieser Begriff:";
			if(sdata.indexOf(indicator) != -1){
				treffer = sdata.substr(sdata.indexOf(indicator)+8);
				if(treffer.indexOf(indicator_end) != -1){
					treffer = treffer.substr(0, treffer.indexOf(indicator_end));
					treffer = treffer.trim();
					treffer = parseInt(treffer);
					if(treffer < 1){
						app.failedSelector(selector);
					}
					for(i=0; i<Math.min(treffer, 33); i++){ //maximum 30, we don't want to overload the server
                        $.ajax({
                            url: url,
                            method: "POST",
                            data: postdata+"&nr="+i,
                            success: function(data){app.gotPledari(word, data, selector, url, postdata+"&nr="+i, false)},
                            //This is super important as meinPledari doesn't send a Content-Type HTTP header but only a <meta>
                            //which is not sufficient for jQuery to detect the correct encoding
                            beforeSend: function(jqXHR) {
                                jqXHR.overrideMimeType('text/html; charset=iso-8859-1');
                            },
                        }
                        );
                        
					}
				}
				else{
					app.failedSelector(selector);
				}
			}
			else{
				app.failedSelector(selector);
			}
		}
		
		if(!recurse || treffer > 0){
			var dummydiv = $("<div>").html(data);
			var textareas = $("textarea", dummydiv.get(0));
			if(textareas.length == 9){
				$(selector).find('.statusimg').attr("src", "img/success.png");
				var source = $(textareas[0]).text().trim();
				var target = $(textareas[2]).text().trim();
                
				if(target.indexOf("(=RG)") != -1){
					target = $(textareas[1]).text().trim();
				}else if(target.indexOf("-----") != -1){
					return;
				}else if(target.length < 1){
					return;
				}
				if(postdata.indexOf("direcziun=2") == -1){
					$(selector).find('.list').append("<li>"+source+" → "+target+"</li>");
				}
				else{
					$(selector).find('.list').append("<li>"+target+" → "+source+"</li>");
				}
			}
			else{
				app.failedSelector(selector);
			}
		}
	},
};

app.initialize();
