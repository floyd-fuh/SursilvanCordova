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
		$.post(url, postdata, function(data){app.gotPledari(word, data, selector, url, postdata, true)});
	},
	
	getPledariSursilvan: function(word){
		var selector = "#pledariromansh";
		var url = "http://www.pledari.ch/meinpledari/index.php";
		$(selector).find('.link').click( function(e) {e.preventDefault(); app.doPostRedirectPledari(url, word, false); return false; } );
		var postdata = "direcziun=2&modus=entschatta&pled="+encodeURIComponent(word)+"&tschertgar=5.+Tschertgar+%2F+suchen";
		$.post(url, postdata, function(data){app.gotPledari(word, data, selector, url, postdata, true)});
	},
	
	gotPledari: function(word, iso_data, selector, url, postdata, recurse){
        //What MeinPledari returns is ISO-8859-1
        var data = app.isoToUtf(iso_data);
        
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
                        $.post(url, postdata+"&nr="+i, function(data){app.gotPledari(word, data, selector, url, postdata+"&nr="+i, false)});
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
				var source_iso = $(textareas[0]).text().trim();
				var target_iso = $(textareas[2]).text().trim();                
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
    
    isoToUtf: function(word){
        //I know this is horrible, but as the freaking MeinPledari website is sending "Content-Type: text/html"
        //with no encoding but then has a HTML tag <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
        //and also sends characters such as ü as raw byte \xfc, this is all iso-8859-1. However, in this app everything is UTF-8
        //and therefore we somehow have to convert it. I tried all kind of tricks on https://stackoverflow.com/questions/22587308/convert-iso-8859-1-to-utf-8
        //but they simply didn't work. So I got a little fed up and wrote this function.
        
        /*
        var a = word.mapReplace(
            {
                "\xfc":"ü",
                "\xdc":"Ü"
            }
        );
        */
        
        //var a = word.replace("\xfc", "ü");
        
        //var a = unescape(encodeURIComponent(word));
        var a = encodeURIComponent(word);
        
        if(a.indexOf("Sal") != -1)
            alert(a);
        //alert(encodeURIComponent(a));
        return a;
        
        /*
        var a = $('<div>').text(word).html();
        alert(a);
        var b = $("<div>").html(a).text();
        alert(b);
        return b;
        */
    }
};

app.initialize();
