/**
 * A heavily customized Twitter's bootsrap typeahead plugin...by Adam Filkor - filkor.org
 * 
 * 
 * Modified:
 * - Defined this.parent as option
 * - constructor, hide(), render()
 * - lookup() show initial subreddits if input fiend is empty
 * - select - when click in tag -- added onSelection: function(val)
 */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {  	
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    
    this.parent = this.options.parent
    this.$menu = $(this.options.menu).appendTo(this.parent)
    this.source = this.options.source
    this.shown = false
    this.onSelection = this.options.onSelection
    
    this.subscribed = this.options.subscribed
    
    //we have to set this.query here too because we call render
    this.query = ''
    //render, we don't need the show() function here, it's just sets the top: , left: values, but we don't need that  
    this.render(this.source.slice(0,this.options.items))
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      /*
      This select function is just a 'wrapper' now. Keydown, or click events ends up here , but we are using our custom onSelection
      	function now defined in main.js as an option
      */
     

	  var $tag = this.$menu.find('.active')
      this.onSelection($tag) //run when click on tag
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
  	/*
      this.$menu.hide()
      this.shown = false
      return this
    */
   
   	  //don't need this hide function now. 
   	  return '';
    }

  , lookup: function (event) {
      var that = this
        , items
        , q

      this.query = this.$element.val()

      if (!this.query) {
      	//if the query is empty, like empty input field
      	return this.render(this.source.slice(0,this.options.items)).show()
        
      }

      items = $.grep(this.source, function (item) {
        return that.matcher(item)
      })
      


      items = this.sorter(items)
      
      //first we slice the items
      items = items.slice(0, this.options.items)
      
      //then push to the end the query, so always come up with a 'match', and don't need to set a 20k length array with subredditnames 
      //when we not allow to push to the end the query
      //the seciond condition is that we get duplicate tags if the query is the same as any other item, like we type 'funny' 
      if (this.query !== ' ' && $.inArray(this.query, items) == -1) {
      	//whitespaces are not allowed
      	items.push(this.query.replace(/ /g,''));
      }
	   
	 
	 
      if (!items.length) {
      	//no matched item, this never happen in thes custom script becuase we always push the this.query to the end 
        return this.shown ? this.hide() : this
      }

      return this.render(items).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.html(that.highlighter(item))
        
        //CUSTOM: check if the item is already in the subscribed list - make it green then
        //see: The great mystery of the tilde operator (they using at indexOf(), too or where -1 is the returning value)
        if (~$.inArray(item, that.subscribed)) {
        	//for mobile or without the css3 background-size (for ie..etc) using no images in tags (check,cross)
        	if( /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) || !Modernizr.backgroundsize) {
        		i.addClass('subscribed-noimg')
        	} else {
        		i.addClass('subscribed')
        	}
        	
        } else {
        	i.addClass('unsubscribed')
        }
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if ($.browser.webkit || $.browser.msie) {
        this.$element.on('keydown', $.proxy(this.keypress, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
          break

        //case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , keypress: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          if (e.type != 'keydown') break
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          if (e.type != 'keydown') break
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , blur: function (e) {
      var that = this
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {

      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="subreddit-tags"></ul>'
  , item: '<li><a href="#"></a></li>'
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
      var $this = $(this)
      if ($this.data('typeahead')) return
      e.preventDefault()
      $this.typeahead($this.data())
    })
  })

}(window.jQuery);