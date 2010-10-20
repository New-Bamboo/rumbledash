(function($){
  $.fn.toolTip = function() {
    $.each(this, function(i, elem) {
      var title = $(this).attr('title');
      $(this).removeAttr('title');
      var pos = $(this).position();
      var box = $('<span>').addClass('tooltip').text(title).hide().appendTo($(this));
      $(this).mouseover(function() {
        $(this).find('.tooltip').show()
      });
      $(this).mouseout(function() {
        $(this).find('.tooltip').hide();
      });
      $(this).mousemove(function(evt){
        $(this).find('.tooltip').css({
          top: evt.pageY - pos.top - 50,
          left: evt.pageX - pos.left
        })
      });
    })
  }
})(jQuery);

function autoLink(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

var CollaboratorView = function( model, container, total_collabs ) {
  
  function percentageSize (total) {
    return (100 / total) + '%';
  }
  
  width = percentageSize(total_collabs);
  
  var template = $('#collaborator_template').clone()
      .attr('id', 'team_' + model.id())
      .find('.gravatar').attr('src', model.gravatar_url()+'?s=16').end()
      .appendTo(container);
  
  function highlight(){
    template.addClass('highlight')
  }
  
  model.bind('irc_new', highlight);
  model.bind('tweet_new', highlight);
}

var TeamView = function(model, container) {
  
  var min_opacity = 0.4,
      fade_rate = 1000;
  var opacity = fade_rate * min_opacity;
  
  var klass = (Math.floor(TeamView.count / 20) + TeamView.count % 20) % 2 == 0 ? 'odd' : 'even';
  
  var template = $('#team_template').clone()
      .attr('id', 'team_' + model.id())
      .attr('title', model.attr('name'))
      .addClass(klass);
      
  var outline = template.find('.outline');
  
  function setOpacity (opacity) {
    outline.css('opacity', opacity / fade_rate);
  }
  
  setOpacity(opacity);
  
  function TeamPopUp(service, user, text) {
    var bubble = template.find('.popup');
    bubble
      // .addClass(service)
      // .find('.service').text(service).end()
      .find('.user').text(user).end()
      .find('.text').text(text).end()
      .show();
    
    var user_w = bubble.find('.user').width(),
        text_w = bubble.find('.text').width();
    
    bubble.css('width', (user_w > text_w ? user_w : text_w));
    setTimeout(function(){
      bubble.hide();
    }, 4000);
      
  }
  
  $.each(model.collaborators(), function(c) {
    new CollaboratorView(this, template.find('.collaborators'), model.collaborators().length)
  });
  template.appendTo(container);
  
  model.bind('commit_new', function (commit) {
    try {      
      new TeamPopUp('commit', commit.attr('author'), commit.attr('message'));
    } catch(e) {
      console.log('COMMIT ERROR', e, commit)
    }
    template.highlightFade({speed:3000});
    opacity = fade_rate;
  });
  
  model.bind('irc_new', function (irc) {
    var user = Collaborator.find_by_irc_name(irc.user);
    new TeamPopUp('irc', user, irc.message);
    template.highlightFade({speed:3000});
    opacity = fade_rate;
  });
  
  model.bind('twitter_new', function (tweet) {
    var user = Collaborator.find_by_twitter_name(tweet.user.screen_name);
    new TeamPopUp('tweet', user, tweet.text);
    template.highlightFade({speed:3000});
    opacity = fade_rate;
  });
  
  model.bind('over', function () {
    template.addClass('highlighted')
  });
  
  model.bind('out', function () {
    template.removeClass('highlighted')
  });
  
  model.bind('tick', function () {
    if (opacity > (min_opacity * fade_rate)) {
      setOpacity(opacity--);
    }
  });
  TeamView.count++;
  
  template.click(function() {
    new TeamFancyBox(model);
  });
  
}
TeamView.count = 0;

var TeamFancyBoxCollaborator = function(model, container) {
  var template = $('#team_fancybox_collaborator_template').clone()
      .removeAttr('id')
      .find('.name strong').text(model.attr('name')).end()
      .find('.gravatar').attr('src', model.gravatar_url()+'?s=40').end()
      
  for(var attr in model.attr()) {
    if( model.attr(attr) && template.find('.'+attr + ' span').length > 0){
      template.find('.'+attr + ' span').text(model.attr(attr)).show();
    }
  }
      
  template.appendTo(container);
}

var TeamFancyBoxCommit = function(model, container) {
  var template = $('#team_fancybox_commit_template').clone()
      .removeAttr('id')
      .find('.team_name').text(model.team().attr('name')).end()
      .find('.commiter').text(model.attr('author')).end()
      .find('.message').text(model.attr('message')).end()
      .find('.link').attr('href', model.link()).text(model.attr('commitHash'))
      .end()
      .prependTo(container);
}


var TeamFancyBox = function (model) {
  var template = $('#team_fancybox_template').clone()
      .find('.name').text(model.attr('name')).end(),
  $collab_list = template.find('.collaborators');
  $commit_list = template.find('.commits');
  
  $.each(model.collaborators(), function(c) {
    new TeamFancyBoxCollaborator(this, $collab_list);
  });

  // Team.first().attr('commit_counts'))
  
  $.each(model.commits(), function(c) {
    new TeamFancyBoxCommit(this, $commit_list);
  });
  
  
  $.fancybox(template, {overlayOpacity:0})
  if(model.attr('commit_counts').length > 0){
    var graph_data = [];
    $.each(model.attr('commit_counts'), function(i){
      graph_data.push( [i, this] );
    });
    $.plot(template.find(".graph"), [graph_data]);
  } else {
    template.find(".graph").hide();
  }
}

var CommitView = function( model, container ) {
  var klass = CommitView.count % 2 == 0 ? 'odd' : 'even';
  var template = $('#commit_template').clone()
      .attr('id', 'commit_' + model.id())
      .find('.commiter').text(model.attr('author')).end()
      .find('.message').text(model.attr('message')).end()
      .find('.link').attr('href', model.link()).text(model.attr('commitHash'))
      .end()
      .addClass(klass)
      .prependTo(container)
      .highlightFade();
  var team = model.team();
  if( team){
    template
      .find('.team_name')
        .text(team.attr('name'))
        .click(function(){
          new TeamFancyBox(team);
          return false;
        });
    
  }
      
  template.mouseover(function (evt) {
    model.team().trigger('over');
  });
  template.mouseout(function (evt) {
    model.team().trigger('out');
  });
  CommitView.count++;
}
CommitView.count = 0;

var IrcView = function( model, container ) {
  var klass = IrcView.count % 2 == 0 ? 'odd' : 'even';
  var template = $('#irc_template').clone().removeAttr('id');
      template.find('.user').text(model.user);
      template.find('.message').html(autoLink(model.message));
      template.addClass(klass);
      template.appendTo(container)
      .highlightFade({start: '#256720', end: 'black', speed: 3000});
  IrcView.count++;
  
  $(container).attr('scrollTop', $(container).attr('scrollHeight'));
}
IrcView.count = 0;

var TweetView = function( model, container ) {
  
  var klass = TweetView.count % 2 == 0 ? 'odd' : 'even';
  var template = $('#tweet_template').clone().removeAttr('id')
      .find('.user').text(model.user.screen_name).end()
      .find('.message').html(autoLink(model.text)).end()
      .prependTo(container)
      .addClass(klass)
      .highlightFade();
  
  TweetView.count++;
}
TweetView.count = 0;