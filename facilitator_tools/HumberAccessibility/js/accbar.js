/*
    Accbar 
    From Lichuan Wen 2017 
    lichuan.wen1189@gmail.com
    MIT License
    Humber College

    body data attributions 
    data-rft    uri of rft file;
    data-print  uri of docx file;
*/



var accbarloaded = false;
$(document).ready(function(){
    if (accbarloaded)
        return;
    accbarloaded = true;

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    

    function initTts(){
        var ttssuppoet = false;
        var synthObj = window.speechSynthesis;
        if ('speechSynthesis' in window) {
            ttssuppoet = true;
        } else {
            ttssuppoet = false;
        }
        var isreading = false;
        var ispause = false;
        var timerhandle = null;

       
        this.ttsclick = (function(){
            if (!isreading)
                this.playstop();
            else
                this.pause();
        });

        this.ttsstop = (function(){
            playstop();
        })

        function loadVoices() {
          // Fetch the available voices.
            var voices = speechSynthesis.getVoices();
          
          // Loop through each of the voices.
            voices.forEach(function(voice, i) {
            // Create a new option element.
                
            });
            if (ttssuppoet){
                window.speechSynthesis.cancel();
            }
        }

        // Execute loadVoices.
        if (ttssuppoet)
            loadVoices();

        // Create a new utterance for the specified text and add it to
        // the queue.
        function speak(text) {
            var msg = new SpeechSynthesisUtterance();
            var defvoice = "Alex";
            msg.text = text;
          
            msg.volume = 1;
            msg.rate = 0.9;
            msg.pitch = 1;
          
            //if (voiceSelect.value) {
            if ($("body").data("voice"))
                defvoice = $("body").data("voice");
    //msg.voice = speechSynthesis.getVoices();
            if (window.navigator.userAgent.indexOf("Edge") == -1)
            {
                msg.voice = speechSynthesis.getVoices().filter(function(voice) { return true; })[0];
         //       if (!msg.voice)
           //         msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == "Google US English" })[0];
            }

            //}

            window.speechSynthesis.speak(msg);

            $(document).keyup(function (event) {
                if (event.keyCode === '1'){
                    playstop();
                }
                else if(event.keyCode == 32 && isreading){
                    pause();
                    
                }
                /*else if(event.keyCode == 27){
                    isreading = false;
                    clearInterval(timerhandle);
                    window.speechSynthesis.cancel();
                }*/

            });
        }

        function finishReading(){

        }

        function selectText( dom ) {
            var node = dom[0];
            node.scrollIntoView( true );
            if ( document.selection ) {
                var range = document.body.createTextRange();
                range.moveToElementText( node  );
                range.select();
            } else if ( window.getSelection ) {
                var range = document.createRange();
                range.selectNodeContents( node );
                window.getSelection().removeAllRanges();
                window.getSelection().addRange( range );
            }
        }

        var multicontent;
        var multicontentindex = 0;
        this.playstop = function(){
            $('.panel-collapse').each(function(){
                if (!$(this).hasClass('in') && !$(this).hasClass('fold')) {
                    $(this).collapse('toggle');
                }
            });

            if (ttssuppoet){
                if (!isreading)
                {
                    $(".magnifier_wrapper .tts").removeClass("tts");
                    var ttscontents = $(".tts");
                    var contentindex = 0;
                    isreading = true;
                    ispause = false;
                    $(".accpanel").addClass("tts-status-playing");
                    $(".accpanel").removeClass("tts-status-pause");

                    timerhandle = setInterval(function(){
                        if (
                            (ttscontents.length > contentindex || multicontent.length > multicontentindex)
                            && !window.speechSynthesis.speaking){
                            if (!multicontent || multicontent.length <= (multicontentindex)){
                                var contenttext;
                                var maxwords = 30;
                                if (ttscontents.eq(contentindex).attr("alt")){
                                    contenttext = (ttscontents.eq(contentindex).attr("alt"));
                                }
                                else{
                                    contenttext = (ttscontents.eq(contentindex).text());
                                }
                                contenttext = contenttext.split(" ");
                                selectText(ttscontents.eq(contentindex));
                                ttscontents.eq(contentindex).scrollTop();
                                contentindex++;
                                multicontentindex = 0;
                                multicontent = [];
                                for (var a=0; a < contenttext.length; a++){
                                    if (!multicontent[parseInt(a/maxwords)])
                                        multicontent[parseInt(a/maxwords)] = "";
                                    multicontent[parseInt(a/maxwords)] += " " + contenttext[a];
                                }
                            }
                            speak(multicontent[multicontentindex]);
                            multicontentindex++;

                        }
                        else if(ttscontents.length == contentindex &&  !window.speechSynthesis.speaking)
                            playstop()
                    },100);
                }
                else{
                    isreading = false;
                    clearInterval(timerhandle);
                    window.speechSynthesis.cancel();
                    $(".accpanel").removeClass("tts-status-playing");
                }
            }
            else{
                alert("your browser doesnot support TTS");
            }
        }

        this.pause = function() {
            if (!isreading)
                return;
            if (!ispause){
                ispause = true;
                window.speechSynthesis.pause();
                $(".tts-play").prop("title","Click on this icon to play");
                $(".accpanel").addClass("tts-status-pause");
            }
            else{
                $(".tts-play").prop("title","Click on this icon to pause playback");
                window.speechSynthesis.resume();
                ispause = false;
                $(".accpanel").removeClass("tts-status-pause");
            }
        }

        
        return this;
    }

    function initMagnifier(){
       
        var zoom = $("<div class=\"magnifier_content\"><div class=\"magnifier_body\" id=\"magnifier_body\" ><div class=\"magnifier_wrapper \"></div></div></div>");
        var zoomstatus = false;
        var lastscrolltop = 0;
        //zoom.find(".magnifier_wrapper").append($($("body").html()));
        document.body.appendChild(zoom[0]);

        this.quit = function(){
           
            zoom.hide();
            zoomstatus = false;
            $(".magnifier").removeClass("activated");

        }

        function exec(e){
            if (zoomstatus)
                return;
            zoom.remove();
            zoom = $("<div class=\"magnifier_content\"><div class=\"magnifier_body\" id=\"magnifier_body\" ><div class=\"magnifier_wrapper \"></div></div></div>");
            zoom.find(".magnifier_wrapper").append($($("body").html()));
            document.body.appendChild(zoom[0]);
            lastscrolltop = $(window).scrollTop();
            zoomstatus = true;
            zoom.show();
            $(".magnifier").addClass("activated");
        }

        $(document).on("mousemove", function(e){
            if (zoomstatus){
                if ($(window).scrollTop()+e.clientY > $("body").height())
                    e.clientY = $("body").height() - $(window).scrollTop();

                zoom.css({left:e.clientX - 225, top:$(window).scrollTop()+e.clientY - 225});
                zoom.find(".magnifier_wrapper").css({"left":0-(e.clientX) * 2 + 225, "top":0-($(window).scrollTop()+e.clientY ) * 2 + 225,width:$("body").width(),height:$("body").height()});
                
                if (lastscrolltop){
                    $(window).scrollTop(lastscrolltop);
                    lastscrolltop = 0;
                }
            }
        }); 
        this.reset = function(e){
            if (zoomstatus){
                zoom.remove();
                zoom = $("<div class=\"magnifier_content\"><div class=\"magnifier_body\" id=\"magnifier_body\" ><div class=\"magnifier_wrapper \"></div></div></div>");
                zoom.find(".magnifier_wrapper").append($($("body").html()));
                document.body.appendChild(zoom[0]);
                zoomstatus = false;
                exec();
                if ($(window).scrollTop()+e.clientY > $("body").height())
                    e.clientY = $("body").height() - $(window).scrollTop();
 
                zoom.css({left:e.clientX - 225, top:$(window).scrollTop()+e.clientY - 225});
                zoom.find(".magnifier_wrapper").css({"left":0-(e.clientX) * 2 + 225, "top":0-($(window).scrollTop()+e.clientY ) * 2 + 225,width:$("body").width(),height:$("body").height()});
                
                if (lastscrolltop){
                    $(window).scrollTop(lastscrolltop);
                    lastscrolltop = 0;
                }
            }
        }
        this.butclick = function(e){
            
            
                if (!zoomstatus){
                    exec();
                }
                else if (zoomstatus){
                    this.quit();
                }
            
        }
        
        return this;
    }

    if (isMobile.any()){
        $(".accpanel").hide();
        return;
    }

    var button = $("<div class=\"accpanel\" >"
                +"<a  class=\"button accbar tts-play\" data-toggle=\"tooltip\" data-placement=\"bottom\"  title=\"Click on this icon to convert the text on this page to an audio version. If using your keyboard, press 1 to start and stop the reader, press the space bar to pause the reader.\">"
                +"<a  class=\"button accbar tts-stop\" data-toggle=\"tooltip\" data-placement=\"bottom\"  title=\"Click on this icon to stop reading.\"></a>"
                +"<a  class=\"button accbar magnifier\" data-toggle=\"tooltip\" data-placement=\"bottom\"  title=\"Click on this icon to enable the magnifying glass. Move your mouse over the content you would like to enlarge.\"></a>"
                +"<a  class=\"button accbar pdf\" data-toggle=\"tooltip\" data-placement=\"bottom\"  title=\"Click on the PDF button to open the PDF document in a new window. From this new window, the document can be downloaded.\"></a>"
                +"<a  class=\"button accbar print\" data-toggle=\"tooltip\" data-placement=\"bottom\"  title=\"Click on this icon to print this page.\"></a>"
                +"<a  class=\"button accbar rtf\" data-toggle=\"tooltip\" data-placement=\"bottom\"  title=\"Rtf files are for screen reader users. Click this icon to download the rtf file for this content.\"></a>"
            +"</div>")
    
  //  $('[data-toggle="tooltip"]').tooltip();

    var  framework = $(window.parent.document.getElementById("cleanSlate"));
    if(framework.length){
        $( window.parent ).scroll(function() {
            if ($( window.parent ).scrollTop() > 270){
                button.css("top",(0+$( window.parent ).scrollTop() - 220) > 100 ? (0+$( window.parent ).scrollTop() - 220) : 100);
            }
            else
                button.css("top",100);
        });
    }


    
    var magnifier = initMagnifier();
    var tts = initTts();


    $(document).click(function(event) {
        if (event.target.className.indexOf("accbar") !== -1){
            if (event.target.className.indexOf("magnifier") !== -1){
                magnifier.butclick(event);
            }
            else if (event.target.className.indexOf("print") !== -1){
                event.preventDefault();
                window.print();
                $(event).blur();
            }
            else if (event.target.className.indexOf("rtf") !== -1){
                event.preventDefault();
                window.location.href = $("body").data("rtf");
                $(event).blur();
            }
            else if (event.target.className.indexOf("pdf") !== -1){
                event.preventDefault();
                  window.open(
                      $("body").data("pdf"),
                      '_blank' // <- This is what makes it open in a new window.
                    );
                $(event).blur();
            }
            else if (event.target.className.indexOf("tts-play") !== -1){
                tts.ttsclick();
            }
            else if (event.target.className.indexOf("tts-stop") !== -1){
                tts.ttsstop();
            }
        }
        else
            magnifier.reset(event);
    });

    $(document).keyup(function (event) {
        if (event.keyCode === 49){
            tts.playstop();
        }
        else if(event.keyCode == 50){
            tts.pause();
            
        }
        else if(event.keyCode == 27){
            magnifier.quit();
            
        }
        /*else if(event.keyCode == 27){
            isreading = false;
            clearInterval(timerhandle);
            window.speechSynthesis.cancel();
        }*/

    });


    document.body.appendChild(button[0]);
});