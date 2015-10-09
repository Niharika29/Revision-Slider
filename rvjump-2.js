// Version 2: 50 most revisions always, if available

// Page title
var gPageName = mw.config.get( 'wgPageName' );

// Gives us the most current revision ID for the page
var gCurRevisionId = mw.config.get( 'wgCurRevisionId' );

// Action: view/query/history
var gAction = mw.config.get( 'wgAction' );

// User name
var gUserName = mw.config.get( 'wgUserName' );

// The URL of the page, relative to DOCUMENT_ROOT
var gScript = mw.config.get( 'wgScript' );

// Revision ID of right revision on diff page
var gRightRevID = mw.config.get( 'wgRevisionId' );

// Revision ID of left revision on diff page
var gLeftRevID = mw.util.getParamValue( 'oldid' );

// Page ID
var gPageID = mw.config.get( 'wgArticleID' );

// Server
var gServer = mw.config.get( 'wgServer' );

function addCSS() {
	$( '.ui-slider' ).css({
		height: "5px",
		border: "1px solid black",
		margin: "20px"
	});
	$( '.ui-slider .ui-slider-handle').css({
		height: "10px",
		width: "7px",
		background: "orange",
		"z-index": "101"
	});
	$( '.ui-slider-tick-mark' ).css({
		display: "inline-block",
    	width:	"2px",
    	background: "grey",
    	height:	"10px",
    	position:	"absolute",
    	top:	"-4px",
    	"z-index" : "100",
    	"text-align": "center"
	});
	$( '.styleTooltip' ).css({
		"box-shadow": "none",
		background: "black",
	    color: "white",
	    border: "none",
	    padding: "0",
	    opacity: "1",
	});
}

function refresh( v1, v2 ) {
    var $url = gServer + gScript + '?title=' + gPageName + '&diff=' + v2 + '&oldid=' + v1;
    location.href = $url;
}

function setSliderTicks( element, revs ) {
    var $slider =  $( element );
    var max =  $slider.slider( "option", "max" );    
    var min =  $slider.slider( "option", "min" );    
    var spacing =  100 / ( max - min );
    for (var i = 0; i <= max-min ; i++) {
    	var html = 'Timestamp: ' + new Date( revs[i].timestamp ).toString() + '<br>';
    	html += 'By: '+ revs[i].user + '<br>';
    	if( revs[i].comment != '' ) {
    		html += 'Edit summary: ' + revs[i].comment; 
    	}
        $('<div class="ui-slider-tick-mark" title="' +  html +'"></div>')
        .css('left', ( spacing * i ) +  '%')
        .tooltip({
        	position: {
        		my: "center bottom",
        		at: "center top-10"
        	},
        	tooltipClass: "styleTooltip",
        })
        .appendTo( $slider ); 
     }
}

function addSlider( revs ) {
	numberRevs = revs.length;
	var $slider = $( '<div class="range-slider"></div>' )
					.slider({
						range: true,
						min: 1,
						max: numberRevs,
						step: 1,
						animate: "fast",
						values: [1, numberRevs],
						create: function( event, ui ) {
							setSliderTicks( event.target, revs );
						},
						stop: function( event, ui ) {
							var v1 = revs[ui.values[0]-1].revid;
							var v2 = revs[ui.values[1]-1].revid;
							refresh( v1, v2 );
						}
					});
	$( '.diff-multi' ).append( $slider );
	addCSS();
}

// Driver function
mw.loader.using( ['jquery.ui.slider', 'jquery.ui.tooltip'], function () {
	$( document ).ready( function() {
		$.ajax( {
			url: mw.util.wikiScript( 'api' ),
			data: {
				action: 'query',
				prop: 	'revisions',
				format: 'json',
				rvprop: 'ids|timestamp|user|comment',
				titles: gPageName,
				formatversion:	2,
				rvdir: 'newer',
				rvstartid: gLeftRevID,
				rvendid: gRightRevID,
				"continue": "",
				rvlimit: "50"
			},
			success: function( data ) {
				revs = data.query.pages[0].revisions;
				numberRevs = revs.length;
				addSlider( revs );
				// Test purposes
				console.log( gLeftRevID + '   ' + gRightRevID + ' total: ' + numberRevs );
				for( i=0; i<revs.length; i++ ) {
					console.log( revs[i].comment + ':' + revs[i].timestamp );
				}
			}
		} );
	} );
} );
